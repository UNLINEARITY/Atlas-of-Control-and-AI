---
{"dg-publish":true,"dg-path":"机器人/URDF.md","permalink":"/机器人/URDF/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-01-07T21:30:49.000+08:00","updated":"2026-01-08T21:47:01.394+08:00"}
---


(terminology::**Unified Robot Description Format**)   统一机器人描述格式

基于 [[XML\|XML]] 的机器人结构描述语言： **有向无环刚体树（Rigid Body Tree）** 一个 link 只能有一个 parent joint，描述了：
- 机器人 刚体拓扑结构
- 各刚体（link）的 几何、惯性、视觉、碰撞属性
- 各关节（joint）的 运动学约束

### 1. 基本组成

声明信息+两种关键组件
#### 1.1 声明信息

第一部分是xml的声明信息
第二部分是机器人的声明，通过robot标签就可以声明一个机器人模型

```
robot
 ├── link (节点)
 └── joint (边)
```
 
```xml 
<?xml version="1.0"?>
<robot name="robot_name">
	<link></link>
	<joint></joint>
</robot>
```

#### 1.2 两种关键组件
**Link**：机器人的各个部件
**Joint**：机器人关节， Link 和 Link 之间的连接部分，用于连接两个机器人部件

### 2. Link 
一个完整的 `<link>` 通常包含：
```xml
<link name="link1">
  <visual>	</visual>     <!-- 可视模型 -->
  <collision>	</collision> <!-- 碰撞模型 -->
  <inertial>	</inertial>  <!-- 惯性参数 -->
</link>
```

#### 2.1 visual 外观模型
`<visual>`    用于定义连杆的可视化属性，即连杆在仿真环境或可视化界面中呈现的外观。

-  `<geometry>`  几何形状
	- `<box size="x y z"/>`  **长方体**    size-长宽高
	- `<cylinder radius="r" length="l"/>` **圆柱体**  radius -半径 length-高度
	- `<sphere radius="r"/>`  **球体**   radius -半径
	- `<mesh filename="xxx.stl" scale="1 1 1"/>`  **第三方导出的模型文件**  
-  `<origin>`   `xyz` 默认为零矢量 `rpy` 弧度表示的翻滚、俯仰、偏航
-  `<material>`   name 名称；  `<color rgba=" ">`  颜色

#### 2.2 collision 碰撞模型
`<collision>`  用于定义连杆的碰撞属性，在仿真中用于碰撞检测，确保机器人在运动过程中不会与其他物体或自身发生不合理的穿透。

```XML 
<collision>
  <geometry>
    <box size="0.48 0.18 0.08"/>
  </geometry>
</collision>
```
#### 2.3 inertial 动力学核心
`<inertial>`   用于定义连杆的惯性属性，这些属性对于机器人动力学仿真和控制算法的准确性非常重要，它决定了连杆在受到力和力矩作用时的运动响应。

```XML 
<inertial>
  <origin xyz="0 0 0" rpy="0 0 0"/>
  <mass value="2.5"/>
  <inertia
    ixx="0.01" ixy="0" ixz="0"
    iyy="0.02" iyz="0"
    izz="0.03"/>
</inertial>
```


### 3. Joint  
> 定义：child link 坐标系相对于 parent link 坐标系的变换与运动约束 

```XML
<joint name="joint1" type="revolute">

  <parent link="base_link"/>
  <child link="link1"/>

  <origin xyz="0 0 0.1" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>

</joint>
```

用于连接两个机器人部件，
- `name` 关节的名称
- `type` 关节的类型
- `parent` 父 link 名称
- `child` 子 link 名称
- `origin` 父子之间的关系 xyz rpy
    `<origin xyz="0 0 0.014" />`
- `axis` 围绕旋转的关节轴
    `<axis xyz="0 0 1" />`

#### type 关节类型

| 类型         | 含义     |                                |
| ---------- | ------ | ------------------------------ |
| fixed      | 固定     | 不允许运动的特殊关节                     |
| revolute   | 有限角度旋转 | 旋转关节，绕单轴旋转, 角度有上下限, 比如舵机 0-180 |
| continuous | 无限旋转   | 旋转关节，可以绕单轴无限旋转, 比如自行车的前后轮      |
| prismatic  | 直线移动   | ，沿某一轴线移动的关节，有位置极限              |
| planar     | 平面内运动  | 平面关节                           |
| floating   | 6 DOF  | 浮动关节，允许进行、平移、旋转                |

origin  零位时的刚体变换
axis  自由度方向定义
limit 可达空间与物理约束

```txt 
x：前
y：左
z：上
r = roll  （滚转）
p = pitch （俯仰）
y = yaw   （偏航）
```

### 4. 可视化相关文件
URDF（Unified Robot Description Format）是 ROS 生态中用于描述机器人**运动学与结构拓扑**的模型描述文件格式，本质是 XML。

URDF 用来描述机器人“是什么样的、怎么连起来、怎么动”，而不是“长得多精细”。

#### .STL 
STL（Stereolithography）是**三角网格几何模型格式**，与机器人无关，是通用的 3D 模型格式。

主要特征
- 只有几何（三角面片），没有颜色、材质、层级、坐标系
- 体积小、结构简单
- 工业与仿真中最常见
在 URDF 中的角色
- 常用于 collision（碰撞模型）
- 也可用于 visual（视觉模型，但通常偏粗糙）

#### .DAE
DAE（COLLADA）是一种**富几何 + 语义的 3D 模型交换格式**。
DAE 用来描述“外形 + 材质 + 层级关系”。

主要特征
- 支持颜色、贴图、材质
- 支持模型内部层级（多个 mesh）
- 文件结构复杂，但表达能力强
- 常由 Blender、Maya、SketchUp 导出

在 URDF 中的角色
- 常用于 visual（视觉模型）
- 用于在 RViz / Gazebo 中获得更真实的外观
- 很少用于 collision（过于复杂）

#### .Xacro 
[[Xacro\|Xacro]]（XML Macros）不是模型格式，而是**URDF 的“元语言 / 预处理器”**

解决 URDF 的三大痛点：
- 重复
- 参数不可配置
- 难以维护

主要能力
- 宏定义（类似函数）
- 参数化（长度、质量、数量可配置）
- 条件与循环
- 文件拆分与复用


### 可视化网站
https://unlinearity.github.io/URDF-Visualizer/

https://gkjohnson.github.io/urdf-loaders/javascript/example/bundle/ 
https://xinlang2019.github.io/urdf_visualizer/ 
https://viewer.robotsfan.com/  
