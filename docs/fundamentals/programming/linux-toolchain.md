---
title: 1.3 Linux 与开发环境
description: 从一个 Python 进程入手，理解 PID、后台任务、/proc、文件描述符与重定向
---

# 1.3 Linux 与开发环境

## 学习目标

- 分清程序、进程和 Shell 后台任务
- 看懂 PID、PPID、进程状态、内存和线程数
- 理解标准输入、标准输出、标准错误以及 Shell 重定向
- 学会用 `ps` 和 `/proc` 观察真实进程

## 从一个最小进程开始

先写一个只做两件事的 Python 程序它打印自己的进程信息，然后睡眠 600 秒，给我们留下观察时间

```python title="test.py"
import os
import time


print(f"pid={os.getpid()} ppid={os.getppid()}", flush=True)
time.sleep(600)
```

程序是磁盘上的代码文件，进程是这份代码的一次运行多次执行 `test.py` 会得到多个进程，每个进程都有自己的 PID

## 后台运行和任务编号

在 Bash 中运行：

```bash
python3 test.py > test.log 2>&1 &
study_pid=$!
```

末尾的 `&` 让 Python 在后台运行Bash 不必等它结束，可以立刻显示下一行提示符

`$!` 是 Bash 的特殊变量，保存最近一个后台任务的 PID第二行把这个值存进 `study_pid`，后面的命令就不用手动复制 PID变量只在当前 Shell 中有效，赋值时等号两边不能有空格

Bash 启动任务后会显示类似下面的内容：

```text
[8] 2908270
```

这里有两个编号：

```text
[8]       当前 Shell 的任务编号
2908270   操作系统分配的进程 PID
```

`[8]` 不代表 `test.py` 一定执行了八次它只是当前 Shell 任务表中的编号，其中也可能包括别的后台任务或暂停的命令任务编号只在当前终端有意义，可以用 `jobs -l` 查看，用 `fg %8` 切回前台，也可以用 `kill %8` 结束对应任务

PID 由操作系统使用`ps -p 2908270` 和 `kill 2908270` 操作的是这个具体进程

### 为什么后台输出会跑到命令提示符后面

终端没有一个受到保护的"输入框"它更像一条共享的字符流Bash 输出提示符，Python 也可以向同一个终端输出文字

如果不做重定向，可能出现这样的顺序：

```text
Bash：启动 Python -> 显示任务编号 -> 显示新提示符
Python：                              -> 输出 pid=...
```

Bash 先显示了提示符，后台 Python 随后才获得运行机会Python 的输出会写在当时的光标位置，看起来就像闯进了输入区域两个进程只是碰巧共用了同一个终端

## 观察正在运行的进程

在启动进程的同一个终端里执行：

```bash
echo "保存的 PID：$study_pid"

ps -o pid,ppid,stat,%cpu,%mem,etime,cmd -p "$study_pid"

awk '/^(Name|State|Pid|PPid|Threads|VmRSS):/ {print}' "/proc/$study_pid/status"

ls -l "/proc/$study_pid/fd"
```

下面是一次实际运行结果

![在 Cursor 终端中观察 Python 进程、/proc 状态和文件描述符](/img/fundamentals/programming/linux-process-observation.png)

### `ps` 输出怎么看

截图里的进程信息是：

| 字段 | 值 | 含义 |
| --- | --- | --- |
| `PID` | `2908270` | Python 进程的编号 |
| `PPID` | `2901541` | 启动 Python 的父进程编号，这里通常是 Bash |
| `STAT` | `S` | 进程正在可中断睡眠 |
| `%CPU` | `0.0` | `sleep()` 期间几乎不使用 CPU |
| `%MEM` | `0.0` | 占总内存的比例很小，显示时被四舍五入 |
| `ELAPSED` | `00:16` | 已经运行 16 秒 |
| `CMD` | `python3 test.py` | 启动命令 |

状态 `S` 和代码中的 `time.sleep(600)` 正好对应进程仍然存在，但它正在等待计时器，不需要一直占用 CPU

### `/proc` 是什么

`/proc` 看起来像目录，里面的大部分内容却不是普通磁盘文件Linux 内核通过它暴露系统和进程状态

截图中的 `/proc/2908270/status` 给出了这些数据：

```text
Name:    python3
State:   S (sleeping)
Pid:     2908270
PPid:    2901541
VmRSS:   9760 kB
Threads: 1
```

`VmRSS` 是当前驻留在物理内存中的页面大小，约 9.5 MiB它不是进程申请过的全部虚拟内存，也不表示这些内存全由该进程独占`Threads: 1` 表示这里只有 Python 主线程

## 文件描述符到底是什么

文件描述符是进程用来访问输入输出对象的整数编号可以把它理解成内核替进程维护的一张连接表程序只需读写某个编号，内核负责把数据送到这个编号当前指向的终端、文件、管道或 socket

每个新进程通常从三个约定好的编号开始：

```text
编号 0  读取   标准输入 stdin
编号 1  写入   标准输出 stdout
编号 2  写入   标准错误 stderr
```

Python 中常见操作与它们的关系是：

```text
input()                     从编号 0 读取
print()                     向编号 1 写入
print(..., file=sys.stderr) 向编号 2 写入
未处理异常的 traceback       通常向编号 2 写入
```

本次实验里的映射是：

```text
0 -> /dev/pts/14
1 -> /home/zene/AI_Infra/test.log
2 -> /home/zene/AI_Infra/test.log
```

编号 `0` 仍连接 Cursor 的伪终端，所以 Python 如果调用 `input()`，输入来源就是这个终端本程序没有读取输入，这条连接没有实际用上

编号 `1` 和 `2` 都指向 `test.log`原因就在启动命令的两个重定向操作中：

```bash
python3 test.py > test.log 2>&1 &
```

`> test.log` 等价于 `1> test.log`，它先把标准输出从终端改到文件`2>&1` 再让标准错误使用标准输出当前的目的地，所以普通输出和错误信息都进入同一个文件

### 为什么错误输出反而排在前面

下面的实验先调用普通 `print()`，再写一条错误输出：

```bash
python3 -c 'import sys; print("这是普通输出"); print("这是错误输出", file=sys.stderr)' > fd-demo.log 2>&1

cat fd-demo.log
```

实际结果却是错误输出在第一行

![stdout 和 stderr 同时重定向到文件后的输出顺序](/img/fundamentals/programming/fd-redirection-result.png)

这是缓冲造成的stdout 连接终端时通常按行刷新，改为普通文件后会使用更大的缓冲区第一条普通输出暂时留在用户态缓冲区stderr 更及时地写入文件，于是错误输出先落盘进程退出时，stdout 才刷新自己的缓冲区，普通输出因此排在后面

可以用 Python 的非缓冲模式验证：

```bash
python3 -u -c 'import sys; print("这是普通输出"); print("这是错误输出", file=sys.stderr)' > fd-demo-unbuffered.log 2>&1

cat fd-demo-unbuffered.log
```

这时通常会按代码顺序得到：

```text
这是普通输出
这是错误输出
```

这也是日志排障时常见的坑两条日志在代码里的先后顺序，不一定等于它们写进文件后的顺序

### 为什么还能看到 38、39、103 等编号

截图中还有 `anon_inode:inotify`、`socket:[...]`、`/dev/ptmx` 和 Cursor 的 `ptyhost.log`这个简单脚本没有主动创建它们，它们很可能来自 Cursor、终端或 Bash 的进程链

Linux 创建子进程时会继承父进程中没有设置为"执行时关闭"的文件描述符因此，一个很小的 Python 程序也可能带着高编号描述符运行在服务端程序中，如果无意间一直保留这些描述符，就可能形成资源泄漏

## 用信号改变进程状态

进程仍在睡眠时，可以继续观察状态变化：

```bash
kill -STOP "$study_pid"
ps -o pid,ppid,stat,%cpu,etime,cmd -p "$study_pid"

kill -CONT "$study_pid"
ps -o pid,ppid,stat,%cpu,etime,cmd -p "$study_pid"

kill -TERM "$study_pid"
wait "$study_pid"
termination_status=$?
echo "退出状态：$termination_status"
```

`SIGSTOP` 会暂停进程，`STAT` 通常变为 `T``SIGCONT` 让它继续运行，状态会回到 `S``SIGTERM` 请求进程退出Bash 中由 `SIGTERM` 结束的进程通常返回：

```text
143 = 128 + SIGTERM(15)
```

`wait` 不只是等待Shell 还会借此回收子进程的终止状态，避免它在任务表里一直留下未处理的完成记录

## 参考资料

- [1] [Bash Job Control Basics](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Basics.html)
- [2] [Bash Redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html)
- [3] [Linux proc_pid_fd(5)](https://man7.org/linux/man-pages/man5/proc_pid_fd.5.html)
