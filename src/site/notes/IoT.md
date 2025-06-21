---
{"aliases":["物联网"],"dg-publish":true,"dg-path":"IoT/IoT.md","dg-pinned":true,"permalink":"/IoT/IoT/","pinned":true,"dgPassFrontmatter":true,"noteIcon":"","created":"2024-11-21T15:59:31.851+08:00","updated":"2025-06-19T11:34:53.891+08:00"}
---

(terminology::**Internet of Things**)  **物联网**
> “万物互联”

作为信息技术、通信技术、控制技术与智能技术融合发展的产物，是实现物理世界与数字世界深度融合的重要桥梁，推动“万物互联”的愿景。

物联网的核心目标不仅仅是让物体具备“被动标识”（passive identification），更在于赋予其“主动感知、互联互通、智能协作”的能力，实现物体之间在无人干预下的**自组织**（self-organization）、**自管理**（self-management）、**自决策**（self-decision-making）。

这一技术体系围绕“**感知-传输-处理-应用**”四个环节展开，是一个多技术协同集成的复杂系统工程，涵盖从底层硬件到高层应用、从局域连接到全球互联的全链路构建。

### 一、体系架构

#### 1. 感知层
负责实现物理世界的信息获取与状态采集，依赖于各类传感器、执行器、嵌入式采集设备。关键技术包括 RFID、传感网络（sensor networks）、二维码、图像识别、微机电系统（MEMS）等。
### 2. 网络层
承担数据传输、路由与协议转换，支持多种通信方式，如蜂窝通信（2G/3G/4G/5G）、Wi-Fi、蓝牙、ZigBee、LoRa、NB-IoT、IPv6 等，既包含传统网络，也涉及软件定义网络（SDN）等新兴架构。
#### 3. 应用层
面向各行业需求，提供智能服务、业务逻辑、数据可视化及人机交互（HCI），应用领域覆盖智慧城市、智能制造、车联网、智慧医疗、智慧农业、数字能源等。

### 二、通信协议与标准
在物联网系统中，通信协议是实现设备互联、数据交换、远程控制的核心支撑。由于物联网设备通常资源受限、网络环境复杂，因此协议设计强调**轻量化**（lightweight）、**高效性**（efficiency）、**可扩展性**（scalability）与**互操作性**（interoperability）。

物联网的通信协议主要分为三类，根据不同层级需求，采用不同协议进行协同：
- 设备到设备（Device-to-Device, D2D）
- 设备到网关（Device-to-Gateway）
- 设备到云端（Device-to-Cloud）

常用协议包括：
- [[MQTT\|MQTT]]（Message Queuing Telemetry Transport）  
    轻量级、基于发布/订阅模式，适用于低带宽、高延迟、网络不稳定场景。通过“主题”（Topic）进行消息分类，由代理（Broker）转发消息，广泛用于智能家居、远程监控、传感器网络。 
- CoAP（Constrained Application Protocol）  
    面向受限设备的协议，基于 UDP，采用 REST 架构风格，支持 GET/POST/PUT/DELETE 操作，适合用于资源受限节点间的简单数据交互，常见于低功耗无线网络。
- AMQP（Advanced Message Queuing Protocol）  
    面向企业级应用的高级消息队列协议，具备更强的消息保障机制、事务处理能力，适用于对可靠性要求较高的场景，如金融物联网、工业控制。
-  [[DDS\|DDS]]（Data Distribution Service）  
    采用数据中心化（Data-Centric）的发布/订阅模式，支持实时、可靠的高频数据分发，常用于工业自动化、车联网、机器人等对实时性有严格要求的应用。 
此外，还有 HTTP/HTTPS、XMPP、ZigBee、Bluetooth LE、LoRaWAN、NB-IoT 等多种协议在不同场景中协作应用。


随着设备数量激增、异构性增强，对协议的**统一性与开放性**提出更高要求。国际上出现了一系列标准化组织与框架推动协议互联互通：
- **OCF（Open Connectivity Foundation）**  
    提供跨厂商、跨平台的互操作标准，定义统一数据模型与通信接口。
- **OneM2M**  
    面向物联网平台的全球标准，旨在实现不同物联网系统之间的无缝集成与互操作。
- **LwM2M（Lightweight M2M）**  
    专为设备管理与远程配置设计的轻量协议，适合低功耗、低带宽场景。

### 三、物联网的核心问题
物联网不只是技术的简单组合，更是系统整体优化的问题。随着“连接万物”向“智能万物”演进，物联网正借助边缘智能（Edge Intelligence）、分布式机器学习（distributed machine learning）、联邦学习（federated learning）等新技术，实现数据的本地处理、快速响应、智能协作，从而减少对云端的依赖，提升实时性、隐私性与资源利用率。

数字孪生（Digital Twin）、协同智能（collaborative intelligence）、泛在感知（ubiquitous sensing）、低功耗通信（low-power communication，如 NB-IoT、6G mMTC）等，成为当前物联网的前沿方向。

物联网不仅是一项技术，更是数字社会的新型信息基础设施。它以“万物可连接、万物可计算、万物可协作”为愿景，推动社会从信息化、网络化迈向智能化。物联网的发展已经从“技术探索”进入“规模化落地”阶段，未来将在 AIoT 融合、智能边缘、隐私计算、数字孪生、6G 融合通信等方向持续拓展应用边界。

如今，物联网不再局限于“物与物的连接”，而是迈向“物、网、云、边、智”的一体化协同，正在重塑产业链、价值链与创新链，对未来社会的运行模式、产业发展乃至人类生活方式产生深远影响。



#### 相关理论
[[Age of Information\|Age of Information]]
[[Artificial Internet of Things\|Artificial Internet of Things]]


