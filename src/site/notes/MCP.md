---
{"dg-publish":true,"dg-path":"人工智能/MCP.md","permalink":"/人工智能/MCP/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-03-15T22:48:10.000+08:00","updated":"2025-10-21T16:37:09.000+08:00"}
---

(terminology::**Model Context Protocol**)  模型上下文协议  
> 本质是客户端调用命令行，调用了电脑上的 node. js 程序

由 Anthropic 提出的一种开放协议，旨在通过标准化接口实现[[大语言模型\|大语言模型]]（LLM）与外部数据源和工具的无缝集成。MCP 的设计初衷是解决 AI 模型在运行时与外部世界（如文件、数据库、API、工具）之间的**数据孤岛问题**，使模型能够通过协议获取更丰富、更动态的上下文，从而生成**更准确、上下文相关**的响应。


### MCP Server 
MCP 协议的实现主体，本质是一个本地运行的轻量级程序（ [[Node.js\|Node.js]] 或 [[Python\|Python]] 程序，类似于 Function Call ），负责暴露特定的数据源或工具功能，并通过标准化协议与客户端交互：
1. **封装数据源或工具**（如 GitHub、浏览器、时间服务器等）
2. **提供标准接口**（按照 MCP 协议规范）
3. **通过 JSON-RPC 与客户端通信**
**运行方式**：通过命令行调用（ `npx` 或 `python -m`）启动
#### 1. 前置准备
#### node. js
在运行 Node.js 实现的 MCP Server 前，确保本地环境已安装并配置：
```
node -v   # 查看 Node.js 版本
npx -v    # 查看 npx 版本
```
#### python 
```
pip install 
```

#### 2. MCP Server 通用格式
每个 MCP Server 都通过 `command` 和 `args` 定义启动命令及参数，客户端通过 MCP 协议与之交互。
```
{
  "mcpServers": {
  
    "mcpServer1": {
      "command": "cmd",
      "args": ["/c","npx","-y","<mcpServer1_name>"],
    }, 
    
    "mcpServer2": {
      "command": "python",
      "args": ["-m", "<mcpServer2_name>","<parameter>"]
    },
    
  }
}
```

### 实际示例
```
{
  "mcpServers": {
    "github": {
      "command": "cmd",
      "args": ["/c","npx","-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "<Your Actual token>"  }
    },
    
    "filesystem": {
        "command": "cmd",
        "args": ["/c","npx","-y", "@modelcontextprotocol/server-filesystem",
          "<Your Actual File Path>"]
    },

    "sequential-thinking": {
      "command":"cmd",
      "args": [ "/c","npx","-y", "@modelcontextprotocol/server-sequential-thinking"]
    },

    "browser-tools-mcp": {
      "command": "cmd",
      "args": ["/c","npx","-y","@agentdeskai/browser-tools-mcp@1.2.0"]
  },

    "time": {
      "command": "python",
      "args": ["-m", "mcp_server_time","<Your Timezone>"]
    }
  }
}
```
### 参考资料
- (website::https://modelcontextprotocol.io/) 
- (website::https://github.com/modelcontextprotocol/servers)
- (website::https://smithery.ai/)
- (website::https://github.com/AgentDeskAI/browser-tools-mcp)
- (website:: [MCP简易介绍视频](https://www.bilibili.com/video/BV1AnQNYxEsy/))
- (website:: [MCP A2A](https://www.bilibili.com/video/BV1XFhPzoEBx/))

