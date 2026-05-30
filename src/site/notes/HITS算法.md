---
{"aliases":["HITS","Hyperlink-Induced Topic Search"],"tags":["Algorithm","LinearAlgebra","Graph","SVD"],"dg-publish":true,"permalink":"/HITS算法/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["HITS","Hyperlink-Induced Topic Search"],"tags":["Algorithm","LinearAlgebra","Graph","SVD"]}}
---

(terminology::**Hyperlink-Induced Topic Search**) HITS 算法

HITS 算法是一种基于网页链接结构的排序方法。它把网页同时看成 authority 和 hub：好的 authority 被很多好 hub 指向，好的 hub 指向很多好 authority。这个互相强化的定义最终变成 $A^TA$ 与 $AA^T$ 的特征向量问题，也就是[[奇异值分解\|奇异值分解]]的顶部奇异向量问题。

### 网页邻接矩阵与两类分数

设候选网页集合有 $N$ 个页面，邻接矩阵为
$$
A\in\{0,1\}^{N\times N},\qquad
a_{ij}=1\ \Longleftrightarrow\ \text{页面 }i\text{ 链接到页面 }j.
$$
令
$$
x=(x_1,\ldots,x_N)^T
$$
表示 authority 分数，$x_i$ 越大，页面 $i$ 越像权威页面；令
$$
y=(y_1,\ldots,y_N)^T
$$
表示 hub 分数，$y_i$ 越大，页面 $i$ 越像高质量目录页面。

初始分数 $x^0,y^0$ 可以取全 $1$，也可以取入链数和出链数。HITS 的一次更新为
$$
x^1=A^T y^0,\qquad y^1=A x^0.
$$
第一式把指向页面 $i$ 的 hub 分数加总为 authority 分数；第二式把页面 $i$ 指向的 authority 分数加总为 hub 分数。

### 两步迭代与 SVD 结构

再更新一次得到
$$
x^2=A^T y^1=A^T A x^0,\qquad
y^2=A x^1=A A^T y^0.
$$
所以 authority 排名实际在反复乘以 $A^T A$，hub 排名实际在反复乘以 $A A^T$。若
$$
A=U\Sigma V^T,
$$
则
$$
A^T A=V\Sigma^2V^T,\qquad
A A^T=U\Sigma^2U^T.
$$
多步迭代中，最大特征值 $\sigma_1^2$ 对应的方向会主导结果：
$$
(A^T A)^k x^0\approx c\,\sigma_1^{2k}v_1,\qquad
(A A^T)^k y^0\approx d\,\sigma_1^{2k}u_1.
$$
因此 authority 分数趋向顶部右奇异向量 $v_1$，hub 分数趋向顶部左奇异向量 $u_1$。实际计算时每轮都要归一化 $x,y$，否则向量长度会随 $\sigma_1^{2k}$ 放大。

### 一个三页例子

设 1 号页面链接到 2、3，2 号页面链接到 3，3 号页面链接到 1：
$$
A=
\begin{bmatrix}
0&1&1\\
0&0&1\\
1&0&0
\end{bmatrix}.
$$
从 $x^0=y^0=(1,1,1)^T$ 开始，
$$
x^1=A^Ty^0=
\begin{bmatrix}1\\1\\2\end{bmatrix},
\qquad
y^1=Ax^0=
\begin{bmatrix}2\\1\\1\end{bmatrix}.
$$
这一步中，3 号页面因为有两个入链而 authority 较高，1 号页面因为有两个出链而 hub 较高。第二步为
$$
x^2=A^T A x^0=A^Ty^1=
\begin{bmatrix}1\\2\\3\end{bmatrix},
\qquad
y^2=A A^T y^0=Ax^1=
\begin{bmatrix}3\\2\\1\end{bmatrix}.
$$
分数不再只是原始入链和出链计数，而开始反映“由高质量页面支持”的递归质量。

### 与 PageRank 的差别

HITS 通常先由关键词检索得到一个较小的主题子图，再在该子图内部分析链接。它给每个页面两个分数：authority 和 hub。PageRank 则通常在更大的网页图上构造随机游走的 Markov 矩阵，并给每个页面一个全局重要性分数。两者都利用线性代数和幂迭代，但 HITS 的核心矩阵是 $A^T A$ 与 $A A^T$，PageRank 的核心是随机转移矩阵。

### 失败模式与边界

HITS 的结果高度依赖候选子图。若关键词召回混入多个主题，顶部奇异向量可能表示最强的混合社区，而不是用户真正想要的主题。若图中存在链接农场、互链团体或重复镜像页面，authority 与 hub 会被人为放大。若最大奇异值没有明显谱间隔，迭代方向也会不稳定。

因此 HITS 更适合作为“链接结构如何产生权威与目录角色”的线性代数模型，而不是完整搜索引擎排序的充分描述。真正的搜索系统还会加入内容匹配、反垃圾链接、用户反馈、时间衰减和站点质量等信号。
