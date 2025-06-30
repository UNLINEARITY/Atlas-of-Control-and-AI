---
{"tags":["Transform"],"dg-publish":true,"dg-path":"A1- 数学/8. 变换/Clarke变换.md","permalink":"/A1- 数学/8. 变换/Clarke变换/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-09-18T14:30:36.000+08:00","updated":"2025-06-30T16:57:50.000+08:00"}
---


Clarke 变换是一种数学变换，它将[[三相交流电\|三相交流电]]的三相坐标系（通常表示为 a、b、c）转换为两相正交坐标系（通常表示为α、β）。这种变换在电机控制领域，尤其是在矢量控制（也称为磁场定向控制）中非常重要，因为它简化了电机的数学模型，使得控制算法更容易实现。

Clarke 变换的数学表达式如下：
$$ \begin{bmatrix} i_{\alpha} \\ i_{\beta} \end{bmatrix} = \frac{2}{3} \begin{bmatrix} 1 & -\frac{1}{2} & -\frac{1}{2} \\ 0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} \end{bmatrix} \begin{bmatrix} i_a \\ i_b \\ i_c \end{bmatrix} $$

其中 $i_a$、$i_b$ 和 $i_c$ 是三相电流或电压的相量，$i_{\alpha}$ 和 $i_{\beta}$ 是变换后的两相正交坐标系中的分量。

Clarke 变换的逆变换公式为：
$$ \begin{bmatrix} i_a \\ i_b \\ i_c \end{bmatrix} = \begin{bmatrix} 1 & \frac{1}{2} & \frac{1}{2} \\ 0 & -\frac{\sqrt{3}}{2} & \frac{\sqrt{3}}{2} \\ \frac{1}{2} & \frac{1}{2} & \frac{1}{2} \end{bmatrix} \begin{bmatrix} i_{\alpha} \\ i_{\beta} \end{bmatrix} $$

在实际应用中，Clarke 变换通常用于将电机的三相电流或电压信号转换为两相正交信号，然后这些信号可以被用来控制电机的磁场和转矩。变换后的α轴通常与电机的 a 相重合，而β轴与 a 相和 b 相之间的正交方向对齐。

值得注意的是，Clarke 变换后，通常会有一个零序分量（$i_0$），但在理想情况下，对于平衡的三相系统，这个零序分量是零。在实际电机控制中，这个零序分量通常被忽略，因为它不影响电机的转矩产生。

在电机控制算法中，Clarke 变换通常与 [[Park 变换\|Park 变换]]结合使用，Park 变换将 Clarke 变换后的静止坐标系（α、β）转换为与转子磁通同步旋转的 dq 坐标系，进一步简化了电机控制算法的设计。这种组合变换使得电机的磁场和转矩控制可以通过控制 d 轴和 q 轴的电流分量来实现，从而实现精确的电机控制。
