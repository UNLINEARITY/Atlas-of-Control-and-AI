---
{"tags":["OpenSource","Framework"],"dg-publish":true,"dg-path":"机器人/ROS 2.md","permalink":"/机器人/ROS 2/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:28.457+08:00","updated":"2025-08-03T10:59:26.454+08:00"}
---

(website::https://docs.ros.org/)
(terminology::**Robot Operating System 2**)  第二代机器人操作系统
是一个用于[[机器人\|机器人]]软件开发的开源框架。它提供了一套工具和库，使得开发者能够更容易地创建复杂的机器人应用程序。ROS的核心目标是实现代码的复用、模块化以及跨平台的机器人软件开发。
模块化、分布式

实际上是**软件库和工具集**，用于简化在各种机器人平台上创建复杂而强大的机器人行为的任务，即不重复造轮子。
ROS2 是在 ROS 的基础上设计开发的第二代机器人操作系统，可以帮助我们简化机器人开发任务，本质上是加速机器人落地的**软件库和工具集**。

一个面向机器人的中间件、库和工具的集合。它为机器人应用开发提供了一种灵活的框架，用于编写机器人软件。它能够帮助开发者更容易地构建复杂的机器人系统，使得软件的复用性更高，

[[ROS2 相关基础\|ROS2 相关基础]]
[[ROS2 的安装\|ROS2 的安装]]
[[ROS2 Architecture\|ROS2 Architecture]]
[[ROS2 Package\|ROS2 Package]]
[[ROS2 Message\|ROS2 Message]]
[[ROS2 Communication\|ROS2 Communication]]
[[Ros2 bag\|Ros2 bag]]
[[ROS and mqtt 代码使用\|ROS and mqtt 代码使用]]

![Functional files/Photo Resources/Pasted image 20250501214912.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020250501214912.png)


### 概念 Concepts 
#### Basic Concepts 
[[ROS2 Nodes\|ROS2 Nodes]]
[[ROS2 Topics\|ROS2 Topics]]
[[ROS2 Services\|ROS2 Services]]
[[RCL\|RCL]]

### 实际实践
创建工作区
编写节点 rclcpp 或 rclpy 
编译构建 colcon build 
运行节点 ros2 run
测试通信 ros2 topic echo / ros2 topic pub
 
### 相关工具





| 相关工具       | 简要介绍         |
| ---------- | ------------ |
| [[Rviz2\|Rviz2]]  | Data         |
| [[RQT\|RQT]]    | GUI Framwork |
| [[Gazebo\|Gazebo]] |              |
| [[Colcon\|Colcon]] |              |

