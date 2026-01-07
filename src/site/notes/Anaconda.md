---
{"dg-publish":true,"dg-path":"计算机/Anaconda.md","permalink":"/计算机/Anaconda/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-01-23T15:16:11.460+08:00","updated":"2025-12-26T14:33:29.837+08:00"}
---


[[Python\|Python]]
### Linux 
```
conda env list  // 查看有那些环境
```

启动 base 环境
```
conda activate base
conda list -n 环境名  // 某个特定环境的详细信息
```

取消自动激活环境
```
conda config --set auto_activate_base false
```


| 功能     | 命令                                     | 示例                                           | 说明                 |
| ------ | -------------------------------------- | -------------------------------------------- | ------------------ |
| 创建环境   | `conda create -n 环境名 python=版本`        | `conda create -n deepseek python=3.12 -y`    | 创建新环境并指定 Python 版本 |
| 查看所有环境 | `conda env list` 或 `conda info --envs` | —                                            | 带星号的为当前激活环境        |
| 激活环境   | `conda activate 环境名`                   | `conda activate deepseek`                    | 进入某个环境             |
| 退出环境   | `conda deactivate`                     | —                                            | 回到 base 环境         |
| 删除环境   | `conda remove -n 环境名 --all`            | `conda remove -n deepseek --all`             | 删除整个环境             |
| 克隆环境   | `conda create -n 新环境名 --clone 旧环境名`    | `conda create -n deepseek2 --clone deepseek` | 快速复制环境             |
| 导出环境   | `conda env export > environment.yml`   | —                                            | 导出依赖文件（跨平台部署常用）    |
| 导入环境   | `conda env create -f environment.yml`  | —                                            | 根据 yml 文件重建环境      |


```Bash
# 添加清华源
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --set show_channel_urls yes
```

### windows 
miniconda:https://www.anaconda.com/docs/getting-started/miniconda/install#quickstart-install-instructions 


install 
 ```shell 
Invoke-WebRequest -Uri "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe" -outfile ".\miniconda.exe"
Start-Process -FilePath ".\miniconda.exe" -ArgumentList "/S" -Wait
del .\miniconda.exe
 ```

在这种模式下：
1. Miniconda **默认不会**：
    - 把 `conda` 加入系统 PATH
    - 自动执行 `conda init`
2. 因此 PowerShell 找不到 `conda` 可执行文件：
    `conda : 无法将“conda”项识别为 cmdlet`


 **Miniconda 本身已经正确安装完成了**，可以查看你版本号
```shell 
C:\Users\unlin\miniconda3\Scripts\conda.exe --version
```


conda 自带的初始化流程，shell 集成、激活机制
```shell 
C:\Users\unlin\miniconda3\Scripts\conda. exe init powershell
```

此时会，每次打开终端，都会自动进入 conda ， 这个 hook 的**默认策略是**：
- PowerShell 启动
- conda hook 加载
- **自动激活 base 环境**

```shell 
conda config --set auto_activate_base false 
```


```
conda config --show
conda config --show envs_dirs
conda config --show pkgs_dirs

conda config --add envs_dirs E:\conda\envs
conda config --add pkgs_dirs E:\conda\pkgs
E:\conda\
├─ envs\        # 所有虚拟环境
├─ pkgs\        # 包缓存
└─ cache\       # 预留
```

base 环境不要动
- **不要试图移动 base**
- base 永远跟 conda 安装目录绑定
- 所有“工作环境”都用新建 env 

VS Code 选解释器时，选 `D:\conda\envs\xxx\python.exe`



