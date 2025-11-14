---
{"dg-publish":true,"dg-path":"机器人/XRCE-DDS.md","permalink":"/机器人/XRCE-DDS/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-03-27T15:35:41.800+08:00","updated":"2025-08-28T21:53:14.000+08:00"}
---


(website:: [XRCE-DDS](https://micro-xrce-dds.docs.eprosima.com/en/latest/index.html))  (website::https://www.eprosima.com/)
> [[DDS\|DDS]] for e**X**tremely **R**esource **C**onstrained **E**nvironment standard

eProsima Micro XRCE-DDS is a software solution that allows communicating eXtremely Resource Constrained Environments (XRCEs) with an existing DDS network.

This implementation complies with the specification of the eXtremely Resource Constrained Environments DDS (DDS-XRCE) protocol as defined and maintained by the Object Management Group (OMG) consortium.

DDS-XRCE 协议的目标是让资源受限设备能够访问 DDS 全局数据空间。这通过一种 **客户端-服务器** 架构实现，其中资源有限的设备称为 _XRCE 客户端_，它们连接到一个服务器，称为 _XRCE Agent_，该服务器代表其客户端在 DDS 全局数据空间中进行操作。 



![Pasted image 20250501165537.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020250501165537.png)

### Components
Micro XRCE-DDS 由两个主要部分组成：
- [Micro XRCE-DDS Agent](https://github.com/eProsima/Micro-XRCE-DDS-Agent)：一个 **C++11 即开即用的应用程序**，实现 XRCE Agent 功能。
- [Micro XRCE-DDS Client](https://github.com/eProsima/Micro-XRCE-DDS-Client)：一个 **C99 库**，实现 XRCE 客户端功能。
此外，Micro XRCE-DDS 还使用另外两个组件：
[[Micro CDR\|Micro CDR]]   [[Micro XRCE-DDS Gen\|Micro XRCE-DDS Gen]]
### Main Features

#### 低资源消耗
如上所述，Micro XRCE-DDS 专注于微控制器应用。因此，该中间件的设计和实现充分考虑了此类设备的内存限制。 XRCE 客户端完全不使用动态内存，从内存占用角度来看，库的[最新版本](https://github.com/eProsima/Micro-XRCE-DDS-Client/releases/latest) 的内存消耗不到 **75 KB Flash** 和大约 **3 KB RAM**，即可运行一个完整的发布者和订阅者应用，处理大约 512 B 大小的消息。

有关内存消耗随消息大小、实体数量和库内部内存管理变化的详细信息：[[Micro XRCE-DDS memory profiling\|Micro XRCE-DDS memory profiling]]

此外，该库高度可配置，得益于 _profile_ 概念，允许在配置时选择、添加或移除某些功能。这使得在未使用某些功能时可以定制 XRCE 客户端库的大小。编译时有多个定义用于配置和构建客户端库。这些定义可根据应用需求创建不同版本的库，并可在 `client.config` 文件中修改。每次更改定义后需要运行 `cmake` 命令以应用配置。

有关如何通过调整 Micro XRCE-DDS 库或其 RMW 实现 [`rmw_microxrcedds`](https://github.com/micro-ROS/rmw-microxrcedds) 中的参数来配置 micro-ROS 的更多信息，请参考此 [教程](https://micro.ros.org/docs/tutorials/advanced/microxrcedds_rmw_configuration/) 和 `rmw_microxrcedds` [README](https://github.com/micro-ROS/rmw-microxrcedds#rmw-micro-xrce-dds-implementation)。
#### 多传输支持
作为前面提到的 profiles 一部分，用户可以选择多种传输层将客户端与 Agent 连接。实际上，与只支持特定传输层的其他物联网中间件（如 MQTT 和 CoaP）不同，XRCE 原生支持多种传输协议。特别是，Micro XRCE-DDS 最新版本支持：**UDP**、**TCP** 和自定义的 **串口** 传输协议。
此外，Micro XRCE-DDS 为 Agent 和 Client 提供了传输接口，使得用户可以轻松实现自定义传输。这使得 Micro XRCE-DDS 移植到不同平台和添加新传输协议变得简单，任何用户都能完成。

#### 多平台支持
XRCE 客户端支持 **FreeRTOS**、**Zephyr** 和 **NuttX** 作为嵌入式 [[RTOS\|RTOS]]。此外，它也可以运行在 **Windows** 和 **Linux** 上。另一方面，XRCE Agent 支持 **Windows** 和 **Linux**。

#### QoS 支持
XRCE 客户端库允许用户通过两种方式在 XRCE Agent 上创建 DDS 实体：
- 通过 [[XML\|XML]]（默认选项）
- 通过引用
使用默认选项时，用户可以以可靠模式或尽力而为模式创建实体，XML 文件由客户端编写并存储。但这种 QoS 配置可能不满足部分用户需求。对于这种情况，Micro XRCE-DDS 允许直接在 Agent 上创建实体，用户可以像在 DDS 中那样编写自定义 XML QoS。Agent 上的每个实体都会关联一个标签，客户端只需引用这些标签即可创建所需实体进行通信。

此外，使用引用方式还可以减少 MCU 中客户端的内存占用。因为引用方式可以避免构建存储 XML 的代码部分。
需要注意的是，这一机制被 micro-ROS 继承，因此 micro-ROS 也能够利用与 ROS 2 相同的完整 QoS 功能。关于如何在 micro-ROS 中使用自定义 QoS 的完整教程，请访问 [专门页面](https://micro.ros.org/docs/tutorials/advanced/create_dds_entities_by_ref/)。

