---
{"tags":["OpenSource","Library"],"dg-path":"人工智能/计算机视觉/OpenCV.md","dg-publish":true,"permalink":"/人工智能/计算机视觉/OpenCV/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-10-08T17:11:09.000+08:00","updated":"2025-10-22T21:58:44.000+08:00"}
---

(terminology::**Open Source Computer Vision Library**)

(website::https://opencv.org/)

开源的[[计算机视觉\|计算机视觉]]和[[机器学习\|机器学习]]软件库，它提供了一系列的编程接口和算法，用于实时的计算机视觉任务。

是**计算机视觉、图像处理、机器人感知领域最重要的开源库之一**。它不仅支持图像处理、机器学习、视频流处理，还支持多平台、多语言。

### 常用模块
|模块|功能|
|---|---|
|`core`|核心数据结构与基本运算|
|`imgproc`|图像处理：滤波、边缘检测、形态学操作|
|`highgui`|图像显示、视频捕获|
|`video`|光流、背景建模、运动检测|
|`calib3d`|相机标定、立体视觉、三维重建|
|`features2d`|特征检测与匹配（SIFT、ORB、FAST）|
|`objdetect`|目标检测（Haar、HOG）|
|`dnn`|深度学习推理|
|`ml`|机器学习|
|`photo`|图像修复、去噪、HDR|
|`videoio`|视频输入输出|
|`viz`|3D 可视化|

### 操作的共性与核心思维
读取图像 → 预处理 → 核心处理 → 可视化/保存

OpenCV- [[Python	\|Python	]] 快速原型验证
OpenCV- [[C++\|C++]]	      高性能应用

#### 数据结构 ：Mat
所有图像、视频、矩阵数据统一存储在 cv::Mat（C++）或 numpy. array（Python） 中。Mat 的本质：行列二维数组，每个像素可能包含灰度值、RGB、深度等信息。
#### 图像通道与颜色约定
OpenCV 默认通道顺序：**BGR（而非 RGB）**
转换颜色空间：`cv2.cvtColor`，支持 BGR、GRAY、HSV、Lab、YUV 等
统一的图像数据类型：
- 8 位灰度：np. uint8
- 8 位彩色：np. uint8 三通道
- 浮点型图像：np. float32（如光流）

#### 操作共性
所有滤波操作（均值、卷积、高斯、腐蚀、膨胀）本质上是：
- 在像素邻域滑动窗口进行局部运算
- 结果存储于新 Mat，不修改原图

所有图像几何操作（仿射、透视、旋转、缩放）：
- 都通过计算变换矩阵
- 使用统一函数 `cv2.warpAffine` 或 `cv2.warpPerspective`



