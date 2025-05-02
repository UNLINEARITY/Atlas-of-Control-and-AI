---
{"dg-publish":true,"dg-path":"IoT/DDS.md","permalink":"/IoT/DDS/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-01-06T21:19:26.150+08:00","updated":"2025-05-02T16:21:11.199+08:00"}
---

(website::https://www.dds-foundation.org/)
(terminology::**Data Distribution Service**)  数据分发服务
a middleware standard developed by the Object Management Group (OMG)

“自动化”、“去中心化”、“面向数据”
一种发布-订阅（pub-sub）中间件标准，主要用于实时系统中设备间的数据交换。

Is more commonly used in real - time, mission - critical applications where high - performance, reliability, and low - latency communication are required.
>  has significant differences with  [[MQTT\|MQTT]]
### Publish - Subscribe
**Publishers and Subscribers**: Publishers are entities that generate and send data, while subscribers are those that receive and process the data.

**Topics**: Data is organized into topics. A topic is a named entity that represents a particular type of data.
### Data - Centric Approach
**Loose Coupling**
**Focus on Data**
the system is designed to ensure that the right data gets to the right places at the right time, regardless of the specific software components involved.

### Quality of Service  (QoS) Policies
provides a rich set of QoS policies that allow users to customize the communication characteristics according to their specific requirements.

### DDS 
[[XRCE-DDS\|XRCE-DDS]]

