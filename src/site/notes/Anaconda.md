---
{"dg-publish":true,"dg-path":"计算机/Anaconda.md","permalink":"/计算机/Anaconda/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-01-23T15:16:11.460+08:00","updated":"2025-11-19T18:14:51.523+08:00"}
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

