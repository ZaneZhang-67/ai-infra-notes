---
title: 2.10 线性相关、张成空间与秩
description: 理解线性相关、张成空间、矩阵秩与低秩近似之间的关系
sidebar_position: 10
---

# 2.10 线性相关、张成空间与秩

线性相关、张成空间和秩描述的是同一件事的不同侧面：一组向量中有多少真正独立的方向，以及这些方向能够覆盖多大的空间

## 1. 线性相关与线性无关

给定一组向量 $v_1,v_2,\ldots,v_k$，如果存在一组不全为 $0$ 的系数 $c_1,c_2,\ldots,c_k$，使得：

$$
c_1v_1+c_2v_2+\cdots+c_kv_k=0
$$

那么这组向量称为**线性相关**（Linearly Dependent）

这表示至少有一个向量可以由其他向量组合得到，因此这组向量中存在信息重复

例如：

$$
v_1=\begin{bmatrix}1\\2\end{bmatrix},\qquad
v_2=\begin{bmatrix}2\\4\end{bmatrix}=2v_1
$$

取 $c_1=-2$、$c_2=1$，就有：

$$
-2v_1+v_2=0
$$

所以 $v_1$ 和 $v_2$ 线性相关，第二个向量没有带来新的方向

如果只有所有系数都为 $0$ 时才能得到零向量，这组向量称为**线性无关**（Linearly Independent）。例如二维空间中的：

$$
e_1=\begin{bmatrix}1\\0\end{bmatrix},\qquad
e_2=\begin{bmatrix}0\\1\end{bmatrix}
$$

除非两个系数都为 $0$，否则 $c_1e_1+c_2e_2$ 不可能等于零向量，因此它们线性无关

判断一组向量是否线性相关，也可以把它们作为矩阵的列，检查齐次方程：

$$
Ac=0
$$

如果存在非零解 $c$，矩阵的列向量就线性相关

## 2. 张成空间是什么

一组向量的**张成空间**（Span）是它们所有线性组合构成的集合：

$$
\operatorname{span}(v_1,\ldots,v_k)
=\left\{c_1v_1+\cdots+c_kv_k\mid c_i\in\mathbb{R}\right\}
$$

张成空间回答的是：

> 这些向量通过线性组合，能够到达哪些位置

一个非零向量只能张成一条过原点的直线。例如：

$$
\operatorname{span}\left(\begin{bmatrix}1\\2\end{bmatrix}\right)
=\left\{\begin{bmatrix}t\\2t\end{bmatrix}\mid t\in\mathbb{R}\right\}
$$

两个线性无关的二维向量可以张成整个二维平面。标准基向量 $e_1,e_2$ 的任意线性组合为：

$$
a e_1+b e_2
=\begin{bmatrix}a\\b\end{bmatrix}
$$

因此：

$$
\operatorname{span}(e_1,e_2)=\mathbb{R}^2
$$

如果加入一个与已有向量线性相关的向量，张成空间不会变大。比如 $v_2=2v_1$ 时：

$$
\operatorname{span}(v_1,v_2)=\operatorname{span}(v_1)
$$

这就是线性相关和张成空间之间的联系：相关向量会增加表示方式，但不会增加新的方向

## 3. 矩阵的秩

矩阵 $A$ 的**秩**（Rank）是它的列空间维度，也就是矩阵列向量中最多有多少个线性无关的方向

如果：

$$
A\in\mathbb{R}^{M\times N}
$$

那么 $A$ 的列向量都位于 $\mathbb{R}^M$ 中，最多只能有 $M$ 个独立方向，而矩阵一共只有 $N$ 列，因此：

$$
\operatorname{rank}(A)\leq\min(M,N)
$$

矩阵的行秩和列秩始终相等，所以也可以把秩理解为行向量中最多有多少个线性无关的方向

例如：

$$
A=\begin{bmatrix}
1&2&3\\
2&4&6
\end{bmatrix}
$$

第二行是第一行的 $2$ 倍，第三列是前两列的和。进一步检查列向量：

$$
\begin{bmatrix}3\\6\end{bmatrix}
=\begin{bmatrix}1\\2\end{bmatrix}
+\begin{bmatrix}2\\4\end{bmatrix}
$$

而第二列又是第一列的 $2$ 倍，所以所有列都只沿着同一条方向，最终：

$$
\operatorname{rank}(A)=1
$$

这里需要区分矩阵的形状和矩阵包含的信息量。矩阵有 $2\times3=6$ 个元素，但它的独立方向只有 $1$ 个

## 4. 满秩与秩亏

对于 $A\in\mathbb{R}^{M\times N}$，如果：

$$
\operatorname{rank}(A)=\min(M,N)
$$

称为**满秩**（Full Rank）。满秩表示矩阵在形状允许的范围内保留了最多的独立方向

如果：

$$
\operatorname{rank}(A)<\min(M,N)
$$

称为**秩亏**（Rank Deficient）。秩亏说明矩阵的行或列之间存在冗余，部分信息可以由其他行或列线性组合得到

对于一个 $N\times N$ 方阵，满秩等价于矩阵可逆。秩亏方阵没有逆矩阵，因为它把至少一个方向压缩成了无法恢复的信息

## 5. 低秩近似

如果矩阵的秩远小于它的行数和列数，可以用两个更小的矩阵近似表示它：

$$
A\approx UV
$$

其中：

$$
U\in\mathbb{R}^{M\times r},\qquad
V\in\mathbb{R}^{r\times N},\qquad
r\ll\min(M,N)
$$

原矩阵 $A$ 需要存储 $MN$ 个参数，分解后只需要存储：

$$
Mr+rN=r(M+N)
$$

当 $r$ 足够小时，参数量会显著下降。例如 $M=N=1000$、$r=10$ 时：

$$
MN=1{,}000{,}000
$$

而低秩形式只需要：

$$
r(M+N)=10\times(1000+1000)=20{,}000
$$

参数量减少到原来的 $2\%$，矩阵乘法的计算量也会随之下降

实际计算低秩近似时，常用奇异值分解（Singular Value Decomposition，SVD）：

$$
A=U\Sigma V^\mathsf{T}
$$

对于 $A\in\mathbb{R}^{M\times N}$，各个符号的含义是：

- $U\in\mathbb{R}^{M\times M}$ 是左奇异向量组成的正交矩阵，每一列表示输出空间中的一个方向
- $\Sigma\in\mathbb{R}^{M\times N}$ 是奇异值矩阵，主对角线上的非负数 $\sigma_1\geq\sigma_2\geq\cdots\geq0$ 表示对应方向的重要程度
- $V\in\mathbb{R}^{N\times N}$ 是右奇异向量组成的正交矩阵，每一列表示输入空间中的一个方向
- $V^\mathsf{T}$ 表示 $V$ 的转置

矩阵也可以写成若干个秩为 $1$ 的矩阵之和：

$$
A=\sigma_1u_1v_1^\mathsf{T}+\sigma_2u_2v_2^\mathsf{T}+\cdots
$$

其中 $u_i$ 是 $U$ 的第 $i$ 列，$v_i$ 是 $V$ 的第 $i$ 列，$\sigma_i$ 决定第 $i$ 个方向的贡献大小

严格来说，左右两侧对应的是左奇异向量 $u_i$ 和右奇异向量 $v_i$，奇异值只有同一组 $\sigma_i$。右奇异向量由 $A^\mathsf{T}A$ 的特征向量得到，左奇异向量再由 $u_i=Av_i/\sigma_i$ 得到

### 一个低秩近似例子

考虑一个对称但不是对角矩阵的例子：

$$
A=\begin{bmatrix}
2&1\\
1&2
\end{bmatrix}
$$

### 第一步：由 $A^\mathsf{T}A$ 求奇异值

右奇异向量是 $A^\mathsf{T}A$ 的特征向量，奇异值的平方是对应的特征值。由于这里的 $A$ 是对称矩阵，$A^\mathsf{T}=A$，所以：

$$
A^\mathsf{T}A=A^2
=\begin{bmatrix}
5&4\\
4&5
\end{bmatrix}
$$

求特征值：

$$
\det(A^\mathsf{T}A-\lambda I)
=(5-\lambda)^2-16=0
$$

得到：

$$
\lambda_1=9,\qquad\lambda_2=1
$$

因此两个奇异值是特征值的平方根：

$$
\sigma_1=\sqrt{9}=3,\qquad
\sigma_2=\sqrt{1}=1
$$

### 第二步：求右奇异向量

对于 $\lambda_1=9$，解 $(A^\mathsf{T}A-9I)v_1=0$，得到方向 $(1,1)$。单位化后：

$$
v_1=\frac{1}{\sqrt{2}}\begin{bmatrix}1\\1\end{bmatrix}
$$

对于 $\lambda_2=1$，得到方向 $(1,-1)$，单位化后：

$$
v_2=\frac{1}{\sqrt{2}}\begin{bmatrix}1\\-1\end{bmatrix}
$$

将它们作为列向量，就得到：

$$
V=\frac{1}{\sqrt{2}}
\begin{bmatrix}
1&1\\
1&-1
\end{bmatrix}
$$

### 第三步：由 $u_i=Av_i/\sigma_i$ 求左奇异向量

先看第一个方向：

$$
Av_1=\begin{bmatrix}2&1\\1&2\end{bmatrix}
\frac{1}{\sqrt{2}}\begin{bmatrix}1\\1\end{bmatrix}
=3v_1
$$

所以：

$$
u_1=\frac{Av_1}{\sigma_1}=v_1
$$

同理：

$$
Av_2=v_2,\qquad
u_2=\frac{Av_2}{\sigma_2}=v_2
$$

因此这个例子中 $U=V$，完整的 SVD 为：

$$
A=U\Sigma V^\mathsf{T}
$$

其中：

$$
U=V=\frac{1}{\sqrt{2}}
\begin{bmatrix}
1&1\\
1&-1
\end{bmatrix},\qquad
\Sigma=\begin{bmatrix}
3&0\\
0&1
\end{bmatrix}
$$

### 第四步：保留最大的奇异值

如果只保留最大的一个奇异值，也就是取 $r=1$，得到：

$$
A_1=\sigma_1u_1v_1^\mathsf{T}
=3\frac{1}{\sqrt{2}}\begin{bmatrix}1\\1\end{bmatrix}
\frac{1}{\sqrt{2}}\begin{bmatrix}1&1\end{bmatrix}
=\begin{bmatrix}
1.5&1.5\\
1.5&1.5
\end{bmatrix}
$$

$A_1$ 的秩为 $1$，它保留了沿 $(1,1)$ 方向的主要变化，丢弃了沿 $(1,-1)$ 方向、奇异值为 $1$ 的变化。近似误差为：

$$
A-A_1=\begin{bmatrix}
0.5&-0.5\\
-0.5&0.5
\end{bmatrix}
$$

如果保留两个奇异值，$A_2=A$，近似误差为 $0$，但也失去了降维和压缩的效果。因此 $r$ 越小，参数量和计算量越低，近似误差通常越大

一般情况下，只保留最大的前 $r$ 个奇异值及对应方向，可以写成：

$$
A\approx A_r=U_r\Sigma_rV_r^\mathsf{T}
$$

其中 $U_r$ 取 $U$ 的前 $r$ 列，$\Sigma_r$ 取前 $r$ 个奇异值，$V_r$ 取 $V$ 的前 $r$ 列。保留的方向越多，近似通常越准确，但参数量和计算量也越大

低秩结构在模型压缩、参数高效微调和推荐系统中都很常见。它利用的核心事实是：参数矩阵虽然尺寸很大，但真正重要的变化方向可能只有少数几个
