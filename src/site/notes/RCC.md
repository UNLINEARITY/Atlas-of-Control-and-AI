---
{"tags":["Preipheral"],"dg-publish":true,"dg-path":"MCU微控制器/STM32/RCC.md","permalink":"/MCU微控制器/STM32/RCC/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:28.457+08:00","updated":"2025-08-02T10:36:28.457+08:00"}
---

(terminology::**Reset and Clock Control**)
复位和时钟控制、管理内核外的外设

### RCC . h 
开启外设时钟
```C
//最常使用的三个函数
//   (总线外设Periph，ENABLE/DISABLE)

void RCC_AHBPeriphClockCmd (uint32_t RCC_AHBPeriph, FunctionalState NewState);
//Enables or disables the AHB peripheral clock.
void RCC_APB2PeriphClockCmd (uint32_t RCC_APB2Periph, FunctionalState NewState);
//Enables or disables the High Speed APB (APB2) peripheral clock.
void RCC_APB1PeriphClockCmd (uint32_t RCC_APB1Periph, FunctionalState NewState);
//Enables or disables the Low Speed APB (APB1) peripheral clock.
```

可以按位或，开启多个外设时钟
### RCC 时钟树
RCC 产生时钟并将配置好的时钟发送到各个外设的系统
时钟是所有外设运行的基础，所以也应该是最先要配置好的东西
`SystemInit( )`

![Pasted image 20240718232416.png](/img/user/Photo%20Resources/Pasted%20image%2020240718232416.png)

#### 1. 时钟产生电路
##### 基本原理
###### 基本
首先启动内部时钟，暂时以 8MHz 的时钟运行
然后再启动外部时钟，8MHz 时钟信号进入 PLLMUL 锁相环进行倍频
倍频 9 倍得到 72MHz，等到锁相环输出稳定后，选择锁相环输出作为系统时钟

如果外部晶振出现问题，系统时钟就无法切换到 72MHz ，就只能以 8MHz 运行

CSS（Clock Security System）时钟安全系统，负责切换时钟
可以检测外部时钟的运行状态，一旦外部时钟失效，就会自动切换为内部时钟，保证时钟运行，防止程序卡死出现事故

##### 时钟源
- 内部 8MHz 高速 RC 振荡器

- 外部 4-16MHz 高速石英振荡器
	一般接 8MHz 晶振
	外部晶振比内部RC 振荡器更加稳定

>[!note] 注意
>两个高速晶振来提供系统时钟
> AHB、APB1、APB2 的时钟都来源于此
> 
>外部晶振比内部 RC 振荡器更加稳定，一般使用外部晶振
>如果系统简单，也不需要很精确的时钟，也可使用内部 RC 振荡电路

- 外部 32.768KHz 低速晶振
	给 [[RTC\|RTC]]  提供时钟
	
- 40KHz 低速 RC 振荡器
	给看门狗提供时钟  [[IWDG\|IWDG]]

#### 2. 时钟分配电路
首先系统时钟 72MHz 进入到 AHB 总线
`SystemInit()` 配置 AHB 总线中预分频器的分频系数

##### 2.1. APB1 总线
APB1 外设总线有预分频器（系统默认初始化分频系数为 2），总线时钟最大为 $\dfrac{72}{2}=36MHz$

但是 APB1 分出一条支路给定时器 [[TIM\|TIM]]
- 如果分频系数为 1，保持频率不变
- 如果分频系数为其他值，频率乘 2
	默认情况给到定时器的时钟还是 72MHz 

##### 2.2. APB2总线
APB1 外设总线有预分频器（系统默认初始化分频系数为 1）
分出一条支路给定时器TIM 的时钟频率也为 72MHz 

>[!note] 注意
>APB1 与 APB2 都有外设时钟使能 Clock Enable 信号与时钟输出相==与==
>所以要软件上 `RCC_APB2PeriphClockCmd`   `RCC_APB1PeriphClockCmd`
### CSS  时钟安全系统
**Clock Security System**  
负责切换时钟

