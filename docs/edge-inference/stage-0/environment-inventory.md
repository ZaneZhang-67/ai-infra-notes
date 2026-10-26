---
title: 环境判断
description: 通过实际命令判断设备、操作系统、硬件资源和开发环境
---

# 环境判断

## RTX 3090

### 第一次判断：主机、系统、CPU 与内存

#### 执行命令

```bash
hostname
uname -a
cat /etc/os-release
lscpu | sed -n '1,24p'
free -h
```

#### 原始结果

![主机、系统和 CPU 信息](pathname:///ai-infra-notes/img/edge-inference/stage-0/rtx-3090-system-environment.png)

<div className="figure-caption">图 1：依次执行 hostname、uname -a、读取 os-release，并查看 lscpu 的前 24 行</div>

![内存与交换空间信息](pathname:///ai-infra-notes/img/edge-inference/stage-0/rtx-3090-memory-status.png)

<div className="figure-caption">图 2：执行 free -h 得到的内存与交换空间摘要</div>

#### 每条命令是什么意思

##### `hostname`

`hostname` 用来查看这台机器的名字。有好几台机器时，这个名字可以帮我们分清结果是在哪台设备上跑的，但它看不出机器型号或 GPU 型号

本机输出：

```text
yons-MS-7D99
```

当前机器叫 `yons-MS-7D99`

##### `uname -a`

`uname` 用于输出内核和硬件平台信息，`-a` 表示输出所有常用字段。这一行可以按下面的方式理解：

```text
Linux yons-MS-7D99 5.15.0-139-generic #149~20.04.1-Ubuntu SMP Wed Apr 16 08:29:56 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
```

| 输出片段 | 含义 | 本次判断 |
|---|---|---|
| `Linux` | 内核名称 | 当前运行 Linux 内核 |
| `yons-MS-7D99` | 主机名 | 与 `hostname` 的结果一致 |
| `5.15.0-139-generic` | 内核版本 | 使用 Ubuntu generic 5.15 内核 |
| `#149~20.04.1-Ubuntu` | Ubuntu 内核构建编号 | 这是 Ubuntu 20.04 系列提供的内核构建 |
| `SMP` | 支持对称多处理 | 内核可以调度多个 CPU 核心 |
| `Wed Apr 16 ... 2025` | 该内核的构建时间 | 不是系统安装时间，也不是本次命令执行时间 |
| `x86_64` | 机器与处理器架构 | 这是 64 位 x86 主机，不是 Jetson 使用的 ARM64 主机 |
| `GNU/Linux` | 操作系统类型 | GNU 用户态与 Linux 内核组合 |

这里连续出现了三个 `x86_64`，分别来自机器、处理器和硬件平台字段，说的都是同一种架构，不是说机器里有三颗处理器

##### `cat /etc/os-release`

`cat` 会把文件内容打印到终端，`/etc/os-release` 里记的是 Linux 发行版信息。`uname` 主要看内核，这个文件主要看系统版本

关键输出为：

```text
NAME="Ubuntu"
VERSION="20.04.6 LTS (Focal Fossa)"
PRETTY_NAME="Ubuntu 20.04.6 LTS"
VERSION_ID="20.04"
VERSION_CODENAME=focal
```

截图里能直接读到：

- 系统是 Ubuntu 20.04.6 LTS，代号是 `focal`

##### `lscpu | sed -n '1,24p'`

这行命令其实是三部分拼在一起：

- `lscpu` 从 `/proc` 和 `/sys` 汇总 CPU 架构与拓扑信息
- `|` 是管道，把 `lscpu` 的输出交给右边的命令
- `sed -n '1,24p'` 只打印第 1 到第 24 行，避免第一次就输出太多内容

这份输出里先看这些字段：

| 字段 | 实际输出 | 解读 |
|---|---:|---|
| 架构 | `x86_64` | 64 位 x86 平台 |
| 字节序 | `Little Endian` | 多字节数据的低位字节存放在低地址 |
| Address sizes | `46 bits physical, 48 bits virtual` | CPU 地址能力，不是机器实际安装了这么大的内存 |
| CPU | `28` | 操作系统可调度 28 个逻辑 CPU，编号为 0～27 |
| 每个座的核数 | `20` | 单路 CPU 包含 20 个物理核心 |
| 座 | `1` | 单路 CPU 系统 |
| NUMA 节点 | `1` | 所有逻辑 CPU 都属于 NUMA 节点 0 |
| 型号名称 | `Intel(R) Core(TM) i7-14700` | CPU 型号为 Intel Core i7-14700 |
| CPU 最大/最小 MHz | `5400 / 800` | CPU 会在负载和电源策略影响下动态调频 |
| 虚拟化 | `VT-x` | CPU 支持 Intel 硬件虚拟化 |
| L1d/L1i/L2 | `480 KiB / 320 KiB / 20 MiB` | 当前截取范围内显示的缓存汇总 |

`20` 个物理核心和 `28` 个逻辑 CPU 与 i7-14700 的混合核心结构相符。有个地方容易看错：截图里写着`每个核的线程数为 1`，但性能核和能效核的线程能力并不一样，这一行没法把混合拓扑完整表示出来。以后做线程绑定或 CPU benchmark 时，还要看完整的 `lscpu -e`

`CPU MHz: 2100` 只是执行命令那一刻的频率，不是固定工作频率。正式测性能时还要记录 CPU governor、温度和频率状态。`BogoMIPS` 是内核校准值，不能拿来比较真实性能

##### `free -h`

`free` 用来查看物理内存和 swap，`-h` 会把数字换成 GiB、MiB 这类更容易读的单位

实际结果：

```text
              总计         已用        空闲      共享    缓冲/缓存    可用
内存：        62Gi       8.4Gi        30Gi       396Mi        23Gi        53Gi
交换：       2.0Gi          0B       2.0Gi
```

这里最容易看错的是`空闲`和`可用`：

- `总计 62 GiB`：操作系统能看到的物理内存，通常对应标称 64 GB 的机器
- `已用 8.4 GiB`：当前被进程和系统占用的内存
- `空闲 30 GiB`：完全没被使用的内存
- `缓冲/缓存 23 GiB`：Linux 用闲置内存缓存文件和数据，应用需要内存时可以回收其中的大部分
- `可用 53 GiB`：在不产生明显 swap 压力的情况下，新进程大约还能使用多少内存。看内存余量时，这个数字比`空闲`更有用
- `swap 2 GiB，已用 0 B`：机器配了 2 GiB 交换空间，现在没有用到

### GPU 与驱动

#### 执行命令

```bash
nvidia-smi
```

#### 输出

![RTX 3090 的 nvidia-smi 输出](pathname:///ai-infra-notes/img/edge-inference/stage-0/rtx-3090-nvidia-smi.png)

<div className="figure-caption">图 3：RTX 3090 主机上的 nvidia-smi 输出</div>

`nvidia-smi` 是 NVIDIA 提供的 GPU 状态查看工具，完整名称是 NVIDIA System Management Interface

#### 版本信息

```text
NVIDIA-SMI 580.126.09    Driver Version: 580.126.09    CUDA Version: 13.0
```

| 字段 | 输出 | 含义 |
|---|---|---|
| NVIDIA-SMI | `580.126.09` | 当前 `nvidia-smi` 工具版本 |
| Driver Version | `580.126.09` | NVIDIA 驱动版本 |
| CUDA Version | `13.0` | 当前驱动支持的 CUDA 版本上限，不代表机器已经安装 CUDA 13.0 Toolkit |

#### GPU 状态

| 字段 | 输出 | 含义 |
|---|---:|---|
| GPU | `0` | GPU 编号，从 0 开始 |
| Name | `NVIDIA GeForce RTX 3090` | GPU 型号 |
| Persistence-M | `Off` | Persistence Mode 没有开启 |
| Bus-Id | `00000000:01:00.0` | GPU 在 PCIe 总线上的地址 |
| Disp.A | `On` | 这张卡正在连接桌面显示 |
| Fan | `40%` | 风扇转速百分比 |
| Temp | `34C` | 采样时的 GPU 温度 |
| Perf | `P3` | 采样时处于 P3 性能状态，P0 是最高性能状态 |
| Pwr:Usage/Cap | `78W / 350W` | 当前功耗 78 W，功耗上限 350 W |
| Memory-Usage | `1468 MiB / 24576 MiB` | 已使用 1468 MiB 显存，总显存 24576 MiB |
| GPU-Util | `12%` | 采样时的 GPU 利用率 |
| Compute M. | `Default` | 使用默认计算模式 |
| Volatile Uncorr. ECC | `N/A` | 没有可用的 ECC 统计 |
| MIG M. | `N/A` | 这张卡不提供 MIG 模式 |

#### 进程表

下半部分列出正在使用 GPU 的进程

| 字段 | 含义 |
|---|---|
| GPU | 进程使用哪一张 GPU |
| PID | Linux 进程号 |
| Type | `G` 是图形进程，`C` 是计算进程，`C+G` 同时使用计算和图形能力 |
| Process name | 进程名称 |
| GPU Memory Usage | 进程占用的显存 |

截图里的 `Xorg`、`gnome-shell` 和桌面应用都在使用 RTX 3090，所以没有运行模型时显存也不会是 0

### CUDA Toolkit

#### 执行命令

```bash
nvcc --version
```

#### 输出

![nvcc 版本输出](pathname:///ai-infra-notes/img/edge-inference/stage-0/rtx-3090-nvcc-version.png)

<div className="figure-caption">图 4：RTX 3090 主机上的 nvcc 版本</div>

`nvcc` 是 CUDA Toolkit 里的编译器，`--version` 用来查看它的版本

```text
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2023 NVIDIA Corporation
Built on Tue_Jun_13_19:16:58_PDT_2023
Cuda compilation tools, release 12.2, V12.2.91
Build cuda_12.2.r12.2/compiler.32965470_0
```

| 输出 | 含义 |
|---|---|
| `Cuda compiler driver` | 这里的 driver 指编译器驱动程序，不是 NVIDIA 显卡驱动 |
| `Built on Tue_Jun_13_19:16:58_PDT_2023` | 这个编译器的构建时间 |
| `release 12.2` | 本机 CUDA Toolkit 的大版本是 12.2 |
| `V12.2.91` | `nvcc` 的完整版本号 |
| `compiler.32965470_0` | NVIDIA 内部的编译器构建编号 |

| 查看位置 | 版本 | 表示什么 |
|---|---:|---|
| `nvidia-smi` | `CUDA Version: 13.0` | 当前显卡驱动支持的 CUDA 版本上限 |
| `nvcc --version` | `release 12.2, V12.2.91` | 本机实际安装的 CUDA Toolkit 和编译器版本 |
