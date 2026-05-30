---
{"Level":3,"dg-publish":true,"dg-path":"A1- 数学/5. 泛函分析/内积空间与Hilbert空间/Hilbert空间.md","tags":["Mathematics","FunctionalAnalysis","HilbertSpace","BanachSpace"],"aliases":["Hilbert Space","希尔伯特空间"],"permalink":"/A1- 数学/5. 泛函分析/内积空间与Hilbert空间/Hilbert空间/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"Level":3,"tags":["Mathematics","FunctionalAnalysis","HilbertSpace","BanachSpace"],"aliases":["Hilbert Space","希尔伯特空间"]}}
---


(terminology::**Hilbert空间，Hilbert Space**) Hilbert空间是泛函分析中最重要的一类空间，它是有限维欧几里得空间在无穷维空间中的自然推广。Hilbert空间既是完备的赋范线性空间（Banach空间），又是内积空间，这种双重结构使得它成为量子力学、Fourier分析、偏微分方程等领域的数学基础。

## 一、定义与基本性质

### 1.1 Hilbert空间的定义

**定义**：[[内积\|内积]]空间 $(H, \langle \cdot, \cdot \rangle)$ 称为**Hilbert空间**，如果它是**完备的**，即每个Cauchy序列都收敛于 $H$ 中的元素。

$$
\text{Hilbert空间} = \text{内积空间} + \text{完备性}
$$

**形式化表述**：设 $\{x_n\}_{n=1}^{\infty}$ 是 $H$ 中的Cauchy序列（即 $\lim_{m,n \to \infty} \|x_m - x_n\| = 0$），则存在 $x \in H$ 使得：

$$
\lim_{n \to \infty} \|x_n - x\| = 0
$$

### 1.2 Hilbert空间与Banach空间的关系

**Banach空间**：完备的赋范线性空间

**Hilbert空间**：完备的内积空间

$$
\text{Hilbert空间} \subset \text{Banach空间}
$$

**关键区别**：
- Banach空间的范数不一定由内积导出
- Hilbert空间有**几何结构**（角度、正交性）
- 并非所有Banach空间都是Hilbert空间

**反例**：$L^p$ 空间（$p \neq 2$）是Banach空间但不是Hilbert空间。

### 1.3 平行四边形法则（Parallelogram Law）

**定理**：赋范线性空间 $(X, \|\cdot\|)$ 是内积空间的充要条件是范数满足平行四边形法则：

$$
\|x + y\|^2 + \|x - y\|^2 = 2(\|x\|^2 + \|y\|^2), \quad \forall x, y \in X
$$

**几何意义**：平行四边形两条对角线的长度平方和等于四条边长平方和的一半。

**应用**：验证一个Banach空间是否为Hilbert空间。

**例子**：
- $\ell^p$ 空间是Hilbert空间 $\iff p = 2$
- $L^p$ 空间是Hilbert空间 $\iff p = 2$

## 二、经典Hilbert空间

### 2.1 有限维Hilbert空间

**欧几里得空间** $\mathbb{R}^n$：
- 内积：$\langle x, y \rangle = \sum_{i=1}^{n} x_i y_i$
- 范数：$\|x\| = \sqrt{\sum_{i=1}^{n} x_i^2}$
- 完备性：$\mathbb{R}^n$ 是完备的

**酉空间** $\mathbb{C}^n$：
- 内积：$\langle x, y \rangle = \sum_{i=1}^{n} x_i \overline{y_i}$
- 范数：$\|x\| = \sqrt{\sum_{i=1}^{n} |x_i|^2}$
- 完备性：$\mathbb{C}^n$ 是完备的

**维数**：$\dim(\mathbb{R}^n) = n$，$\dim(\mathbb{C}^n) = n$

### 2.2 序列空间 $\ell^2$

**定义**：
$$
\ell^2 = \left\{x = (x_1, x_2, \ldots) : \sum_{n=1}^{\infty} |x_n|^2 < \infty\right\}
$$

**内积**：
$$
\langle x, y \rangle = \sum_{n=1}^{\infty} x_n \overline{y_n}
$$

**范数**：
$$
\|x\| = \sqrt{\sum_{n=1}^{\infty} |x_n|^2}
$$

**完备性**：$\ell^2$ 是完备的（Riesz-Fischer定理）

**标准正交基**：
$$
e_1 = (1, 0, 0, \ldots), \quad e_2 = (0, 1, 0, \ldots), \quad \ldots
$$

**可分性**：$\ell^2$ 是可分的（有可数稠密子集）

### 2.3 函数空间 $L^2(\Omega)$

**定义**：
$$
L^2(\Omega) = \left\{f: \Omega \to \mathbb{C} : \int_\Omega |f(x)|^2 dx < \infty\right\}
$$

其中 $\Omega \subset \mathbb{R}^n$ 是可测集。

**内积**：
$$
\langle f, g \rangle = \int_\Omega f(x) \overline{g(x)} dx
$$

**范数**：
$$
\|f\|_2 = \sqrt{\int_\Omega |f(x)|^2 dx}
$$

**完备性**：$L^2(\Omega)$ 是完备的（Riesz-Fischer定理）

**例子**：
- $L^2[a, b]$：区间 $[a, b]$ 上的平方可积函数
- $L^2(\mathbb{R})$：整个实轴上的平方可积函数
- $L^2([0, 2\pi])$：Fourier级数的自然空间

**Fourier基**：在 $L^2[-\pi, \pi]$ 中：
$$
\left\{\frac{e^{inx}}{\sqrt{2\pi}}\right\}_{n \in \mathbb{Z}}
$$

### 2.4 Sobolev空间 $H^1(\Omega)$

**定义**：
$$
H^1(\Omega) = \{f \in L^2(\Omega) : \nabla f \in L^2(\Omega)\}
$$

**内积**：
$$
\langle f, g \rangle_{H^1} = \int_\Omega f(x) \overline{g(x)} dx + \int_\Omega \nabla f(x) \cdot \overline{\nabla g(x)} dx
$$

**范数**：
$$
\|f\|_{H^1} = \sqrt{\int_\Omega |f(x)|^2 dx + \int_\Omega |\nabla f(x)|^2 dx}
$$

**完备性**：$H^1(\Omega)$ 是Hilbert空间

**应用**：偏微分方程的弱解

### 2.5 Hardy空间 $H^2(\mathbb{D})$

**定义**：单位圆盘 $\mathbb{D} = \{z \in \mathbb{C} : |z| < 1\}$ 上的解析函数空间：

$$
H^2(\mathbb{D}) = \left\{f(z) = \sum_{n=0}^{\infty} a_n z^n : \sum_{n=0}^{\infty} |a_n|^2 < \infty\right\}
$$

**内积**：
$$
\langle f, g \rangle = \sum_{n=0}^{\infty} a_n \overline{b_n}, \quad f(z) = \sum_{n=0}^{\infty} a_n z^n, \ g(z) = \sum_{n=0}^{\infty} b_n z^n
$$

**再生核**（Bergman核）：
$$
K(z, w) = \frac{1}{1 - \overline{w}z}
$$

满足**再生性质**：
$$
f(z) = \langle f, K(\cdot, z) \rangle
$$

## 三、Hilbert空间的基本定理

### 3.1 Riesz表示定理

**定理**：设 $H$ 是Hilbert空间。对每个**连续线性泛函** $f \in H^*$，存在**唯一**的 $y \in H$ 使得：

$$
f(x) = \langle x, y \rangle, \quad \forall x \in H
$$

且 $\|f\| = \|y\|$。

**证明思路**：
1. 若 $f = 0$，取 $y = 0$
2. 若 $f \neq 0$，令 $M = \ker f$，则 $M$ 是闭子空间
3. 取 $z \in M^\perp$ 且 $\|z\| = 1$，验证 $y = \overline{f(z)} z$ 满足条件
4. 唯一性由正交补的性质保证

**意义**：Hilbert空间的对偶空间**同构于自身**：

$$
H^* \cong H
$$

这是Hilbert空间最重要的特征之一。

**推广**（Lax-Milgram定理）：在偏微分方程中有重要应用。

### 3.2 投影定理

**定理**：设 $M$ 是Hilbert空间 $H$ 的**闭线性子空间**。对任意 $x \in H$，存在**唯一**的分解：

$$
x = u + v, \quad u \in M, \ v \in M^\perp
$$

其中 $M^\perp$ 是 $M$ 的[[正交性\|正交补]]。

**几何意义**：$u$ 是 $x$ 在 $M$ 上的**正交投影**，记作 $u = Px$。

**正交投影算子** $P: H \to M$ 的性质：
1. **线性性**：$P(\alpha x + \beta y) = \alpha Px + \beta Py$
2. **幂等性**：$P^2 = P$
3. **自伴性**：$\langle Px, y \rangle = \langle x, Py \rangle$
4. **范数**：$\|P\| = 1$（若 $M \neq \{0\}$）

**应用**：最小二乘法、信号处理、最优控制。

### 3.3 自伴算子的谱定理

**定义**：线性算子 $A: H \to H$ 称为**自伴的**（self-adjoint），如果：

$$
\langle Ax, y \rangle = \langle x, Ay \rangle, \quad \forall x, y \in H
$$

**谱定理**（有限维）：设 $A$ 是有限维Hilbert空间上的自伴算子，则存在**标准正交基** $\{e_1, \ldots, e_n\}$ 使得：

$$
A e_i = \lambda_i e_i, \quad i = 1, \ldots, n
$$

其中 $\lambda_i \in \mathbb{R}$ 是 $A$ 的特征值。

**谱定理**（无限维）：设 $A$ 是Hilbert空间 $H$ 上的**紧自伴算子**，则存在**标准正交基** $\{e_n\}_{n=1}^{\infty}$ 和实数 $\{\lambda_n\}_{n=1}^{\infty}$ 使得：

$$
A x = \sum_{n=1}^{\infty} \lambda_n \langle x, e_n \rangle e_n, \quad \forall x \in H
$$

**应用**：量子力学中的可观测量是自伴算子。

## 四、可分Hilbert空间

### 4.1 可分性的定义

**定义**：Hilbert空间 $H$ 称为**可分的**（separable），如果它包含一个**可数稠密子集**。

**等价刻画**：$H$ 有可数正交基。

**例子**：
- **可分**：$\ell^2$、$L^2(\Omega)$（$\Omega$ 可测）、Sobolev空间 $H^1$
- **不可分**：非可数Hilbert空间（很少在应用中出现）

### 4.2 同构定理

**定理**：所有**无限维可分Hilbert空间**都**等距同构**于 $\ell^2$：

$$
H \cong \ell^2
$$

**证明**：设 $\{e_n\}_{n=1}^{\infty}$ 是 $H$ 的可数正交基。定义映射：

$$
T: H \to \ell^2, \quad T x = (\langle x, e_1 \rangle, \langle x, e_2 \rangle, \ldots)
$$

由Parseval等式：
$$
\|Tx\|_{\ell^2}^2 = \sum_{n=1}^{\infty} |\langle x, e_n \rangle|^2 = \|x\|_H^2
$$

因此 $T$ 是等距同构。∎

**意义**：在结构上，只有一个无限维可分Hilbert空间！

## 五、弱收敛与弱拓扑

### 5.1 弱收敛的定义

**定义**：序列 $\{x_n\}_{n=1}^{\infty} \subset H$ **弱收敛**于 $x \in H$（记作 $x_n \rightharpoonup x$），如果：

$$
\lim_{n \to \infty} \langle x_n, y \rangle = \langle x, y \rangle, \quad \forall y \in H
$$

**强收敛**（通常意义下的收敛）：
$$
\lim_{n \to \infty} \|x_n - x\| = 0
$$

**关系**：强收敛 $\implies$ 弱收敛（逆命题不成立）

**例子**：在 $\ell^2$ 中，设 $e_n = (0, \ldots, 0, 1, 0, \ldots)$（第 $n$ 个位置为1）。则：
- $\|e_n\| = 1$，不强收敛于0
- 但 $e_n \rightharpoonup 0$（弱收敛）

### 5.2 弱紧性

**定理**（Banach-Alaoglu）：Hilbert空间的单位球在弱拓扑中是**紧的**。

**推论**（弱收敛定理）：有界序列必有弱收敛子序列。

## 六、应用

### 6.1 量子力学

**态空间**：量子系统的态由Hilbert空间 $H$ 中的**单位向量** $|\psi\rangle$ 表示（$\langle \psi|\psi \rangle = 1$）。

**可观测量**：物理量（位置、动量、能量）对应**自伴算子**。

**Schrödinger方程**：
$$
i\hbar \frac{\partial}{\partial t} |\psi(t)\rangle = H |\psi(t)\rangle
$$

其中 $H$ 是哈密顿算子（能量算子）。

**例子**：量子谐振子的态空间是 $L^2(\mathbb{R})$，能量本征态是Hermite函数。

### 6.2 偏微分方程

**弱解**：在Sobolev空间 $H^1$ 中定义偏微分方程的弱解。

**Lax-Milgram定理**：保证椭圆型偏微分方程弱解的存在性和唯一性。

**例子**：Poisson方程 $-\Delta u = f$ 在 $H^1_0$ 中的弱解。

### 6.3 Fourier分析

**Fourier级数**：在 $L^2[-\pi, \pi]$ 中：

$$
f(x) = \sum_{n=-\infty}^{\infty} c_n e^{inx}, \quad c_n = \frac{1}{2\pi} \int_{-\pi}^{\pi} f(x) e^{-inx} dx
$$

**Parseval等式**：
$$
\frac{1}{2\pi} \int_{-\pi}^{\pi} |f(x)|^2 dx = \sum_{n=-\infty}^{\infty} |c_n|^2
$$

**Fourier变换**：$L^2(\mathbb{R})$ 上的等距变换（Plancherel定理）。

### 6.4 信号处理

**能量有限信号**：$L^2(\mathbb{R})$ 中的函数

**正交变换**：Fourier变换、小波变换保持能量

**采样定理**：带限信号的完全重构

### 6.5 机器学习

**再生核Hilbert空间（RKHS）**：
- 核方法的理论基础
- 支持向量机（SVM）
- 高斯过程

**特征映射**：
$$
K(x, y) = \langle \phi(x), \phi(y) \rangle_H
$$

其中 $\phi: X \to H$ 将数据映射到Hilbert空间 $H$。

---

## 参考链接

- [[内积\|内积]]
- [[正交性\|正交性]]
- [[正交基\|正交基]]
- [[函数空间\|函数空间]]
- [[Riesz表示定理\|Riesz表示定理]]
- [[投影定理\|投影定理]]

## 参考文献

1. Rudin, W. (1991). *Functional Analysis* (2nd ed.). McGraw-Hill.
2. Reed, M., & Simon, B. (1980). *Functional Analysis* (Vol. 1). Academic Press.
3. Lax, P. D. (2002). *Functional Analysis*. Wiley-Interscience.
4. Kreyszig, E. (1978). *Introductory Functional Analysis with Applications*. Wiley.

---

## AI 结构化补充（2026-05-02）

(terminology::**Hilbert空间，Hilbert Space**) Hilbert空间是泛函分析中最重要的一类空间，它是有限维欧几里得空间在无穷维空间中的自然推广。Hilbert空间既是完备的赋范线性空间（Banach空间），又是内积空间，这种双重结构使得它成为量子力学、Fourier分析、偏微分方程等领域的数学基础。

### 一、定义与基本性质

#### 1.1 Hilbert空间的定义

**定义**：[[内积\|内积]]空间 $(H, \langle \cdot, \cdot \rangle)$ 称为**Hilbert空间**，如果它是**完备的**，即每个Cauchy序列都收敛于 $H$ 中的元素。

$$
\text{Hilbert空间} = \text{内积空间} + \text{完备性}
$$

**形式化表述**：设 $\{x_n\}_{n=1}^{\infty}$ 是 $H$ 中的Cauchy序列（即 $\lim_{m,n \to \infty} \|x_m - x_n\| = 0$），则存在 $x \in H$ 使得：

$$
\lim_{n \to \infty} \|x_n - x\| = 0
$$

#### 1.2 Hilbert空间与Banach空间的关系

**Banach空间**：完备的赋范线性空间

**Hilbert空间**：完备的内积空间

$$
\text{Hilbert空间} \subset \text{Banach空间}
$$

**关键区别**：
- Banach空间的范数不一定由内积导出
- Hilbert空间有**几何结构**（角度、正交性）
- 并非所有Banach空间都是Hilbert空间

**反例**：$L^p$ 空间（$p \neq 2$）是Banach空间但不是Hilbert空间。

#### 1.3 平行四边形法则（Parallelogram Law）

**定理**：赋范线性空间 $(X, \|\cdot\|)$ 是内积空间的充要条件是范数满足平行四边形法则：

$$
\|x + y\|^2 + \|x - y\|^2 = 2(\|x\|^2 + \|y\|^2), \quad \forall x, y \in X
$$

**几何意义**：平行四边形两条对角线的长度平方和等于四条边长平方和的一半。

**应用**：验证一个Banach空间是否为Hilbert空间。

**例子**：
- $\ell^p$ 空间是Hilbert空间 $\iff p = 2$
- $L^p$ 空间是Hilbert空间 $\iff p = 2$

### 二、经典Hilbert空间

#### 2.1 有限维Hilbert空间

**欧几里得空间** $\mathbb{R}^n$：
- 内积：$\langle x, y \rangle = \sum_{i=1}^{n} x_i y_i$
- 范数：$\|x\| = \sqrt{\sum_{i=1}^{n} x_i^2}$
- 完备性：$\mathbb{R}^n$ 是完备的

**酉空间** $\mathbb{C}^n$：
- 内积：$\langle x, y \rangle = \sum_{i=1}^{n} x_i \overline{y_i}$
- 范数：$\|x\| = \sqrt{\sum_{i=1}^{n} |x_i|^2}$
- 完备性：$\mathbb{C}^n$ 是完备的

**维数**：$\dim(\mathbb{R}^n) = n$，$\dim(\mathbb{C}^n) = n$

#### 2.2 序列空间 $\ell^2$

**定义**：
$$
\ell^2 = \left\{x = (x_1, x_2, \ldots) : \sum_{n=1}^{\infty} |x_n|^2 < \infty\right\}
$$

**内积**：
$$
\langle x, y \rangle = \sum_{n=1}^{\infty} x_n \overline{y_n}
$$

**范数**：
$$
\|x\| = \sqrt{\sum_{n=1}^{\infty} |x_n|^2}
$$

**完备性**：$\ell^2$ 是完备的（Riesz-Fischer定理）

**标准正交基**：
$$
e_1 = (1, 0, 0, \ldots), \quad e_2 = (0, 1, 0, \ldots), \quad \ldots
$$

**可分性**：$\ell^2$ 是可分的（有可数稠密子集）

#### 2.3 函数空间 $L^2(\Omega)$

**定义**：
$$
L^2(\Omega) = \left\{f: \Omega \to \mathbb{C} : \int_\Omega |f(x)|^2 dx < \infty\right\}
$$

其中 $\Omega \subset \mathbb{R}^n$ 是可测集。

**内积**：
$$
\langle f, g \rangle = \int_\Omega f(x) \overline{g(x)} dx
$$

**范数**：
$$
\|f\|_2 = \sqrt{\int_\Omega |f(x)|^2 dx}
$$

**完备性**：$L^2(\Omega)$ 是完备的（Riesz-Fischer定理）

**例子**：
- $L^2[a, b]$：区间 $[a, b]$ 上的平方可积函数
- $L^2(\mathbb{R})$：整个实轴上的平方可积函数
- $L^2([0, 2\pi])$：Fourier级数的自然空间

**Fourier基**：在 $L^2[-\pi, \pi]$ 中：
$$
\left\{\frac{e^{inx}}{\sqrt{2\pi}}\right\}_{n \in \mathbb{Z}}
$$

#### 2.3.1 $\ell^2$ 与 $L^2$ 的 Fourier 对应

Hilbert空间把“有限长度”作为进入空间的边界。无限列向量属于 $\ell^2$ 当且仅当
$$
\|v\|_{\ell^2}^2=\sum_{j=1}^{\infty}|v_j|^2<\infty.
$$
例如
$$
v=\left(1,\frac12,\frac14,\dots\right)
$$
满足
$$
\|v\|^2=1+\frac14+\frac1{16}+\cdots=\frac43,
$$
所以 $v\in\ell^2$；而 $(1,1,1,\dots)$ 长度无限，不属于 $\ell^2$。函数空间中的对应条件是平方可积：
$$
\|f\|_{L^2[0,2\pi]}^2=\int_0^{2\pi}|f(x)|^2\,dx<\infty.
$$
例如
$$
\|\sin x\|^2=\int_0^{2\pi}\sin^2x\,dx=\pi.
$$

同一个有限长度边界也排除形式上的 delta 尖峰。周期三角和
$$
\frac12+\cos x+\cos 2x+\cos 3x+\cdots
$$
在 $x=0$ 处叠成高度无穷的尖峰，在其他点按分布意义抵消；它可看作 $\pi\delta(x)$ 的周期版本。归一化的 $\delta$ 满足 $\int\delta(x)\,dx=1$，但
$$
\int\delta(x)^2\,dx=\infty,
$$
也常简写为 $\int\delta^2=\infty$。所以 $\delta$ 不是 $L^2$ 函数，也不作为向量属于这个 Hilbert 空间。

Fourier级数给出 $L^2$ 与 $\ell^2$ 的坐标化桥梁。若
$$
f(x)=a_0+\sum_{k=1}^{\infty}\bigl(a_k\cos kx+b_k\sin kx\bigr),
$$
则正交性给出
$$
\|f\|_{L^2}^2=2\pi a_0^2+\pi\sum_{k=1}^{\infty}(a_k^2+b_k^2).
$$
换成标准正交基后，映射
$$
f\longmapsto (A_0,A_1,B_1,A_2,B_2,\dots)
$$
保持长度，因此可以把函数的几何问题转化为 $\ell^2$ 中系数列的几何问题。

这个对应首先是 Hilbert 空间范数意义下的对应。它保证最佳平方误差逼近和能量守恒，但不自动保证每一点都逐点收敛；有跳跃时，典型 Fourier 级数在跳跃点收敛到左右极限的平均值。

#### 2.4 Sobolev空间 $H^1(\Omega)$

**定义**：
$$
H^1(\Omega) = \{f \in L^2(\Omega) : \nabla f \in L^2(\Omega)\}
$$

**内积**：
$$
\langle f, g \rangle_{H^1} = \int_\Omega f(x) \overline{g(x)} dx + \int_\Omega \nabla f(x) \cdot \overline{\nabla g(x)} dx
$$

**范数**：
$$
\|f\|_{H^1} = \sqrt{\int_\Omega |f(x)|^2 dx + \int_\Omega |\nabla f(x)|^2 dx}
$$

**完备性**：$H^1(\Omega)$ 是Hilbert空间

**应用**：偏微分方程的弱解

#### 2.5 Hardy空间 $H^2(\mathbb{D})$

**定义**：单位圆盘 $\mathbb{D} = \{z \in \mathbb{C} : |z| < 1\}$ 上的解析函数空间：

$$
H^2(\mathbb{D}) = \left\{f(z) = \sum_{n=0}^{\infty} a_n z^n : \sum_{n=0}^{\infty} |a_n|^2 < \infty\right\}
$$

**内积**：
$$
\langle f, g \rangle = \sum_{n=0}^{\infty} a_n \overline{b_n}, \quad f(z) = \sum_{n=0}^{\infty} a_n z^n, \ g(z) = \sum_{n=0}^{\infty} b_n z^n
$$

**再生核**（Bergman核）：
$$
K(z, w) = \frac{1}{1 - \overline{w}z}
$$

满足**再生性质**：
$$
f(z) = \langle f, K(\cdot, z) \rangle
$$

### 三、Hilbert空间的基本定理

#### 3.1 Riesz表示定理

**定理**：设 $H$ 是Hilbert空间。对每个**连续线性泛函** $f \in H^*$，存在**唯一**的 $y \in H$ 使得：

$$
f(x) = \langle x, y \rangle, \quad \forall x \in H
$$

且 $\|f\| = \|y\|$。

**证明思路**：
1. 若 $f = 0$，取 $y = 0$
2. 若 $f \neq 0$，令 $M = \ker f$，则 $M$ 是闭子空间
3. 取 $z \in M^\perp$ 且 $\|z\| = 1$，验证 $y = \overline{f(z)} z$ 满足条件
4. 唯一性由正交补的性质保证

**意义**：Hilbert空间的对偶空间**同构于自身**：

$$
H^* \cong H
$$

这是Hilbert空间最重要的特征之一。

**推广**（Lax-Milgram定理）：在偏微分方程中有重要应用。

#### 3.2 投影定理

**定理**：设 $M$ 是Hilbert空间 $H$ 的**闭线性子空间**。对任意 $x \in H$，存在**唯一**的分解：

$$
x = u + v, \quad u \in M, \ v \in M^\perp
$$

其中 $M^\perp$ 是 $M$ 的[[正交性\|正交补]]。

**几何意义**：$u$ 是 $x$ 在 $M$ 上的**正交投影**，记作 $u = Px$。

**正交投影算子** $P: H \to M$ 的性质：
1. **线性性**：$P(\alpha x + \beta y) = \alpha Px + \beta Py$
2. **幂等性**：$P^2 = P$
3. **自伴性**：$\langle Px, y \rangle = \langle x, Py \rangle$
4. **范数**：$\|P\| = 1$（若 $M \neq \{0\}$）

**应用**：最小二乘法、信号处理、最优控制。

#### 3.3 自伴算子的谱定理

**定义**：线性算子 $A: H \to H$ 称为**自伴的**（self-adjoint），如果：

$$
\langle Ax, y \rangle = \langle x, Ay \rangle, \quad \forall x, y \in H
$$

**谱定理**（有限维）：设 $A$ 是有限维Hilbert空间上的自伴算子，则存在**标准正交基** $\{e_1, \ldots, e_n\}$ 使得：

$$
A e_i = \lambda_i e_i, \quad i = 1, \ldots, n
$$

其中 $\lambda_i \in \mathbb{R}$ 是 $A$ 的特征值。

**谱定理**（无限维）：设 $A$ 是Hilbert空间 $H$ 上的**紧自伴算子**，则存在**标准正交基** $\{e_n\}_{n=1}^{\infty}$ 和实数 $\{\lambda_n\}_{n=1}^{\infty}$ 使得：

$$
A x = \sum_{n=1}^{\infty} \lambda_n \langle x, e_n \rangle e_n, \quad \forall x \in H
$$

**应用**：量子力学中的可观测量是自伴算子。

### 四、可分Hilbert空间

#### 4.1 可分性的定义

**定义**：Hilbert空间 $H$ 称为**可分的**（separable），如果它包含一个**可数稠密子集**。

**等价刻画**：$H$ 有可数正交基。

**例子**：
- **可分**：$\ell^2$、$L^2(\Omega)$（$\Omega$ 可测）、Sobolev空间 $H^1$
- **不可分**：非可数Hilbert空间（很少在应用中出现）

#### 4.2 同构定理

**定理**：所有**无限维可分Hilbert空间**都**等距同构**于 $\ell^2$：

$$
H \cong \ell^2
$$

**证明**：设 $\{e_n\}_{n=1}^{\infty}$ 是 $H$ 的可数正交基。定义映射：

$$
T: H \to \ell^2, \quad T x = (\langle x, e_1 \rangle, \langle x, e_2 \rangle, \ldots)
$$

由Parseval等式：
$$
\|Tx\|_{\ell^2}^2 = \sum_{n=1}^{\infty} |\langle x, e_n \rangle|^2 = \|x\|_H^2
$$

因此 $T$ 是等距同构。∎

**意义**：在结构上，只有一个无限维可分Hilbert空间！

### 五、弱收敛与弱拓扑

#### 5.1 弱收敛的定义

**定义**：序列 $\{x_n\}_{n=1}^{\infty} \subset H$ **弱收敛**于 $x \in H$（记作 $x_n \rightharpoonup x$），如果：

$$
\lim_{n \to \infty} \langle x_n, y \rangle = \langle x, y \rangle, \quad \forall y \in H
$$

**强收敛**（通常意义下的收敛）：
$$
\lim_{n \to \infty} \|x_n - x\| = 0
$$

**关系**：强收敛 $\implies$ 弱收敛（逆命题不成立）

**例子**：在 $\ell^2$ 中，设 $e_n = (0, \ldots, 0, 1, 0, \ldots)$（第 $n$ 个位置为1）。则：
- $\|e_n\| = 1$，不强收敛于0
- 但 $e_n \rightharpoonup 0$（弱收敛）

#### 5.2 弱紧性

**定理**（Banach-Alaoglu）：Hilbert空间的单位球在弱拓扑中是**紧的**。

**推论**（弱收敛定理）：有界序列必有弱收敛子序列。

### 六、应用

#### 6.1 量子力学

**态空间**：量子系统的态由Hilbert空间 $H$ 中的**单位向量** $|\psi\rangle$ 表示（$\langle \psi|\psi \rangle = 1$）。

**可观测量**：物理量（位置、动量、能量）对应**自伴算子**。

**Schrödinger方程**：
$$
i\hbar \frac{\partial}{\partial t} |\psi(t)\rangle = H |\psi(t)\rangle
$$

其中 $H$ 是哈密顿算子（能量算子）。

**例子**：量子谐振子的态空间是 $L^2(\mathbb{R})$，能量本征态是Hermite函数。

#### 6.2 偏微分方程

**弱解**：在Sobolev空间 $H^1$ 中定义偏微分方程的弱解。

**Lax-Milgram定理**：保证椭圆型偏微分方程弱解的存在性和唯一性。

**例子**：Poisson方程 $-\Delta u = f$ 在 $H^1_0$ 中的弱解。

#### 6.3 Fourier分析

**Fourier级数**：在 $L^2[-\pi, \pi]$ 中：

$$
f(x) = \sum_{n=-\infty}^{\infty} c_n e^{inx}, \quad c_n = \frac{1}{2\pi} \int_{-\pi}^{\pi} f(x) e^{-inx} dx
$$

**Parseval等式**：
$$
\frac{1}{2\pi} \int_{-\pi}^{\pi} |f(x)|^2 dx = \sum_{n=-\infty}^{\infty} |c_n|^2
$$

**Fourier变换**：$L^2(\mathbb{R})$ 上的等距变换（Plancherel定理）。

#### 6.4 信号处理

**能量有限信号**：$L^2(\mathbb{R})$ 中的函数

**正交变换**：Fourier变换、小波变换保持能量

**采样定理**：带限信号的完全重构

#### 6.5 机器学习

**再生核Hilbert空间（RKHS）**：
- 核方法的理论基础
- 支持向量机（SVM）
- 高斯过程

**特征映射**：
$$
K(x, y) = \langle \phi(x), \phi(y) \rangle_H
$$

其中 $\phi: X \to H$ 将数据映射到Hilbert空间 $H$。

---

### 参考链接

- [[内积\|内积]]
- [[正交性\|正交性]]
- [[正交基\|正交基]]
- [[函数空间\|函数空间]]
- [[Riesz表示定理\|Riesz表示定理]]
- [[投影定理\|投影定理]]

### 参考文献

1. Rudin, W. (1991). *Functional Analysis* (2nd ed.). McGraw-Hill.
2. Reed, M., & Simon, B. (1980). *Functional Analysis* (Vol. 1). Academic Press.
3. Lax, P. D. (2002). *Functional Analysis*. Wiley-Interscience.
4. Kreyszig, E. (1978). *Introductory Functional Analysis with Applications*. Wiley.

### 正交基与投影坐标

判断一组基是否适合计算，关键要看内积矩阵。若基向量组成矩阵 $B$，并且
$$
B^*B=I,
$$
则这组基正交归一，坐标长度和几何长度一致；若使用幂基 $1,x,x^2,\ldots$，相关的 Gram 矩阵可能形成条件数很大的 Hilbert 矩阵，计算会极不稳定。

函数空间中的 Fourier 基、Legendre 多项式和 Chebyshev 多项式都在追求更好的正交结构。Fourier 系数可写成投影公式的函数版本：
$$
\text{coefficient along }g=\frac{\langle f,g\rangle}{\langle g,g\rangle}.
$$
这正是 Hilbert 空间中“用内积做投影”的核心思想，也是 PCA、最小二乘和正交展开共享的几何基础。
