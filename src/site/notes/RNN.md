---
{"aliases":["循环神经网络","Recurrent Neural Network"],"dg-publish":true,"dg-path":"人工智能/深度学习/RNN.md","tags":["DL","Sequence Model"],"permalink":"/人工智能/深度学习/RNN/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["循环神经网络","Recurrent Neural Network"],"tags":["DL","Sequence Model"]}}
---


(terminology::**Recurrent Neural Network**) 循环神经网络

> **RNN 通过隐藏状态的循环连接实现对序列数据的建模，使网络具备"记忆"能力，能够捕捉时间步之间的依赖关系。** 属于[[深度学习\|深度学习]]中处理变长序列数据的基础架构，是 LSTM、GRU 及现代序列模型的理论起点。

### 核心思想：隐状态的循环传递

与前馈[[神经网络\|神经网络]]不同，RNN 在隐藏层中引入**循环连接**：每个时间步的隐藏状态不仅依赖当前输入，还依赖前一时间步的隐藏状态。这使得网络能够将历史信息编码到隐状态中，实现对序列上下文的建模。

$$h_t = f_W(h_{t-1}, x_t)$$

其中 $h_t$ 是时间步 $t$ 的隐藏状态，$x_t$ 是当前输入，$f_W$ 是参数共享的状态转移函数。

### 数学公式

**隐藏状态更新：**

$$h_t = \tanh(W_{xh} x_t + W_{hh} h_{t-1} + b_h)$$

**输出计算：**

$$y_t = g(W_{hy} h_t + b_y)$$

其中：
- $x_t \in \mathbb{R}^d$ 是时间步 $t$ 的输入向量
- $h_t \in \mathbb{R}^n$ 是隐藏状态向量
- $W_{xh} \in \mathbb{R}^{n \times d}$ 是输入到隐藏状态的权重矩阵
- $W_{hh} \in \mathbb{R}^{n \times n}$ 是隐藏状态到隐藏状态的权重矩阵（**所有时间步共享**）
- $W_{hy} \in \mathbb{R}^{m \times n}$ 是隐藏状态到输出的权重矩阵
- $b_h, b_y$ 是偏置向量
- $g$ 是输出层的[[激活函数\|激活函数]]（如 softmax 用于分类）

> [!note] 参数共享
> RNN 的关键特性是**权重在所有时间步上共享**（$W_{xh}, W_{hh}, W_{hy}$ 不随 $t$ 变化）。这使得网络可以处理任意长度的序列，且参数量与序列长度无关。

### 训练：BPTT

RNN 使用**时间反向传播 (Backpropagation Through Time, BPTT)** 进行训练。将 RNN 沿时间轴展开后，等价于一个深度前馈网络，然后应用标准的反向传播算法计算梯度。

对于损失函数 $L = \sum_{t=1}^T L_t$，参数梯度涉及沿时间步的链式求导：

$$\frac{\partial L}{\partial W_{hh}} = \sum_{t=1}^T \sum_{k=1}^t \frac{\partial L_t}{\partial h_t} \left(\prod_{j=k+1}^t \frac{\partial h_j}{\partial h_{j-1}}\right) \frac{\partial h_k}{\partial W_{hh}}$$

### 梯度问题

> [!warning] 梯度消失与梯度爆炸
> 由于 BPTT 中梯度需要经过多个时间步的连乘 $\prod \frac{\partial h_j}{\partial h_{j-1}}$，当序列较长时：
> - 若 $\|W_{hh}\|$ 的谱范数 $< 1$：梯度指数衰减 → **梯度消失**，无法学习长距离依赖
> - 若 $\|W_{hh}\|$ 的谱范数 $> 1$：梯度指数增长 → **梯度爆炸**，训练不稳定

缓解策略：

| 问题 | 解决方案 | 说明 |
|------|----------|------|
| 梯度爆炸 | 梯度裁剪 (Gradient Clipping) | 当梯度范数超过阈值时进行缩放 |
| 梯度消失 | 门控机制 (LSTM/GRU) | 通过门控制信息流，维持长距离梯度 |
| 梯度消失 | 残差连接 | 提供梯度的"捷径" |
| 梯度消失 | 正交初始化 | 使 $W_{hh}$ 初始化为正交矩阵，谱范数为 1 |

### 主要变种

#### LSTM (Long Short-Term Memory)

LSTM 引入**细胞状态** $c_t$ 和三个门控机制来解决长距离依赖问题：

$$\begin{aligned}
f_t &= \sigma(W_f [h_{t-1}, x_t] + b_f) & \text{（遗忘门）} \\
i_t &= \sigma(W_i [h_{t-1}, x_t] + b_i) & \text{（输入门）} \\
\tilde{c}_t &= \tanh(W_c [h_{t-1}, x_t] + b_c) & \text{（候选状态）} \\
c_t &= f_t \odot c_{t-1} + i_t \odot \tilde{c}_t & \text{（细胞状态更新）} \\
o_t &= \sigma(W_o [h_{t-1}, x_t] + b_o) & \text{（输出门）} \\
h_t &= o_t \odot \tanh(c_t) & \text{（隐藏状态）}
\end{aligned}$$

细胞状态 $c_t$ 通过线性的自循环路径传递，梯度可以几乎无衰减地流过多个时间步。

#### GRU (Gated Recurrent Unit)

GRU 是 LSTM 的简化版本，将遗忘门和输入门合并为**更新门**，参数更少：

$$\begin{aligned}
z_t &= \sigma(W_z [h_{t-1}, x_t]) & \text{（更新门）} \\
r_t &= \sigma(W_r [h_{t-1}, x_t]) & \text{（重置门）} \\
\tilde{h}_t &= \tanh(W [r_t \odot h_{t-1}, x_t]) & \text{（候选状态）} \\
h_t &= (1 - z_t) \odot h_{t-1} + z_t \odot \tilde{h}_t & \text{（状态更新）}
\end{aligned}$$

### RNN 变种架构对比

| 特性 | Vanilla RNN | LSTM | GRU |
|------|-------------|------|-----|
| 参数量 | $O(n^2)$ | $O(4n^2)$ | $O(3n^2)$ |
| 长距离依赖 | 差 | 好 | 好 |
| 门控机制 | 无 | 3 个门 | 2 个门 |
| 训练速度 | 快 | 慢 | 中等 |
| 适用场景 | 短序列 | 长序列、复杂任务 | 数据量较小的任务 |

### 序列建模模式

RNN 支持多种输入-输出模式：

- **一对一 (One-to-One)**：标准前馈网络，非序列任务
- **一对多 (One-to-Many)**：如图像描述生成（输入图像，输出文字序列）
- **多对一 (Many-to-One)**：如情感分析（输入文本序列，输出情感标签）
- **多对多 (Many-to-Many)**：如机器翻译（Encoder-Decoder）、视频分类

### PyTorch 示例

```python
import torch
import torch.nn as nn

class SimpleRNN(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.rnn = nn.RNN(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x, h0=None):
        # x: (batch, seq_len, input_size)
        out, hn = self.rnn(x, h0)
        # 取最后一个时间步的输出用于分类
        out = self.fc(out[:, -1, :])
        return out

# 使用 LSTM 替代
class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size,
                           num_layers=num_layers, batch_first=True,
                           dropout=0.2)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, (hn, cn) = self.lstm(x)
        return self.fc(out[:, -1, :])
```

### 局限与后续发展

- **并行计算困难**：RNN 的时间步必须顺序执行，无法充分利用 GPU 并行能力
- **长距离依赖仍有限**：即使 LSTM/GRU 缓解了梯度消失，超长序列仍面临信息瓶颈
- **被 Transformer 取代**：在 NLP 领域，基于自注意力机制的 Transformer 架构已大幅取代 RNN，实现更好的并行性和长距离建模能力

> [!tip] 发展脉络
> Vanilla RNN → LSTM (1997) → GRU (2014) → Attention 机制 → Transformer (2017) → 大语言模型

---

> [[神经网络\|神经网络]] | [[机器学习\|机器学习]] | [[深度学习\|深度学习]] | [[CNN\|CNN]]
