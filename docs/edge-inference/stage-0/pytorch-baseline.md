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

我这次第一次构建用了 `1749.9s`，最后显示 `8/8 FINISHED`，镜像名是 `edge-inference-pytorch:cu128`

### 启动容器

先回到仓库根目录，再启动刚才构建好的镜像：

```bash
cd ~/ZaneZhang-67-ai-infra-notes

docker run --rm -it \
  --runtime=nvidia \
  --ipc=host \
  -v "$PWD:/workspace" \
  edge-inference-pytorch:cu128
```

这里的 `~/ZaneZhang-67-ai-infra-notes` 是我自己的仓库路径，其他人要换成仓库在自己电脑上的实际位置

| 参数 | 含义 |
|---|---|
| `--rm` | 退出后删除这次创建的容器，构建好的镜像不会被删除 |
| `-it` | 让终端可以直接输入命令 |
| `--runtime=nvidia` | 把 NVIDIA GPU 和驱动交给容器使用 |
| `--ipc=host` | 让容器使用主机的共享内存，后面跑模型和 DataLoader 时不容易卡在很小的默认共享内存上限 |
| `-v "$PWD:/workspace"` | 把当前目录挂载到容器里的 `/workspace`，在容器里写下的脚本会直接保存在仓库中 |
| `edge-inference-pytorch:cu128` | 这次要启动的镜像 |

`$PWD` 代表执行命令时所在的目录，所以这条命令要在仓库根目录运行。如果不在仓库根目录，也可以把 `$PWD` 换成仓库的绝对路径

启动后，提示符会变成类似下面这样：

```text
root@10ca31222d24:/workspace#
```

`10ca31222d24` 是这次容器的 ID，每次创建容器都可能不同

### 检查 PyTorch 能不能使用 GPU

在容器中进入 Python：

```bash
python
```

逐行执行：

```python
import torch

torch.__version__
torch.version.cuda
torch.cuda.get_device_name(0)

x = torch.randn((4096, 4096), device="cuda")
y = x @ x

y.shape
y.device
```

<img className="figure-image" src="/ai-infra-notes/img/edge-inference/stage-0/rtx-3090-pytorch-cuda-check.png" alt="在自建容器中检查 PyTorch 和 RTX 3090" />

<div className="figure-caption">图 1：在自建容器中检查 PyTorch 版本并运行一次 GPU 矩阵乘法</div>

### 输出怎么看

容器启动时显示：

```text
CUDA Version 12.8.1
```

这是基础镜像带进容器的 CUDA Runtime 版本

```text
'2.8.0+cu128'
```

当前 PyTorch 版本是 2.8.0，`cu128` 表示安装的是 CUDA 12.8 版 wheel

```text
'12.8'
```

这是当前 PyTorch 构建时使用的 CUDA 版本，不是宿主机上 `nvcc` 的版本。宿主机的 CUDA Toolkit 是 12.2，容器中的 PyTorch 仍然可以使用自己带的 CUDA 12.8 用户态库

```text
'NVIDIA GeForce RTX 3090'
```

PyTorch 已经能看到宿主机上的 RTX 3090

```text
torch.Size([4096, 4096])
device(type='cuda', index=0)
```

矩阵乘法得到一个 `4096 × 4096` 的张量，结果保存在第 0 张 CUDA 设备上
