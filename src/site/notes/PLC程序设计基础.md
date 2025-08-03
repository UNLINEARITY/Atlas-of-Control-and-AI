---
{"dg-publish":true,"dg-path":"A4- 过程控制系统/PLC/PLC程序设计基础.md","permalink":"/A4- 过程控制系统/PLC/PLC程序设计基础/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:28.428+08:00","updated":"2025-08-03T10:59:26.120+08:00"}
---



基本环境：CCW 
主要语言：梯形图（Ladder Diagram，LD）
软件编程：双击图标，设置与硬件的映射关系
### 基本数据类型
BOOL 布尔值
DATE  日期
INT  整型   $2^{16}$
**DINT** 双整型  $2^{32}$
UINT 无符号整型
REAL 实数浮点型
STRING  字符串
TIME 时间
### 基本元件
左母线-->右母线，程序顺序循环执行，相当于编程语言中 `while`，按 rung 梯级从上到下执行，不断循环

![Functional files/Photo Resources/Pasted image 20241228130131.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020241228130131.png)

Direct Contact 
Reverse Contact 

### 常用功能指令块 Instruction Block
时序图应该关注：信号、高低电平、上升沿、下降沿
#### 定时器
![Functional files/Photo Resources/Pasted image 20241211104346.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020241211104346.png)

`T # 3s  `   表示 T = 3s 

==TON==  开通延时定时器
- IN：输入信号，Q：输出信号
- PT：programing time，虚水平线表示常数
- ET：elapse time   经过的时间  
IN 的上升沿使得 ET 开始累加，下降沿使得 ET 直接清零；当 ET 到达 PT 水平线时，输出Q 为高电平，其余时刻都为低电平。

==TOF==  关断延时定时器
IN 的下降沿使得 ET 开始累加，上升沿使得 ET 直接清零
当 ET 为高电平时（到达 PT 水平线），Q 为低电平，其余时刻都为高电平。


==比较指令块== ：数据进行比较

==ANY_TO_==  数据转换：  例如ANY_TO_REAL 将任何数据转换为 REAL 类型

==MOV==   直接传送: 实现赋值，将一个变量分配给另一个


==CTU==  向上计数器，对输入信号的上升沿进行计数
- PV   Preset Value  预设值
- CV  Current Value  当前计数值
CV 和 PV 值进行比较，如果 CV>= PV，计数器输出高电平

`CTUD` 向下向上计数器

数据进行移位操作，例如有数据：1111 1001
==ROL==  左循环移位：向左循环移动指定的位数，一端移出的位会从另一端重新移入  1111 0011
==ROR==  右循环移位：向右循环移动指定的位数，一端移出的位会从另一端重新移入  1111 0011
==SHL==   左移：移出的位被丢弃，而空出的低位则补零 1111 0010
==SHR==   右移：移出的位被丢弃，而空出的低位则补零


MOD 除法余数
POW 实数指数幂
`*`  乘法
Neg 取反
### 用户自定义功能块
相当于编程语言中的子程序/函数

方向设置
输入：VarInput 
输出：VarOutput 


### SFC 顺序功能流程图
(terminology::**Sequential Function Chart**)
用于描述控制系统中顺序控制过程的图形化编程语言

#### 基本结构
- **步（Step）**：代表系统的一个稳定状态，每个步都有相应的动作或任务。步用矩形框表示，框内可以填写步的编号或名称。
- **转换（Transition）**：用于表示从一个步到另一个步的切换条件。转换用有向线段连接两个步，在线段上用短横线表示转换条件，转换条件可以是时间、外部输入信号或内部逻辑条件。
- **动作（Action）**：与每个步相关联，描述在该步执行期间需要完成的操作。动作通常写在步的矩形框旁边

SFC 程序按照步的顺序依次执行。当某个步的前一个步满足转换条件时，系统会自动切换到该步，并执行与该步相关联的动作。一旦该步的转换条件满足，又会触发下一个步的执行，如此循环，直到整个顺序控制过程结束。

![Functional files/Photo Resources/Pasted image 20241229124253.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020241229124253.png)

#### 主要类型
**单序列**：最基本的 SFC 结构，由一系列相继激活的步组成，每个步后面只有一个转换，每个转换后面只有一个步。
**选择序列**：在某个步之后有多个分支，根据不同的转换条件选择其中一个分支执行。
**并行序列**：可以同时激活多个分支，各分支同时执行，当所有分支都完成后，再进行下一步。

#### 绘制规则
- 步与步之间必须用转换隔开，转换与转换之间必须用步隔开。
- 初始步是系统开始运行时的第一步，一般用双线框表示，一个 SFC 程序必须有且只有一个初始步。
- 有向线段表示步的执行顺序，从上到下或从左到右绘制，正常情况下不允许出现交叉。



### PLC 编程语言
PLC 支持多种编程语言，
- **梯形图（Ladder Diagram, LD）**：最常用的编程语言，模拟电气继电器逻辑，易于电气工程师理解和使用。
- **顺序功能流程图（Sequential Function Chart，SFC）**：描述顺序控制过程的图形化语言，过步、转换和动作等元素清晰地展示系统的工作流程。
- **结构化文本（Structured Text, ST）**：类似于高级编程语言，适用于复杂的算法和数据处理任务。
- **~~功能块图（Function Block Diagram, FBD）~~**：~~使用图形化的功能块来表示控制逻辑，适合复杂的控制任务。~~
- **~~指令列表（Instruction List, IL）~~**：~~类似于汇编语言，适合于需要精确控制和优化程序性能的场合。--

 