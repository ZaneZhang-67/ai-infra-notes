---
title: 2.5 范数、误差与数值容差
description: 理解向量与矩阵范数，以及它们在梯度裁剪、正则化、归一化和数值校验中的作用
sidebar_position: 5
---

# 2.5 范数、误差与数值容差

## 1. 范数：衡量对象的大小

范数（norm）是一种把向量映射为非负标量的函数，用来描述向量的整体规模。不同范数采用不同的聚合方式，因此关注点也不同：有的关注所有分量的总量，有的关注最大的单个分量

设向量为 $x=(x_1,x_2,\ldots,x_n)$。本文使用的几种范数如下

## 2. 向量范数

### 2.1 L1 范数

$$
\lVert x \rVert_1=\sum_{i=1}^{n}|x_i|
$$

L1 范数将每个分量的绝对值相加。绝对值避免了正负分量相互抵消，因此可以反映所有分量的总幅度

例如：

$$
x=(3,-4,2),\qquad \lVert x\rVert_1=|3|+|-4|+|2|=9
$$

### 2.2 L2 范数

$$
\lVert x \rVert_2=\sqrt{\sum_{i=1}^{n}x_i^2}
$$

L2 范数是最常用的向量范数。二维情况下，它就是点 $(x_1,x_2)$ 到原点的欧几里得距离：

$$
x=(3,4)\quad\Longrightarrow\quad \lVert x\rVert_2=\sqrt{3^2+4^2}=5
$$

因此，L2 范数也称为欧几里得范数（Euclidean norm）

### 2.3 L∞ 范数

$$
\lVert x \rVert_\infty=\max_i|x_i|
$$

L∞ 范数只关注绝对值最大的分量。例如：

$$
x=(3,-7,2,5)\quad\Longrightarrow\quad \lVert x\rVert_\infty=7
$$

它适合描述最极端的分量规模，例如一组误差或梯度中最大的单项幅度

### 2.4 三种范数的对比

对同一个向量 $x=(3,-4,2)$：

$$
\lVert x\rVert_1=9,\qquad
\lVert x\rVert_2=\sqrt{29}\approx5.39,\qquad
\lVert x\rVert_\infty=4
$$

三者描述的是同一个向量，但使用了不同的“尺子”：

| 范数 | 计算方式 | 主要关注点 |
| --- | --- | --- |
| L1 | 绝对值之和 | 所有分量的总幅度 |
| L2 | 平方和再开平方 | 整体欧几里得长度 |
| L∞ | 最大绝对值 | 最极端的单个分量 |

## 3. 矩阵的 Frobenius 范数

对于矩阵 $A\in\mathbb{R}^{m\times n}$，Frobenius 范数定义为：

$$
\lVert A\rVert_F=\sqrt{\sum_{i=1}^{m}\sum_{j=1}^{n}A_{ij}^2}
$$

例如：

$$
A=\begin{bmatrix}1&2\\3&4\end{bmatrix},\qquad
\lVert A\rVert_F=\sqrt{1^2+2^2+3^2+4^2}=\sqrt{30}\approx5.477
$$

Frobenius 范数可以理解为将矩阵展平后计算 L2 范数：

$$
\lVert A\rVert_F=\lVert(1,2,3,4)\rVert_2
$$

它经常用于衡量一组参数、激活或梯度的整体规模

## 4. 范数在深度学习中的应用

### 4.1 监控参数、激活和梯度规模

计算参数矩阵 $W$ 的 Frobenius 范数，或计算梯度 $\nabla W$ 的 L2 范数，可以判断数值规模是否异常：

$$
\lVert W\rVert_F,\qquad \lVert\nabla W\rVert_2
$$

训练日志中通常会记录这些量，用于发现梯度爆炸、梯度消失或数值溢出等问题

### 4.2 梯度裁剪

梯度裁剪（gradient clipping）通过限制梯度范数，避免单次更新过大。设梯度为 $g$，阈值为 $c>0$，常见的按范数裁剪方式为：

$$
g_{\text{new}}=g\cdot\min\left(1,\frac{c}{\lVert g\rVert_2}\right)
$$

当 $\lVert g\rVert_2\le c$ 时，梯度保持不变，当 $\lVert g\rVert_2>c$ 时，梯度按比例缩小到 L2 范数为 $c$

例如 $g=(3,4)$，且 $c=1$：

$$
\lVert g\rVert_2=5,\qquad
g_{\text{new}}=g\cdot\frac{1}{5}=\left(\frac35,\frac45\right)
$$

此时 $\lVert g_{\text{new}}\rVert_2=1$，但梯度方向保持不变

### 4.3 正则化

L2 正则化将参数规模加入损失函数：

$$
\mathcal{L}=\mathcal{L}_{\text{task}}+\lambda\lVert W\rVert_2^2
$$

其中，$\lambda$ 控制惩罚强度。参数越大，正则项越大，优化过程因此倾向于寻找规模更小的参数。对于矩阵参数，工程实现通常等价地对全部元素的平方和进行惩罚

### 4.4 向量归一化

向量归一化将向量缩放为单位长度：

$$
\hat{x}=\frac{x}{\lVert x\rVert_2},\qquad \lVert\hat{x}\rVert_2=1
$$

例如：

$$
x=(3,4)\quad\Longrightarrow\quad
\hat{x}=\left(\frac35,\frac45\right)
$$

归一化保留向量方向，只改变长度。需要注意的是，$x=0$ 时不能直接归一化，因为除数为零，这类情况应在调用前明确处理并报告错误，而不是用静默替代值掩盖输入问题

## 5. 绝对误差与相对误差

设真实值为 $x$，预测值为 $\hat{x}$

### 5.1 绝对误差

$$
e_{\text{abs}}=|\hat{x}-x|
$$

绝对误差表示实际差了多少。例如 $x=100$、$\hat{x}=105$ 时：

$$
e_{\text{abs}}=|105-100|=5
$$

### 5.2 相对误差

$$
e_{\text{rel}}=\frac{|\hat{x}-x|}{|x|}
$$

相对误差表示误差相对于真实值规模的比例。上例中：

$$
e_{\text{rel}}=\frac{5}{100}=0.05=5\%
$$

两种误差应结合使用：

| 情况 | 真实值 | 预测值 | 绝对误差 | 相对误差 |
| --- | ---: | ---: | ---: | ---: |
| A | 1 | 1.1 | 0.1 | 10% |
| B | 1000 | 1000.5 | 0.5 | 0.05% |

情况 B 的绝对误差更大，但相对于目标规模的偏差更小。绝对误差适合回答“实际差了多少”，相对误差适合回答“相对于目标规模，偏差有多严重”

## 6. `atol + rtol` 数值容差

数值计算和工程测试中，常用下面的条件判断结果是否足够接近：

$$
|\hat{x}-x|\le\text{atol}+\text{rtol}\cdot|x|
$$

其中：

- `atol`（absolute tolerance）是绝对容差，提供固定的最低误差范围，
- `rtol`（relative tolerance）是相对容差，随真实值的规模变化

例如 $x=100$、`atol = 0.1`、`rtol = 0.01` 时，允许的最大误差为：

$$
0.1+0.01\times100=1.1
$$

因此预测值满足 $98.9\le\hat{x}\le101.1$ 时，可以通过该容差判断

只使用相对误差会在真实值接近零时失去稳定性。例如 $x=10^{-6}$、$\hat{x}=2\times10^{-6}$ 时，绝对误差只有 $10^{-6}$，但相对误差为 100%，当 $x=0$ 时，相对误差甚至无法定义。`atol + rtol` 同时覆盖了两种尺度：真实值较大时由相对容差控制，真实值接近零时由绝对容差提供可比较的基准
