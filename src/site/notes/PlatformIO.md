---
{"dg-publish":true,"dg-path":"计算机/PlatformIO.md","permalink":"/计算机/PlatformIO/","dgPassFrontmatter":true,"noteIcon":"","dg-note-properties":{}}
---


(website::https://platformio.org/) [[VSCode\|VSCode]]


```
/home/nonlinear/.platformio/penv/bin/pio run -e motion_control -t upload --upload-port /dev/ttyUSB0

/home/nonlinear/.platformio/penv/bin/pio run -e motion_control -t erase --upload-port /dev/ttyUSB0
```
### Basic 
PlatformIO project consists of 3 main items:
-  `lib` - put here project specific (private) libraries
-  `src` - put your source files in this folder
-  `platformio.ini` - project configuration file


PlatformIO Project Configuration File:
- `Generic options` - development platforms, boards, frameworks
- `Build options` - build flags, source filter, extra scripting
- `Upload options` - custom port, speed and extra flags
- `Library options` - dependencies, extra library storages


`Ctrl+Alt+S`    open monitor
`monitor_speed = 115200 `    in `platformio.ini`

### Linux  USB permission 
```
sudo chmod 666 /dev/ttyUSBx   // grant permission temporarily 

sudo usermod -a -G dialout $USER
sudo usermod -a -G plugdev $USER   // grant permission permanently
// need restart your system 

```


### Unable to init 
Network error 
`pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple`
`pip config list`

python globle source

### 报错显示库文件缺失
```
lib_ldf_mode=deep+
```

![Pasted image 20241118201130.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020241118201130.png)


