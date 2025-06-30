---
{"dg-publish":true,"dg-path":"机器人/Lie Algebra.md","permalink":"/机器人/Lie Algebra/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-06-16T18:35:22.688+08:00","updated":"2025-06-30T23:47:57.992+08:00"}
---

(terminology::**Lie Algebra**)   李代数
李代数：[[Lie Group\|Lie Group]] 的切空间，是Lie 群的局部线性近似。
通常写作小写字母，如李代数 $\mathfrak{se}(3)$ 对应于李群的 $SE(3)$。

```LaTeX
\mathfrak{}   \mathfrak{se}
```
### Lie 代数和Lie 群
Lie 群描述全局运动（非线性），李代数描述局部运动（线性）。
- 通过 **指数映射（exp）** 可以从李代数映射到 Lie 群。
- 通过 **对数映射（log）** 可以从 Lie 群映射到李代数。

### 常见 Lie 群的数学推导
| Lie 群          | 群元素形式               | 李代数                            | 指数映射形式                          |
| -------------- | ------------------- | ------------------------------ | ------------------------------- |
| $SO(2)$        | $2 \times 2$ 旋转矩阵   | $\omega \in \mathbb{R}$        | $R = \exp(\hat{\omega} \theta)$ |
| $SO(3)$        | $3 \times 3$ 旋转矩阵   | $\omega \in \mathbb{R}^3$      | Rodrigues 公式                    |
| $SE(2)$        | $3 \times 3$ 刚体变换矩阵 | $[v, \omega] \in \mathbb{R}^3$ | 平面运动公式                          |
| $SE(3)$        | $4 \times 4$ 刚体变换矩阵 | $[v, \omega] \in \mathbb{R}^6$ | 雅可比矩阵形式                         |
| $\mathbb{R}^n$ | 向量加法                | 向量本身                           | 指数映射为恒等映射                       |

#### 1. $SO(2)$：二维平面旋转群
**群元素**：二维旋转矩阵
$$
R(\theta) =
\begin{bmatrix}
\cos \theta & -\sin \theta \\
\sin \theta & \cos \theta
\end{bmatrix}
$$

**李代数**：李代数 $\mathfrak{so}(2)$ 的元素：
$$
\hat{\omega} =
\begin{bmatrix}
0 & -\omega \\
\omega & 0
\end{bmatrix}
$$

**指数映射**：
$$
R(\theta) = \exp(\hat{\omega} \theta) = 
\begin{bmatrix}
\cos \theta & -\sin \theta \\
\sin \theta & \cos \theta
\end{bmatrix}
$$

#### 2. $SO(3)$：三维空间旋转群
**群元素**：三维旋转矩阵
$$
R \in SO(3) \quad \text{满足} \quad R^T R = I, \quad \det(R) = 1
$$

**李代数**：李代数 $\mathfrak{so}(3)$ 的元素（反对称矩阵）：
$$
\hat{\omega} =
\begin{bmatrix}
0 & -\omega_z & \omega_y \\
\omega_z & 0 & -\omega_x \\
-\omega_y & \omega_x & 0
\end{bmatrix}
$$

**指数映射**（使用 Rodrigues 公式）：
$$
R = \exp(\hat{\omega} \theta) = I + \frac{\sin \theta}{\theta} \hat{\omega} + \frac{1 - \cos \theta}{\theta^2} \hat{\omega}^2
$$

**对数映射**：给定旋转矩阵 $R$，其旋转轴 $\omega$ 与旋转角度 $\theta$ 满足：

$$
\theta = \cos^{-1} \left( \frac{\text{tr}(R) - 1}{2} \right)
$$
**旋转向量**：
$$
\omega = \frac{\theta}{2 \sin \theta}
\begin{bmatrix}
R_{32} - R_{23} \\
R_{13} - R_{31} \\
R_{21} - R_{12}
\end{bmatrix}
$$

#### 3. $SE(2)$：二维刚体运动群
**群元素**：$R(\theta)$ 为 $SO(2)$ 旋转矩阵，$t \in \mathbb{R}^2$ 为平移向量。
$$
T =
\begin{bmatrix}
R(\theta) & t \\
0 & 1
\end{bmatrix} \in SE(2)
$$

**李代数**：李代数 $\mathfrak{se}(2)$ 的元素：
$$
\xi^\wedge =
\begin{bmatrix}
0 & -\omega & v_x \\
\omega & 0 & v_y \\
0 & 0 & 0
\end{bmatrix}
$$

**指数映射**：
$$
T = \exp(\xi^\wedge)
$$

当 $\omega \neq 0$ 时，有：
$$
T = 
\begin{bmatrix}
R(\theta) & V t \\
0 & 1
\end{bmatrix}
$$

其中：
$$
V =
\frac{1}{\omega}
\begin{bmatrix}
\sin \omega & -(1 - \cos \omega) \\
1 - \cos \omega & \sin \omega
\end{bmatrix}
$$

#### 4. $SE(3)$：三维刚体运动群
**群元素**：$R \in SO(3)$，$t \in \mathbb{R}^3$。
$$
T =
\begin{bmatrix}
R & t \\
0 & 1
\end{bmatrix} \in SE(3)
$$


**李代数**： $\mathfrak{se}(3)$ 的元素，$\hat{\omega} \in \mathfrak{so}(3)$，$v \in \mathbb{R}^3$
$$
\xi^\wedge =
\begin{bmatrix}
\hat{\omega} & v \\
0 & 0
\end{bmatrix}
$$

**指数映射**：
$$
T = \exp(\xi^\wedge) =
\begin{bmatrix}
\exp(\hat{\omega}) & J v \\
0 & 1
\end{bmatrix}
$$

其中，$J$ 为平移部分的[[雅可比矩阵\|雅可比矩阵]]：
$$
J = I + \frac{1 - \cos \theta}{\theta^2} \hat{\omega} + \frac{\theta - \sin \theta}{\theta^3} \hat{\omega}^2
$$

**对数映射**：给定刚体变换矩阵 $T$，旋转部分用 $R$，平移部分用 $t$
$$
\hat{\omega} = \log(R)
$$

旋转角度 $\theta$ 同上，计算 $J^{-1}$，得到：
$$
v = J^{-1} t
$$

#### 5. $\mathbb{R}^n$：欧式空间（特殊情况）
当只涉及平移，没有旋转时，李群退化为欧式空间，群运算为[[向量\|向量]]加法，李代数就是自己。


