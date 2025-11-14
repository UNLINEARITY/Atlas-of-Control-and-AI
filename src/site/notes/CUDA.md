---
{"dg-path":"计算机/CUDA.md","dg-publish":true,"permalink":"/计算机/CUDA/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-09-20T10:48:31.380+08:00","updated":"2025-11-04T00:16:12.000+08:00"}
---


(terminology::**Compute Unified Device Architecture**)  

NVIDIA公司推出的一种并行计算平台和编程模型。它允许开发者使用NVIDIA的GPU（图形处理单元）来进行通用计算（即不仅限于图形渲染的计算任务）。

CUDA为开发者提供了直接在 [[GPU\|GPU]] 上执行计算任务的能力，这通常比在CPU上执行相同任务要快得多，因为GPU拥有大量的核心，能够同时处理数千个[[线程\|线程]]。

### CUDA toolkit 
是由 **NVIDIA 官方提供的一整套 GPU 加速计算开发工具包**。
> CUDA Toolkit = GPU 编程的“操作系统 + 编译器 + 库 + 工具”。

#### 作用
安装 CUDA Toolkit 后，你可以：
1. **用 C/C++、Python 等语言编写 GPU 程序**（通过 CUDA API 调用 GPU）；
2. **编译运行 GPU 加速代码**；
3. **调用各种 GPU 加速库**（如 cuBLAS、cuDNN、cuFFT 等）；
4. **开发深度学习框架或运行模型推理**（例如 PyTorch、TensorFlow、DeepSeek-OCR 都依赖它）。

深度学习框架（如 PyTorch、TensorFlow）不会直接操作 GPU，而是
1. 调用 **CUDA** 底层 API；
2. 使用 **cuDNN、cuBLAS** 等库进行加速。

所以：
- 没有安装 CUDA Toolkit，就无法运行 GPU 版本的 PyTorch；
- 但如果只是**使用已编译好的 PyTorch**，通常不需要手动安装 Toolkit，只要系统驱动支持对应 CUDA 版本即可。

#### Toolkit 主要组成部分

|组成部分|功能|
|---|---|
|**nvcc**|CUDA 编译器，用于编译 `.cu` 文件（C/C++ GPU 代码）。|
|**CUDA Runtime API**|程序运行时与 GPU 交互的接口（如内存分配、核函数启动）。|
|**CUDA Driver API**|更底层的 GPU 控制接口（Runtime API 基于它实现）。|
|**cuBLAS**|GPU 上的线性代数库（矩阵乘法、求逆等）。|
|**cuFFT**|GPU 上的快速傅立叶变换库。|
|**cuDNN**|深度神经网络库（卷积、归一化等加速）。|
|**Nsight / nvprof / nsys**|GPU 性能分析与调试工具。|
|**Samples**|官方示例项目，用于学习 CUDA 编程。|


驱动提供了硬件接口，Toolkit 提供了编程接口。

| 项目                     | 功能               | 是否必须      |
| ---------------------- | ---------------- | --------- |
| **NVIDIA 驱动 (Driver)** | 让系统识别 GPU（显卡的驱动） | 必须安装      |
| **CUDA Toolkit**       | 让你写、编译、运行 GPU 程序 | 开发或深度学习必装 |

