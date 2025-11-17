---
{"dg-publish":true,"dg-path":"A1- 数学/0. 基础知识/Tensor.md","permalink":"/A1- 数学/0. 基础知识/Tensor/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-10-20T23:42:16.630+08:00","updated":"2025-11-17T09:12:19.088+08:00"}
---


(terminology::**Tensor**)  张量
张量是数学和物理学中的一个基本概念，它是标量 Scalar 和向量 Vector 的推广。

张量可以被视为一种**多线性函数**，它将一组向量映射到一个标量，或者将一组向量映射到另一个向量。

在微分几何 Differential Geometry 中，张量是在流形 Manifold 上定义的多线性对象，可以用于描述流形的几何和物理性质，如度规张量 Metric Tensor 和曲率张量 Curvature Tensor。

### 张量的阶数
张量的阶数（或秩）表示其所包含的指标数量。阶数越高，张量描述的物理量越复杂。
-  **零阶张量** Zeroth-order Tensor /Scalar: 没有指标，只有一个分量。例如，温度、质量、能量。
-  **一阶张量** First-order Tensor/ Vector: 有一个指标，具有大小和方向。例如，力、速度、位移。
-  **二阶张量** Second-order Tensor: 有两个指标，可以表示为矩阵 Matrix。例如，应力张量、惯性张量、电导率张量。
-  **更高阶张量**：具有三个或更多指标。例如，黎曼曲率张量是四阶张量。

### 张量的表示
张量通常用分量表示，其分量值取决于所选择的坐标系 Coordinate System。张量的一个重要特性是其分量在坐标变换下的特定变换规律。
-   **协变张量** Covariant Tensor: 下标表示的张量，其分量在坐标变换下与基向量的变换方式相同。
-   **逆变张量** Contravariant Tensor: 上标表示的张量，其分量在坐标变换下与基向量的变换方式相反。
-   **混合张量** Mixed Tensor: 既有上标也有下标的张量。


### 张量的运算
张量可以进行多种运算：
-   **加法和减法**：同阶张量可以逐分量相加或相减。
-   **标量乘法**：张量的每个分量乘以一个标量。
-   **张量积** Tensor Product/ Outer Product: 两个张量相乘得到一个更高阶的张量。例如，两个向量的张量积是一个二阶张量。
-   **缩并** Contraction: 通过对一对上标和下标求和来降低张量的阶数。例如，二阶张量的缩并得到一个标量（迹）。
-   **内积** Inner Product: 两个张量通过缩并得到的标量。


### PyTorch 
[[PyTorch\|PyTorch]] 

Tensors are a specialized data structure that are very similar to arrays and matrices. 

In PyTorch, we use tensors to encode the inputs and outputs of a model, as well as the model’s parameters.

张量是一种特殊的[[数据结构\|数据结构]]，与数组和矩阵非常相似。在 PyTorch 中，我们使用张量来编码模型的输入和输出，以及模型的参数。

- Tensor 类似于 [[Numpy\|NumPy]] 的 ndarrays，但张量可以在 GPU 或其他硬件加速器上运行
- Tensor 和 NumPy 数组通常可以共享相同的底层内存，无需复制数据
- Tensor 还针对自动微分进行了优化。


### 张量操作

#### 初始化张量

```python
data = [[1, 2],[3, 4]]

# 直接从数据初始化
x_data = torch.tensor(data)

# 从 NumPy 数组创建
np_array = np.array(data)
x_np = torch.from_numpy(np_array)

# 从另一个张量初始化：新张量默认保留参数张量的属性（形状、数据类型）

## retains the properties of x_data
x_ones = torch.ones_like(x_data) 
print(f"Ones Tensor: \n {x_ones} \n")

## overrides the datatype of x_data 
x_rand = torch.rand_like(x_data, dtype=torch.float) 
print(f"Random Tensor: \n {x_rand} \n")
```

#### 张量的属性
```python
tensor = torch.rand(3,4)

print(f"Shape of tensor: {tensor.shape}")
print(f"Datatype of tensor: {tensor.dtype}")
print(f"Device tensor is stored on: {tensor.device}") 
```

#### 其他操作
超过 1200 种张量操作，包括算术、线性代数、矩阵操作（转置、索引、切片）、采样等（见 (website:: [Tensor API](https://docs.pytorch.org/docs/stable/torch.html)) 与 [[Numpy\|NumPy]] API 十分类似 ）

这些操作中的每一种都可以在 CPU 和加速器（如 CUDA、MPS、MTIA 或 XPU）上运行。默认情况下，张量在 CPU 上创建。我们需要使用 `.to` 方法显式地将张量移动到加速器

#### 与  MumPy 桥接
CPU 上的张量和 NumPy 数组可以共享它们的底层内存位置，更改其中一个会改变另一个。

```python
# 张量到 NumPy 数组,张量的变化会反映在 NumPy 数组中。
t = torch.ones(5)
n = t.numpy()
t.add_(1)  # 同时改变 n


# NumPy 数组到张量,NumPy 数组的变化会反映在张量中。
n = np.ones(5)
t = torch.from_numpy(n)
np.add(n, 1, out=n) # 同时改变 t 
```


### 张量的应用
#### 在物理学中的应用
张量是物理学中描述物理量和物理定律的强大工具，特别是在弯曲空间和相对论中：

-   **广义相对论**：爱因斯坦场方程 Einstein Field Equations 是一个张量方程，它描述了时空 Spacetime 的弯曲与物质和能量的分布之间的关系。度规张量 $g_{\mu\nu}$ 描述了时空的几何，应力-能量张量 $T_{\mu\nu}$ 描述了物质和能量的分布。
-   **连续介质力学**：应力张量、应变张量描述了材料在受力时的变形和内部力。
-   **电磁学**：电磁场张量 Electromagnetic Field Tensor 统一了电场和磁场，并在狭义相对论中保持协变性。

#### 在机器学习中的应用
在机器学习 Machine Learning 和深度学习 Deep Learning 中，“张量”通常指多维数组。尽管这里的“张量”概念与数学物理中的张量略有不同（不强调坐标变换下的不变性），但其多维数组的特性使其成为处理和操作高维数据的核心数据结构：
-   **数据表示**：图像（三维张量：高、宽、通道）、视频（四维张量：帧、高、宽、通道）、文本（词嵌入向量组成的二维张量）等数据都以张量形式表示。
-   **神经网络**：神经网络中的权重、偏置和激活值都是张量。神经网络的计算本质上是张量运算。
-   **并行计算**：张量运算可以高效地在GPU等并行计算硬件上执行，这对于深度学习的训练至关重要。


