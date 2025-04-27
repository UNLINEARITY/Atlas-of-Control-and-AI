---
{"tags":["Protocol"],"dg-publish":true,"dg-path":"计算机/计算机网络/TCP.md","permalink":"/计算机/计算机网络/TCP/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-10-16T10:15:55.752+08:00","updated":"2025-04-25T18:13:59.630+08:00"}
---

>接收方驱动

面向连接的运输层协议。在不可靠 IP 网络的基础上进行可靠传输，提供可靠交付的服务。
每一条 TCP 连接只能有两个端点，点对点的全双工[[通信\|通信]]

不支持广播、多播服务，开销较大、效率低（建立有序的东西要花费代价）
TCP 报文
网络带宽的增长永远跟不上业务的需求
网络的拥塞问题

面向字节流：虽然应用程序和 TCP 一次交互一个数据块，但交互的数据仅看作无结构的字节流（可以任意断开组合）
流：流入流出进程的字节序列

不关心应用程序一次把多长的报文发送到 TCP 缓存
根据窗口值和网络拥塞程度来决定一个报文应该包含多少字节，形成 TCP 报文

### TCP 的连接
将连接作为最基本的抽象
套接字(terminology::**Socket**) = （IP 地址：端口号）
锁定互联网中特定主机的特定进程
[[Socket\|Socket]]

`TCP连接 ::= {socket1,socket2}={(IP1,port1),(IP2,port2)}`

实际用户编程使用五元组描述
`TCP连接 ::= {socket1,socket2}={(IP1,port1),(IP2,port2),protocol}`
protocol 可选：UDP、TCP 

### TCP 报文首部

$2^{4Byte}=2^{32}=4G$
最大传输大于 4GB
序号：随机数开始到
确认号：期望收到的对方的**下一个报文段的第一个数据字节的序号**（可有效实现**累积确认**）
确认号为 N，则暗含已正确收到前N-1 个数据

假设收到 1-999，1000-1999，2000-2999
则接收方发送确认：请发送第3000 位的报文（暗含接收到之前的所有数据）


#### 控制位
每一位都为 1bite
ACK：置为 1 表示确认号有效（一般不单独发送，和数据合并在一起，在通信中确认是否“确认有效”）
SYN：SYN为 1 时表示连接请求（ACK=0）或连接接受（ACK=1）
FIN：结束位，为 1 时，释放连接
#### 窗口
明确允许对方发送数据的量，窗口的值保持动态变化
 
### TCP 可靠传输实现
以字节为单位
流水线传输、滑动窗口、可靠传输

[[可靠传输\|可靠传输]]

发送窗口
接受窗口

超时重传时间（TCP 最复杂的问题之一）

加权平均往返时间

### 实际应用
[[WWW\|WWW]]、[[SMTP\|SMTP]]、[[FIP\|FIP]]


(terminology::**Transmission Control Protocol**) 传输控制协议（TCP）  
> 面向连接的可靠传输协议，提供端到端的字节流通信服务

>[!important] Description  
>前置知识：[[IP协议\|IP协议]] [[OSI模型\|OSI模型]] [[数据包交换\|数据包交换]]  

### 基本定义
TCP 是工作在[[传输层\|传输层]]的核心协议，主要特征包括：
$$
\begin{align}
\text{可靠性} &= \text{确认应答} + \text{超时重传} + \text{数据校验} \\
\text{流量控制} &= \text{滑动窗口协议} \\
\text{拥塞控制} &= \text{AIMD算法（加性增/乘性减）}
\end{align}
$$

### 一、连接管理机制
1. **三次握手建立连接**
   - SYN=1, Seq=x → SYN-ACK=1, Seq=y, Ack=x+1 → ACK=1, Ack=y+1
   - 解决历史连接问题和初始序列号同步
2. **四次挥手终止连接**
   - FIN=1 → ACK=1 → FIN=1 → ACK=1
   - 确保双方数据传输完全终止

### 二、可靠传输保障
| 机制 | 实现原理 | 数学表达 |
|---|---|---|
| 确认应答 | 接收方发送 ACK 确认包 | $ACK_n = \text{期望接收的第}n\text{字节}$ |
| 超时重传 | 动态计算 RTT（Round Trip Time） | $Timeout = \beta \times SRTT + (1-\beta) \times RTTVAR$ |
| 滑动窗口 | 动态调整发送窗口大小 | $W_{effective} = \min(W_{cong}, W_{adv})$ |

### 三、拥塞控制算法
1. **慢启动阶段**：窗口大小按指数增长  
   $$ W_{new} = W_{old} + \lfloor \frac{W_{old}}{k} \rfloor \quad (k=2) $$
2. **拥塞避免阶段**：窗口线性增长  
   $$ W_{new} = W_{old} + \frac{1}{W_{old}} $$
3. **快速重传/快速恢复**：收到 3 个重复 ACK 时触发  
   $$ W_{threshold} = \max(\frac{W_{current}}{2}, 2) $$

### 实际应用
1. **网页浏览**：HTTP/HTTPS 基于 TCP 传输
2. **文件传输**：FTP 协议使用 TCP 保证文件完整性
3. **邮件系统**：SMTP/POP3 依赖 TCP 可靠性
4. **远程登录**：SSH/Telnet 通过 TCP 保持会话

### 代码实现（Python Socket 示例）
```python
# TCP服务端
import socket
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('0.0.0.0', 8080))
server.listen(5)
while True:
    client, addr = server.accept()
    data = client.recv(1024)
    client.send(b'HTTP/1.1 200 OK\r\n\r\nHello TCP!')
    client.close()

# TCP客户端
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('127.0.0.1', 8080))
client.send(b'GET / HTTP/1.1\r\nHost: localhost\r\n\r\n')
print(client.recv(1024).decode())
client.close()
```