---
title: 2.9 转置、单位矩阵与逆矩阵
description: 理解矩阵转置、单位矩阵和逆矩阵的定义、性质及工程中的线性方程求解
sidebar_position: 9
---

# 2.9 转置、单位矩阵与逆矩阵

转置、单位矩阵和逆矩阵是线性代数中最常用的基础操作，它们分别描述矩阵的行列交换、恒等作用和可逆变换

## 1. 矩阵转置

矩阵 $A$ 的转置记作 $A^\mathsf{T}$，含义是把原矩阵的行和列交换

如果：

$$
A=\begin{bmatrix}
a_{11}&a_{12}&a_{13}\\
a_{21}&a_{22}&a_{23}
\end{bmatrix}
$$

那么：

$$
A^\mathsf{T}=\begin{bmatrix}
a_{11}&a_{21}\\
a_{12}&a_{22}\\
a_{13}&a_{23}
\end{bmatrix}
$$

原矩阵的形状是 $(2,3)$，转置后的形状是 $(3,2)$

按元素表示：

$$
(A^\mathsf{T})_{ij}=A_{ji}
$$

也就是说，转置后的第 $i$ 行第 $j$ 列元素，来自原矩阵的第 $j$ 行第 $i$ 列

转置不会改变元素总数，只会改变元素的排列方式

## 2. 转置的常用规则

### 转置两次恢复原矩阵

$$
(A^\mathsf{T})^\mathsf{T}=A
$$

第一次转置交换行列，第二次转置再交换回来

### 和与标量乘法可以直接转置

$$
(A+B)^\mathsf{T}=A^\mathsf{T}+B^\mathsf{T}
$$

$$
(aA)^\mathsf{T}=aA^\mathsf{T}
$$

其中 $a$ 是标量

### 矩阵乘积的转置需要反转顺序

$$
(AB)^\mathsf{T}=B^\mathsf{T}A^\mathsf{T}
$$

这里不能写成 $A^\mathsf{T}B^\mathsf{T}$，因为矩阵乘法通常不满足交换律

假设：

$$
A\in\mathbb{R}^{M\times K},\qquad B\in\mathbb{R}^{K\times N}
$$

那么：

$$
AB\in\mathbb{R}^{M\times N}
$$

转置后：

$$
(AB)^\mathsf{T}\in\mathbb{R}^{N\times M}
$$

右侧的乘法必须写成：

$$
B^\mathsf{T}A^\mathsf{T}
$$

其形状为：

$$
(N,K)@(K,M)\rightarrow(N,M)
$$

形状也正好匹配

## 3. 对称矩阵

如果一个方阵满足：

$$
A^\mathsf{T}=A
$$

那么它称为对称矩阵

按元素看，对称矩阵满足：

$$
A_{ij}=A_{ji}
$$

例如：

$$
A=\begin{bmatrix}
1&2&3\\
2&4&5\\
3&5&6
\end{bmatrix}
$$

对称矩阵在协方差矩阵、距离矩阵、二次型和优化问题中经常出现

## 4. 单位矩阵

单位矩阵记作 $I$，它是主对角线为 $1$、其他位置为 $0$ 的方阵

例如，三阶单位矩阵为：

$$
I_3=\begin{bmatrix}
1&0&0\\
0&1&0\\
0&0&1
\end{bmatrix}
$$

单位矩阵在矩阵乘法中的作用类似于数字 $1$：

$$
IA=AI=A
$$

如果 $A$ 不是方阵，左侧和右侧的单位矩阵阶数需要匹配：

$$
I_MA=A,\qquad AI_N=A
$$

其中 $A\in\mathbb{R}^{M\times N}$

单位矩阵还满足：

$$
I^\mathsf{T}=I
$$

它是自己的转置

## 5. 逆矩阵的定义

对于方阵 $A$，如果存在矩阵 $A^{-1}$，使得：

$$
A^{-1}A=AA^{-1}=I
$$

那么 $A^{-1}$ 称为 $A$ 的逆矩阵，矩阵 $A$ 称为可逆矩阵或非奇异矩阵

这和数字的倒数类似：

$$
\frac{1}{a}a=a\frac{1}{a}=1
$$

但逆矩阵只对满足条件的方阵存在。非方阵和奇异方阵通常没有普通意义下的逆矩阵

## 6. 逆矩阵的常用规则

### 逆矩阵的逆

$$
(A^{-1})^{-1}=A
$$

### 乘积的逆需要反转顺序

$$
(AB)^{-1}=B^{-1}A^{-1}
$$

只有当 $A$ 和 $B$ 都可逆且乘积维度匹配时，这个公式才成立

### 转置和逆矩阵可以交换顺序

$$
(A^\mathsf{T})^{-1}=(A^{-1})^\mathsf{T}
$$

这说明先转置再求逆，和先求逆再转置，结果相同

### 正交矩阵的逆等于转置

如果方阵 $Q$ 满足：

$$
Q^\mathsf{T}Q=QQ^\mathsf{T}=I
$$

那么 $Q$ 称为正交矩阵，并且：

$$
Q^{-1}=Q^\mathsf{T}
$$

这个性质让正交矩阵的求逆非常简单，也能保持向量的长度和角度

## 7. 用逆矩阵表示线性方程的解

考虑线性方程组：

$$
Ax=b
$$

如果 $A$ 可逆，两边左乘 $A^{-1}$：

$$
A^{-1}Ax=A^{-1}b
$$

利用 $A^{-1}A=I$：

$$
x=A^{-1}b
$$

这给出了方程的数学表达式，但不代表工程实现时应该真的先计算 $A^{-1}$

## 8. 为什么通常不显式计算逆矩阵

直接计算 $A^{-1}$ 往往需要更多计算和额外内存，也可能放大浮点误差。实际求解 $Ax=b$ 时，通常直接使用矩阵分解：

- LU 分解（LU Decomposition，也称 Lower-Upper Decomposition）适合一般方阵
- QR 分解（QR Decomposition）把矩阵分成正交矩阵和上三角矩阵，数值稳定性通常较好
- Cholesky 分解（Cholesky Decomposition）适用于对称正定矩阵，计算成本比一般分解更低

### LU 中的 L 和 U

LU 分解的形式是：

$$
A=LU
$$

其中：

- $L$ 是下三角矩阵（Lower Triangular Matrix），主对角线右上方的元素全为 $0$
- $U$ 是上三角矩阵（Upper Triangular Matrix），主对角线左下方的元素全为 $0$

例如：

$$
L=\begin{bmatrix}
1&0&0\\
\ell_{21}&1&0\\
\ell_{31}&\ell_{32}&1
\end{bmatrix},\qquad
U=\begin{bmatrix}
u_{11}&u_{12}&u_{13}\\
0&u_{22}&u_{23}\\
0&0&u_{33}
\end{bmatrix}
$$

常见的 Doolittle 形式会把 $L$ 的主对角线设为 $1$。下三角结构适合从上到下进行前向代入，上三角结构适合从下到上进行回代，这正是 $LUx=b$ 可以拆成两个简单方程的原因

### QR 和 Cholesky 中的矩阵

QR 分解的英文含义可以直接从矩阵名称理解：

$$
A=QR
$$

其中 $Q$ 是正交矩阵（Orthogonal Matrix），满足 $Q^\mathsf{T}Q=I$，$R$ 是上三角矩阵（Upper Triangular Matrix）

Cholesky 分解通常写成：

$$
A=LL^\mathsf{T}
$$

其中 $A$ 必须是对称正定矩阵，$L$ 是对角线元素为正的下三角矩阵。它只需要存储和计算一个三角矩阵，因此通常比一般 LU 分解更高效

以 LU 分解为例，原方程变为：

$$
LUx=b
$$

可以先求解：

$$
Ly=b
$$

再求解：

$$
Ux=y
$$

### 一个具体例子

考虑线性方程组：

$$
A=\begin{bmatrix}
3&1\\
1&2
\end{bmatrix},\qquad
b=\begin{bmatrix}
9\\
8
\end{bmatrix}
$$

目标是求出满足 $Ax=b$ 的向量 $x$

对 $A$ 做 LU 分解：

$$
A=LU
=
\begin{bmatrix}
1&0\\
\frac{1}{3}&1
\end{bmatrix}
\begin{bmatrix}
3&1\\
0&\frac{5}{3}
\end{bmatrix}
$$

于是原方程变成：

$$
LUx=b
$$

先令 $Ux=y$，求解下三角方程 $Ly=b$：

$$
\begin{bmatrix}
1&0\\
\frac{1}{3}&1
\end{bmatrix}
\begin{bmatrix}
y_1\\
y_2
\end{bmatrix}
=
\begin{bmatrix}
9\\
8
\end{bmatrix}
$$

逐行计算得到：

$$
y_1=9,\qquad
\frac{1}{3}y_1+y_2=8
\quad\Longrightarrow\quad
y=\begin{bmatrix}9\\5\end{bmatrix}
$$

再求解上三角方程 $Ux=y$：

$$
\begin{bmatrix}
3&1\\
0&\frac{5}{3}
\end{bmatrix}
\begin{bmatrix}
x_1\\
x_2
\end{bmatrix}
=
\begin{bmatrix}
9\\
5
\end{bmatrix}
$$

从最后一行开始回代：

$$
\frac{5}{3}x_2=5\quad\Longrightarrow\quad x_2=3
$$

$$
3x_1+x_2=9\quad\Longrightarrow\quad x_1=2
$$

因此：

$$
x=\begin{bmatrix}2\\3\end{bmatrix}
$$

如果显式计算逆矩阵，会得到：

$$
A^{-1}=\frac{1}{5}
\begin{bmatrix}
2&-1\\
-1&3
\end{bmatrix}
$$

再计算 $A^{-1}b$ 同样得到 $x=(2,3)^\mathsf{T}$。两种方法的数学结果一致，但求解一个或多个右端向量时，LU 分解只需要分解一次，再重复进行三角方程求解，不需要显式构造整个逆矩阵

这两个步骤分别是三角方程求解，通常比显式计算逆矩阵更快，也更适合数值计算

在 PyTorch 中，已知 $A$ 和 $b$ 时通常写成：

```python
x = torch.linalg.solve(A, b)
```

而不是：

```python
x = torch.linalg.inv(A) @ b
```

前者直接求解线性方程，避免了不必要的求逆过程
