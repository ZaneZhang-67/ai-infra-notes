---
title: 3.1 Transformer 整体架构
description: 从输入到输出理解 Transformer 的完整数据流。
---

# 3.1 Transformer 整体架构

## 2.2 当前大模型的主流：Decoder-only 架构

GPT 系列模型说明了一个重要事实：只使用 Decoder，也可以完成语言理解和文本生成。现在常见的 GPT、LLaMA、Mistral、Qwen、DeepSeek 等大语言模型，普遍采用 Decoder-only 架构，去掉了 Encoder 和 Cross-Attention，只保留带因果掩码的 Self-Attention

整体结构可以概括为三部分：

1. 输入层，把 token 转换成向量，并加入位置信息
2. $N$ 层 Decoder Block，把输入表示逐层加工成更丰富的上下文表示
3. 输出层，把最后的隐藏状态映射到词表，得到下一个 token 的概率

<img
  src="/ai-infra-notes/img/decoder-only-architecture.png"
  alt="Decoder-only 架构示意图"
  style={{width: '100%', height: 'auto'}}
/>

## 2.2.1 输入层

输入文本首先被切分成 token，再通过 Embedding 映射到模型隐藏维度

假设输入序列长度为 $S$，隐藏维度为 $D$，那么输入可以表示为：

$$
X\in\mathbb{R}^{S\times D}
$$

模型还需要知道 token 的顺序。现代模型通常使用 RoPE 等位置编码方法，把位置信息注入 Attention 的计算过程。位置编码的作用是区分“我喜欢猫”和“猫喜欢我”这类 token 相同但顺序不同的输入

## 2.2.2 Decoder Block 的重复堆叠

整个模型的核心是中间重复堆叠的 $N$ 层 Decoder Block。每个 Block 的结构基本相同，上一层的输出作为下一层的输入

一个 Decoder Block 主要包含两个子模块：

- **Masked Self-Attention**：让每个 token 聚合它前面 token 的信息
- **FFN**：对每个 token 的表示独立进行非线性变换

每个子模块前后还会配合 LayerNorm 和残差连接，使信息能够稳定地穿过很多层

### Masked Self-Attention

Decoder-only 模型必须按照从左到右的顺序生成文本。计算第 $t$ 个 token 时，只能使用位置 $1$ 到 $t$ 的信息，不能提前看到未来 token

因此 Attention 分数矩阵会加上因果掩码（Causal Mask）：当前位置之后的区域被屏蔽，Softmax 后对应位置的权重为 $0$

这也是它和 Encoder Self-Attention 的关键区别：Encoder 可以让序列中的 token 彼此查看，Decoder 的 Self-Attention 必须遵守从左到右的信息流

### FFN

Attention 负责让 token 之间交换信息，FFN 则对每个 token 的隐藏状态独立做特征变换。典型形式可以写成：

$$
\operatorname{FFN}(x)=W_2\,\sigma(W_1x+b_1)+b_2
$$

其中 $W_1$ 通常先把隐藏维度扩大，经过激活函数后，再由 $W_2$ 投影回原来的隐藏维度。由于 FFN 主要由大矩阵乘法组成，它通常也是模型计算量的重要来源

## 2.2.3 输出层

最后一层 Decoder Block 输出隐藏状态后，经过一个线性层投影到词表大小：

$$
Z=HW_{vocab}
$$

再经过 Softmax 得到每个 token 的概率分布。推理时，模型会根据这个分布选择或采样下一个 token，把新 token 接到输入序列末尾，再继续进行下一轮计算

## 2.2.4 为什么叫 Decoder-only

原始 Transformer 的 Decoder 包含 Masked Self-Attention、Cross-Attention 和 FFN。Decoder-only 模型去掉了 Cross-Attention，因为它不再接收单独的 Encoder 输出

它只保留：

$$
\text{Masked Self-Attention}+\text{FFN}+\text{残差连接与 LayerNorm}
$$

输入序列本身既是模型要理解的上下文，也是模型生成后续 token 的依据。因此，一套 Decoder Block 就可以同时承担上下文建模和文本生成任务

## 2.2.5 Pre-Norm 与 Post-Norm

Decoder-only 架构中还有一个容易混淆的区别：LayerNorm 放在子模块之前还是之后

- **Post-Norm**：先计算子模块和残差相加，再进行 LayerNorm
- **Pre-Norm**：先对输入做 LayerNorm，再进入 Attention 或 FFN，最后与残差相加

两种结构的主要差异在于残差分支和梯度的传播路径。现代大语言模型通常更常见的是 Pre-Norm，因为它在深层堆叠时通常更容易训练稳定

## 2.2.6 与 AI Infra 优化的关系

Decoder-only 模型的结构直接决定了工程优化的对象：

- Masked Self-Attention 带来 $QK^\mathsf{T}$、Softmax 和 $PV$ 等计算
- FFN 带来占比较大的矩阵乘法和显存读写
- $N$ 层 Block 的重复堆叠放大了每个 Kernel 的性能差异
- 自回归生成使 KV Cache 成为推理部署中的关键数据结构

因此，理解 Decoder-only 的数据流，是继续学习 Attention、FFN、归一化、残差连接和 KV Cache 的基础

## 2.2.7 参考视频

可以结合 [Transformer 结构讲解视频](https://www.bilibili.com/video/BV1xoJwzDESD/) 观看整体数据流，再回到本文对照 Decoder Block 中每个子模块的作用
