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

## ResNet18 第一次计时

先用 torchvision 自带的 ResNet18 跑一轮 FP32 单张推理。这里设置 `weights=None`，不会下载预训练权重，也不检查分类准确率，只看这张网络在 GPU 上执行一次要花多少时间

### 在宿主机写脚本

容器里没有安装编辑器，脚本放在宿主机上写：

```bash
cd ~/ZaneZhang-67-ai-infra-notes
mkdir -p benchmarks/pytorch
code .
```

在 VS Code 中新建 `benchmarks/pytorch/resnet18_timing.py`

启动容器时已经把仓库挂载到了 `/workspace`，所以宿主机和容器看到的是同一个脚本。VS Code 负责编辑，运行时要回到提示符为 `root@容器ID:/workspace#` 的容器终端

如果在 `(base) zene@主机名` 这样的宿主机终端运行，会遇到下面的错误：

```text
ModuleNotFoundError: No module named 'torch'
```

PyTorch 安装在这次构建的容器里，宿主机的 Conda base 环境没有安装它

### 完整脚本

```python
import time

import torch
from torchvision.models import resnet18


WARMUP_STEPS = 50    # 预热 50 步
MEASURE_STEPS = 200  # 正式测 200 步

# 建一个随机初始化的 ResNet18，weights=None 不下载预训练权重
model = resnet18(weights=None).eval().cuda()
input_tensor = torch.randn(1, 3, 224, 224, device="cuda")  # NCHW

# 按推理方式运行，不为反向传播保存中间结果
with torch.inference_mode():
    # 把同一个输入送进 ResNet18，先空跑 50 次
    for _ in range(WARMUP_STEPS):
        model(input_tensor)

    # 等 GPU 做完前面的计算，再开始下面的计时
    torch.cuda.synchronize()

    cpu_start = time.perf_counter()

    for _ in range(MEASURE_STEPS):
        model(input_tensor)

    # 这里故意不在读取结束时间前同步 GPU
    # 这个数字不能当成 GPU 完成一次前向的时间
    wrong_latency_ms = (
        time.perf_counter() - cpu_start
    ) * 1000 / MEASURE_STEPS

    torch.cuda.synchronize()

    # 重置峰值统计，不会释放模型已经占用的显存
    torch.cuda.reset_peak_memory_stats()

    start_event = torch.cuda.Event(enable_timing=True)
    end_event = torch.cuda.Event(enable_timing=True)
    latencies_ms = []

    for _ in range(MEASURE_STEPS):
        start_event.record()
        output = model(input_tensor)
        end_event.record()
        end_event.synchronize()

        latencies_ms.append(
            start_event.elapsed_time(end_event)
        )

latencies = torch.tensor(latencies_ms)
mean_latency = latencies.mean().item()

print(f"GPU: {torch.cuda.get_device_name(0)}")
print(f"Output shape: {tuple(output.shape)}")
print(f"Wrong timing: {wrong_latency_ms:.3f} ms")
print(f"Mean: {mean_latency:.3f} ms")
print(f"P50: {latencies.quantile(0.50).item():.3f} ms")
print(f"P95: {latencies.quantile(0.95).item():.3f} ms")
print(f"P99: {latencies.quantile(0.99).item():.3f} ms")
print(f"Throughput: {1000 / mean_latency:.2f} images/s")
print(
    f"Peak memory: "
    f"{torch.cuda.max_memory_allocated() / 1024**2:.2f} MiB"
)
```

### 这几个地方容易看错

`eval()` 把 BatchNorm、Dropout 等模块切到推理状态，`torch.inference_mode()` 则关闭这段代码里的梯度记录。两者管的事情不同，这里都要有

前 50 次前向不计入结果。第一次运行时会发生 CUDA context 初始化、显存分配和 cuDNN 算法准备，直接把它们算进正式结果会让前几次特别慢

`time.perf_counter()` 是 CPU 时钟，它不知道 GPU 什么时候算完。第一组循环在读取结束时间前没有调用 `torch.cuda.synchronize()`，留下来就是为了和 CUDA Event 的结果对照

第二组计时把 Event 放到 GPU 的执行队列里，`end_event.synchronize()` 等这次前向真正结束后再读取两个 Event 之间的时间

`torch.cuda.reset_peak_memory_stats()` 只重置 PyTorch 的显存峰值计数器，不会清空显存，也不会卸载模型

### 执行

回到容器中的 `/workspace`：

```bash
python benchmarks/pytorch/resnet18_timing.py
```

<img className="figure-image" src="/ai-infra-notes/img/edge-inference/stage-0/rtx-3090-resnet18-fp32-timing.png" alt="RTX 3090 上的 ResNet18 FP32 推理计时结果" />

<div className="figure-caption">图 2：RTX 3090 上的 ResNet18 FP32 单张推理结果</div>

### 结果怎么读

```text
Output shape: (1, 1000)
```

batch 是 1，ResNet18 默认输出 1000 个类别，所以结果形状是 `(1, 1000)`。这里使用随机权重，形状可以用来检查前向是否跑通，输出内容不能用来判断分类效果

```text
Wrong timing: 0.773 ms
Mean: 0.678 ms
```

`Wrong timing` 这次反而比 CUDA Event 的平均值大。没有同步的错误计时经常偏小，但不是每次都一定更小。它混进了 Python 循环、算子下发和队列等待，测量边界里又没有 GPU 完成点，所以这个数字没有明确的 GPU 延迟含义

`Mean: 0.678 ms` 来自 200 次 CUDA Event 计时的平均值，每次前向结束后都做了同步，可以作为这一轮的单张推理平均延迟

```text
P50: 0.655 ms
P95: 0.733 ms
P99: 0.758 ms
```

200 次测量中，一半不超过 `0.655 ms`，95% 不超过 `0.733 ms`，99% 不超过 `0.758 ms`。本次 P99 比 P50 高 `0.103 ms`，后面重复跑多轮时再看这个差距是否稳定

```text
Throughput: 1474.25 images/s
```

这个数字是用 `1000 / Mean` 换算出来的，因为 batch 是 1，所以单位是 images/s。它不是另跑一组连续请求测出来的吞吐量，后面做 batch 和并发实验时要重新测

```text
Peak memory: 630.91 MiB
```

这是 PyTorch 在正式计时阶段记录到的峰值已分配显存，包含模型、输入、输出和前向过程用到的张量。它不是 `nvidia-smi` 里的整个进程显存，也不是 RTX 3090 的总显存
