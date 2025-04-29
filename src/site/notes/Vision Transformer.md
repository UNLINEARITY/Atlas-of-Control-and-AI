---
{"dg-publish":true,"dg-path":"人工智能/计算机视觉/Vision Transformer.md","permalink":"/人工智能/计算机视觉/Vision Transformer/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-04-28T22:38:34.840+08:00","updated":"2025-04-29T11:41:21.226+08:00"}
---

(terminology::**Vision Transformer**)  ViT
一种直接将 [[Transformer\|Transformer]] 架构应用到**图像分类任务**的方法，首次证明了在大规模数据集（比如ImageNet-21k）上，Transformer可以超越传统卷积神经网络（CNN）。
> **Google Brain**在2020年发布的论文《An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale》。

传统图像任务几乎都是基于[[CNN\|卷积神经网络]]
Vision Transformer通过简单地把图像分成小块并用Transformer处理，展现了强大的学习全局特征的能力，推动了计算机视觉从"卷积时代"走向了"自注意力时代"！

### 基本原理
把**一张图像**当作**一串序列**来处理！
**步骤概览**：
1. **切图**：把图像切成固定大小的小块（patches）
2. **编码**：把每个小块线性映射成向量（类似词向量）
3. **加位置编码**：告诉模型每个块的位置
4. **送进Transformer编码器**：用标准的Transformer（多头自注意力+前馈网络）处理
5. **分类头**：用一个分类token输出最终类别

