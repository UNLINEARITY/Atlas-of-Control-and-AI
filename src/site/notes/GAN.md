---
{"aliases":["生成对抗网络"],"dg-publish":true,"dg-path":"人工智能/深度学习/GAN.md","tags":["DL","Generative Model"],"permalink":"/人工智能/深度学习/GAN/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["生成对抗网络"],"tags":["DL","Generative Model"]}}
---


(terminology::**Generative Adversarial Network**) 生成对抗网络

> **GAN 通过两个[[神经网络\|神经网络]]的对抗博弈来隐式学习数据分布，从而生成逼真的新样本。** 由 Ian Goodfellow 等人于 2014 年提出，是生成模型领域最具影响力的框架之一。

### 核心思想：对抗博弈

GAN 的架构包含两个相互对抗的网络：

- **生成器 (Generator, $G$)**：接收随机噪声 $z \sim p_z(z)$，输出伪造样本 $G(z)$，目标是生成尽可能逼真的数据以"欺骗"判别器。
- **判别器 (Discriminator, $D$)**：接收真实样本 $x$ 或生成样本 $G(z)$，输出一个概率值 $D(\cdot) \in [0, 1]$，判断输入是否来自真实数据分布。

两者构成一个**极小极大博弈 (Minimax Game)**：生成器试图最大化判别器的错误率，判别器试图最大化自身的判别准确率。

### 数学公式

GAN 的目标函数（价值函数）为：

$$\min_G \max_D V(D, G) = \mathbb{E}_{x \sim p_{data}(x)}[\log D(x)] + \mathbb{E}_{z \sim p_z(z)}[\log(1 - D(G(z)))]$$

其中：
- $p_{data}(x)$ 是真实数据分布
- $p_z(z)$ 是噪声先验分布（通常为高斯分布或均匀分布）
- $D(x)$ 表示判别器认为 $x$ 来自真实数据的概率
- $G(z)$ 是生成器从噪声 $z$ 生成的样本

> [!note] 纳什均衡
> 理论上，当训练达到纳什均衡时，生成器学会了真实数据分布 $p_G = p_{data}$，此时判别器对任意输入输出 $D(x) = \frac{1}{2}$，即无法区分真假。

### 训练过程

GAN 的训练交替进行以下两步：

**第一步：固定 $G$，训练 $D$（最大化 $V$）**

$$\max_D \; \mathbb{E}_{x \sim p_{data}}[\log D(x)] + \mathbb{E}_{z \sim p_z}[\log(1 - D(G(z)))]$$

**第二步：固定 $D$，训练 $G$（最小化 $V$）**

实践中通常最大化 $\log D(G(z))$ 而非最小化 $\log(1 - D(G(z)))$，以避免早期梯度消失：

$$\max_G \; \mathbb{E}_{z \sim p_z}[\log D(G(z))]$$

```python
import torch
import torch.nn as nn

# 判别器训练
real_output = D(real_data)
fake_data = G(torch.randn(batch_size, latent_dim))
fake_output = D(fake_data.detach())
d_loss = -torch.mean(torch.log(real_output) + torch.log(1 - fake_output))

# 生成器训练
fake_data = G(torch.randn(batch_size, latent_dim))
fake_output = D(fake_data)
g_loss = -torch.mean(torch.log(fake_output))
```

### 网络架构

| 组件   | 典型结构                        | 输入          | 输出                  |
| ---- | --------------------------- | ----------- | ------------------- |
| 生成器 $G$ | 全连接 / 转置卷积（反卷积）网络           | 噪声向量 $z \in \mathbb{R}^d$ | 生成样本 $G(z)$         |
| 判别器 $D$ | 全连接 / [[CNN\|CNN]] | 样本 $x$ 或 $G(z)$    | 概率值 $D(\cdot) \in [0,1]$ |

生成器通常使用 BatchNorm + ReLU（最后一层用 Tanh），判别器使用 LeakyReLU + Dropout。

### 训练挑战

> [!warning] 模式崩溃 (Mode Collapse)
> 生成器可能只学会生成少数几种"安全"的样本来欺骗判别器，而忽略真实数据分布中的其他模式。这是 GAN 训练中最常见的问题。

- **训练不稳定**：生成器与判别器的能力需要大致平衡，否则一方过强会导致另一方无法有效学习
- **梯度消失**：当判别器过强时，$\log(1 - D(G(z))) \to 0$，生成器梯度趋近于零
- **评估困难**：缺乏像似然函数那样的显式指标来衡量训练进度

### 主要变种

| 变种       | 改进点                       | 关键特性             |
| -------- | ------------------------- | ---------------- |
| DCGAN    | 使用[[卷积\|卷积]]架构替代全连接          | 稳定训练，图像生成质量提升    |
| WGAN     | 用 Wasserstein 距离替代 JS 散度  | 缓解模式崩溃，梯度更平滑     |
| WGAN-GP  | 在 WGAN 基础上用梯度惩罚替代权重裁剪    | 训练更稳定，无需权重裁剪     |
| CGAN     | 引入条件信息 $y$（类别标签等）        | 可控生成             |
| CycleGAN | 无配对数据的图像风格转换              | 循环一致性损失          |
| StyleGAN | 风格映射网络 + 渐进式生成            | 高分辨率人脸生成，风格可控    |
| BigGAN   | 大规模训练 + 类条件生成             | ImageNet 级别图像生成  |

### 与其他生成模型的对比

| 特性       | GAN              | [[VAE\|VAE]]                | [[DDPM\|DDPM]]             |
| -------- | ---------------- | ---------------------- | -------------------- |
| 训练方式     | 对抗训练             | 变分推断（最大化 ELBO）         | 去噪分数匹配               |
| 生成质量     | 高（尤其是锐利度）        | 中等（易模糊）                | 高                    |
| 训练稳定性    | 低（需精心调参）         | 高                      | 高                    |
| 模式覆盖     | 易模式崩溃            | 好                      | 好                    |
| 采样速度     | 快（单次前向传播）        | 快                      | 慢（需迭代去噪）             |
| 似然估计     | 无显式似然            | 有（ELBO 下界）             | 有                    |

### 应用场景

- **图像生成与超分辨率**：生成逼真的人脸、场景图像，图像增强
- **图像到图像翻译**：语义分割图到真实图像（pix2pix）、风格迁移（CycleGAN）
- **数据增强**：为训练数据不足的任务生成合成样本
- **文本到图像生成**：结合文本编码器实现条件生成
- **异常检测**：通过学习正常数据分布来识别异常样本

---

> [[机器学习\|机器学习]] | [[深度学习\|深度学习]] | [[神经网络\|神经网络]] | [[VAE\|VAE]] | [[DDPM\|DDPM]]
