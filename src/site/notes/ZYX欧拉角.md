---
{"aliases":["ZYX Euler angles","ZYX 欧拉角","yaw-pitch-roll"],"dg-publish":true,"permalink":"/ZYX欧拉角/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["ZYX Euler angles","ZYX 欧拉角","yaw-pitch-roll"]}}
---


(terminology::**ZYX Euler Angles**) ZYX 欧拉角用三个依次作用在**本体坐标系**上的旋转描述 $R\in [[SO(3)\|SO(3)]]$：先绕本体 $\hat z_b$ 轴转 $\alpha$，再绕新的 $\hat y_b$ 轴转 $\beta$，最后绕新的 $\hat x_b$ 轴转 $\gamma$。其矩阵乘积为

$$
R(\alpha,\beta,\gamma)=\operatorname{Rot}(\hat z,\alpha)\operatorname{Rot}(\hat y,\beta)\operatorname{Rot}(\hat x,\gamma).
$$

记 $c_\alpha=\cos\alpha,\ s_\alpha=\sin\alpha$ 等，则

$$
R=
\begin{bmatrix}
c_\alpha c_\beta & c_\alpha s_\beta s_\gamma-s_\alpha c_\gamma & c_\alpha s_\beta c_\gamma+s_\alpha s_\gamma\\
s_\alpha c_\beta & s_\alpha s_\beta s_\gamma+c_\alpha c_\gamma & s_\alpha s_\beta c_\gamma-c_\alpha s_\gamma\\
-s_\beta & c_\beta s_\gamma & c_\beta c_\gamma
\end{bmatrix}.
$$

这是一种[[欧拉角\|欧拉角]]参数化：三个角本身不是独立于约定的物理量，只有在旋转顺序、旋转轴和本体系/固定系约定同时给定后才有确定含义。

## 反解

给定 $R=[r_{ij}]$。若 $\beta\ne\pm\pi/2$，即 $r_{31}\ne\pm1$，常用主值分支为

$$
\beta=\operatorname{atan2}\left(-r_{31},\sqrt{r_{11}^{2}+r_{21}^{2}}\right),
\quad
\alpha=\operatorname{atan2}(r_{21},r_{11}),
\quad
\gamma=\operatorname{atan2}(r_{32},r_{33}).
$$

若允许 $\beta$ 落在另一个长度为 $\pi$ 的区间，也可把平方根取负得到另一组角。两组角表示同一个[[旋转矩阵\|旋转矩阵]]，这是欧拉角多值性的正常表现。

## 奇异边界

当 $\beta=\pi/2$ 时，第一、第三个本体旋转轴重合为同一竖直轴的相反方向，$\alpha$ 与 $\gamma$ 不再分别可辨，只保留 $\alpha-\gamma$。例如

$$
(\alpha,\beta,\gamma)=(0,\pi/2,0)
\quad\text{和}\quad
(\delta,\pi/2,\delta)
$$

给出同一个 $R$。一个可选反解是 $\alpha=0,\ \gamma=\operatorname{atan2}(r_{12},r_{22})$。

当 $\beta=-\pi/2$ 时，保留的是 $\alpha+\gamma$；一个可选反解是

$$
\alpha=0,\qquad \gamma=-\operatorname{atan2}(r_{12},r_{22}).
$$

这些一参数族就是 ZYX 约定下的[[万向节锁\|万向节锁]]。在滤波、优化或插值中，若姿态可能接近该边界，通常改用[[单位四元数\|单位四元数]]、[[旋转矩阵\|旋转矩阵]]或局部误差的[[旋转的指数坐标\|旋转的指数坐标]]。

## 与固定轴 RPY 的关系

矩阵乘积 $\operatorname{Rot}(\hat z,\alpha)\operatorname{Rot}(\hat y,\beta)\operatorname{Rot}(\hat x,\gamma)$ 也出现在[[横滚俯仰偏航角\|横滚俯仰偏航角]]中；那里解释为先绕固定 $\hat x$ 轴 roll，再绕固定 $\hat y$ 轴 pitch，最后绕固定 $\hat z$ 轴 yaw。矩阵相同不表示物理叙述相同，区别在于 ZYX 欧拉角使用本体固定轴，XYZ RPY 使用空间固定轴。
