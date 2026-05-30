---
{"aliases":["卷积神经网络"],"dg-publish":true,"dg-path":"人工智能/深度学习/CNN.md","tags":["DL","Computer Vision"],"permalink":"/人工智能/深度学习/CNN/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["卷积神经网络"],"tags":["DL","Computer Vision"]}}
---


(terminology::**Convolutional Neural Network**) 卷积神经网络

> **CNN 通过局部感受野、权重共享和空间下采样三大机制，从网格状数据（图像、音频）中高效地逐层提取空间层次特征。** 是[[深度学习\|深度学习]]在计算机视觉领域取得突破的核心架构。

### 核心设计原则

CNN 的架构受三个生物视觉系统的启发：

- **局部感受野 (Local Receptive Field)**：每个神经元只关注输入的一个局部区域，而非全部像素。对应[[卷积\|卷积]]操作中的卷积核大小。
- **权重共享 (Weight Sharing)**：同一卷积核在整个输入上滑动，所有位置共享相同参数。大幅减少参数量，同时赋予平移不变性。
- **空间下采样 (Spatial Subsampling)**：通过池化操作逐步降低特征图的空间分辨率，增大感受野范围，提取更高层次的抽象特征。

### 核心层类型

#### 卷积层 (Convolutional Layer)

卷积层是 CNN 的核心计算单元。对于输入特征图 $X$ 和卷积核 $W$，卷积操作定义为：

$$(X * W)[i, j] = \sum_{m} \sum_{n} X[i+m, j+n] \cdot W[m, n] + b$$

对于多通道输入（$C_{in}$ 个通道），卷积核为 $W \in \mathbb{R}^{C_{out} \times C_{in} \times k_h \times k_w}$，每个输出通道对所有输入通道求和：

$$Y[c_{out}, i, j] = \sum_{c_{in}=1}^{C_{in}} \sum_{m=0}^{k_h-1} \sum_{n=0}^{k_w-1} X[c_{in}, i+m, j+n] \cdot W[c_{out}, c_{in}, m, n] + b[c_{out}]$$

**输出尺寸计算：**

$$H_{out} = \left\lfloor \frac{H_{in} + 2p - k_h}{s} \right\rfloor + 1$$

其中 $p$ 为填充 (padding)，$s$ 为步长 (stride)，$k_h$ 为卷积核高度。

> [!note] 参数量优势
> 对于 $224 \times 224 \times 3$ 的输入图像，全连接层需要 $224 \times 224 \times 3 \times n$ 个参数（$n$ 为输出维度），而一个 $3 \times 3$ 的卷积核只需要 $3 \times 3 \times 3 \times C_{out}$ 个参数，减少了数个数量级。

#### 池化层 (Pooling Layer)

池化层对特征图进行下采样，降低空间维度和计算量，同时增强特征的平移不变性。

**最大池化 (Max Pooling)：**

$$P[i, j] = \max_{(m,n) \in \mathcal{R}_{ij}} X[m, n]$$

**平均池化 (Average Pooling)：**

$$P[i, j] = \frac{1}{|\mathcal{R}_{ij}|} \sum_{(m,n) \in \mathcal{R}_{ij}} X[m, n]$$

其中 $\mathcal{R}_{ij}$ 是以 $(i,j)$ 为中心的池化窗口区域。

#### 全连接层 (Fully Connected Layer)

将卷积/池化层提取的空间特征展平后，通过全连接层映射到最终的分类或回归输出。现代架构中常用**全局平均池化 (Global Average Pooling)** 替代全连接层以减少参数。

### 典型 CNN 架构

| 架构 | 年份 | 深度 | 关键创新 | Top-5 错误率 (ImageNet) |
|------|------|------|----------|------------------------|
| LeNet-5 | 1998 | 5 层 | 卷积 + 池化的基本范式 | - |
| AlexNet | 2012 | 8 层 | ReLU、Dropout、GPU 训练 | 16.4% |
| VGGNet | 2014 | 16/19 层 | 全部使用 $3 \times 3$ 小卷积核 | 7.3% |
| GoogLeNet | 2014 | 22 层 | Inception 模块（多尺度并行卷积） | 6.7% |
| [[ResNet\|ResNet]] | 2015 | 152 层 | **残差连接** $F(x) + x$ | 3.6% |
| DenseNet | 2017 | 121 层 | 密集连接（每层与之前所有层相连） | - |
| EfficientNet | 2019 | - | 复合缩放（深度/宽度/分辨率） | 2.9% |

### 残差连接 (Residual Connection)

[[ResNet\|ResNet]] 通过引入跳跃连接解决了深层网络的退化问题：

$$y = F(x, \{W_i\}) + x$$

网络只需学习残差映射 $F(x) = H(x) - x$，而非完整映射 $H(x)$。当恒等映射已经最优时，将残差推向零比拟合恒等映射更容易。

### 特征层次化

CNN 逐层提取从低级到高级的特征：

| 层深度 | 特征类型 | 示例 |
|--------|----------|------|
| 浅层 (1-2) | 边缘、纹理 | 水平线、颜色梯度 |
| 中层 (3-5) | 局部模式 | 眼睛、轮子、纹理组合 |
| 深层 (6+) | 高级语义 | 人脸、物体、场景 |

### PyTorch 示例

```python
import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.classifier = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)
```

### 超参数选择

| 超参数 | 常用取值 | 说明 |
|--------|----------|------|
| 卷积核大小 | $3 \times 3$（主流） | VGG 证明多个小卷积核优于大卷积核 |
| 步长 (Stride) | 1 或 2 | stride=2 可替代池化层进行下采样 |
| 填充 (Padding) | same / valid | same 保持空间尺寸不变 |
| 通道数 | 逐层递增（32→64→128→...） | 空间缩小时增加通道数以保持信息量 |
| BatchNorm | 卷积后、激活前 | 加速收敛，允许更高学习率 |
| Dropout | 全连接层中使用 | 防止过拟合 |

### 应用领域

- **图像分类**：ImageNet、CIFAR 等基准任务
- **目标检测**：YOLO、Faster R-CNN（CNN 作为骨干网络）
- **语义分割**：FCN、U-Net（全卷积 + 上采样）
- **图像生成**：作为 [[GAN\|GAN]] 判别器 / [[DDPM\|DDPM]] 中 U-Net 的构建模块
- **医学影像**：病变检测、CT/MRI 分析
- **自然语言处理**：TextCNN 用于文本分类

---

> [[神经网络\|神经网络]] | [[机器学习\|机器学习]] | [[深度学习\|深度学习]] | [[RNN\|RNN]] | [[ResNet\|ResNet]]
