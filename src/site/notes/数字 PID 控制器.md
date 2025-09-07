---
{"tags":["Discrete","Practical","Control"],"dg-publish":true,"dg-path":"A2- 控制理论/3. 计算机控制系统/3.2 数字 PID 控制器.md","permalink":"/A2- 控制理论/3. 计算机控制系统/3.2 数字 PID 控制器/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-03-10T10:07:21.000+08:00","updated":"2025-09-01T10:07:34.000+08:00"}
---


(terminology::**Discrete-time  PID Controller**)  离散 PID 控制器 

[[模拟式PID控制器\|模拟式PID控制器]]的离散化，得到[[数字控制器\|数字控制器]]

### 一、数字 PID 算法
已知连续时间的 PID 控制，拉普拉斯变换得到：


$$\begin{align}
u(t)=K_{p}\left[e(t)+ \dfrac{1}{T_{i}} \int _{0}^{t} e(\tau)\, d\tau +T_{d}\dfrac{\mathrm{d} e(t)}{\mathrm{d} t}  \right] \quad {\color{red}\Leftrightarrow} \quad D(s)=\dfrac{U(s)}{E(s)}= K_{p}(1+\dfrac{1}{T_{i}s}+T_{d}s)
\end{align}$$

$$\begin{align}
\begin{cases}
 & u(t) \approx u(k) \\
 & e(t)\approx e(k) \\
 & \int _{0}^{t} e{ (\tau )}\, d\tau  \approx \sum\limits_{j=0}^{k}e(j)T \\ 
 & \dfrac{\mathrm{d} e(t)}{\mathrm{d} t} \approx \dfrac{e(k)-e(k-1)}{T}
\end{cases}
\end{align}$$

#### 1.  位置式 PID 算法
$$\begin{align}
u(k)=K_{p}e(k)+K_{i} \sum\limits_{j=0}^{k} e(j)+K_{d}\left[e(k)-e(k-1)\right]
\end{align}$$

- 稳态精度高，直观易于理解
- 计算量大，容易出现积分饱和

#### 2. 增量式 PID 算法
$$\begin{align}
\Delta u & =u(k)-u(k-1) \\
 & =K_{p}\left[e(k)-e(k-1)\right]+K_{i}e(k)+K_{d}\left[e(k)-2e(k-1)+e(k-2)\right] \\
 & =(K_{p}+K_{i}+K_{d})e(k)-(K_{p}+2K_{d})e(k-1)+K_{d}e(k-2)
\end{align}$$
- 节约内存和计算时间；控制量冲击小，能平滑过渡
- 无积分环节积累，可能存在一定误差


#### 3. 一般 PID 算法的离散化
一般常用[[模拟控制器离散化#二、差分变换法\|模拟控制器离散化#二、差分变换法]] ，用后向差分，或双线性差分，并写为控制器的形式


### 二、改进的数字 PID 算法

![改进PID.png](../img/user/Functional%20files/Photo%20Resources/%E6%94%B9%E8%BF%9BPID.png)

#### 1.  积分分离算法
在系统误差较大时，取消积分作用；当误差减小到一定值时，再重新积分。$e_{0}$ 为积分分离阈值

$\left\lvert  e(k) \right\rvert\leq e_{0}$ 采用 PID 控制，保证稳态误差为 0
$\left\lvert  e(k) \right\rvert> e_{0}$   采用 PD 控制，大幅度减小超调量

$$\begin{align}
u(k)=K_{p}\left[e(k)+\dfrac{T}{T_{i}} {\color{red}\sum\limits_{i=0}^{k} e(i)}+ \dfrac{T_{d}}{T} \left(e(k)-e(k-1)\right)\right]
\end{align}$$
$$\sum\limits_{i=0}^{k} e(i)=\begin{cases}
\sum\limits_{i=0}^{k} e(i)\quad  \left\lvert  e(k) \right\rvert\leq e_{0} \\ \\
\sum\limits_{i=0}^{k-1} e(i)\quad  \left\lvert  e(k) \right\rvert> e_{0} 
\end{cases}$$
#### 2. 抗饱和积分算法
输出限幅，输出超限时不积分
$$\sum\limits_{i=0}^{k} e(i)=\begin{cases}
\sum\limits_{i=0}^{k} e(i)\quad  u_{min}\leq u(k) \leq u_{max}\\ \\
\sum\limits_{i=0}^{k-1} e(i)\quad  u_{min}> u(k) \; \text{or}\; u(k)> u_{max}
\end{cases}$$

#### 3. 遇限削弱算法
$$\sum\limits_{i=0}^{k} e(i)=\begin{cases}
\sum\limits_{i=0}^{k} e(i)\quad \begin{cases}
\left\lvert  u(k) \right\rvert \leq u_{0} \\ \\
u(k) > u_{0} \; \text{and}  \;e(k)<0  \\ \\
u(k)< u_{0} \; \text{and}  \;e(k)>0 
\end{cases}\\ \\
\sum\limits_{i=0}^{k-1} e(i) \quad \begin{cases}
 u(k) > u_{0} \; \text{and}  \;e(k)>0 \\
 \\
 u(k)< u_{0} \; \text{and}  \;e(k)<0
\end{cases} \\
\end{cases}$$

#### 4. 不完全微分
纯微分环节对噪声很敏感，可以串接一个惯性环节来抑制高频影响
$$\begin{align}
G_{f}= \dfrac{1}{T_{f}s+1}=\dfrac{U(s)}{U_{1}(s)}\; {\color{red}\Rightarrow} \; T_{f} \dfrac{\mathrm{d} u(t)}{\mathrm{d} t} +u(t)=u_{1}(t)\; {\color{red}\Rightarrow} \; T_{f} \dfrac{u(k)-u(k-1)}{T}+u(k)=u_{1}(k)
\end{align}$$
$$\begin{align}
u(k)= \dfrac{T_{f}}{T_{f}+T} u(k-1)+\dfrac{T}{T_{f}+T} u_{1}(k)
\end{align}$$

#### 5. 微分先行
![微分先行.png](../img/user/Functional%20files/Photo%20Resources/%E5%BE%AE%E5%88%86%E5%85%88%E8%A1%8C.png)

- **输出量微分：只对输出量进行微分**，避免因给定值变化给控制系统带来超调量过大、调节阀动作剧烈的冲击
- **偏差量微分：对给定值和输出量均微分**




#### 6. 带死区的 PID 
$$\sum\limits_{i=0}^{k} e(i)=\begin{cases}
\sum\limits_{i=0}^{k} e(i)\quad  \left\lvert  e(k) \right\rvert > e_{0} \\ \\
\sum\limits_{i=0}^{k-1} e(i)\quad  \left\lvert  e(k) \right\rvert\leq e_{0} 
\end{cases}$$

