---
{"dg-path":"人工智能/强化学习/Matrix-vector form of the Bellman equation.md","dg-publish":true,"permalink":"/人工智能/强化学习/Matrix-vector form of the Bellman equation/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-12-05T10:41:44.202+08:00","updated":"2025-12-11T23:15:57.151+08:00"}
---


$$\begin{align}
v_{\pi}(s)  & = \mathbb{E}[R_{t+1}|S_t = s] + \gamma \mathbb{E}[G_{t+1}|S_t = s], \\ \\
 & = \underbrace{ \sum_{a \in A} \pi(a|s)\sum_{r \in \mathcal{R}} p(r|s, a) r}_{\text{mean of immediate rewards}} + \underbrace{\gamma \sum_{a \in A} \pi(a|s) \sum_{s' \in \mathcal{S}} p(s'|s, a) v_\pi(s')}_{\text{mean of future rewards}} \\

 & = \sum_{a \in A} \pi(a|s) \left[ \sum_{r \in \mathcal{R}} p(r|s, a) r + \gamma \sum_{s' \in \mathcal{S}} p(s'|s, a) v_\pi(s') \right], \quad \text{for all } s \in \mathcal{S}. 
\end{align}\quad (2.7)$$

The [[Bellman Equation\|Bellman Equation]]  in (2.7) is in an elementwise form. Since it is valid for every state, we can combine all these equations and write them concisely in a matrix- vector form, which will be frequently used to analyze the Bellman equation.  

To derive the matrix- vector form, we first rewrite the Bellman equation in (2.7) as  

$$v_{\pi}(s) = r_{\pi}(s) + \gamma \sum\limits _{s'\in S}p_{\pi}(s'|s)v_{\pi}(s')\quad (2.8)$$

- $r_{\pi}(s)$ denotes **the mean of the immediate rewards**,
- $p_{\pi}(s^{\prime}|s)$ is the probability of transitioning from $s$ to $s'$ under policy $\pi$

$$r_{\pi}(s)\doteq \sum_{a\in A}\pi (a|s)\sum_{r\in \mathcal{R}}p(r|s,a)r,$$ 
$$p_{\pi}(s^{\prime}|s)\doteq \sum_{a\in \mathcal{A}}\pi (a|s)p(s^{\prime}|s,a).$$  
Suppose that the states are indexed as $s_i$ with $i = 1,\ldots ,n$ , where $n = |\mathcal{S}|$ . For state $s_i$ , (2.8) can be written as  

$$\begin{align}
v_{\pi}(s_i) = r_{\pi}(s_i) + \gamma \sum_{s_j\in \mathcal{S}}p_\pi (s_j|s_i)v_\pi (s_j).\quad (2.9)
\end{align}$$  
Let $v_{\pi} = [v_{\pi}(s_1),\dots,v_{\pi}(s_n)]^T\in \mathbb{R}^n$ , $r_{\pi} = [r_{\pi}(s_1),\dots,r_{\pi}(s_n)]^T\in \mathbb{R}^n$ , and $P_{\pi}\in \mathbb{R}^{n\times n}$ with $[P_{\pi}]_{ij} = p_{\pi}(s_j|s_i)$ . Then, (2.9) can be written in the following **matrix- vector** form:  

$$v_{\pi} = r_{\pi} + \gamma P_{\pi}v_{\pi}, \quad (2.10)$$  
where $v_{\pi}$ is the unknown to be solved, and $r_{\pi}, P_{\pi}$ are known.  


The matrix $P_{\pi}$ has some interesting properties. 
- First, it is a nonnegative matrix, meaning that all its elements are equal to or greater than zero. This property is denoted as $P_{\pi} \geq 0$ , where 0 denotes a zero matrix with appropriate dimensions. In this book, $\ge$ or $\le$ represents an elementwise comparison operation. 
- Second, $P_{\pi}$ is a stochastic matrix, meaning that the sum of the values in every row is equal to one. This property is denoted as $P_{\pi} \mathbf{1} = \mathbf{1}$ , where $\mathbf{1} = [1,\ldots ,1]^T$ has appropriate dimensions.  

Consider the example shown in Figure 2.6. The matrix- vector form of the Bellman equation is  

$$ \begin{bmatrix} v_{\pi}(s_1) \\ v_{\pi}(s_2) \\ v_{\pi}(s_3) \\ v_{\pi}(s_4) \end{bmatrix} = \begin{bmatrix} r_{\pi}(s_1) \\ r_{\pi}(s_2) \\ r_{\pi}(s_3) \\ r_{\pi}(s_4) \end{bmatrix} + \gamma \begin{bmatrix} p_{\pi}(s_1|s_1) & p_{\pi}(s_2|s_1) & p_{\pi}(s_3|s_1) & p_{\pi}(s_4|s_1) \\ p_{\pi}(s_1|s_2) & p_{\pi}(s_2|s_2) & p_{\pi}(s_3|s_2) & p_{\pi}(s_4|s_2) \\ p_{\pi}(s_1|s_3) & p_{\pi}(s_2|s_3) & p_{\pi}(s_3|s_3) & p_{\pi}(s_4|s_3) \\ p_{\pi}(s_1|s_4) & p_{\pi}(s_2|s_4) & p_{\pi}(s_3|s_4) & p_{\pi}(s_4|s_4) \end{bmatrix} \begin{bmatrix} v_{\pi}(s_1) \\ v_{\pi}(s_2) \\ v_{\pi}(s_3) \\ v_{\pi}(s_4) \end{bmatrix}. $$

Substituting the specific values into the above equation gives 
$$
\left[ \begin{array}{c} v_\pi(s_1) \\ v_\pi(s_2) \\ v_\pi(s_3) \\ v_\pi(s_4) \end{array} \right] = \left[ \begin{array}{c} 0.5(0) + 0.5(-1)  \\ 1 \\ 1 \\ 1 \end{array} \right] + \gamma \left[ \begin{array}{cccc} 0 & 0.5 & 0.5 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 0 & 1 \end{array} \right] \left[ \begin{array}{c} v_\pi(s_1) \\ v_\pi(s_2) \\ v_\pi(s_3) \\ v_\pi(s_4) \end{array} \right].
$$


It can be seen that $P_{\pi}$ satisfies $P_{\pi}1 = 1$ .  

![](../img/user/OCR/images/3---Chapter-2-State-Values-and-Bellman-Equation_13_0.jpg)

<center>Figure 2.6: An example for demonstrating the matrix-vector form of the Bellman equation. </center>  

