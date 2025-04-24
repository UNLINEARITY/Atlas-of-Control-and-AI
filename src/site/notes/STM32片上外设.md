---
{"dg-publish":true,"dg-path":"MCU微控制器/STM32/STM32片上外设.md","tags":["Preipheral"],"permalink":"/MCU微控制器/STM32/STM32片上外设/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-07-22T07:55:45.000+08:00","updated":"2025-04-22T16:50:43.000+08:00"}
---

(terminology::**Preipheral**)

### 共同代码
#### 初始化
一般都是 RCC 开启时钟，GPIO 初始化，然后再为特定外设的初始化
外设基本代码：都是使用[[结构体\|结构体]]初始化。

定义结构体、给结构体赋值、将结构体地址传递
```C
//封装的代码
void Preipheral_DeInit(void);
void Preipheral_Init(Preipheral_InitTypeDef* Preipheral_InitStruct);
void Preipheral_StructInit(Preipheral_InitTypeDef* Preipheral_InitStruct);
```

```C
//实际操作
Preipheral_InitTypeDef Preipheral_InitStruct ; //定义结构体
Preipheral_InitStruct.member1= ; 
Preipheral_InitStruct.member2= ; 
//...  引出结构体的成员，进行赋值
Preipheral_Init(&Preipheral_InitStruct); //将结构体的地址传入，进行初始化
```

#### 状态标志位
状态标志位，在状态寄存器中
```C
FlagStatus Preipheral_GetFlagStatus(USART_TypeDef* USARTx, uint16_t USART_FLAG);

void Preipheral_ClearFlag(USART_TypeDef* USARTx, uint16_t USART_FLAG);

ITStatus Preipheral_GetITStatus(USART_TypeDef* USARTx, uint16_t USART_IT);

void Preipheral_ClearITPendingBit(USART_TypeDef* USARTx, uint16_t USART_IT);
```

#### 中断配置
[[NVIC\|NVIC]]


### 说明
>[!important] 注意
>调用初始化函数，将结构体地址传入函数时，就写入到硬件的寄存器中了
>所以可以直接更改值继续使用，初始化其他外设

```C
Preipheral_InitTypeDef Preipheral_InitStruct;
Preipheral_InitStruct.member1=x1;
Preipheral_InitStruct.member2=y1;
Preipheral1_Init(&Preipheral_InitStruct);

Preipheral_InitTypeDef Preipheral_InitStruct;
Preipheral_InitStruct.member1=x2;
Preipheral_InitStruct.member2=y2;
Preipheral2_Init(&Preipheral_InitStruct);
```

