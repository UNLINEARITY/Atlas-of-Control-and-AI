---
{"tags":["Preipheral"],"dg-publish":true,"dg-path":"MCU微控制器/STM32/STM32 ADC.md","permalink":"/MCU微控制器/STM32/STM32 ADC/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:28.462+08:00","updated":"2025-08-02T10:36:28.462+08:00"}
---


STM32 内置的ADC [[STM32片上外设\|外设资源]]： **逐次逼近型**[[ADC#逐次比较型\|ADC]]
**性能指标：**
- 分辨率：12 位，对应转换结果范围：0~4095  $2^{16}$
- 转换时间：1us 
**输入电压范围**：0~3.3V
**18 个输入通道**
- 16 个外部输入通道
	STM32 最多可能的数目，实际资源要看说明书
	例如：STM32F103C8T6 ADC 资源：ADC1、ADC2，10 个外部输入通道
- 2 个内部信号源输入
	内部温度传感器（读取 CPU 温度）
	内部参考电压（1.2V 左右的基准电压，不随外部供电电压变化）

**两个转换单元**
属于ADC 的增强功能，可以一次性启动一个组，转换多个值
- 规则组，常规使用
	可以同时转化 16 个通道，但是规则通道数据寄存器只能储存一个结果
	如果不想被覆盖，可以借助 [[DMA\|DMA]] 转运数据
- 注入组，突发事件
	同时转化 4 个通道，对应数据寄存器也能存放 4 个通道的数据

**模拟看门狗**
自动监测输入电压范围，可以设置阈值，使用模拟[[WDG\|看门狗]]在一定的条件下执行特定的操作，当达到阈值时，自动申请中断，在中断函数中执行相应的操作

![Pasted image 20240731115749.png](/img/user/Photo%20Resources/Pasted%20image%2020240731115749.png)

$V_{REF_{+}}\quad V_{REF_{-}}$   决定 ADC 输入电压的范围
$V_{DDA} \quad V_{SSA}$    ADC 的供电引脚
一般情况下 $V_{REF_{+}}=V_{DDA}$   $V_{REF_{-}}=V_{SSA}$

触发 ADC 开始转换的信号（相当于 ADC0809 的 START 启动转换信号）
- 软件触发
- 硬件触发，主要来源于 [[TIM\|TIM]] 定时器
	可以利用定时器中断更新事件，在中断函数中处理（但是频繁中断干简单的事情浪费资源）
	也可以利用 TRGO 定时器触发，[[硬件自动化\|硬件自动化]]处理

ADCCLK 来源于 ADC 预分频器，也就是来源于 [[RCC#RCC 时钟树\|RCC]]
只能选择 6 分频 $\dfrac{72}{6}=12MHz$ 和 8 分频 $\dfrac{72}{8}=9MHz$

转换结束后，信号可以进入 [[NVIC\|NVIC]] 中申请中断
![Pasted image 20240731122759.png](/img/user/Photo%20Resources/Pasted%20image%2020240731122759.png)

### STM32 中 ADC 的基础介绍
#### 输入通道
参考引脚定义图
注意结合具体芯片具体看，[[STM32F103C8T6\|STM32F103C8T6]]
ADC1 和 ADC2 的外部输入引脚都相同，实质上可以配置[[双 ADC 模式\|双 ADC 模式]]

| 通道   | ADC1   | ADC2 | ADC3 |
| ---- | ------ | ---- | ---- |
| **通道0**  | **PA0**    | **PA0**  | PA0  |
| **通道1**  | **PA1**    | **PA1**  | PA1  |
| **通道2**  | **PA2**    | **PA2**  | PA2  |
| **通道3**  | **PA3**    | **PA3**  | PA3  |
| **通道4**  | **PA4**    | **PA4**  | PF6  |
| **通道5**  | **PA5**    | **PA5**  | PF7  |
| **通道6**  | **PA6**    | **PA6**  | PF8  |
| **通道7**  | **PA7**    | **PA7**  | PF9  |
| **通道8**  | **PB0**    | **PB0**  | PF10 |
| **通道9**  | **PB1**    | **PB1**  |      |
| **通道10** | **PC0**    | **PC0**  | PC0  |
| 通道11 | PC1    | PC1  | PC1  |
| 通道12 | PC2    | PC2  | PC2  |
| 通道13 | PC3    | PC3  | PC3  |
| 通道14 | PC4    | PC4  |      |
| 通道15 | PC5    | PC5  |      |
| 通道16 | 温度传感器  |      |      |
| 通道17 | 内部参考电压 |      |      |
#### 规则组的转换模式
两个参数，四种组合
- 单次转换：每次启动转换都需要触发转换信号
- 连续转换：上一次的转换结束信号 EOC 可以触发转换，连续测量

- 非扫描模式：只能使用一个通道
- 扫描模式：可以使用组，设置转换通道的数目

|       | 单次转换              | 连续转换              |
| ----- | ----------------- | ----------------- |
| 非扫描模式 | 单次转换<br>非扫描模式<br> | 连续转换<br>非扫描模式<br> |
| 扫描模式  | 单次转换<br>扫描模式<br>  | 连续转换<br>扫描模式<br>  |

#### 数据对齐

#### 转换时间
[[ADC#一般工作过程\|ADC步骤]]
TCONV = 采样时间 + 12.5个ADC周期

#### 校准
ADC有一个内置自校准模式。校准可大幅减小因内部电容器组的变化而造成的准精度误差。校准期间，在每个电容器上都会计算出一个误差修正码(数字值)，这个码用于消除在随后的转换中每个电容器上产生的误差
建议在每次上电后执行一次校准
启动校准前， ADC必须处于关电状态超过至少两个ADC时钟周期



### 库函数
#### rcc . h
```C
void RCC_ADCCLKConfig(uint32_t RCC_PCLK2);//开启ADC时钟
```

#### adc. h
```C
//通用配置
void ADC_DeInit(ADC_TypeDef* ADCx);
void ADC_Init(ADC_TypeDef* ADCx, ADC_InitTypeDef* ADC_InitStruct);
void ADC_StructInit(ADC_InitTypeDef* ADC_InitStruct);
void ADC_Cmd(ADC_TypeDef* ADCx, FunctionalState NewState);
void ADC_DMACmd(ADC_TypeDef* ADCx, FunctionalState NewState);
void ADC_ITConfig(ADC_TypeDef* ADCx, uint16_t ADC_IT, FunctionalState NewState);


//校准函数
void ADC_ResetCalibration(ADC_TypeDef* ADCx);  //复位校准
FlagStatus ADC_GetResetCalibrationStatus(ADC_TypeDef* ADCx);//获取复位校准状态
void ADC_StartCalibration(ADC_TypeDef* ADCx);//开始校准
FlagStatus ADC_GetCalibrationStatus(ADC_TypeDef* ADCx);//获取开始校准状态


//软件启动
void ADC_SoftwareStartConvCmd(ADC_TypeDef* ADCx, FunctionalState NewState); //软件启动转换

//规则组配置
void ADC_RegularChannelConfig(ADC_TypeDef* ADCx, uint8_t ADC_Channel, uint8_t Rank, uint8_t ADC_SampleTime);


uint16_t ADC_GetConversionValue(ADC_TypeDef* ADCx); //获取ADC数据寄存器的值，读取转换的结果

//模拟看门狗
void ADC_AnalogWatchdogCmd(ADC_TypeDef* ADCx, uint32_t ADC_AnalogWatchdog);  //启动
void ADC_AnalogWatchdogThresholdsConfig(ADC_TypeDef* ADCx, uint16_t HighThreshold, uint16_t LowThreshold); //设置阈值
void ADC_AnalogWatchdogSingleChannelConfig(ADC_TypeDef* ADCx, uint8_t ADC_Channel); //看门通道

void ADC_TempSensorVrefintCmd(FunctionalState NewState);//开启内部 温度传感器、内部参考电压两个通道


//通用
FlagStatus ADC_GetFlagStatus(ADC_TypeDef* ADCx, uint8_t ADC_FLAG);//获取标志位
void ADC_ClearFlag(ADC_TypeDef* ADCx, uint8_t ADC_FLAG);//清除标志位
ITStatus ADC_GetITStatus(ADC_TypeDef* ADCx, uint16_t ADC_IT);//获取中断状态
void ADC_ClearITPendingBit(ADC_TypeDef* ADCx, uint16_t ADC_IT);//清除中断挂起位
```


### 实际配置
注意 GPIO 口要配置为 [[GPIO#模拟输入\|模拟输入]]模式

