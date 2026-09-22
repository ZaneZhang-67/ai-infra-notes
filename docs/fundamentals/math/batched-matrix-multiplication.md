---
title: 2.7 Batched Matrix Multiplication
description: 从张量形状、批量矩阵乘法和转置理解 Attention 中的 QK^T
sidebar_position: 7
---

# 2.7 Batched Matrix Multiplication

在 Attention 中，矩阵乘法通常不是只处理一对二维矩阵，而是同时处理多个 batch 和多个 attention head

核心可以概括为一句话：前面的维度负责索引不同的矩阵，最后两维才参与一次矩阵乘法

## 1. 从普通矩阵乘法扩展到批量矩阵乘法

普通矩阵乘法的形状关系为：

$$
(M,K)@(K,N)\rightarrow(M,N)
$$

这里的两个矩阵只有二维，每次运算只得到一个结果矩阵

批量矩阵乘法在前面增加若干个批次维度：

$$
(B,M,K)@(B,K,N)\rightarrow(B,M,N)
$$

它表示同时进行 $B$ 次矩阵乘法。对于每个批次索引 $b$，单独计算：

$$
C_b=A_bB_b
$$

这里的下标 $b$ 表示“取第 $b$ 组数据”，不是乘法。若原始张量形状为：

$$
A\in\mathbb{R}^{B\times M\times K},\qquad
B\in\mathbb{R}^{B\times K\times N}
$$

那么取出第 $b$ 组后：

$$
A_b=A[b,:,:]\in\mathbb{R}^{M\times K},\qquad
B_b=B[b,:,:]\in\mathbb{R}^{K\times N}
$$

此时 $A_bB_b$ 中间没有写乘号，表示普通矩阵乘法，结果为：

$$
C_b=A_bB_b\in\mathbb{R}^{M\times N}
$$

也就是说，批量矩阵乘法只是对 $b=1,2,\ldots,B$ 的每一组二维矩阵分别计算一次

因此，批量矩阵乘法不是把整个张量展平成一个大矩阵，而是保留批次维度，沿着最后两维执行矩阵乘法

## 2. Attention 中的张量形状

多头 Attention 中常见的查询矩阵和键矩阵形状为：

$$
Q\in\mathbb{R}^{B\times N_h\times S_q\times D_h}
$$

$$
K\in\mathbb{R}^{B\times N_h\times S_k\times D_h}
$$

其中：

- $B$ 表示 batch size，一次处理多少个样本
- $N_h$ 表示 attention head 的数量
- $S_q$ 表示 query 序列长度
- $S_k$ 表示 key 序列长度
- $D_h$ 表示每个 head 的特征维度

固定一个 batch 和一个 head 后，$Q$ 的最后两维就是一个矩阵：

$$
Q_{b,h}\in\mathbb{R}^{S_q\times D_h}
$$

$K$ 的最后两维也是一个矩阵：

$$
K_{b,h}\in\mathbb{R}^{S_k\times D_h}
$$

Attention 需要计算 query 与 key 的相似度，因此要让 $Q$ 的每一行和 $K$ 的每一行做点积

## 3. 为什么要转置 $K$

原始的 $K$ 形状是：

$$
K\in\mathbb{R}^{B\times N_h\times S_k\times D_h}
$$

矩阵乘法要求左矩阵的最后一维等于右矩阵的倒数第二维。$Q$ 的最后两维为 $(S_q,D_h)$，因此右矩阵需要整理为 $(D_h,S_k)$

转置后：

$$
K^\mathsf{T}\in\mathbb{R}^{B\times N_h\times D_h\times S_k}
$$

这里的转置只交换最后两个维度：

```text
(B, Nh, Sk, Dh) -> (B, Nh, Dh, Sk)
```

$B$ 和 $N_h$ 仍然保留在前面，因为它们表示不同的矩阵组，不属于单个矩阵内部的行列维度

## 4. $QK^\mathsf{T}$ 的结果形状

现在进行批量矩阵乘法：

$$
QK^\mathsf{T}
\in
\mathbb{R}^{B\times N_h\times S_q\times D_h}
\;@
\mathbb{R}^{B\times N_h\times D_h\times S_k}
$$

中间的 $D_h$ 被归约，前面的 $B$ 和 $N_h$ 作为批次维保留，外侧的 $S_q$ 和 $S_k$ 形成结果矩阵：

$$
QK^\mathsf{T}\in\mathbb{R}^{B\times N_h\times S_q\times S_k}
$$

形状检查可以写成：

```text
(B, Nh, Sq, Dh) @ (B, Nh, Dh, Sk) -> (B, Nh, Sq, Sk)
```

固定一个 batch 和一个 head 后，实际执行的仍然只是普通矩阵乘法：

$$
(S_q,D_h)@(D_h,S_k)\rightarrow(S_q,S_k)
$$

整个四维运算只是把这类二维矩阵乘法复制到 $B\times N_h$ 个位置，并行完成

## 5. 每个结果元素的含义

结果矩阵中一个元素的计算方式为：

$$
(QK^\mathsf{T})_{b,h,i,j}
=
\sum_{d=1}^{D_h}Q_{b,h,i,d}K_{b,h,j,d}
$$

它表示第 $b$ 个样本、第 $h$ 个 head 中，第 $i$ 个 query 与第 $j$ 个 key 的点积相似度

因此，结果的最后两维 $(S_q,S_k)$ 可以理解为一张注意力分数表：

- 每一行对应一个 query 位置
- 每一列对应一个 key 位置
- 每个元素表示一对 query 和 key 的相似度

后续通常还会除以 $\sqrt{D_h}$，再经过 softmax 得到注意力权重：

$$
\operatorname{Attention}(Q,K,V)
=
\operatorname{softmax}\left(\frac{QK^\mathsf{T}}{\sqrt{D_h}}\right)V
$$

例如 $D_h=16$ 时：

$$
\sqrt{D_h}=\sqrt{16}=4
$$

如果某个 query 和 key 的点积为 $20$，缩放后会变成 $20/4=5$。点积的累加项越多，数值通常越容易变大，直接送入 softmax 可能导致分布过度集中，梯度也会变小，因此先除以 $\sqrt{D_h}$ 来控制分数的尺度

## 6. 一个具体的形状例子

假设：

$$
B=2,\qquad N_h=4,\qquad S_q=8,\qquad S_k=8,\qquad D_h=16
$$

那么：

$$
Q\in\mathbb{R}^{2\times4\times8\times16}
$$

$$
K^\mathsf{T}\in\mathbb{R}^{2\times4\times16\times8}
$$

批量矩阵乘法的结果为：

$$
QK^\mathsf{T}\in\mathbb{R}^{2\times4\times8\times8}
$$

这表示一共存在 $2\times4=8$ 组独立的注意力矩阵，每组矩阵的形状都是 $8\times8$

每组矩阵的一个元素需要完成长度为 $16$ 的点积，因此总的乘法次数约为：

$$
B\times N_h\times S_q\times S_k\times D_h
$$

代入上面的数字后，乘法次数为：

$$
2\times4\times8\times8\times16=8192
$$

若同时统计乘法和加法，FLOPs 约为上述结果的两倍

## 7. 在 PyTorch 中对应的写法

对于形状为 $(B,N_h,S_q,D_h)$ 和 $(B,N_h,S_k,D_h)$ 的张量，可以直接写成：

```python
scores = torch.matmul(Q, K.transpose(-1, -2))
```

`transpose(-1, -2)` 只交换最后两个维度：

```text
Q                    : (B, Nh, Sq, Dh)
K                    : (B, Nh, Sk, Dh)
K.transpose(-1, -2)  : (B, Nh, Dh, Sk)
scores               : (B, Nh, Sq, Sk)
```

也可以使用转置后的矩阵乘法运算符：

```python
scores = Q @ K.transpose(-1, -2)
```

`torch.matmul` 会把前面的维度视为批次维，并在最后两维执行矩阵乘法。只要批次维满足广播规则，就可以处理形状相同或可广播的张量
