---
{"dg-publish":true,"dg-path":"MCU微控制器/STM32/STM32-C语言.md","permalink":"/MCU微控制器/STM32/STM32-C语言/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-07-16T00:27:12.582+08:00","updated":"2025-05-01T23:26:33.239+08:00"}
---

[[C 语言\|C 语言]]
### 地址

**STM32 存储器映像**

| 类型      | 起始地址        | 存储器         | 用途                   |     |
| ------- | ----------- | ----------- | -------------------- | --- |
| [[ROM\|ROM]] | 0x0800 0000 | 程序存储器 Flash | 存储 C 语言编译后的程序代码      |     |
|         | 0x1FFF F000 | 系统存储器       | 存储 BootLoader，用于串口下载 |     |
|         | 0x1FFF F800 | 选项字节        | 存储一些独立于程序代码的配置参数     |     |
| [[RAM\|RAM]] | 0x2000 0000 | 运行内存 SRAM   | 存储运行过程中的临时变量         |     |
|         | 0x4000 0000 | 外设寄存器       | 存储各个外设的配置参数          |     |
|         | 0xE000 0000 | 内核外设寄存器     | 存储内核各个外设的配置参数        |     |

特定寄存器的实际地址=寄存器所在外设的起始地址+外设总表的偏移

举例：
```C
(uint32_t)&ADC1->DR
#define ADC1                  ((ADC_TypeDef *) ADC1_BASE)
#define ADC1_BASE             (APB2PERIPH_BASE + 0x2400)
#define APB2PERIPH_BASE       (PERIPH_BASE + 0x10000)
#define PERIPH_BASE           ((uint32_t)0x40000000)
```
ADC1 为结构体[[指针\|指针]]，指向 ADC1 外设的起始地址
`->` 访问结构体成员，就相当于加上一个地址偏移


### 数据类型

| 关键字                | 位数     | stdint关键字<br>（新版库函数使用） | ST关键字<br>（兼容老版本遗留）<br> |
| ------------------ | ------ | ---------------------- | ---------------------- |
| char               | 8      | int8_t                 | s8                     |
| unsigned char      | 8      | uint8_t                | u8                     |
| short              | 16     | int16_t                | s16                    |
| unsigned short     | 16     | uint16_t               | u16                    |
| **int**            | **32** | **int32_t**            | **s32**                |
| unsigned int       | 32     | uint32_t               | u32                    |
| long               | 32     |                        |                        |
| unsigned long      | 32     |                        |                        |
| long long          | 64     | int64_t                |                        |
| unsigned long long | 64     | uint64_t               |                        |
| float              | 32     |                        |                        |
| double             | 64     |                        |                        |


