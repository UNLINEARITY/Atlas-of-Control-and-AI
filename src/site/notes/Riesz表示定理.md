---
{"Level":3,"dg-publish":true,"dg-path":"A1- 数学/5. 泛函分析/内积空间与Hilbert空间/Riesz表示定理.md","tags":["Mathematics","FunctionalAnalysis","RieszRepresentationTheorem","HilbertSpace"],"aliases":["Riesz Representation Theorem","Riesz表示定理"],"permalink":"/A1- 数学/5. 泛函分析/内积空间与Hilbert空间/Riesz表示定理/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"Level":3,"tags":["Mathematics","FunctionalAnalysis","RieszRepresentationTheorem","HilbertSpace"],"aliases":["Riesz Representation Theorem","Riesz表示定理"]}}
---


(terminology::**Riesz表示定理，Riesz Representation Theorem**) Riesz表示定理是Hilbert空间理论中最深刻的定理之一，它建立了Hilbert空间与其对偶空间之间的同构关系。这个定理不仅在泛函分析中有基本重要性，还在量子力学、偏微分方程、信号处理等领域有广泛应用。

## 一、问题的背景

### 1.1 对偶空间的概念

**定义**：赋范线性空间 $X$ 的**对偶空间** $X^*$ 是所有**连续线性泛函**的集合：

$$
X^* = \{f: X \to \mathbb{C} : f \text{ 是连续线性的}\}
$$

**范数**：对 $f \in X^*$，定义：
$$
\|f\| = \sup_{\|x\| \leq 1} |f(x)| = \sup_{\|x\| = 1} |f(x)|
$$

**例子**：
- 在 $\mathbb{R}^n$ 中，每个线性泛函形式为 $f(x) = \sum_{i=1}^{n} a_i x_i$
- 在 $C[a, b]$ 中，$I(f) = \int_a^b f(x) dx$ 是连续线性泛函

### 1.2 核心问题

**问题**：给定Hilbert空间 $H$，如何描述其**所有**连续线性泛函？

在有限维空间 $\mathbb{R}^n$ 中：
- 每个线性泛函 $f: \mathbb{R}^n \to \mathbb{R}$ 形式为 $f(x) = \langle x, y \rangle$
- 其中 $y = (f(e_1), \ldots, f(e_n))$，$\{e_i\}$ 是标准基

Riesz表示定理告诉我们：**这在无穷维Hilbert空间中也成立！**

## 二、Riesz表示定理的陈述

### 2.1 定理陈述

**定理**（Riesz表示定理）：设 $H$ 是Hilbert空间。对每个连续线性泛函 $f \in H^*$，存在**唯一**的 $y \in H$ 使得：

$$
f(x) = \langle x, y \rangle, \quad \forall x \in H
$$

且满足：
$$
\|f\| = \|y\|
$$

**几何意义**：每个连续线性泛函都是**"取内积"**运算。

**符号**：常用记号 $f = \langle \cdot, y \rangle$ 表示泛函 $f$。

### 2.2 证明

**证明**（存在性）：

**步骤1**：若 $f = 0$（零泛函），取 $y = 0$，则 $\langle x, 0 \rangle = 0 = f(x)$，且 $\|f\| = 0 = \|0\|$。

**步骤2**：假设 $f \neq 0$。令 $M = \ker f = \{x \in H : f(x) = 0\}$。

- **$M$ 是闭线性子空间**：
  - 线性性：若 $x_1, x_2 \in M$，则 $f(\alpha x_1 + \beta x_2) = \alpha f(x_1) + \beta f(x_2) = 0$
  - 闭性：$f$ 连续 $\implies M = f^{-1}(\{0\})$ 是闭集

**步骤3**：取 $z \in M^\perp$ 且 $\|z\| = 1$（$z$ 存在因为 $f \neq 0$）。

- 为什么存在？因为 $M \neq H$（$f \neq 0$），故 $M^\perp \neq \{0\}$

**步骤4**：令 $y = \overline{f(z)} z$，验证 $f(x) = \langle x, y \rangle$ 对所有 $x \in H$。

对任意 $x \in H$，由[[投影定理\|投影定理]]，$x$ 可唯一分解为：
$$
x = u + \alpha z, \quad u \in M, \ \alpha \in \mathbb{C}
$$

其中 $\alpha = \langle x, z \rangle$（因为 $z \perp M$）。

计算：
$$
f(x) = f(u) + \alpha f(z) = 0 + \alpha f(z) = \langle x, z \rangle f(z) = \langle x, \overline{f(z)} z \rangle = \langle x, y \rangle
$$

**步骤5**：验证 $\|f\| = \|y\|$。

由Cauchy-Schwarz不等式：
$$
|f(x)| = |\langle x, y \rangle| \leq \|x\| \|y\| \implies \|f\| \leq \|y\|
$$

取 $x = y$：
$$
|f(y)| = |\langle y, y \rangle| = \|y\|^2 \implies \|f\| \geq \frac{|f(y)|}{\|y\|} = \|y\|
$$

因此 $\|f\| = \|y\| = |f(z)|$。∎

**证明**（唯一性）：

假设 $y_1, y_2$ 都满足条件：
$$
\langle x, y_1 \rangle = \langle x, y_2 \rangle, \quad \forall x \in H
$$

则：
$$
\langle x, y_1 - y_2 \rangle = 0, \quad \forall x \in H
$$

取 $x = y_1 - y_2$，得 $\|y_1 - y_2\|^2 = 0$，故 $y_1 = y_2$。∎

## 三、对偶空间的刻画

### 3.1 Riesz同构

**定理**：映射 $\Phi: H \to H^*$ 定义为：

$$
\Phi(y) = \langle \cdot, y \rangle
$$

是**共轭线性等距同构**。

**性质**：
1. **共轭线性**：$\Phi(\alpha y_1 + \beta y_2) = \overline{\alpha} \Phi(y_1) + \overline{\beta} \Phi(y_2)$
2. **等距**：$\|\Phi(y)\| = \|y\|$
3. **满射**：对任意 $f \in H^*$，存在 $y \in H$ 使得 $f = \Phi(y)$
4. **双射**：由唯一性保证

**注**：共轭线性是因为：
$$
\Phi(\alpha y)(x) = \langle x, \alpha y \rangle = \overline{\alpha} \langle x, y \rangle = \overline{\alpha} \Phi(y)(x)
$$

### 3.2 Hilbert空间的自反性

**推论**：Hilbert空间是**自反的**，即：

$$
H^{**} \cong H
$$

**证明**：$H^* \cong H$（共轭线性同构）$\implies H^{**} \cong H^* \cong H$。∎

**意义**：Hilbert空间的对偶对 $(H^*, H)$ 有完美的对称性。

### 3.3 与Banach空间的对比

**Banach空间**：对偶空间 $X^*$ 通常**不同构**于 $X$。

**例子**：
- $\ell^1 \neq (\ell^1)^* = \ell^\infty$（不对等）
- $L^1 \neq (L^1)^* = L^\infty$（不对等）
- $c_0 \neq (c_0)^* = \ell^1$（不对等）

**Hilbert空间**：$H^* \cong H$（完美对应！）

## 四、应用

### 4.1 量子力学

**量子态的对偶性**：
- **刃矢**（ket）$|\psi\rangle \in H$：Hilbert空间中的向量
- **刃矢**（bra）$\langle \phi| \in H^*$：对偶空间中的线性泛函

**Dirac记号**：
$$
\langle \phi | \psi \rangle = \text{泛函 } \langle \phi | \text{ 作用在 } |\psi\rangle \text{ 上}
$$

**Riesz表示定理**：
$$
\langle \phi | \in H^* \iff \exists |\phi\rangle \in H: \langle \phi | \psi \rangle = \langle \psi, \phi \rangle
$$

**物理意义**：
- $\langle \phi | \psi \rangle$ 是态 $|\psi\rangle$ 在态 $|\phi\rangle$ 方向上的"投影幅"
- $|\langle \phi | \psi \rangle|^2$ 是测量概率

### 4.2 偏微分方程

**弱解**：利用Riesz表示定理证明Lax-Milgram定理。

**Lax-Milgram定理**：设 $a(u, v)$ 是Hilbert空间 $V$ 上的**有界双线性形式**，满足：
- **有界性**：$|a(u, v)| \leq C \|u\| \|v\|$
- **强制性**（椭圆性）：$a(v, v) \geq \alpha \|v\|^2$

则对任意 $f \in V^*$，存在唯一 $u \in V$ 使得：
$$
a(u, v) = f(v), \quad \forall v \in V
$$

**证明思路**：
1. 对固定 $u$，$a(u, \cdot)$ 是连续线性泛函
2. 由Riesz表示定理，存在 $Au \in V$ 使得 $a(u, v) = \langle v, Au \rangle$
3. 证明 $A: V \to V$ 是同胚
4. 存在唯一 $u = A^{-1} f$

**应用**：椭圆型偏微分方程弱解的存在唯一性。

### 4.3 信号处理

**相关函数**：对固定信号 $y$，定义泛函：
$$
f_y(x) = \langle x, y \rangle
$$

由Riesz表示定理，所有连续线性泛函都这种形式。

**匹配滤波**：在噪声中检测信号 $s(t)$，最优滤波器响应为：
$$
y(t) = \int x(\tau) \overline{s(t - \tau)} d\tau = \langle x, s \rangle
$$

这是内积运算！

### 4.4 最优控制

**线性二次调节器（LQR）**：最优控制律形式为：
$$
u^*(t) = -R^{-1} B^T P x(t)
$$

其中 $P$ 是Riccati方程的解。这个形式本质上是**对偶映射**。

### 4.5 统计学

**协方差算子**：对随机过程 $\{X_t\}$，定义协方差算子 $C: H \to H$：
$$
\langle C x, y \rangle = \mathbb{E}[\langle X, x \rangle \langle X, y \rangle]
$$

这利用了Riesz表示定理将双线性形式转化为算子。

## 五、推广

### 5.1 Riesz表示定理（测度论版本）

**定理**：设 $X$ 是局部紧Hausdorff空间。$C_c(X)$（紧支集连续函数空间）上的正线性泛函 $L$ 可以表示为：

$$
L(f) = \int_X f(x) d\mu(x)
$$

其中 $\mu$ 是**正则Borel测度**。

**意义**：建立了线性泛函与测度之间的对应关系。这是**测度论的基础定理**。

### 5.2 Banach空间的表示定理

**问题**：在一般Banach空间中，对偶空间如何表示？

**答案**：通常没有像Riesz表示定理这样简洁的表示。

**例子**：
- $(\ell^p)^* = \ell^q$（$1/p + 1/q = 1$，$1 < p < \infty$）
- $(L^p)^* = L^q$（$1/p + 1/q = 1$，$1 < p < \infty$）
- $(C[a, b])^* = \text{有界变差函数空间}$

这些表示都**复杂得多**。

### 5.3 Hahn-Banach定理

**定理**：设 $M$ 是赋范线性空间 $X$ 的子空间，$f_0 \in M^*$。则 $f_0$ 可以**延拓**为 $f \in X^*$ 使得：

$$
f|_M = f_0, \quad \|f\| = \|f_0\|
$$

**与Riesz表示定理的关系**：
- Hahn-Banach：泛函的**存在性**
- Riesz：Hilbert空间泛函的**具体表示**

**应用**：分离定理、凸分析、优化理论。

## 六、复数与实数情况的区别

### 6.1 复Hilbert空间

在复Hilbert空间中，Riesz映射 $\Phi: H \to H^*$ 是**共轭线性**的：

$$
\Phi(\alpha y) = \overline{\alpha} \Phi(y)
$$

### 6.2 实Hilbert空间

在实Hilbert空间中，Riesz映射 $\Phi: H \to H^*$ 是**线性**的：

$$
\Phi(\alpha y) = \alpha \Phi(y)
$$

因此，在实Hilbert空间中，$H$ 与 $H^*$ 是**真正的线性同构**。

---

## 参考链接

- [[Hilbert空间\|Hilbert空间]]
- [[内积\|内积]]
- [[投影定理\|投影定理]]
- [[函数空间\|函数空间]]
- [[泛函分析\|泛函分析]]

## 参考文献

1. Rudin, W. (1991). *Functional Analysis* (2nd ed.). McGraw-Hill.
2. Reed, M., & Simon, B. (1980). *Functional Analysis* (Vol. 1). Academic Press.
3. Lax, P. D. (2002). *Functional Analysis*. Wiley-Interscience.
4. Brezis, H. (2011). *Functional Analysis, Sobolev Spaces and Partial Differential Equations*. Springer.
5. Dirac, P. A. M. (1958). *The Principles of Quantum Mechanics* (4th ed.). Oxford University Press.
