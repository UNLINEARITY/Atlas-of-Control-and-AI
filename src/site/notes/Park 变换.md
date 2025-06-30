---
{"dg-publish":true,"dg-path":"A1- 数学/8. 变换/Park变换.md","tags":["Transform"],"permalink":"/A1- 数学/8. 变换/Park变换/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-09-18T14:32:37.000+08:00","updated":"2025-06-30T16:57:54.000+08:00"}
---


Park 变换是电机控制中的另一种坐标变换，它将 [[Clarke 变换\|Clarke 变换]]得到的两相正交坐标系（α、β）转换为与转子磁通同步旋转的 dq 坐标系。这种变换对于实现永磁同步电机（PMSM）和无刷直流电机（BLDC）的矢量控制至关重要，因为它允许控制算法在旋转坐标系中独立地控制电机的磁场和转矩。

Park 变换的数学表达式如下：
 $$\begin{bmatrix} i_d \\ i_q \end{bmatrix} = \begin{bmatrix} \cos (\theta) & \sin (\theta) \\ -\sin (\theta) & \cos (\theta) \end{bmatrix} \begin{bmatrix} i_{\alpha} \\ i_{\beta} \end{bmatrix}$$

其中：
- $i_d$ 和 $i_q$ 是 dq 坐标系中的电流分量，分别代表与转子磁通和转矩相关的分量。
- $i_{\alpha}$ 和 $i_{\beta}$ 是 Clarke 变换后的两相正交坐标系中的电流分量。
- $\theta$ 是转子的电角度，通常由转子位置传感器（如编码器）提供，或者通过无传感器技术估算得到。


Park 变换的逆变换公式为：
 $$\begin{bmatrix} i_{\alpha} \\ i_{\beta} \end{bmatrix} = \begin{bmatrix} \cos (\theta) & -\sin (\theta) \\ \sin (\theta) & \cos (\theta) \end{bmatrix} \begin{bmatrix} i_d \\ i_q \end{bmatrix}$$

在矢量控制策略中，Park 变换使得控制算法可以在 dq 坐标系中独立地控制电机的磁场和转矩。具体来说：
- $i_d$ 控制电机的磁场强度，与电机的磁通量成正比。
- $i_q$ 控制电机产生的转矩，与电机的电磁转矩成正比。

通过适当地调节$i_d$ 和 $i_q$，可以实现对电机转速和转矩的精确控制。这种控制方式类似于直流电机的控制，因此，矢量控制也被称为直流电机控制的交流电机等效。

在实际应用中，Park 变换通常与 Clarke 变换结合使用，首先通过 Clarke 变换将三相坐标系转换为两相正交坐标系，然后通过 Park 变换将两相正交坐标系转换为与转子磁通同步旋转的 dq 坐标系。这种组合变换为电机控制提供了极大的便利，使得电机的动态性能和控制精度得到了显著提高。

