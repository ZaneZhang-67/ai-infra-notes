---
title: 环境判断
description: 通过实际命令判断设备、操作系统、硬件资源和开发环境。
---

# 环境判断

## 目的

确认每台设备真实安装的软件和硬件版本，为后续选择容器、PyTorch、TensorRT 和构建方式提供依据。盘点阶段不升级驱动，也不修改系统环境。

## 预期结果

每台设备应形成一份包含下列信息的环境档案：

- 主机名、设备角色和 CPU 架构。
- 操作系统与内核。
- CPU、内存和可用磁盘。
- GPU/SoC 型号、显存和驱动。
- CUDA、cuDNN、TensorRT、JetPack/L4T。
- Python、PyTorch 和开发工具链。
- Docker 与 NVIDIA Container Runtime。
- 已发现的缺失依赖或兼容性风险。

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

*图 1：依次执行 `hostname`、`uname -a`、读取 `os-release`，并查看 `lscpu` 的前 24 行。*

![内存与交换空间信息](pathname:///ai-infra-notes/img/edge-inference/stage-0/rtx-3090-memory-status.png)

*图 2：执行 `free -h` 得到的内存与交换空间摘要。*

#### 每条命令是什么意思

##### `hostname`

`hostname` 输出 Linux 内核当前记录的主机名。主机名用于区分网络和运维环境中的不同机器，本身不能说明机器型号或 GPU 型号。

本机输出：

```text
yons-MS-7D99
```

这说明当前机器的主机名是 `yons-MS-7D99`。后续保存 benchmark 时应记录它，避免混淆 3090、5090、Orin 和 Thor 的结果。

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

这里出现三个 `x86_64`，分别对应机器、处理器和硬件平台字段。它们都指向同一种架构，不代表有三颗处理器。

##### `cat /etc/os-release`

`cat` 把文件内容输出到终端；`/etc/os-release` 是 Linux 发行版提供的标准系统身份文件。相比 `uname` 主要描述内核，这个文件主要描述 Linux 发行版。

关键输出为：

```text
NAME="Ubuntu"
VERSION="20.04.6 LTS (Focal Fossa)"
PRETTY_NAME="Ubuntu 20.04.6 LTS"
VERSION_ID="20.04"
VERSION_CODENAME=focal
```

由此可以判断：

- 当前发行版是 Ubuntu，而不是只知道“它运行 Linux”。
- 版本是 Ubuntu 20.04.6 LTS，代号为 `focal`。
- 这是较早的系统版本，后续选择 Python、CMake、Docker、CUDA 和软件包时要核对兼容性。
- 盘点阶段只记录现状，不因为版本较早就立即升级系统或驱动。

##### `lscpu | sed -n '1,24p'`

这条命令由三部分组成：

- `lscpu` 从 `/proc` 和 `/sys` 汇总 CPU 架构与拓扑信息。
- `|` 是管道，把 `lscpu` 的输出交给右侧命令。
- `sed -n '1,24p'` 关闭默认输出，只打印第 1 到第 24 行，避免第一次盘点时信息过多。

本次输出的主要结论：

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

`20` 个物理核心和 `28` 个逻辑 CPU 与 i7-14700 的混合核心结构相符。截图同时显示“每个核的线程数为 1”，但这种单一字段不能完整表达性能核与能效核具有不同线程能力的非对称拓扑。后续做线程绑定或 CPU benchmark 时，应继续查看完整的 `lscpu -e`，不能只依赖这一行。

`CPU MHz: 2100` 只是执行命令时的瞬时频率，而不是固定工作频率。进行性能测试时，需要另外记录 CPU governor、温度和频率状态。`BogoMIPS` 是内核校准值，不能拿来比较真实性能。

由于这里只打印前 24 行，没有看到 L3 cache 等后续字段，不能据此判断 CPU 没有 L3 cache。

##### `free -h`

`free` 汇总物理内存和 swap 使用情况，`-h` 表示用 GiB、MiB 等适合人阅读的单位显示。

实际结果：

```text
              总计         已用        空闲      共享    缓冲/缓存    可用
内存：        62Gi       8.4Gi        30Gi       396Mi        23Gi        53Gi
交换：       2.0Gi          0B       2.0Gi
```

这里最容易误解的是“空闲”和“可用”：

- `总计 62 GiB`：操作系统可见的物理内存，通常对应标称 64 GB 的机器。
- `已用 8.4 GiB`：当前被进程和系统实际使用的内存。
- `空闲 30 GiB`：完全没有被使用的内存。
- `缓冲/缓存 23 GiB`：Linux 利用闲置内存缓存文件和数据，其中大部分在应用需要时可以回收。
- `可用 53 GiB`：在不发生明显 swap 压力的情况下，新进程大致还能使用的内存；判断内存余量时，它通常比“空闲”更有意义。
- `swap 2 GiB，已用 0 B`：配置了 2 GiB 交换空间，但当前没有使用。

因此，当前机器没有明显内存压力，后续运行模型基线具备足够的系统内存余量。但这个结果还不能说明 GPU 显存有多少。

### 本轮环境判断

| 判断项 | 结论 | 证据 |
|---|---|---|
| 主机 | `yons-MS-7D99` | `hostname` |
| 平台类型 | x86_64 桌面/工作站平台，不是 Jetson | `uname -a`、`lscpu` |
| 操作系统 | Ubuntu 20.04.6 LTS（Focal） | `/etc/os-release` |
| 内核 | Linux 5.15.0-139-generic | `uname -a` |
| CPU | Intel Core i7-14700，20 个物理核心、28 个逻辑 CPU | `lscpu` |
| NUMA | 1 个节点，逻辑 CPU 0～27 都在节点 0 | `lscpu` |
| 系统内存 | 62 GiB 可见，当前约 53 GiB 可用 | `free -h` |
| swap | 2 GiB，当前未使用 | `free -h` |

本轮命令**尚未验证**以下项目：

- 是否确实安装 RTX 3090。
- NVIDIA 驱动版本和 GPU 显存。
- CUDA 编译器与 CUDA runtime。
- cuDNN、TensorRT、PyTorch。
- Docker 是否能访问 GPU。

这些内容要由下一轮 GPU 与 NVIDIA 软件栈命令继续验证，不能根据“这台机器计划用作 3090 开发机”直接写成事实。

## RTX 5090

### 执行命令

```bash
# 待记录
```

### 原始结果

```text
待记录。
```

### 观察与结论

- 待记录。

## Jetson Orin

### 执行命令

```bash
# 待记录
```

### 原始结果

```text
待记录。
```

### 观察与结论

- 待记录。

## Jetson Thor

### 执行命令

```bash
# 待记录
```

### 原始结果

```text
待记录。
```

### 观察与结论

- 待记录。

## 设备对比

| 项目 | RTX 3090 | RTX 5090 | Jetson Orin | Jetson Thor |
|---|---|---|---|---|
| 设备角色 | 待记录 | 待记录 | 待记录 | 待记录 |
| CPU 架构 | 待记录 | 待记录 | 待记录 | 待记录 |
| OS/内核 | 待记录 | 待记录 | 待记录 | 待记录 |
| GPU/SoC | 待记录 | 待记录 | 待记录 | 待记录 |
| 驱动或 L4T | 待记录 | 待记录 | 待记录 | 待记录 |
| CUDA | 待记录 | 待记录 | 待记录 | 待记录 |
| TensorRT | 待记录 | 待记录 | 待记录 | 待记录 |
| PyTorch | 待记录 | 待记录 | 待记录 | 待记录 |
| 主要风险 | 待记录 | 待记录 | 待记录 | 待记录 |
