---
{"dg-publish":true,"dg-path":"MCU微控制器/STM32.md","dg-pinned":true,"tags":["Subject"],"permalink":"/MCU微控制器/STM32/","pinned":true,"dgPassFrontmatter":true,"noteIcon":"","created":"2024-05-21T15:20:27.841+08:00","updated":"2024-08-12T13:47:08.994+08:00"}
---

ST-M-32
- ST：公司
- M：MCU 微控制器/单片机
- 32： 32 位

基于 [[ARM\|ARM]]  Cortex-M 开发的 32 位的 [[微控制器\|微控制器]]
[[STM32F103C8T6\|STM32F103C8T6]]

[[STM32-C\|STM32-C]]
[[STM32片上外设\|STM32片上外设]]
[[STM32中断系统\|STM32中断系统]]
[[STM32程序设计\|STM32程序设计]]

### 开发方式
- 基于[[寄存器\|寄存器]]：偏底层
- 基于[[库函数\|库函数]]：使用 ST 公司封装的库函数
- 基于 [[HAl\|HAl]]：   图形化快速配置
### 芯片命名规则


| 产品系列 | 产品类型 | 产品子系列             | 引脚数目    | 闪存容量 | 封装  | 温度范围 |
| ---- | ---- | ----------------- | ------- | ---- | --- | ---- |
|      |      | 101 ： <br>基本型     | T : 36  | 4    |     |      |
|      |      | 102 ：<br>USB 基本类型 | C : 48  | 6    |     |      |
|      |      | 103 ：<br>增强型      | R : 64  | 8    |     |      |
|      |      | 105/107：<br>互联型   | V : 100 | B    |     |      |
|      |      |                   | Z : 144 | C    |     |      |
|      |      |                   |         | D    |     |      |
|      |      |                   |         | E    |     |      |

***

### 参考资料
1. https://jiangxiekeji.com/
2. STM32F10xxx Reference manual  



