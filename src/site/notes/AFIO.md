---
{"dg-publish":true,"dg-path":"MCU微控制器/STM32/AFIO.md","permalink":"/MCU微控制器/STM32/AFIO/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:26.360+08:00","updated":"2025-08-02T10:36:26.360+08:00"}
---

复用功能输入/输出: (terminology::**Alternate Function I/O**)

允许用户配置 [[GPIO\|GPIO]] 引脚的复用功能

主要用于引脚复用功能的选择和重定义
在STM32中，AFIO主要完成两个任务：复用功能引脚重映射、中断引脚选择
[[STM32F103C8T6\|STM32F103C8T6]]

```C
RCC_APB2PeriphClockCmd(RCC_APB2Periph_AFIO,ENABLE); //开启APB2的时钟   


GPIO_PinRemapConfig(GPIO_PartialRemap1_TIM2, ENABLE); // TIM2部分重映射模式1，PA15映射为TIM2_CH1

GPIO_PinRemapConfig(GPIO_Remap_SWJ_JTAGDisable , ENABLE); //将默认串口调试端口变为GPIO 普通引脚
```

注意如果端口主功能为 **调试端口**
需要将端口先变为普通端口再进行重映射 

### 引脚定义图
![STM32F103C8T6引脚定义.png](/img/user/Photo%20Resources/STM32F103C8T6%E5%BC%95%E8%84%9A%E5%AE%9A%E4%B9%89.png)

### GPIO. h
```C
//复位 AFIO外设，调用此函数，将AFIO的配置全部清除
void GPIO_AFIODeInit(void);
```

```C
void GPIO_PinRemapConfig(uint32_t GPIO_Remap, FunctionalState NewState);  //引脚重映射
```



[[STM32中断系统\|STM32中断系统]]：
```C
void GPIO_EXTILineConfig(uint8_t GPIO_PortSource, uint8_t GPIO_PinSource); // 外部中断选择，配置数据选择器来选择想要的中断引脚
```


```C
//配置事件输出功能   （一般使用的不多）
void GPIO_EventOutputConfig(uint8_t GPIO_PortSource, uint8_t GPIO_PinSource);
void GPIO_EventOutputCmd(FunctionalState NewState);
```


```C
void GPIO_ETH_MediaInterfaceConfig(uint32_t GPIO_ETH_MediaInterface);  //以太网设备
```

