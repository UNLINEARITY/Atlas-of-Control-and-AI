---
{"dg-publish":true,"dg-path":"人工智能/计算机视觉/YOLO.md","permalink":"/人工智能/计算机视觉/YOLO/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-02-03T15:09:20.538+08:00","updated":"2025-04-29T11:40:19.646+08:00"}
---

(terminology::**You Only Look Once**)
基于深度学习的**实时目标检测算法**
只需要一次前向传播（一次看图）就能完成图像中所有物体的定位和分类
- 快：一次推理完成检测
- 端到端：直接从输入图像到输出检测框+类别
- 实时应用友好：适合自动驾驶、监控等对速度要求高的场景

它将目标检测任务转化为一个[[回归\|回归]]问题，通过单个神经网络直接从图像像素预测目标的边界框和类别概率 

### 基本工作原理
1. **网格划分**：YOLO将输入图像划分为S×S的网格，每个网格负责检测该区域内的目标。整个检测过程只需要一张图一次推理，极大加快速度。
2. **边界框预测**：每个网格会预测多个边界框（bounding boxes），每个边界框由中心坐标、宽度、高度和置信度表示。
3. **物体分类**：YOLO还会对每个边界框内的物体进行分类。
4. **非极大值抑制（NMS）**：用于去除重复的检测结果，选择置信度最高的边界框作为最终结果。

### 工作流程
1. 输入处理
- 将输入图像调整为固定大小（例如 448x448）
- 标准化像素值
2. 划分网格：将图像划分成 **S×S 个网格**（例如7×7）
3. 每个网格预测
- 每个网格预测：
    - B个边界框（Bounding Boxes）
    - 每个框包括位置 (x, y, w, h) + 置信度 (confidence)
    - C个类别概率
预测输出：
$$\begin{align}
S\times S\times(B\times5 +C)
\end{align}$$
4. 后处理（NMS）使用**非极大值抑制（NMS, Non-Maximum Suppression）**:去掉重复检测到的框，保留得分最高的那个。

### 版本演进

|版本|发布年份|主要特点|
|---|---|---|
|YOLOv1|2016|提出统一检测框架，实时检测|
|YOLOv2（YOLO9000）|2017|引入Anchor机制，提高准确率，可以检测9000类|
|YOLOv3|2018|使用多尺度预测，特征提取更强（Darknet-53）|
|YOLOv4|2020|优化训练技巧（Bag of Freebies/ Specials），提升性能|
|YOLOv5（社区版）|2020|PyTorch重写，更轻便，工程实用性强|
|YOLOv6|2022|更偏工业部署，速度更快|
|YOLOv7|2022|多任务学习，统一多个检测任务|
|YOLOv8|2023|不再依赖Darknet，模块化设计，更快更准，支持分割任务|

#### YOLOv1 → YOLOv2
- 引入了**Anchor Boxes**（先验框），提高小目标检测能力。
- 使用**Batch Normalization**加速收敛。
- 使用高分辨率分类器。
#### YOLOv2 → YOLOv3
- 多尺度预测（Feature Pyramid）
- 用了更深的网络（Darknet-53）
- 用逻辑回归预测目标存在概率
#### YOLOv4
- 技巧优化：Mish激活、CSPNet、DropBlock、CIoU Loss
- 提出了 Bag of Freebies（免费提升）和 Bag of Specials（特殊模块）
#### YOLOv5+
- 完全基于 [[PyTorch\|PyTorch]] 开发，易训练、易部署
- 支持**轻量版**（n/s/m/l/x）
- 加强了数据增强（Mosaic、MixUp）
- 引入AutoAnchor自动调优
#### YOLOv8
- 支持**目标检测+实例分割+姿态估计**一体
- 架构更灵活：不再绑定Darknet
- 更强大、更快，适合端侧应用

