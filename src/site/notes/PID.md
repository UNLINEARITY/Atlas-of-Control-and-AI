---
{"dg-publish":true,"dg-path":"A2- 控制理论/1. 经典控制理论/PID.md","tags":["Control"],"permalink":"/A2- 控制理论/1. 经典控制理论/PID/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-05-21T15:20:27.000+08:00","updated":"2025-06-30T16:12:29.000+08:00"}
---


(terminology::**Proportional-Integral-Derivative Controller**)    PID controller 
对误差信号 $e(t)$ 进行比例、积分和微分运算变换后形成的控制规律

### 一、PID 基础
> 在[[模拟式PID控制器\|模拟式PID控制器]]中有更详细的叙述
#### 比例 P 
$$\begin{align}
G_{c}(s)=K_{p}
\end{align}$$
输出与误差信号成比例，提高系统的开环增益，减小系统[[线性系统稳态误差计算\|稳态误差]]
#### 积分 I 
$$\begin{align}
G_{c}(s)= \dfrac{1}{T_{i}s}
\end{align}$$
输出与误差信号随时间的积分成比例积分的累积作用，**不单独使用**
- 提高系统型别，减小稳态误差
- 相角滞后，可能使系统不稳定
#### 微分 D 
$$\begin{align}
G_{c}(s)=T_{d}s
\end{align}$$
输出与误差信号的变化率成比例，对噪声敏感，一般**不单独使用**


### 二、常用控制器形式
#### PD 比例微分
实际上属于[[超前校正\|超前校正]]，增加开环零点，对高频信号的抑制能力减弱
$$\begin{align}
G_{c}(s)=K_{p}(1+T_{d}s)
\end{align}$$
#### PI 比例积分
实际上属于[[滞后校正\|滞后校正]]，PI 控制器相当于增加了一个位于原点的开环极点和一个负实开环零点 
- 开环极点可以提高型次，减小系统稳态误差 
- 开环零点可以改善缓和极点对系统稳定性及动态过程产生的不利影响 
改善中频段，提升截止频率，改善动态性能
$$\begin{align}
G_{c}(s)&=K_{p}(1+ \dfrac{1}{T_{i}s}) = \dfrac{K_{p}(s+\dfrac{1}{T_{i}})}{s}
\end{align}$$

### PID 比例积分微分
$$\begin{align}
G_{c}(s)&=K_{p}(1+ \dfrac{1}{T_{i}s}+ T_{d}s) 
\end{align}$$
一般不能单独使用 D（按偏差控制，系统不稳定）, I (误差累积)
- 数学模型已知及大多数数学模型难以确定的控制系统或过程 
- PID 控制参数整定方便，结构灵活 
- [[数字 PID 控制器\|数字 PID 控制器]] 控制越来越普及

