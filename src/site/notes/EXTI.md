---
{"dg-publish":true,"dg-path":"MCU微控制器/STM32/EXTI.md","permalink":"/MCU微控制器/STM32/EXTI/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:26.000+08:00","updated":"2025-09-12T12:47:26.000+08:00"}
---

(terminology::**Extern Interrupt**)   外部中断
EXTI 可以监测指定 [[GPIO\|GPIO]] 口的电平信号，当其指定的 GPIO 口产生电平变化时，EXTI 将立即向 NVIC 发出中断申请，经过 NVIC 裁决后即可中断 CPU 主程序，使 CPU 执行 EXTI 对应的中断程序

支持的[[触发方式\|触发方式]]：上升沿/下降沿/双边沿/软件触发
支持的 GPIO 口：所有 GPIO 口，**但相同的 Pin 不能同时触发中断**
通道数：16 个 GPIO_Pin，外加 PVD 输出、RTC 闹钟、USB 唤醒、以太网唤醒

触发响应方式：中断响应/事件响应
- 中断响应：正常的中断流程，中断信号通向 CPU
- 事件响应：不会触发 CPU 的中断，而是触发其他外设操作，属于外设之间的联合工作

![Pasted image 20240716212859.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240716212859.png)


[[AFIO \|AFIO ]] 中断引脚选择模块，实际上是一个[[数据选择器\|数据选择器]]
在所有 GPIO 外设中选择一个 GPIO 连接到之后的 EXTI 通道（相同的 Pin 不能同时触发中断的原因）

GPIO 的 16 个端口与 4 个蹭网的外设并列接入 EXTI 电路
经过 EXTI 电路后分为两种输出

- 接到 NVIC 来触发中断
	注意 20 个中断输入，并没有 20 个中断输出
	ST 公司将外部中断 5~9、10~15 分别作为中断
	EXTI9_5、EXTI15_10 触发同一个中断函数
	在这两个中断函数中，要再根据标志位来区分从哪一个中断口进入中断函数中
	
- 接到其他外设来触发事件响应
	20 条输出


![Pasted image 20240716220251.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240716220251.png)


屏蔽寄存器与输入的中断信号相与，相当于开关控制
当屏蔽寄存器写 0 时，输出为 0，相当于屏蔽了中断

使用外部中断模块的特性：外部驱动很快的突发信号

按键不推荐使用外部中断读取，不好处理按键抖动和松手检测，可以在主程序中循环读取，也可使用定时器中断读取

```C
void EXTI_DeInit(void);  //将EXTI配置都清除
void EXTI_Init(EXTI_InitTypeDef* EXTI_InitStruct);  //结构体配置EXTI 外设
void EXTI_StructInit(EXTI_InitTypeDef* EXTI_InitStruct); //将传递的结构体变量赋默认的值

void EXTI_GenerateSWInterrupt(uint32_t EXTI_Line);
//软件触发外部中断

//在主程序中
FlagStatus EXTI_GetFlagStatus(uint32_t EXTI_Line); //查看指定标志位是否置1
void EXTI_ClearFlag(uint32_t EXTI_Line);  //对置1的标志位清除

//在中断函数中
ITStatus EXTI_GetITStatus(uint32_t EXTI_Line); //在中断函数中查看标志位 是否置1
void EXTI_ClearITPendingBit(uint32_t EXTI_Line);  //清除挂起中断标志位

//四个函数本质上都是读写状态寄存器
```

```C
typedef enum
{
  EXTI_Trigger_Rising = 0x08,
  EXTI_Trigger_Falling = 0x0C,  
  EXTI_Trigger_Rising_Falling = 0x10
}EXTITrigger_TypeDef;
```

### 实际中断的配置流程
配置 [[RCC\|RCC]]，将涉及到的外设的时钟都打开（EXTI、NVIC 外设时钟一直保持打开，无需开启）
- NVIC 属于内核外设，内核外设都不需要打开时钟
- EXTI 虽然为单独的外设，但是由于诸多因素的考量以及电路上的设计，没有相应的时钟控制位，无需开启

配置 [[GPIO\|GPIO]]，选择输入模式
配置 [[AFIO\|AFIO]]，选择使用的 GPIO 连接到之后的 EXTI
配置 [[EXTI\|EXTI]]，选择边沿触发方式（上升沿/下降沿/双边沿/软件触发），及触发响应方式（事件响应/中断响应）
配置 [[NVIC\|NVIC]]，为中断选择合适的优先级


