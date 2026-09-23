---
title: 第3章：AI Infra 工程师学 Transformer
description: 从计算、显存和通信视角理解 Transformer。
---

# 第3章：AI Infra 工程师学 Transformer

## 1. 为什么 AI Infra 工程师必须懂 Transformer

如果准备深入 AI Infra，无论是写 CUDA kernel、做分布式训练，还是做推理部署，最终面对的核心工作对象通常都是 Transformer 模型

这就像汽车工程师需要理解发动机结构。无需自己重新设计 Transformer，但需要知道每个模块在哪里、数据如何流动、计算和显存开销从哪里产生，才能判断应该优化哪个环节

AI Infra 的不同工作层级，分别对应 Transformer 中的不同模块：

| AI Infra 层级 | 核心工作 | 对应的 Transformer 模块 |
| --- | --- | --- |
| CUDA 算子优化 | FlashAttention、高效 GEMM kernel | Self-Attention 中的 $QK^\mathsf{T}$、PV 矩阵乘法 |
| CUDA 算子优化 | Fused Softmax、Online Softmax | Attention 中的 softmax 计算 |
| CUDA 算子优化 | LayerNorm kernel 融合 | 每个 Block 中的归一化层 |
| 分布式训练 | 张量并行（Tensor Parallelism） | Attention 的多头切分、FFN 的矩阵切分 |
| 分布式训练 | 流水线并行（Pipeline Parallelism） | 模型的多层 Decoder Block 堆叠结构 |
| 分布式训练 | ZeRO 显存优化 | 所有参数矩阵的存储与通信 |
| 推理部署 | KV Cache 管理 | Self-Attention 中的 K、V 矩阵 |
| 推理部署 | PagedAttention | KV Cache 的显存碎片问题 |
| 推理部署 | 量化（INT4/INT8/FP8） | 所有权重矩阵和 KV Cache |

不理解 Transformer，就很难判断 AI Infra 优化的对象、位置和收益。后续遇到的每个优化技术，都可以回到模型结构中找到它所作用的具体模块

## 2. Transformer 网络结构全貌

在拆解各个模块之前，先从宏观视角看一遍 Transformer 的整体结构。可以把它理解成一条从输入文本到输出文本的数据处理流水线：输入先变成向量，经过多层 Transformer Block 逐步提取上下文信息，最后转换成下一个 token 的概率

<mark>可以参考 <a href="https://www.bilibili.com/video/BV1xoJwzDESD/">Transformer 结构讲解视频</a> 建立整体认知。观看时可以重点关注输入如何经过 Encoder、Decoder、Attention 和 FFN，而不必一开始就记住每个公式</mark>

### 2.1 原始 Transformer：Encoder-Decoder 架构

2017 年论文《Attention Is All You Need》提出的原始 Transformer，主要由 Encoder 和 Decoder 两部分组成

<img
  src="/ai-infra-notes/img/transformer-encoder-decoder-source.png"
  alt="Transformer 原始 Encoder-Decoder 结构图"
  style={{width: '100%', height: 'auto'}}
/>

**Encoder** 负责读取输入序列并建立上下文表示。每一层通常包含：

- Self-Attention，让输入序列中的 token 彼此交互，计算每个 token 应该关注哪些其他 token
- Feed-Forward Network（FFN），对每个位置的表示独立做更丰富的非线性变换
- 残差连接和 LayerNorm，帮助信息跨层传递并保持训练稳定

**Decoder** 根据 Encoder 的输出逐步生成目标序列。每一层通常包含：

- Masked Self-Attention，只允许当前位置看到已经生成的 token，避免提前看到未来信息
- Cross-Attention，让 Decoder 的当前状态读取 Encoder 产生的源序列表示
- Feed-Forward Network，以及对应的残差连接和 LayerNorm

整个数据流可以按下面的顺序理解：

1. 输入序列经过 Embedding 和位置编码，进入 Encoder
2. Encoder 通过多层 Self-Attention 和 FFN，把输入转换成带上下文的信息表示
3. Decoder 接收已经生成的部分输出，同时通过 Cross-Attention 读取 Encoder 的表示
4. 最后一层经过 Linear 和 Softmax，得到下一个 token 的概率

其中，Encoder 的 Self-Attention 可以让输入 token 互相查看，Decoder 的 Masked Self-Attention 只能查看当前位置之前的 token，Decoder 的 Cross-Attention 则负责连接源序列和目标序列

这套结构最初主要用于机器翻译：Encoder 理解源语言，Decoder 生成目标语言。后来的 BERT 主要使用 Encoder，GPT 类模型主要使用 Decoder-only 结构，但 Self-Attention、FFN、残差连接和归一化仍然是理解这些模型的基础

### 2.2 图中各模块的中文理解

可以把结构图中的模块对应成几类工作：

| 模块 | 作用 |
| --- | --- |
| Embedding | 把 token 编号转换成向量 |
| 位置编码 | 把 token 在序列中的位置信息加入向量 |
| Self-Attention | 在同一序列内部聚合上下文信息 |
| Masked Self-Attention | 生成任务中限制信息只能从左向右流动 |
| Cross-Attention | 让 Decoder 读取 Encoder 的输出 |
| FFN | 对每个 token 的表示进行独立的特征变换 |
| Add & Norm | 通过残差连接和归一化稳定深层网络训练 |
| Linear + Softmax | 把隐藏状态转换成词表上的概率 |

从 AI Infra 的角度看，Self-Attention 主要带来矩阵乘法和序列长度相关的显存开销，FFN 主要带来大规模 GEMM 计算，残差和归一化涉及额外的读写与 kernel 融合，Decoder 推理还会引入 KV Cache 管理问题
