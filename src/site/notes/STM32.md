---
{"dg-publish":true,"dg-path":"MCU微控制器/STM32/STM32.md","dg-pinned":true,"tags":["Subject"],"permalink":"/MCU微控制器/STM32/STM32/","pinned":true,"dgPassFrontmatter":true,"noteIcon":"","created":"2024-05-21T15:20:27.000+08:00","updated":"2025-04-22T16:50:52.000+08:00"}
---

(terminology::**STM32 MCU**)
基于 [[ARM\|ARM]]  Cortex-M 开发的 32 位的[[微控制器\|微控制器]]
[[STM32基础\|STM32基础]]
[[STM32F103C8T6\|STM32F103C8T6]]
编程语言： [[STM32-C\|STM32-C]]
核心部分： [[STM32片上外设\|STM32片上外设]]
实际应用：[[STM32程序设计\|STM32程序设计]]


### STM32 片上外设

| 英文                 | 名称            |     | 英文               | 名称        |
| ------------------ | ------------- | --- | ---------------- | --------- |
| [[NVIC\|NVIC]]     | **嵌套向量中断控制器** |     | [[USB\|USB]]     | USB 通信     |
| SysTick            | 系统滴答定时器       |     | [[USART\|USART]] | 同步/异步串口通信 |
| [[RCC\|RCC]]       | 复位和时钟控制       |     | [[I2C\|I2C]]     | I2C 通信     |
| [[GPIO\|GPIO]]     | 通用 IO 口         |     | [[SPI\|SPI]]     | SPI 通信     |
| [[AFIO\|AFIO]]     | 复用 IO 口         |     | [[CAN\|CAN]]     | CAN 通信     |
| [[EXTI\|EXTI]]     | 外部中断          |     | PWR              | 电源控制      |
| [[TIM\|TIM]]       | **定时器**       |     | BKP              | 备份寄存器     |
| [[STM32 ADC\|ADC]] | 模数转换器         |     | [[IWDG\|IWDG]]   | 独立看门狗     |
| DAC                | 数模转换器         |     | [[WWDG\|WWDG]]         | 窗口看门狗     |
| [[DMA\|DMA]]            | 直接内存访问        |     | SDIO             | SD 卡接口     |
| [[RTC\|RTC]]       | 实时时钟          |     | FSMC             | 可变静态存储控制器 |
| CRC                | CRC 校验         |     | USB OTG          | USB 主机接口   |

***
### 参考资料
1. https://jiangxiekeji.com/
2. STM32F10xxx Reference manual  

