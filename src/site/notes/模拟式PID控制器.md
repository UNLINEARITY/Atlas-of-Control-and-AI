---
{"dg-publish":true,"dg-path":"A4- 过程控制系统/调节器与执行器/模拟式PID控制器.md","permalink":"/A4- 过程控制系统/调节器与执行器/模拟式PID控制器/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-10-06T11:27:23.000+08:00","updated":"2025-05-14T00:36:52.450+08:00"}
---


理论基础：[[PID\|PID]]
实际实现：[[基型控制器#二、PID 电路构成\|基型控制器#二、PID 电路构成]]

### 基本概述
**偏差 = 测量值 - 给定值**     $\varepsilon=x_{i}-x_{S}$  ，$\varepsilon>0$ 为正偏差，$\varepsilon<0$ 为负偏差

**输出信号变化量**    $\Delta y$ ，$\varepsilon>0\to \Delta y>0$ 为正作用控制器，$\varepsilon<0\to \Delta y>0$ 为反作用控制器

$$\begin{align}
W(s)=K_{p}(1+ \dfrac{1}{T_{i}s}+ T_{d}s)
\end{align}$$

$$\begin{align}
W(s)= K_{P}F  \dfrac{1+ \dfrac{1}{FT_{I}s}+\dfrac{T_{D}}{F}s}{1+ \dfrac{1}{K_{I}T_{I}s}+ \dfrac{T_{D}}{K_{D}s}}
\end{align}$$
控制器之间的干扰系数：  $F= 1+\alpha\dfrac{ T_{D}}{T_{I}}$

### 一、P 运算规律
$$\begin{align}
\Delta y= K_{P} \varepsilon\; \Rightarrow \; W(s)=K_{P}
\end{align}$$
==比例度== $\delta$ 表示比例作用的强弱：比例度越小，比例作用越强。
$$\begin{align}
\delta = \dfrac{\dfrac{\varepsilon}{\varepsilon_{max}-\varepsilon_{min}}}{\dfrac{\Delta y}{y_{max}-y_{min}}}\times 100 \% = \dfrac{1}{K_{P}} \times 100 \%
\end{align}$$

单独的比例作用一定会存在余差，比例作用 $K_{P}$ 越大，**余差越小**（静态）。（**但是比例作用增大，稳定性变差**，容易产生振荡）动态响应加快（动态）

### 二、PI 运算规律 
积分作用可以**消除余差**：只要偏差存在，积分作用输出就会随时间不断变化直到偏差消除。（静态）
但是积分输出是随时间累计改变的，控制动作缓慢，可能造成控制不及时，**使得稳定裕度下降**。（动态）

#### 2.1 理想 PI 控制器
$$\begin{align}
\Delta y & =K_{P}\left( \varepsilon +  \dfrac{1}{T_{I}}\int_{0}^{t}  \varepsilon \, dt  \right) \quad \; W(s)=K_{P}\left(1+ \dfrac{1}{T_{I}s}\right)
\end{align}$$
==积分时间== $T_{I}$ : 在阶跃信号作用下，积分作用的输出值变化等于比例作用的输出值所经历的时间。
**积分时间越短，积分速度越快、积分作用越强**。 

#### 2.2 实际 PI 控制器
$$\begin{align}
W(s)= K_{P} \dfrac{1+ \dfrac{1}{T_{I}s}}{1+ \dfrac{1}{K_{I}T_{I}s}}\quad  \Delta y=K_{P}\varepsilon \left[1+( K_{I}-1)(1-e^{ -\frac{t}{K_{I}T_{I}}  } )\right]  
\end{align}$$

积分增益 $K_{I}= \dfrac{\Delta y(\infty)}{\Delta y(0)}$  表示阶跃信号作用下，PI 控制器输出变化的最终值与比例输出值之比
- ==控制点偏差==：$\varepsilon_{max}= \dfrac{y_{max}-y_{min}}{K_{P}K_{I}}$  PI 控制器不可能完全消除余差
- ==控制精度==: $\Delta= \dfrac{\varepsilon_{max}}{x_{max}-x_{min}}\times 100\%= \dfrac{1}{K_PK_{I}}\times 100\%$  控制点最大偏差的相对变化值
>控制精度**表征消除余差的能力**，$K_{I}$ 或 $K_{I}K_{P}$ 越大，控制精度越高，消除余差的能力越大。
>不能完全消除余差：因为积分增益为有限值。

### 三、PD 运算规律
微分作用按偏差变化速度进行控制，只要有变化趋势，就有控制作用输出。
超前控制，**可以改善控制过程的动态特性**。噪声过大的系统不宜单独使用。

**主要是加快系统响应、改善系统稳定性，对噪声敏感，一般不用**
#### 3.1 理想 PD 控制器
$$\begin{align}
\Delta y=K_{P}(\varepsilon+T_{D} \dfrac{\mathrm{d} \varepsilon}{\mathrm{d} t}  )\quad \;W(s)=K_{P}(1+T_{D}s)
\end{align}$$
==微分时间== $T_{D}$： 达到相同的输出值 $\Delta y$ 时，微分作用比比例作用**提前的时间**。
**微分时间越长，微分作用越强**。（过大可能引起高频振荡）

#### 3.2 实际 PD 控制器
$$\begin{align}
W(s)= K_{P}(s)  \dfrac{1+T_{D}s}{1+ \dfrac{T_{D}}{K_{D}}s}\quad  \Delta y=K_{P}\varepsilon \left[1+(K_{D}-1)e^{  -\frac{K_{D}}{T_{D}}t }\right] 
\end{align}$$
==微分增益==：$K_{D}=\dfrac{\Delta y(0)}{\Delta y(\infty)}$  阶跃信号作用下，PD 控制器输出变化的初始值与最终值的比。
微分增益越大，微分作用越理想。

（阶跃信号作用下，实际 PD 控制器的输出从最大值下降到微分输出幅度的 36.8%所经历的时间为微分时间常数 $\dfrac{T_{D}}{K_{D}}$，再乘以微分增益，就得到微分时间）

### 四、PID 运算规律

![Pasted image 20241031161544.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020241031161544.png)
#### PID 控制器的构成
1. **放大器和 PID 反馈电路**：运算电路简单，相互干扰系数大
2. **PD 和 PI 电路串联**：相互干扰系数较小，各级串联使得累计误差较大，精度要求较高
3. **P、I、D 电路并联**：避免级间误差累计增大，实际参数发生改变
4. **PI 与 D 并联后再与 P 串联**：避免级间误差累计增大，不存在变量相互影响
注意明确调节 PID参数时，参数的实际意义：比例/积分/微分增益还是比例度、积分时间、微分时间

