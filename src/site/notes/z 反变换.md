---
{"dg-publish":true,"dg-path":"A1- 数学/8. 变换/z 反变换.md","permalink":"/A1- 数学/8. 变换/z 反变换/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-10-08T17:05:15.000+08:00","updated":"2025-04-23T17:44:02.000+08:00"}
---


(terminology::**Inverse Z-transform**)
采样信号 $e^{*}(t)$ 的 [[z 变换\|z 变换]] 为：$E(z)=\mathscr{Z}[e^{*}(t)]$
则 z 反变换可以记为 $e^{*}(t)=\mathscr{Z}^{-1}[E(z)]=\sum\limits_{n=0}^{\infty}e(nT)\delta(t-nT)$

### 一、幂级数展开法
长除法得到[[洛朗级数\|洛朗级数]]

$$\begin{align}
F(z)=\dfrac{b_{0}z^{m}+b_{1}z^{m-1}+\cdots + b_{m}}{a_{0}z^{n}+a_{1}z^{n-1}+\cdots + a_{n}}=c_{0}+c_{1}z^{-1}+c_{2}z^{-2}+\cdots 
\end{align}$$

$$\begin{align}
f^{*}(t)=c_{0}+c_{1}\delta(t-T)+c_{2} \delta(t-2T)+\cdots 
\end{align}$$

### 二、部分分式法
1.  [[z 变换#三、常见函数的 z 变换\|经典信号的 z 变换]]大多带有因子 $z$  ，先除以 $z$  分解为部分分式
2. 利用[[留数\|留数]]求出部分分式的系数 $c_{i}$
3. 再乘以 $z$，分别求各个部分的 $z$ 反变换：
$$\begin{align}
\dfrac{F(z)}{z} =\sum\limits_{i=1}^{n} \dfrac{c_{i}}{z-p_{i}} \quad  \Leftrightarrow \quad F(z)=\sum\limits_{i=1}^{n} \dfrac{c_{i}z}{z-p_{i}} 
\end{align}$$

$$\begin{align}
f(kT)=\mathscr{Z}^{-1}  \left[  F(z) \right] \quad f^{*}(t)=\sum\limits_{k=0}^{\infty} f(kT)\delta (t-kT)
\end{align}$$


$$\begin{align}
\mathscr{Z}^{-1}[\dfrac{ 1-az^{-1}}{z^{-1}-a}] & =\mathscr{Z}^{-1}[  -\dfrac{a(z^{-1}- \dfrac{1}{a}+a-a)}{z^{-1}-a} ]=\mathscr{Z}^{-1}[-a+\dfrac{1-a^{2}}{-a(1-\dfrac{1}{a}z^{-1})}] \\
 & =-a\delta(k)+(a-\dfrac{1}{a}) (\dfrac{1}{a})^{k}\cdot1(k)
\end{align}$$


