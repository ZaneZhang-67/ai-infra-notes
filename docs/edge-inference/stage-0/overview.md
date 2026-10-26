---
title: 阶段 0：环境盘点与基线
description: 建立可复现的设备环境档案和第一条可信推理基线
---

# 阶段 0：环境盘点与基线

## 这一阶段要做什么

1. 盘点 RTX 3090、RTX 5090、Jetson Orin 和 Jetson Thor 的软硬件环境
2. 理清驱动、CUDA、cuDNN、TensorRT、PyTorch 和 JetPack/L4T 的实际版本关系
3. 定好 benchmark 的测量方法和结果格式
4. 在 RTX 3090 上跑出第一条 PyTorch 推理基线
5. 找出错误计时、环境污染和无法复现的配置

## 实践清单

- [ ] [环境判断](./environment-inventory.md)
- [ ] [PyTorch 推理基线](./pytorch-baseline.md)
- [ ] 补齐 RTX 5090 环境报告
- [ ] 补齐 Jetson Orin 环境报告
- [ ] 补齐 Jetson Thor 环境报告
- [ ] 比较四台设备的软件栈和目标用途

## 做到什么程度算完成

- 四台设备各有一份环境报告
- 基准测试写清模型、输入、精度、预热、迭代次数和计时方法
- 结果里有 P50、P95、P99、吞吐量和峰值显存
- 只看记录就能重新跑出同一个实验
- 能说清楚为什么异步 GPU 计时容易测错
