---
{"dg-publish":true,"dg-path":"A1- 数学/8. 变换/z 变换.md","tags":["Transform","Discrete"],"permalink":"/A1- 数学/8. 变换/z 变换/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-05-21T15:20:27.000+08:00","updated":"2025-06-30T17:13:17.000+08:00"}
---


(terminology::**Z-Transform**)
采样信号的拉普拉斯变换
> **离散时间信号处理**中的一个重要数学工具，在[[信号采样\|信号采样]]的基础上，由连续时间信号处理中的[[拉普拉斯变换\|拉普拉斯变换]]引申出来的变换方法。（将 $s$ 的超越函数转化为 $z$ 的[[幂级数\|幂级数]]或 $z$ 的有理分式）

### 一、z 变换定义
1. 采样信号 $e^{*}(t)$ 的时域表达：
$$\begin{align}
e^{*}(t)&= e(t)\delta _{T}(t)=\sum\limits_{n=0}^{\infty} e(nT)\delta(t-nT)
\end{align}$$
2. 采样信号的拉普拉斯变换为：
$$\begin{align}
E^{*}(s)&=\mathscr{L}[e^{*}(t)]=\sum\limits_{n=0}^{\infty} e(nT) {\color{red}   \mathscr{L}\left[\delta(t-nT)\right]} =\sum\limits_{n=0}^{\infty} e(nT){\color{red  }e^{ -nsT } } 
\end{align}$$
3. 令 $\large z=e^{ sT }$，得到 z 变换：
$$\begin{align}
E(z)=\mathscr{Z}[e(t)] =\mathscr{Z}[e^{*}(t)]=\sum\limits_{k=0}^{\infty} e(nT){\color{red}   z^{-k}} 
\end{align}$$
$\mathscr{Z}$ 表示取 z 变换，习惯上称 $E(z)$ 是采样信号的 z 变换。


常用结论：
$$\begin{align}
\large \delta(t-kT)\quad  {\color{red}\Leftrightarrow} \quad e^{ -kTs } \quad{\color{red}\Leftrightarrow} \quad  z^{-k}
\end{align}$$

均表示信号延迟了 $k$ 个采样周期，则 $z^{-1}$ 就为单位延迟因子：表示信号延迟了一个采样周期

### 二、z 变换方法
#### 1. 级数求和法（定义）
根据定义写为级数展开形式，根据[[常数项级数#1. 等比级数/几何级数\|级数知识]]得到最终表达式：
$$\begin{align}
E(z)=  \sum\limits_{k=0}^{\infty} e(kT)z^{-k} =e(0)+e(T)z^{-1}+e(2T)z^{-2}+\cdots+e(kT)z^{-k}+\cdots 
\end{align}$$
以上级数[[收敛\|收敛]]的充分条件是满足绝对可和条件：
$$\begin{align}
\sum\limits_{k=0}^{+\infty} \left\lvert  e(kT)z^{-k} \right\rvert<+\infty
\end{align}$$

#### 2. 部分分式法
先求**已知连续函数的拉氏变换**  $E(s)$ ，将有理分式 $E(s)$ 展开为**部分分式之和**的形式，对每个部分分式进行 z 变换。（展开为部分分式重要的是用[[留数#2. 极点（主要）\|留数法]]来求系数 $c_{i}$）

$$\begin{align}
E(s)= \sum\limits_{i=1}^{n} \dfrac{c_{i}}{s-p_{i}}\quad \Rightarrow \quad E(z)=\sum\limits_{i=1}^{n} \dfrac{c_{i}}{1-e^{ p_{i}T }z^{-1}}
\end{align}$$
m 重极点的系数：
$$\begin{align}
c_{i}= \dfrac{1}{(m-1)!} \lim\limits_{ z \to z_{0} } \dfrac{\mathrm{d}^{m-1} }{\mathrm{d} z^{m-1}} \left[(z-z_{0})^{m}e(z)\right] 
\end{align}$$


### 三、常见函数的 z 变换

|           |        时间函数         |           离散信号           |        拉普拉斯变换         |                         z 变换                          |
| :-------: | :-----------------: | :----------------------: | :-------------------: | :---------------------------------------------------: |
|  **延迟**   |   $\delta(t-nT)$    |     $\delta (kT-nT)$     |     $e^{ -nTs }$      |                       $z^{-n}$                        |
|   单位脉冲    |     $\delta(t)$     |       $\delta(kT)$       |          $1$          |                          $1$                          |
|   单位阶跃    |       $1(t)$        |         $1(kT)$          |    $\dfrac{1}{s}$     |         $\dfrac{1}{1-z^{-1}}=\dfrac{z}{z-1}$          |
|   单位时间    |         $t$         |           $kT$           |  $\dfrac{1}{s^{2}}$   |  $\dfrac{Tz^{-1}}{(1-z^{-1})}=\dfrac{Tz}{(z-1)^{2}}$  |
| ~~单位加速度~~ | $\dfrac{1}{2}t^{2}$ | $\dfrac{1}{2}k^{2}T^{2}$ |  $\dfrac{1}{s^{3}}$   |   $\dfrac{T^{2}z^{-1}(1+z^{-1})}{2(1-z^{-1})^{3}}$    |
|    指数     |     $e^{ -at }$     |       $e^{ -akT }$       |   $\dfrac{1}{s+a}$    | $\dfrac{1}{1-e^{ -aT }z^{-1}}=\dfrac{z}{z-e^{ -aT }}$ |
|    常数     |      $b^{t/T}$      |         $b^{k}$          | $\dfrac{T}{Ts-\ln b}$ |         $\dfrac{1}{1-bz^{-1}}=\dfrac{z}{z-b}$         |

$$\begin{align}
\mathscr{Z}[\delta(t)] & =\sum\limits_{k=0}^{\infty} \delta(kT)z^{-k}=1 \\
\mathscr{Z}(1) & = \sum\limits_{k=0}^{\infty} 1\cdot z^{-n}=  1+ z^{-1}+z^{-2}+\cdots =\dfrac{1}{1-z^{-1}} = \dfrac{z}{z-1} \;\quad \quad \quad \quad (q=z^{-1})\\
\mathscr{Z}[t] &  =\sum\limits_{k=0}^{\infty} (kT)z^{-k}=   0+Tz^{-1}+2Tz^{-2}+ \cdots =\dfrac{Tz^{-1}}{(1-z^{-1})^{2}}\\
 \mathscr{Z}[e^{-at}] & =\sum\limits_{k=0}^{\infty} e^{ -akT }z^{-k}= 1+e^{ -aT }z^{-1}+ e^{  -2aT}z^{-2}+\cdots =  \dfrac{1}{1-e^{ -aT }z^{-1}} \quad( q=e^{ -aT }z^{-1})\\
\mathscr{Z}[b^{t/T}] & =\sum\limits_{k=0}^{\infty} b^{k}z^{-k}=1 + bz^{-1}+b^{2}z^{-2}+\cdots = \dfrac{1}{1-bz^{-1}}\quad \quad\quad \quad \quad \quad  \quad( q=bz^{-1})
\end{align}$$

> [!important] 
> 实际上主要就是利用了[[常数项级数\|常数项级数]]中的等比级数，再通俗一点，就是高中的等比数列根据公比求和

### 四、z 变换的性质
#### 1. 线性定理
z 变换是一种[[线性变换\|线性变换]]，满足齐次性与均匀性：
$$\begin{align}
\mathscr{Z}[ae(t)]&=aE(z) \\
\mathscr{Z}[e_{1}(t)\pm e_{2}(t)]&=E_{1}(z)\pm E_{2}(z)
\end{align}$$

#### 2. 实数位移定理
**实数位移**：整个采样序列在时间轴上左右平移若干个采样序列（**左加右减**）
实数位移定理相当于[[拉普拉斯变换\|拉普拉斯变换]]的微分与积分定理，可将[[差分方程\|差分方程]]转换为 z 域的代数方程
- 向右平移为**滞后**：
$$\begin{align}
\mathscr{Z}[f(kT-mT)]&=z^{-m}F(z) \; {\color{red}\Rightarrow} \; \mathscr{Z}[f(k-m)]=z^{-m}F(z)
\end{align}$$

根据 $k-m=n \quad \quad n<0,f(t)=0 \quad \Rightarrow \quad f(nT)=0$，有：
$$\begin{align}
\mathscr{Z}[f(kT-mT)] & =\sum\limits_{k=0}^{\infty} f(kT-mT)z^{-k}  = \sum\limits_{n=-m}^{\infty} f(nT)z^{-(n+m)} \\
 & =z^{-m}\left(\sum\limits_{n=0}^{\infty}f(nT)z^{-n}+ \sum\limits_{n=-m}^{-1}f(nT)z^{-n}\right) \\
 & =z^{-m}F(z)
\end{align}$$


- 向左平移为**超前**：
$$\begin{align}
\mathscr{Z}[f(kT+mT)]&=z^{m}\left[F(z)-\sum\limits_{n=0}^{m-1}f(nT)z^{-n}\right]
\end{align}$$

令 $k+m=n$，得到：
$$\begin{align}
\mathscr{Z}[f(kT+mT)] & =\sum\limits_{k=0}^{\infty} f(kT+mT)z^{-k}  =\sum\limits_{n=m}^{\infty} f(nT)z^{-(n-m)} \\
 & = z^{m} \left(\sum\limits_{n=0}^{\infty} f(nT)z^{-n} -\sum\limits_{n=0}^{m-1}f(nT)z^{-n}\right) \\
 & = z^{m}\left( F(z)- \sum\limits_{n=0}^{m-1}f(nT)z^{-n} \right)
\end{align}$$
#### 3. 复数位移定理
$$\begin{align}
\mathscr{Z}[e^{ \mp at }e(t)]=E(ze^{ \pm aT })
\end{align}$$

#### 4. 极限定理
**初值定理**：
$$\begin{align}
e(0)= \lim\limits_{ n \to 0 } e(nT)= \lim\limits_{ z \to \infty } E(z) 
\end{align}$$

**终值定理**：
$$\begin{align}
e(\infty)=\lim\limits_{ n \to \infty } e(nT)=\lim\limits_{ z \to 1 } (z-1)E(z)
\end{align}$$

> [!important] 
> **注意终值定理的使用条件： 如果不稳定，不能直接使用**！！！

#### 5. 微分定理
$$\begin{align}
\mathscr{Z}[tf(t)]=-zT  \dfrac{\mathrm{d} F(z)}{\mathrm{d} z} 
\end{align}$$

#### 6. 卷积定理
[[卷积\|卷积]]
$$\begin{align}
x(nT)*y(nT)=\sum\limits_{k=0}^{\infty}x(kT)y\left[(n-k)T\right]
\end{align}$$

$$\begin{align}
g(nT)&=x(nT)*y(nT) \\
G(z)&=X(z)Y(z)
\end{align}$$

