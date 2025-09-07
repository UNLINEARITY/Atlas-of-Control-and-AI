---
{"tags":["Preipheral"],"dg-publish":true,"dg-path":"MCU微控制器/STM32/DMA.md","permalink":"/MCU微控制器/STM32/DMA/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:26.364+08:00","updated":"2025-08-28T21:53:12.587+08:00"}
---


(terminology::**Direct Memory Access**)     直接[[存储器\|存储器]]存取
DMA 可以提供**外设和存储器**或者**存储器和存储器**之间的高速数据传输
协助 [[CPU\|CPU]]实现数据转运（无须 CPU 干预，节省了 CPU 的资源）

STM32 可拥有 12 个独立可配置的通道
每个通道都支持**软件触发**和特定的**硬件触发**
- DMA1（7 个通道） 
- DMA2（5 个通道）

>[!important] 注意
>STM32F103C8T6 仅有 DMA1 资源
>两种触发方式的选择：
>存储器到存储器一般选用软件触发
> [[STM32片上外设\|外设]]到存储器一般选用硬件触发，不同的外设有不同的硬件触发源
>

### 框图

![Pasted image 20240804175209.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240804175209.png)


总线矩阵的左端为主动单元，拥有存储器的访问权
左端为被动单元，只能被主动单元读写

内核 CPU
- DCode 专门访问 Flash
- 系统总线访问其他外设
DMA 转运数据，也为主动单元
各个通道可以设置转运数据的源地址和目的地址

由于 DMA 总线只有一条
所有通道只能分时复用 DMA 总线
如果产生冲突，由仲裁器 Arbiter 根据优先级分配启用顺序

AHB 从设备，作为 DMA 的被动单元部分，也在 AHB 总线上
CPU 通过此来对 DMA 进行配置

外设通过DMA 请求，硬件触发 DMA 进行数据转运

### 基本结构
![Pasted image 20240805004624.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240805004624.png)

**起始地址**
- 外设起始地址
- 存储器起始地址
**数据宽度**
- 字节 Byte    8
- 半字 HalfWord  16
- 字 Word   32  
如果数据宽度不匹配，会自动进行数据对齐
低位到高位，缺失的高位部分会自动写 0
高位到低位，多出来的高位部分会被舍弃

**地址是否自增** 
如果自增，每次转运后自动移到下一个地址
一般存储器设置自增，外设寄存器不设置自增

如果想要实现存储器到存储器数据的转运，
可以让存储器先放到外设，再从外设运到存储器

**传输计数器**
实质上为一个自减[[计数器\|计数器]]，可以设置转运数据的次数
计数器记为 0 时，自增的地址会回到起始地址，方便新一轮的转运

**自动重装器**
给传输计数器重新赋值

**M2M   Memory to Memory** 
设置转运的触发方式
-  ` 1 `  软件触发
	适合存储器到存储器的转运
	实质上是连续触发，尽快将传输计数器清零，无需等待硬件响应
	不能和循环模式（自动重装器）一起使用
-  ` 2 `  硬件触发 
	与外设有关的转运

开关控制 ENABLE 使能时，传输计数器的值一定要大于零，且有触发转换信号，才能使得 DMA 开始转换

注意在开关控制 DISABLE 时要对传输计数器写值，再打开
不能在 DMA 开启的时候对传输计数器写值

![DMA1映像.png](../img/user/Functional%20files/Photo%20Resources/DMA1%E6%98%A0%E5%83%8F.png)

### DMA 使用
![Pasted image 20240805011737.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240805011737.png)

配合 [[STM32 ADC#规则组的转换模式\|ADC扫描模式]]
- 外设地址不自增
- 存储器地址自增

### 配置流程
[[RCC\|RCC]] 开启时钟
DMA 初始化
开关控制使能

```C 
void DMA_DeInit(DMA_Channel_TypeDef* DMAy_Channelx);
void DMA_Init(DMA_Channel_TypeDef* DMAy_Channelx, DMA_InitTypeDef* DMA_InitStruct);
void DMA_StructInit(DMA_InitTypeDef* DMA_InitStruct);
void DMA_Cmd(DMA_Channel_TypeDef* DMAy_Channelx, FunctionalState NewState);
void DMA_ITConfig(DMA_Channel_TypeDef* DMAy_Channelx, uint32_t DMA_IT, FunctionalState NewState);



void DMA_SetCurrDataCounter(DMA_Channel_TypeDef* DMAy_Channelx, uint16_t DataNumber); //给传输计数器写入数据

uint16_t DMA_GetCurrDataCounter(DMA_Channel_TypeDef* DMAy_Channelx);//DMA获取当前数据寄存器，返回传输计数器的值


FlagStatus DMA_GetFlagStatus(uint32_t DMAy_FLAG);//获取标志位状态
void DMA_ClearFlag(uint32_t DMAy_FLAG);//清除标志位
ITStatus DMA_GetITStatus(uint32_t DMAy_IT);//获取中断状态
void DMA_ClearITPendingBit(uint32_t DMAy_IT);//清除中断挂起位
```







