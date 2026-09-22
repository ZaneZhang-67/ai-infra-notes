---
title: 2.11 特征值与特征向量
description: 理解特征值、特征向量的定义、几何意义及其在工程计算中的应用
sidebar_position: 11
---

# 2.11 特征值与特征向量

矩阵可以看成作用在向量上的一种变换。以二维向量为例：

$$
A=\begin{bmatrix}
2&0\\
0&1
\end{bmatrix},\qquad
x=\begin{bmatrix}1\\1\end{bmatrix}
$$

矩阵乘法得到：

$$
Ax=\begin{bmatrix}2\\1\end{bmatrix}
$$

原向量从原点指向 $(1,1)$，变换后指向 $(2,1)$，所以箭头的方向发生了变化，长度也从 $\sqrt{2}$ 变成了 $\sqrt{5}$。矩阵的不同元素会重新组合向量的各个分量，因此可能造成旋转、拉伸、压缩或翻转

但有一些特殊方向经过矩阵变换后方向保持不变，只发生缩放。这些方向由特征向量描述，缩放倍数就是特征值

## 1. 定义

对于方阵 $A$，如果存在非零向量 $v$ 和标量 $\lambda$，满足：

$$
Av=\lambda v
$$

那么：

- $v$ 称为矩阵 $A$ 的**特征向量**（Eigenvector）
- $\lambda$ 称为对应的**特征值**（Eigenvalue）

这里要求 $v\neq0$，因为零向量和任何矩阵相乘都等于零向量，无法表示一个有意义的方向

等式 $Av=\lambda v$ 的含义是：矩阵作用在 $v$ 上之后，结果仍然落在 $v$ 所在的同一条直线上

- $\lambda>1$ 表示沿该方向放大
- $0<\lambda<1$ 表示沿该方向缩小
- $\lambda<0$ 表示除了缩放，还会反向
- $\lambda=0$ 表示该方向被压缩为零

## 2. 如何求特征值和特征向量

从定义开始：

$$
Av=\lambda v
$$

把右侧移到左侧：

$$
(A-\lambda I)v=0
$$

这里的 $\det$ 是 determinant 的缩写，中文叫**行列式**。它把一个方阵映射成一个标量，用来反映矩阵是否可逆。对于二维矩阵：

$$
B=\begin{bmatrix}
a&b\\
c&d
\end{bmatrix}
$$

行列式为：

$$
\det(B)=ad-bc
$$

当 $\det(B)\neq0$ 时，$B$ 可逆，方程 $Bx=0$ 只有零解。当 $\det(B)=0$ 时，$B$ 不可逆，方程才可能存在非零解。因此要让 $(A-\lambda I)v=0$ 存在非零特征向量，必须满足：

$$
\det(A-\lambda I)=0
$$

这个关于 $\lambda$ 的方程叫**特征方程**（Characteristic Equation），求出的根就是特征值。得到每个 $\lambda$ 后，再代回：

$$
(A-\lambda I)v=0
$$

就可以求出对应的特征向量

### 一个二维例子

考虑矩阵：

$$
A=\begin{bmatrix}
2&1\\
1&2
\end{bmatrix}
$$

先求特征值：

$$
\det(A-\lambda I)
=\det\begin{bmatrix}
2-\lambda&1\\
1&2-\lambda
\end{bmatrix}
=(2-\lambda)^2-1=0
$$

因此：

$$
\lambda_1=3,\qquad\lambda_2=1
$$

对于 $\lambda_1=3$：

$$
(A-3I)v=0
\quad\Longrightarrow\quad
\begin{bmatrix}
-1&1\\
1&-1
\end{bmatrix}v=0
$$

可以取：

$$
v_1=\begin{bmatrix}1\\1\end{bmatrix}
$$

验证：

$$
Av_1=\begin{bmatrix}3\\3\end{bmatrix}=3v_1
$$

对于 $\lambda_2=1$，可以取：

$$
v_2=\begin{bmatrix}1\\-1\end{bmatrix}
$$

并且：

$$
Av_2=\begin{bmatrix}1\\-1\end{bmatrix}=v_2
$$

所以矩阵 $A$ 在 $(1,1)$ 方向上放大 $3$ 倍，在 $(1,-1)$ 方向上保持长度不变

## 3. 几何意义

对于一般向量 $x$，矩阵变换 $Ax$ 可能同时改变方向和长度。特征向量是其中的例外：

$$
v\xrightarrow{A}\lambda v
$$

它的方向保持在同一条直线上，只有长度和朝向根据 $\lambda$ 改变

如果一个矩阵有足够多的线性无关特征向量，可以把这些特征向量作为新的坐标轴。设这些向量组成矩阵：

$$
V=\begin{bmatrix}v_1&v_2&\cdots&v_n\end{bmatrix}
$$

对应特征值组成对角矩阵：

$$
\Lambda=\begin{bmatrix}
\lambda_1&&0\\
&\ddots&\\
0&&\lambda_n
\end{bmatrix}
$$

那么：

$$
AV=V\Lambda
$$

如果 $V$ 可逆，就可以写成：

$$
A=V\Lambda V^{-1}
$$

这叫**特征分解**（Eigendecomposition）。在特征向量坐标系中，矩阵变换被分解成沿各个独立方向分别缩放

对于实对称矩阵，特征向量可以选成正交单位向量，此时 $V^{-1}=V^\mathsf{T}$：

$$
A=Q\Lambda Q^\mathsf{T}
$$

这也是对称矩阵数值计算特别方便的原因

## 4. 动态系统中的放大与衰减

考虑离散动态系统：

$$
x_{t+1}=Ax_t
$$

如果初始状态恰好沿着某个特征向量 $v$：

$$
x_0=cv
$$

那么后续状态为：

$$
x_t=c\lambda^t v
$$

因此特征值的绝对值决定该方向的长期行为：

- $|\lambda|>1$ 时，该方向随时间增长，系统可能发散
- $|\lambda|<1$ 时，该方向逐渐衰减
- $|\lambda|=1$ 时，该方向不会因缩放而衰减或增长

这就是线性动态系统判断稳定性时关注特征值的原因。对离散系统，通常要求所有特征值满足 $|\lambda|<1$ 才能保证状态逐渐衰减
