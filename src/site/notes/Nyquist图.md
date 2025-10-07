---
{"dg-publish":true,"dg-path":"A2- 控制理论/1. 经典控制理论/Nyquist图.md","tags":["Graph"],"permalink":"/A2- 控制理论/1. 经典控制理论/Nyquist图/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-10-08T17:09:44.000+08:00","updated":"2025-09-18T23:10:36.614+08:00"}
---


极坐标图/**幅相曲线图**/Nyquist图
$$\begin{align}
G(j\omega )&=|G(j\omega )|e^{ j \angle G(j\omega ) }=P(\omega ) +jQ(\omega )
\end{align}$$

$\omega: 0\to \infty$  $G(j\omega)$ 在复平面上的轨迹,也即 $P(\omega),Q(\omega)$ 变化的曲线
一般只画 $0\to +\infty$ 的部分（$0\to -\infty$ 只需要以实轴为对称轴翻折即可）

### 基本的画法
一般是对开环传递函数绘制[[传递函数#2. 尾 1 标准型\|传递函数的尾1形式]]：


$$\begin{align}
G(s)&=\dfrac{K\prod\limits_{i=1}^{m}(\tau_{i}s+1)}{s^{v}\prod\limits_{i=1}^{n-v}(T_{i}s+1)} \\
G(j\omega )&=\dfrac{K\prod\limits_{i=1}^{m}(j\tau_{i}\omega +1)}{(j\omega )^{v}\prod\limits_{i=1}^{n-v}(jT_{i}\omega +1)}
\end{align}$$


**同时计算**：
将 $G(j\omega)$ 化为 $P(\omega ) +jQ(\omega )$ 的形式
$P(\omega)\quad Q(\omega)\quad |G(j\omega)|\quad \angle G(j\omega)$

$A(\omega)=|G(j\omega)|$      
$\phi(\omega)=|G(j\omega)|$


#### 相位的范围
相位范围不等号的方向变为一致
分子对应的范围：
$$
\left[0\;,\; \sum\limits_{i=1}^{m}\arctan \tau_{i}\omega\right]
$$

分母对应的范围：
$$\left[ -90^{\circ}\times v-\sum\limits_{i=1}^{n-v}\arctan T_{i}\omega\;, \; -90^{\circ}\times v\right]$$

可能出现的范围：
$$
\left[ -90^{\circ}\times v-\sum\limits_{i=1}^{n-v}\arctan T_{i}\omega\;, \; -90^{\circ}\times v+\sum\limits_{i=1}^{m}\arctan \tau_{i}\omega\right]
$$

#### 1. 绘制起点和终点 
注意渐近线和始末的辐角
-  $\omega \to 0^{+}$：$P(0^{+})\quad Q(0^{+})\quad |G(0^{+})|\quad \angle G(0^{+})$
-  $\omega \to +\infty$：$P(+\infty)\quad Q(+\infty)\quad |G(+\infty)|\quad \angle G(+\infty)$

#### 2. 与实虚轴的交点
**确定实际的相位范围**
- $Q(\omega)=0$ 计算与实轴交点
- $P(\omega)=0$ 计算与虚轴交点

#### 3.注意二阶振荡环节
如果阻尼比为 0，可能会出现极限频率问题，会产生分支，不连续的点：相角的不连续带来幅值的不连续，关注使得分母为 0 的 $\omega$，要讨论左右极限
$P(\omega^{-})\quad Q(\omega^{-})\quad |G(\omega^{-})|\quad \angle G(\omega^{-})$
$P(\omega^{+})\quad Q(\omega^{+})\quad |G(\omega^{+})|\quad \angle G(\omega^{+})$

自然震荡频率的极限问题：通过对幅值 $\left\lvert  G(j\omega) \right\rvert$ 求导，得到幅值和对应的角频率
谐振频率、谐振峰值

### Nyquist 曲线的增补
#### 起始点
从 $G(0^{+})$ 逆时针开始补画 $v\times 90^{\circ}$ ，半径为 $\infty$ 的顺时针圆弧
>[!tip] 注意
>从逆时针补画的原因只是不存在实际的 $G(0)$
>从 $G(0^{+})$ 开始画比较方便
>最后的圆弧还是顺时针的
#### 不连续的点 $\omega_{n}$
从 $G(j\omega_{n}^{-})$ 以半径为无穷大顺时针作 $v\times 180^{\circ}$ 的圆弧至 $G(j\omega_{n}^{+})$


