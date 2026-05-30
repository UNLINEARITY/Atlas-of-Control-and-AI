---
{"aliases":["变分自编码器","Variational Autoencoder"],"dg-publish":true,"dg-path":"人工智能/深度学习/VAE.md","tags":["DL","Generative Model"],"permalink":"/人工智能/深度学习/VAE/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["变分自编码器","Variational Autoencoder"],"tags":["DL","Generative Model"]}}
---


(terminology::**Variational Autoencoder**) 变分自编码器

> **VAE 通过变分推断将数据编码到连续隐空间的概率分布中，再从该分布采样解码，从而实现具有平滑隐空间结构的生成模型。** 由 Kingma & Welling 于 2013 年提出，是第一个将深度学习与贝叶斯推断成功结合的生成模型框架。

### 核心思想：概率化的编码-解码

传统自编码器 (Autoencoder) 将输入编码为确定性的隐向量，VAE 的关键改进是将隐空间**概率化**：编码器输出的不是一个固定向量，而是一个**概率分布的参数**（均值 $\mu$ 和方差 $\sigma^2$），然后从该分布中采样得到隐变量 $z$，再通过解码器重建数据。

这使得 VAE 具备两个关键能力：
- **连续隐空间**：隐空间中相邻的点对应语义相近的数据，支持平滑插值
- **采样生成**：从隐空间的先验分布 $p(z)$ 中直接采样，即可生成新样本

### 概率图模型

VAE 的生成过程可以用如下概率图描述：

$$z \sim p(z) = \mathcal{N}(0, I) \quad \longrightarrow \quad x \sim p_\theta(x|z)$$

其中 $p(z)$ 是隐变量的先验分布（标准正态），$p_\theta(x|z)$ 是解码器（生成器）参数化的似然函数。

核心问题：后验分布 $p(z|x)$ 不可解析计算（涉及边际似然 $p(x) = \int p_\theta(x|z)p(z)dz$ 的积分），因此需要**变分推断**来近似。

### 架构

| 组件 | 功能 | 输入 | 输出 |
|------|------|------|------|
| 编码器 $q_\phi(z\|x)$ | 近似后验推断 | 数据 $x$ | 分布参数 $\mu, \log\sigma^2$ |
| 重参数化 | 可微采样 | $\mu, \sigma, \epsilon$ | 隐变量 $z$ |
| 解码器 $p_\theta(x\|z)$ | 数据重建/生成 | 隐变量 $z$ | 重建数据 $\hat{x}$ |

### 重参数化技巧 (Reparameterization Trick)

从 $q_\phi(z|x) = \mathcal{N}(\mu, \sigma^2 I)$ 中采样的操作不可微，无法直接反向传播。重参数化技巧将采样过程改写为确定性变换：

$$z = \mu + \sigma \odot \epsilon, \quad \epsilon \sim \mathcal{N}(0, I)$$

其中 $\odot$ 表示逐元素乘积。这样梯度可以通过 $\mu$ 和 $\sigma$ 回传到编码器。

> [!important] 重参数化技巧的意义
> 将随机性从计算图中"分离"出来，使得整个模型可以端到端地用[[梯度下降\|梯度下降]]训练。这一思想在 [[DDPM\|DDPM]] 等后续模型中也被广泛使用。

### 损失函数：ELBO

VAE 通过最大化**证据下界 (Evidence Lower Bound, ELBO)** 来训练：

$$\log p(x) \geq \mathbb{E}_{q_\phi(z|x)}[\log p_\theta(x|z)] - D_{KL}(q_\phi(z|x) \| p(z)) = \text{ELBO}$$

损失函数（取负 ELBO）分为两项：

$$\mathcal{L}(\theta, \phi; x) = \underbrace{-\mathbb{E}_{q_\phi(z|x)}[\log p_\theta(x|z)]}_{\text{重建损失}} + \underbrace{D_{KL}(q_\phi(z|x) \| p(z))}_{\text{KL 散度正则项}}$$

- **重建损失**：衡量解码器重建数据的质量（实践中常用 MSE 或二元交叉熵）
- **KL 散度**：约束编码器输出的后验分布接近先验 $\mathcal{N}(0, I)$，确保隐空间的正则性

当编码器输出高斯分布时，KL 散度有解析解：

$$D_{KL}(q_\phi(z|x) \| p(z)) = -\frac{1}{2} \sum_{j=1}^{d} \left(1 + \log\sigma_j^2 - \mu_j^2 - \sigma_j^2\right)$$

### PyTorch 实现示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class VAE(nn.Module):
    def __init__(self, input_dim=784, hidden_dim=400, latent_dim=20):
        super().__init__()
        # 编码器
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)
        # 解码器
        self.fc3 = nn.Linear(latent_dim, hidden_dim)
        self.fc4 = nn.Linear(hidden_dim, input_dim)

    def encode(self, x):
        h = F.relu(self.fc1(x))
        return self.fc_mu(h), self.fc_logvar(h)

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def decode(self, z):
        h = F.relu(self.fc3(z))
        return torch.sigmoid(self.fc4(h))

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar

def vae_loss(recon_x, x, mu, logvar):
    recon = F.binary_cross_entropy(recon_x, x, reduction='sum')
    kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    return recon + kl
```

### KL 散度权重问题

> [!warning] 后验坍缩 (Posterior Collapse)
> 当解码器能力过强时，模型可能忽略隐变量 $z$，使 $q_\phi(z|x) \approx p(z)$（KL 项趋近于零），隐空间丧失有意义的表示。

常见缓解策略：

| 策略 | 方法 | 效果 |
|------|------|------|
| KL 退火 (KL Annealing) | 训练初期降低 KL 权重，逐步增加到 1 | 让编码器先学到有意义的表示 |
| $\beta$-VAE | 设 $\beta > 1$ 或 $\beta < 1$ 调节 KL 权重 | $\beta > 1$ 促进解耦表示 |
| Free Bits | 设定 KL 项的最低值 | 防止各维度 KL 完全为零 |

### 与其他生成模型对比

| 特性 | VAE | [[GAN\|GAN]] | [[DDPM\|DDPM]] |
|------|-----|---------|----------|
| 训练目标 | 最大化 ELBO | 对抗博弈 | 去噪分数匹配 |
| 生成质量 | 中等（易模糊） | 高（锐利） | 高 |
| 隐空间结构 | 连续、可解释 | 无显式结构 | 无显式隐空间 |
| 训练稳定性 | 高 | 低 | 高 |
| 密度估计 | 有（ELBO 下界） | 无 | 有 |
| 采样速度 | 快 | 快 | 慢 |

### 主要变种

- **$\beta$-VAE**：通过调节 KL 权重 $\beta$ 实现解耦表示学习
- **VQ-VAE**：用离散码本替代连续隐空间，结合向量量化，生成质量显著提升
- **CVAE (Conditional VAE)**：引入条件信息 $y$，实现可控生成
- **NVAE**：深层层次化 VAE，生成质量接近 GAN

### 应用场景

- **图像生成与插值**：在隐空间中平滑插值，生成中间过渡状态
- **异常检测**：正常数据重建误差低，异常数据重建误差高
- **药物分子设计**：在连续隐空间中搜索具有目标属性的分子结构
- **表示学习**：学习数据的低维有意义表示，用于下游任务

---

> [[机器学习\|机器学习]] | [[深度学习\|深度学习]] | [[神经网络\|神经网络]] | [[GAN\|GAN]] | [[DDPM\|DDPM]]
