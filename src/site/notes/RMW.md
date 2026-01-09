---
{"dg-path":"机器人/RMW.md","dg-publish":true,"permalink":"/机器人/RMW/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-05-01T17:46:37.000+08:00","updated":"2026-01-02T00:21:33.443+08:00"}
---

(terminology::**ROS Middleware Interface**)

> 是 ROS 2 架构中一个关键的中间层接口，全称为 **ROS 中间件接口**


它位于 [[ROS2\|ROS2]] 软件架构中 [[RCL\|RCL]]（ROS Client Library）与具体通信中间件（如 [[DDS\|DDS]]）实现之间，扮演了中间抽象层的角色。

RMW 的主要作用是为上层提供一个标准化、与中间件无关的 API，使得 ROS 2 能够支持多种不同的底层通信中间件而无需修改上层逻辑，从而实现“中间件无关性”（middleware agnosticism）。


ROS 2 引入了 DDS（Data Distribution Service）作为主要的通信中间件，同时考虑到未来可能采用不同实现，RMW 的设计成为必要。它定义了一组抽象接口，规定了上层客户端库（如 RCL、rclcpp、rclpy）可以使用的功能集合，包括节点管理、发布与订阅、服务与客户端、等待集、QoS 设置等。具体的消息传递、服务调用、序列化与网络通信等由各个 **RMW 实现（middleware implementation）** 完成，例如 `rmw_fastrtps_cpp`、`rmw_cyclonedds_cpp`、`rmw_connext_cpp` 等。 


通过这种设计，RMW 实现了 **接口-实现分离（interface-implementation separation）**。上层 RCL 仅依赖 RMW 定义的接口，无需了解每个中间件的具体实现细节，而用户可以通过配置选择或切换不同的 RMW 实现，从而在不改变应用程序代码的前提下，切换不同的 DDS 实现或自定义中间件。

RMW 的实现形式是一个以 **C 语言编写的共享库**，暴露一套符合标准的 C API。每个具体的 RMW 实现库都必须严格按照这一 API 规范提供函数实现。比如，如果使用 `rmw_fastrtps_cpp`，在构建时会链接到 Fast DDS 的 RMW 实现库，由它负责调用 Fast DDS 的具体 API；如果使用 `rmw_cyclonedds_cpp`，则对应 Cyclone DDS 的实现。这种插件式的架构保证了 ROS 2 系统的灵活性与可扩展性。

在运行时，当 ROS 2 启动节点时，RCL 会调用 RMW 接口，而 RMW 根据用户配置选择对应的实现库，将操作转发到底层中间件。这一流程保证了上层开发者始终面对统一的 API，而底层可以针对不同硬件、网络、性能需求灵活选用最佳的中间件实现。例如，针对嵌入式设备，可以使用资源占用更小、延迟更低的 `rmw_microxrcedds`；而在高性能服务器上，可以选择功能丰富、性能优化的 `rmw_connext_cpp`。
