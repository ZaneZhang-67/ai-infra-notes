---
title: PyTorch 推理基线
description: 在 RTX 3090 上建立第一条可复现、计时正确的模型推理基线
---

# PyTorch 推理基线

## 为什么先做 PyTorch 基线

先用 PyTorch 跑出一条可信的参考结果。后面做 ONNX、TensorRT 和 CUDA 优化时，速度和精度都要拿它来对比

## 这一轮要拿到什么

- 模型能在 GPU 上稳定运行
- 写清模型、输入 shape、batch、dtype 和环境
- 分开预热和正式测量
- GPU 计时包含正确的同步
- 输出 P50、P95、P99、吞吐量和峰值显存
- 重复运行时，能解释结果为什么会有波动

## 准备 PyTorch 容器

这次不用已经装好 PyTorch 的 NGC 镜像，而是从 NVIDIA CUDA Runtime 镜像开始，自己安装 Python 和 PyTorch

这里的`从头创建`不是使用空白的 `FROM scratch`。CUDA 用户态库和 cuDNN 仍然来自 NVIDIA 官方镜像

### 建目录

```bash
cd ~/ZaneZhang-67-ai-infra-notes

mkdir -p docker/pytorch-baseline

cd docker/pytorch-baseline

nano Dockerfile
```

`~/ZaneZhang-67-ai-infra-notes` 是我本机的仓库路径。其他人需要把第一条命令换成自己的仓库路径，后面的 `docker/pytorch-baseline` 目录可以保持不变

### Dockerfile

```dockerfile
FROM nvidia/cuda:12.8.1-cudnn-runtime-ubuntu24.04

ARG DEBIAN_FRONTEND=noninteractive

ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    ca-certificates \
    && python3 -m venv "$VIRTUAL_ENV" \
    && pip install --no-cache-dir --upgrade pip \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    torch==2.8.0 \
    torchvision==0.23.0 \
    --index-url https://download.pytorch.org/whl/cu128

WORKDIR /workspace

CMD ["bash"]
```

| 配置 | 作用 |
|---|---|
| `nvidia/cuda:12.8.1-cudnn-runtime-ubuntu24.04` | Ubuntu 24.04、CUDA 12.8 Runtime 和 cuDNN |
| `/opt/venv` | 容器里的 Python 虚拟环境 |
| `torch==2.8.0` | 固定 PyTorch 版本 |
| `torchvision==0.23.0` | 与 PyTorch 2.8.0 对应的 torchvision 版本 |
| `cu128` | 安装 CUDA 12.8 版 PyTorch wheel |
| `/workspace` | 容器内的工作目录，不是宿主机仓库的真实路径 |

CUDA 12.8 可以运行在 RTX 3090 上，也支持 RTX 5090 使用的 Blackwell 架构。这份镜像用于 x86_64 桌面显卡，Jetson Orin 和 Thor 后面使用各自 JetPack 对应的 ARM64 镜像

### 构建镜像

在 `docker/pytorch-baseline` 目录执行：

```bash
docker build -t edge-inference-pytorch:cu128 .
```

| 参数 | 含义 |
|---|---|
| `docker build` | 根据 Dockerfile 构建镜像 |
| `-t edge-inference-pytorch:cu128` | 镜像名是 `edge-inference-pytorch`，标签是 `cu128` |
| `.` | 当前目录是 Docker 构建上下文，Dockerfile 也在这里 |

构建过程会下载 CUDA Runtime 基础镜像、Ubuntu 软件包和 PyTorch wheel，第一次构建需要等待一段时间
