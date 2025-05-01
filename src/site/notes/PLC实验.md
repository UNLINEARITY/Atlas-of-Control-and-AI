---
{"dg-publish":true,"dg-path":"PLC/PLC实验.md","permalink":"/PLC/PLC实验/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-12-28T12:50:18.838+08:00","updated":"2025-04-29T16:31:36.415+08:00"}
---


[[可编程控制器硬件\|可编程控制器硬件]]

RSLinx：查看 ip 地址
==控制器==： Micro850，2080-LC50-48QBB 

==工业触摸屏==：PanelView800 ，2711R-T7T
通信协议：Ethernet | Allen-Bradley CIP  
控制器 ip 地址选择 Micro850 的
图形配置一般都需要：转至终端配置
触摸屏标签使用控制器的全局变量，写地址，对图形进行 **写标签**

编码器是用于位置测量的传感器

==驱动器/ 变频器==：PowerFlex 525 
**控制交流电机**
改变电机工作电源频率的方式来控制交流电动机

==HSC==
嵌入式 I/O  

HSC 
HSCAPP 
HSCAPP. Accumulator 返回计数值

==电机轴 PTO 组态 ==


**控制步进电机**
步进电机指令块 

MC_Home  归位
MC_MoveAbsolute  绝对运动
MC_MoveRelative  相对运动
MC_Power  伺服模块上电
MC_Reset  重置所有相关错误
NC_Stop  电机轴停止


