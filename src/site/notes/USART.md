---
{"tags":["Preipheral"],"dg-publish":true,"dg-path":"MCU微控制器/STM32/USART.md","permalink":"/MCU微控制器/STM32/USART/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-09-17T11:36:41.299+08:00","updated":"2025-08-03T10:59:27.052+08:00"}
---


(terminology::**Universal Synchronous/Asynchronous Receiver/Transmitter**)
USART 是 STM32 内部集成的硬件外设，通用同步/异步收发器，
可根据数据寄存器的一个字节数据自动生成数据帧时序，从 TX 引脚发送出去；也可自动接收 RX 引脚的数据帧时序，拼接为一个字节数据，存放在数据寄存器里。

主要还是使用异步通信，等同于 [[UART\|UART]]，同步通信只是可以输出时钟信号，不能读取，不能进行两个单片机的同步通信。
### 基本配置
[[STM32F103C8T6\|STM32F103C8T6]] 拥有的 USART 资源：
USART1（APB2）、USART2（APB1）、USART3（APB1）
#### 基本使用
- 自带波特率发生器，本质上为分频器，最高达 4.5Mbits/s
- 可配置数据位长度（8/9）
- 停止位长度（0.5/1/1.5/2）
- 可选校验位（无校验/奇校验/偶校验）
一般选用参数：波特率 9600/115200，数据位 8 位，停止位 1 位，无校验
都可在结构体里配置。

#### 扩展使用
- 支持同步模式：多输出一个时钟信号 CLK
- 支持硬件流控制：在硬件电路上会多出一根线，在接收设备接收完成后给出反馈信号，发送设备才会发送新数据
- 支持 [[DMA\|DMA]] 转运数据
- 兼容其他协议：智能卡、IrDA、LIN

### 结构框图
引脚图见 [[STM32F103C8T6\|STM32F103C8T6]]

![Functional files/Photo Resources/Pasted image 20240811174444.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240811174444.png)

#### 基础功能
程序上共用地址 DR ，实际在物理上分为两个独立的寄存器：
- 发送数据寄存器 TDR  
	进行写操作
	`TXE` TX Empty  发送寄存器空
- 接收数据寄存器 RDR 
	进行读操作
	`RXNE` RX Not Empty  接收寄存器非空

发送移位寄存器
接收移位寄存器 

#### 增强功能
**硬件流控制：**
nRTS  Request to Send 输出引脚
nCTS  Clear to Send  输入引脚 
n 表示低电平有效 
nCTS nRTS 交叉连接

**输出同步时钟信号**
发送寄存器每移位一次，同步时钟电平就跳变一个周期
只能输出，不能读入，
1. 可以兼容别的协议，如 SPI
2. 自适应波特率，接收设备可以测量此信号的周期，来确定波特率


**唤醒单元** Wake up unit 
实现串口挂载多设备
USART Address 来给串口分配地址，实现多个从设备的通信

**中断控制**
SR 状态寄存器的各种标志位
`TXE `  发送寄存器空
`RXNE`  接收寄存器非空
判断发送状态和接收状态的必要标志位

**波特率发生器**
分频器
APB 时钟分频，得到发送和接收的时钟
`TE=1`   发送器使能，发送部分波特率有效
`RE=1`   接收器使能，接收部分波特率有效

**采样策略**
`NE` 噪声标志位，如果采样中置为 1，则说明出现了噪声
16 位波特率采样时钟

波特率= $\dfrac{f_{PCLKn}}{16*DIV}$

### 基本结构图
![Functional files/Photo Resources/Pasted image 20240916192050.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020240916192050.png)

### 基本流程
开启时钟，将 USART、GPIO 的时钟打开
GPIO 初始化，将 TX 配置为复用输出，RX 配置为输入
配置 USART，结构体初始化
如果需要接收，配置 NVIC 中断
开关控制使能

发送数据，调用发送函数
接收数据，调用接收函数，
获取发送和接收的状态，调用获取标志位的函数

### usart. h
基本函数
```C
void USART_SendData(USART_TypeDef* USARTx, uint16_t Data);//写DR寄存器
uint16_t USART_ReceiveData(USART_TypeDef* USARTx);//读DR寄存器

FlagStatus USART_GetFlagStatus(USART_TypeDef* USARTx, uint16_t USART_FLAG);
void USART_ClearFlag(USART_TypeDef* USARTx, uint16_t USART_FLAG);
ITStatus USART_GetITStatus(USART_TypeDef* USARTx, uint16_t USART_IT);
void USART_ClearITPendingBit(USART_TypeDef* USARTx, uint16_t USART_IT);
```

还有增强功能的其他函数

### 实际应用
[[CH340 USB 转串口模块\|CH340 USB 转串口模块]]
[[数据包\|数据包]]

