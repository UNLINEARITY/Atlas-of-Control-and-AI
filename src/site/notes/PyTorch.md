---
{"tags":["OpenSource"],"dg-publish":true,"dg-path":"编程语言/Python/PyTorch.md","permalink":"/编程语言/Python/PyTorch/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-08-19T00:17:48.191+08:00","updated":"2025-07-28T16:02:47.965+08:00"}
---


PyTorch是一个开源的[[机器学习\|机器学习]]库，广泛用于[[计算机视觉\|计算机视觉]]和自然语言处理等应用。它由Facebook的AI研究团队开发，并得到了全球开发者社区的广泛支持。
### 1. PyTorch的本质
无论做什么，PyTorch的底层本质可以归结为两点：
- **张量（Tensor）运算** —— 像 NumPy 那样处理多维数组。
- **计算图（Computational Graph）构建** —— 记录张量之间的运算关系，以便反向传播求梯度。

PyTorch是一个**动态图**框架，意味着：
- 运算发生时就构建计算图（不是事先定义好一整个图）。
- 你可以像写普通 Python 代码一样，灵活控制每一步。
这两个本质——**Tensor + Autograd（自动求导）**，贯穿始终，任何PyTorch程序都是围绕它们展开的。


### 2. 张量（Tensor）操作（核心对象）

#### 2.1 创建Tensor
共性：任何数据（标量、向量、矩阵、多维数组）都可以转为`torch.Tensor`。
常用方式：
```python
import torch
# 直接创建
x = torch.tensor([1, 2, 3])

# 创建指定大小，随机数填充
rand = torch.rand(2, 3)  # [0, 1)均匀分布
randn = torch.randn(2, 3)  # 标准正态分布

# 全0或全1
zeros = torch.zeros(2, 3)
ones = torch.ones(2, 3)

# 指定数据类型
float_tensor = torch.tensor([1, 2, 3], dtype=torch.float32)

# 和 numpy 互转
import numpy as np
a = np.array([1, 2, 3])
b = torch.from_numpy(a)  # numpy -> tensor
c = b.numpy()  # tensor -> numpy
```

**不变的东西**：
- PyTorch中**所有数据都以Tensor表示**。
- Tensor的**形状（shape）** 和 **数据类型（dtype）**始终存在。
- 默认设备是CPU，可以转到GPU。
#### 2.2 Tensor常见属性
```python
x.shape
x.dtype
x.device
```
共性：**每个Tensor都有shape、dtype、device**，任何操作必须保持一致或者有自动广播机制。
### 3. Tensor的基本运算

#### 3.1 算术运算

`+、-、*、/、** `等运算，支持**逐元素操作**。

```python
a = torch.tensor([1, 2])
b = torch.tensor([3, 4])

c = a + b  # 元素加
d = a * b  # 元素乘
e = a ** 2  # 幂
```

PyTorch保证：
- **广播机制**自动补齐维度（类似numpy）。
- 操作是**按元素**执行的，除非特别说明（如矩阵乘法）。
#### 3.2 矩阵运算
```python
mat1 = torch.randn(2, 3)
mat2 = torch.randn(3, 4)
result = torch.matmul(mat1, mat2)  # 矩阵乘法
```

注意：`*`是逐元素，`matmul`是矩阵乘。
#### 3.3 其他常用操作

- reshape / view ：重新调整形状。
- squeeze / unsqueeze ：压缩/增加维度。
- cat / stack ：拼接。
- sum / mean / max ：求和、均值、最大值。
```python
# 改形状
x = torch.randn(4, 4)
y = x.view(2, 8)  # 或 reshape
# 合并
z = torch.cat((x, x), dim=0)
```

### 4. Autograd：自动求导（神经网络训练的核心）

每个`Tensor`都有一个`requires_grad`属性。
- 如果`requires_grad=True`，那么所有对它的运算都会被记录。
- 可以调用`.backward()`自动计算梯度。
- `.grad`属性存储梯度。

```python
x = torch.ones(2, 2, requires_grad=True)
y = x + 2
z = y * y * 3
out = z.mean()

out.backward()  # 反向传播
print(x.grad)  # 查看x的梯度
```

不变的逻辑：
- **构建计算图**是通过运算自动完成的。
- **backward()总是从标量（单个数）开始**。如果是向量，需要手动指定`gradient`参数。
- **梯度默认累加**，需要在每次反向传播前清零。
```python
optimizer.zero_grad()  # 每次训练步骤前清梯度
```

### 5. 模型构建（神经网络基本框架）

PyTorch有一套`torch.nn`模块，抽象了神经网络层和损失函数。
常见套路（完全不变的框架）：
#### 5.1 定义模型

```python
import torch.nn as nn

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

net = Net()
```

共性：
- 继承`nn.Module`。
- 必须实现`__init__()`和`forward()`。
- forward方法定义了前向传播的计算过程。
#### 5.2 损失函数
```python
criterion = nn.CrossEntropyLoss()
```

常见：
- 分类用 CrossEntropyLoss
- 回归用 MSELoss
#### 5.3 优化器
```python
import torch.optim as optim

optimizer = optim.SGD(net.parameters(), lr=0.01)
```

- 调用`optimizer.step()`执行参数更新。
- 调用`optimizer.zero_grad()`清除梯度。
### 6. 训练基本流程（固定套路）

无论任何模型，PyTorch训练流程都是固定的：

```python
for epoch in range(num_epochs):
    for inputs, labels in dataloader:
        outputs = net(inputs)       # 正向
        loss = criterion(outputs, labels)  # 计算损失
        optimizer.zero_grad()       # 清除旧梯度
        loss.backward()             # 反向传播
        optimizer.step()            # 更新参数
```

共性：

- 每一次循环都是**正向传播 ➔ 计算损失 ➔ 反向传播 ➔ 优化更新**。
- 总是先`zero_grad`，然后`backward`，最后`step`。
- loss一定是**标量**才能`.backward()`。

### 7. 设备管理（CPU / GPU）
PyTorch张量可以在CPU或GPU上操作，且**设备要统一**。
```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = Net().to(device)
inputs = inputs.to(device)
labels = labels.to(device)
```
共性：
- Tensor和模型需要`.to(device)`。
- 训练时数据和模型必须在同一设备上。
### 总结：PyTorch中所有共性、不变的东西

|模块|本质|不变的规律|
|---|---|---|
|Tensor|多维数组|每个Tensor有shape、dtype、device|
|运算|张量逐元素或矩阵级运算|自动广播，遵循numpy风格|
|Autograd|计算图和梯度记录|backward从标量出发，grad默认累加|
|Module模型|层组合成网络|定义forward，继承nn.Module|
|优化|梯度下降|zero_grad ➔ backward ➔ step 顺序|
|设备管理|CPU/GPU切换|to(device)确保同一设备|
