---
{"tags":["Programming"],"dg-path":"编程语言/JSON.md","dg-publish":true,"permalink":"/编程语言/JSON/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-10-10T18:32:42.000+08:00","updated":"2025-10-10T10:34:20.000+08:00"}
---


(terminology::**JavaScript Object Notation**)

> 是一种轻量级、灵活强大的**数据交换格式**。

JSON 由 [[Javascript\|JavaScript]] 的对象表示法演变而来，但它是一种独立的语言格式，不仅限于 JavaScript，几乎所有的编程语言都支持解析和生成 JSON。

JSON 格式易于人阅读和编写，同时也易于机器解析和生成。它通常用于服务器和客户端之间的数据传递，同时也广泛用于配置文件和嵌入式系统中。它的简单性和跨平台特性使其成为现代 Web 开发中不可或缺的一部分。

### 基本结构

JSON 格式主要有两种结构：包括**对象**和**数组**

#### 1. 对象（Object）
对象在 JSON 中以花括号 `{}` 包裹，表示为一组无序的键值对（key-value pairs）。
- 键名（key）必须是字符串，用双引号 `" "` 包裹
- 键值（value）可以是字符串、数字、数组、布尔值、null 或另一个对象。

示例：（这个 JSON 对象包含五个键值对，其中 `location` 的值是另一个嵌套的对象）

```json
{
	"name": "Temperature Sensor",
	"model": "TX-100",
	"isActive": true,
	"batteryLevel": 87,
	"location": {
		"latitude": 40.7128,
		"longitude": -74.0060
	}
}
```

#### 2. 数组（Array）

数组在 JSON 中以方括号 `[]` 包裹，表示为一组有序的值。
数组的值可以是任意类型，包括字符串、数字、对象、数组、布尔值或 null。示例：

```JSON
[
  "temperature",
  "humidity",
  "pressure",
  "altitude"
]
```


### 数据类型

JSON 支持以下数据类型：

1. **字符串（String）**：用双引号 `""` 包裹的字符序列，可以包含转义字符（如 `\n` 表示换行，`\t` 表示制表符）。

   ```json
   "name": "Temperature Sensor"
   ```

2. **数值（Number）**：可以是整数或浮点数，不需要引号。

   ```json
   "batteryLevel": 87
   ```

3. **布尔值（Boolean）**：值只能是 `true` 或 `false`，用于表示布尔状态。

   ```json
   "isActive": true
   ```

4. **空值（null）**：表示空值或不存在的值。

   ```json
   "lastUpdate": null
   ```

5. **对象（Object）**：用于包含嵌套的键值对数据。由键值对构成的复合结构。

   ```json
   "location": {
     "latitude": 40.7128,
     "longitude": -74.0060
   }
   ```

6. **数组（Array）**：用于包含一组数据，可以是任何类型的值。由有序值构成的列表。

   ```json
   "readings": [22.5, 23.1, 21.8]
   ```


### JSON 语法规则
JSON 的主要规则：

- **键必须是字符串**，用双引号 `""` 包裹，不能使用单引号 `'`。
- **值**可以是字符串、数值、布尔值、数组、对象或 `null`。
- **不允许**有额外的逗号（尤其是结尾处）。
- JSON 结构可以嵌套，即对象内部可以包含对象或数组，数组内部也可以包含对象或数组。

**合法示例**：
```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "user": {
      "id": 123,
      "name": "Alice",
      "isActive": true
    },
    "items": [
      {
        "id": 1,
        "name": "Item1"
      },
      {
        "id": 2,
        "name": "Item2"
      }
    ]
  }
}
```


以下是一个 JSON 格式的示例，它表示了一个包含用户信息和购物清单的对象：在这个示例中，`user` 是一个对象，包含了用户的姓名、电子邮件和年龄。`shoppingList` 是一个数组，包含了一系列的字符串，表示购物清单上的物品。

```json
{
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "age": 25
  },
  "shoppingList": [
    "bread",
    "milk",
    "cheese"
  ]
}
```

### JSON 特点与常见应用

#### 1. 特点
- **轻量级**：JSON 结构简单，没有冗余的标记，使得数据体积较小。
- **可读性**：格式清晰，易于阅读和编写。
- **跨平台**：JSON 是文本格式，可以在不同的操作系统和编程语言之间传输。
- **语言无关**：虽然基于 JavaScript，但 JSON 是独立于语言的，几乎所有的编程语言都有解析和生成 JSON 数据的能力。

#### 2. 常见应用
JSON 广泛应用于 Web 服务和 API 中，作为客户端和服务器之间数据交换的格式。例如，Web 应用程序可以通过 JSON 发送和接收数据，而不需要依赖于 XML 或其他格式。此外，JSON 也常用于配置文件、数据存储和缓存等场景。

- **配置文件**：JSON 常用于存储配置信息，例如数据库连接信息、用户设置等。
- **API 数据交换**：客户端和服务器之间常通过 JSON 格式的数据交换。
- **数据序列化**：将复杂的数据结构（如对象）序列化为 JSON 格式以便于传输和存储。

