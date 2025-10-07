---
{"dg-publish":true,"dg-path":"机器人/URDF.md","permalink":"/机器人/URDF/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-01-07T21:30:49.000+08:00","updated":"2025-09-12T12:50:33.000+08:00"}
---


(terminology::**Unified Robot Description Format**)   统一机器人描述格式
使用 [[XML\|XML]] 格式进行描述

基本组成：声明信息+两种关键组件

### 声明信息
第一部分是xml的声明信息
第二部分是机器人的声明，通过robot标签就可以声明一个机器人模型
 
```xml 
<?xml version="1.0"?>
<robot name="robot_name">
	<link></link>
	<joint></joint>
</robot>
```

### 两种关键组件
**Link**：机器人的各个部件
**Joint**：机器人关节， Link 和 Link 之间的连接部分，用于连接两个机器人部件

#### Link 
`<visual>`    用于定义连杆的可视化属性，即连杆在仿真环境或可视化界面中呈现的外观。
-  `<geometry>`  几何形状
	- `<box>` **长方体**    size-长宽高
	- `<cylinder>` **圆柱体**  radius -半径 length-高度
	- `sphere` **球体**   radius -半径
	- `mesh` **第三方导出的模型文件**  filename
-  `<origin>`   `xyz` 默认为零矢量 `rpy` 弧度表示的翻滚、俯仰、偏航
-  `<material>`   name 名称；  `<color rgba=" ">`  颜色

`<collision>`  用于定义连杆的碰撞属性，在仿真中用于碰撞检测，确保机器人在运动过程中不会与其他物体或自身发生不合理的穿透。

`<inertial>`   用于定义连杆的惯性属性，这些属性对于机器人动力学仿真和控制算法的准确性非常重要，它决定了连杆在受到力和力矩作用时的运动响应。

#### Joint 
用于连接两个机器人部件，主要写明父子关系
- 父子之间的连接类型，包括是否固定的，可以旋转的等
- 父部件名字
- 子部件名字
- 父子之间相对位置
- 父子之间的旋转轴，绕哪个轴转

- name 关节的名称
- type 关节的类型
    - **revolute: 旋转关节，绕单轴旋转,角度有上下限,比如舵机0-180**
    - **continuous: 旋转关节，可以绕单轴无限旋转,比如自行车的前后轮**
    - **fixed: 固定关节，不允许运动的特殊关节**
    - prismatic: 滑动关节，沿某一轴线移动的关节，有位置极限
    - planer: 平面关节，允许在xyz，rxryrz六个方向运动
    - floating: 浮动关节，允许进行平移、旋转运动

- `parent` 父link名称
    - `<parent link="base_link" />`
- `child`子link名称
    - `<child link="laser_link" />`
- `origin` 父子之间的关系xyz rpy
    - `<origin xyz="0 0 0.014" />`
- `axis` 围绕旋转的关节轴
    - `<axis xyz="0 0 1" />`


