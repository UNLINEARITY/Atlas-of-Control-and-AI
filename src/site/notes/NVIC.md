---
{"tags":["Preipheral"],"dg-publish":true,"dg-path":"MCU微控制器/STM32/NVIC.md","permalink":"/MCU微控制器/STM32/NVIC/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:28.422+08:00","updated":"2025-08-28T21:53:12.736+08:00"}
---

(terminology::**Nested Vectored Interrupt Controller**)  **嵌套向量中断控制器**  

是 STM32 微控制器中用于管理[[中断\|中断]]、分配中断优先级的 [[STM32片上外设\|内核外设]]
它负责处理来自内核和片上所有外设的**中断请求**，包括可屏蔽中断和非屏蔽中断

中断向量表：向量地址，相当于中断程序的跳板
使用 NVIC 统一管理中断，每个中断通道都拥有 16 个可编程的优先等级，可对优先级进行分组，进一步设置抢占优先级和响应优先级

![Pasted image 20240716180800.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240716180800.png)

一个外设可能占据多个中断通道
NVIC 只有一个输出口，根据中断优先级分配中断的先后顺序

NVIC 的中断优先级由优先级寄存器的 4 位（0~15）决定，这 4 位可以进行切分，分为高 n 位的抢占优先级和低 4-n 位的响应优先级

值越小，优先级越高
- **响应优先级高**的可以优先排队
	排队时，紧急程度较高，排在前面
	**subpriority**
	
- **抢占优先级高**的可以中断嵌套
	正在执行中断程序时，**抢占优先级高的中断**可以中断当前的中断
	**pre-emption priority**
	
响应优先级、抢占优先级均相同的按中断号排队


|分组方式|抢占优先级|响应优先级|
|---|---|---|
|分组 0|0 位，取值为 0|4 位，取值为 0~15|
|分组 1|1 位，取值为 0~1|3 位，取值为 0~7|
|分组 2|2 位，取值为 0~3|2 位，取值为 0~3|
|分组 3|3 位，取值为 0~7|1 位，取值为 0~1|
|分组 4|4 位，取值为 0~15|0 位，取值为 0|

### 一般配置
```C
USART_ITConfig(外设Preipheral, 外设的标志位 ,ENABLE);
NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);

NVIC_InitTypeDef NVIC_InitStruct;
NVIC_InitStruct.NVIC_IRQChannel= ; // 查询对应外设的中断通道
NVIC_InitStruct.NVIC_IRQChannelCmd=ENABLE;
NVIC_InitStruct.NVIC_IRQChannelPreemptionPriority=1; //设置
NVIC_InitStruct.NVIC_IRQChannelSubPriority=1; //设置
NVIC_Init(&NVIC_InitStruct);
```
### misc. h
（Miscellaneous Control Register  杂项控制位的寄存器）

```C
//**基本配置、通用配置**

void NVIC_PriorityGroupConfig(uint32_t NVIC_PriorityGroup);
//中断分组,注意整个芯片只能使用一种分组方式
//要么模块化编程时，所有分组一致；要么直接放在主程序，编译一次。无特殊要求或结构简单  NVIC_PriorityGroup可以随便取

void NVIC_Init(NVIC_InitTypeDef* NVIC_InitStruct);//结构体初始化
//**特殊配置**
void NVIC_SetVectorTable(uint32_t NVIC_VectTab, uint32_t Offset);//设置中断向量表

void NVIC_SystemLPConfig(uint8_t LowPowerMode, FunctionalState NewState);  //系统低功耗配置

void SysTick_CLKSourceConfig(uint32_t SysTick_CLKSource);
```

**IRQn**     Interrupt Request -n  中断请求的缩写
它代表了中断源的编号。STM32 的中断系统允许多个中断源被管理，每个中断源都通过一个唯一的中断号（IRQn）来识别。
### 中断函数
每个外设中断函数名称都是固定的，在启动文件 `tartup_stm32f10x_md. s` 中查找。`xxx_IRQHandler`
模块化编程时：在 `.C` 中设置中断函数，在 `.h` 文件中无需额外声明（系统自动调用）

一般中断函数中，都有中断标志位的判断
注意判断完标志位，执行中断函数中的操作时，要清除标志位（一般不会硬件自动清除，即使可以硬件自动清除，也可以软件手动设置清除）

### 配置中断通用流程
先配置 EXTI、TIM、ADC、USART、SPI、I2C、RTC 等多个外设
最后外部中断信号通过 NVIC 进入到 CPU 中
CPU 受到中断信号，跳转到中断函数中执行中断程序

### 中断编程建议
在中断函数里，不要编写耗时过长的代码
中断函数要简短迅速（处理突发事件）
最好不要在中断函数和主函数调用相同的函数
或者操作同一个硬件
可以使用变量或者标志位作为接口，减少代码之间耦合性，让部分代码相互独立
### 实际例子
[[EXTI\|EXTI]]
[[TIM 定时中断\|TIM 定时中断]]

### 配置中断通用流程
先配置 EXTI、TIM、ADC、USART、SPI、I2C、RTC 等多个外设
最后外部中断信号通过 NVIC 进入到 CPU 中
CPU 受到中断信号，跳转到中断函数中执行中断程序
### 中断函数
每个外设中断函数名称都是固定的 
在启动文件 `tartup_stm32f10x_md. s` 中查找

模块化编程在 `.C` 中设置中断函数
在 `.h` 文件中无需额外声明（系统自动调用）

一般中断函数中，都有中断标志位的判断
注意判断完标志位，执行中断函数中的操作时，要清除标志位

### 实际例子
[[EXTI\|EXTI]]
[[TIM 定时中断\|TIM 定时中断]]

