---
{"dg-publish":true,"dg-path":"机器人/运动规划/GJK算法.md","aliases":["Gilbert-Johnson-Keerthi Algorithm","GJK"],"tags":["Robotics","Computational-Geometry","Motion-Planning"],"permalink":"/机器人/运动规划/GJK算法/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{"aliases":["Gilbert-Johnson-Keerthi Algorithm","GJK"],"tags":["Robotics","Computational-Geometry","Motion-Planning"]}}
---


(terminology::**Gilbert-Johnson-Keerthi Algorithm**)

GJK 算法是一种用于凸体之间距离查询和碰撞查询的计算几何算法。它常作为[[距离检测\|距离检测]]和[[碰撞检测\|碰撞检测]]的核心组件，用于机器人、图形学和物理仿真中的凸网格、凸包或其他凸几何体。

## Convex Distance

给定两个凸体 $A$ 与 $B$，它们之间的距离为

$$
d(A,B)=\min_{a\in A,\ b\in B}\|a-b\|.
$$

GJK 把这个问题转化为 Minkowski 差

$$
A\ominus B=A+(-B)=\{a-b\mid a\in A,\ b\in B\}
$$

到原点的距离：

$$
d(A,B)=\min_{x\in A\ominus B}\|x\|.
$$

若原点落在 $A\ominus B$ 内，则两个凸体相交；若原点在外，原点到 $A\ominus B$ 的最近距离就是两凸体清距。

## Support Mapping

GJK 不需要显式构造完整的 Minkowski 差，而是反复调用支持点函数。对方向 $v$，

$$
s_A(v)=\arg\max_{a\in A} v^\mathsf{T}a.
$$

Minkowski 差的支持点可由两个原始支持点组合得到：

$$
s_{A\ominus B}(v)=s_A(v)-s_B(-v).
$$

算法维护一个由支持点组成的 simplex，并迭代更新最接近原点的 simplex。二维中 simplex 是点、线段或三角形；三维中是点、线段、三角形或四面体。

## Use in Robotics

对凸机器人部件和凸障碍，GJK 可直接返回距离或相交判断。复杂形状通常先分解成凸体并取所有凸体对的最小距离：

$$
d(A,B)=\min_{u,v} d(A_u,B_v),
$$

其中

$$
A=\bigcup_u A_u,\qquad B=\bigcup_v B_v.
$$

这样非凸机械臂、环境网格和工具模型可以通过凸分解接入同一个距离查询框架。

## Boundary Conditions

GJK 的基本对象是凸体；非凸形状若不做分解，支持映射不能表达真实最近距离。数值实现还需要容差来区分微小正距离、接触和穿透。若需要穿透深度或接触法向，工程系统常在 GJK 相交后接入额外的接触求解步骤。

## Related Concepts

- [[距离检测\|距离检测]]：GJK 返回凸体之间的清距。
- [[碰撞检测\|碰撞检测]]：当凸体距离小于等于零时判定相交。
- [[保守碰撞检测\|保守碰撞检测]]：凸分解、球覆盖和简化网格都可作为检测几何。
- [[计算几何\|计算几何]]：GJK 属于凸几何支持函数方法。
- [[运动规划\|运动规划]]：规划器通过大量几何查询验证节点和边是否可行。
