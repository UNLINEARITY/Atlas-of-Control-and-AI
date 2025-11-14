---
{"dg-publish":true,"dg-path":"A1- 数学/6. 数理统计/F分布.md","permalink":"/A1- 数学/6. 数理统计/F分布/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-05-31T14:17:01.000+08:00","updated":"2025-10-28T16:40:20.000+08:00"}
---

(terminology::**F-distribution**)  Fisher-Snedecor distribution $F\sim F(n_{1},n_{2})$


$X\sim \chi^{2}(n_{1})\quad Y\sim \chi^{2}(n_{2})$ 服从[卡方分布]]，则 F 分布定义为：
$$\begin{align}

F=\dfrac{X / n_{1}}{Y / n_{2}}\sim F(n_{1},n_{2})
\quad {\color{red}\Leftrightarrow} \quad
\dfrac{1}{F}=\dfrac{Y / n_{2}}{X / n_{1}}\sim F(n_{2},n_{1})

\end{align}$$

- $n_{1}$ 为第一自由度
- $n_{2}$ 为第二自由度




$F_{1-\alpha}(n_{1},n_{2})= \dfrac{1}{F_{\alpha}(n_{2},n_{1})}$

$$\begin{align}
 & P\left\{F>F_{\alpha}(n_{1},n_{2}) \right\}=\alpha  \\
 1-\alpha &=P\left\{F> F_{1-\alpha}(n_{1},n_{2}) \right\} \\
 &=P\left\{\dfrac{1}{F}< \dfrac{1}{F_{1-\alpha}(n_{1},n_{2})} \\
 \right\} \\
&=1-P\left\{\dfrac{1}{F}\geq \dfrac{1}{F_{1-\alpha}(n_{1},n_{2})} \right\} \\
\alpha &=P\left\{\dfrac{1}{F}\geq \dfrac{1}{F_{1-\alpha}(n_{1},n_{2})} \right\}
\end{align}$$


主要用于[[方差分析\|方差分析]]和[[线性回归\|回归分析]]中的转化表述/对立事件





