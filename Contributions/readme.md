## 基础
### 1.Git
本项目是使用 Git 进行协同合作的
这有一个[面向初学者的 Git 教程](https://www.liaoxuefeng.com/wiki/896043488029600), 粗略地跟着教程上手，最快 1 个小时多一点就能实现基本操作

当然，在了解了 Git 的基本思想后，可以直接下载 [Github Desktop](https://desktop.github.com/), 免去了Git 代码的输入，功能强大，也很易于协同
### 2.Markdown
`.md` 是本网站的主题内容
语法非常简单


### 3.Wiki 的链接

-  `[[  ]]`  在双方括号中，输入你想要链接的文件，就会自动产生关联, 产生指向该文件的箭头
 
	例：`[[Markdown]]`

	![[Pasted image 20240422114329.png]]
- `[]()`   网站的链接 `[显示的文字](网站的链接)`

	例： `[Github Desktop](https://desktop.github.com/)`

	[Github Desktop](https://desktop.github.com/)
	
- `![[ ]]`  引用其他文件的内容
	- `![[ #]]`    `#` 文件后缀，引用特定的标题
	- `![[ ^]]`    `^` 文件后缀，引用特定的句子

### 4.呈现到网站上
将要呈现的文件添加到[文件夹](https://github.com/UNLINEARITY/Learn-Everything/tree/main/src/site/notes)中

将下面的代码放在添加文件的开头

```markdown
---
{"dg-publish":true,"dg-path":"所述目录/文件名.md","dg-pinned":true,"permalink":"/所述目录/文件名/","dgPassFrontmatter":true,"noteIcon":""}
---
```

- "dg-publish"
	- true 表示上传到网页上
	- false 不上传
- "dg-path"

文件在文件树上的路径，为字符串"所述目录/文件名.md"
	
- "dg-pinned"
	- true 表示固定在所述文件目录的顶层
	- false 不固定在所述文件目录的顶层
- "permalink"

