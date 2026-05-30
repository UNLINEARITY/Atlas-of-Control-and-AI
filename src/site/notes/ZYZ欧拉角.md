---
{"aliases":["ZYZ Euler angles","ZYZ 欧拉角"],"dg-publish":true,"permalink":"/ZYZ欧拉角/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["ZYZ Euler angles","ZYZ 欧拉角"]}}
---


(terminology::**ZYZ Euler Angles**) ZYZ 欧拉角用三个连续旋转表示 $R\in [[SO(3)\|SO(3)]]$：

$$
R(\alpha,\beta,\gamma)=\operatorname{Rot}(\hat z,\alpha)\operatorname{Rot}(\hat y,\beta)\operatorname{Rot}(\hat z,\gamma).
$$

它可以理解为一个三关节腕部机构的姿态角：第一关节绕初始 $z$ 轴，第二关节绕随动的 $y$ 轴，第三关节绕末端的 $z$ 轴。与[[ZYX欧拉角\|ZYX欧拉角]]不同，第一、第三个旋转轴同属 $z$ 类型，因此它更贴近许多球腕和方位-倾角-自旋描述。

展开后

$$
R=
\begin{bmatrix}
c_\alpha c_\beta c_\gamma-s_\alpha s_\gamma &
-c_\alpha c_\beta s_\gamma-s_\alpha c_\gamma &
c_\alpha s_\beta\\
s_\alpha c_\beta c_\gamma+c_\alpha s_\gamma &
-s_\alpha c_\beta s_\gamma+c_\alpha c_\gamma &
s_\alpha s_\beta\\
-s_\beta c_\gamma &
s_\beta s_\gamma &
c_\beta
\end{bmatrix}.
$$

## 反解

若 $\sin\beta\ne0$，可取

$$
\beta=\operatorname{atan2}\left(\sqrt{r_{13}^{2}+r_{23}^{2}},r_{33}\right),
\quad
\alpha=\operatorname{atan2}(r_{23},r_{13}),
\quad
\gamma=\operatorname{atan2}(r_{32},-r_{31}).
$$

这里的主值通常令 $\beta\in[0,\pi]$，而 $\alpha,\gamma$ 各自在长度 $2\pi$ 的区间内选取。改变角度区间会得到等价但数值不同的三元组。

## 奇异边界

当 $\beta=0$ 或 $\beta=\pi$ 时，第一、第三个 $z$ 轴共线，$\alpha$ 和 $\gamma$ 的单独值不可唯一确定。特别地，若 $\beta=0$，

$$
R=\operatorname{Rot}(\hat z,\alpha+\gamma),
$$

因此 $(\alpha,0,\gamma)$ 与 $(\alpha+\delta,0,\gamma-\delta)$ 表示同一个旋转。若控制算法直接在角度空间中跨过该边界，角速度或关节解可能出现跳变。

## 欧拉角约定

一般的[[欧拉角\|欧拉角]]序列只要求轴 1 垂直于轴 2、轴 2 垂直于轴 3；轴 1 和轴 3 可以相同，也可以不同。第一、第三个角通常覆盖长度 $2\pi$ 的区间，第二个角覆盖长度 $\pi$ 的区间。ZYZ 属于“重复首末轴”的欧拉角，ZYX 属于“三个轴都不同”的欧拉角。
