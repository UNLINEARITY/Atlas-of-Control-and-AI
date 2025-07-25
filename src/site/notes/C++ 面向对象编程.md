---
{"dg-publish":true,"dg-path":"编程语言/C++/C++ 面向对象编程.md","aliases":["类","对象"],"permalink":"/编程语言/C++/C++ 面向对象编程/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-07-17T17:05:46.000+08:00","updated":"2025-07-18T11:42:00.299+08:00"}
---


通用思想：[[面向对象编程\|面向对象编程]]

C++中对象的类型称为类 Class ，类是对象的抽象、对象是类的具体实例
- **类**是对象的抽象、对象的模板：只是抽象的类型，不占用储存空间
- **对象**是类的具体实例 (instance)：具体存在，占用储存空间

### 类的声明
[[C++\|C++]] 中类的声明与[[结构体\|结构体]]相似，由结构体发展而来, 允许使用关键字 `struct`  和 `class`  声明类
- 类头： 关键字 `class` 和类名
- 类体：`{ }` 包裹，类体中为成员表

成员访问限定符：member access specifier 
- ` private ` ： 私有（未进行成员限定声明时  `class` 默认使用）
- ` public `   ： 公用（未进行成员限定声明时  `struct` 默认使用）
- ` protected `  ：受保护

```C++
class className  // class head 
{
	private:
		DataType1 var1;
		DataType2 var2; // 
	public:
		DataType FuncName(varList)
			{
				FunctionBody;
			}
	// class body  
	// class member list
};
```


#### 1. 先声明类，再定义对象

```C++
class Student 
{
	private:
		int num;
		char name[20];
		char sex;
	public:
		void display()
		{
			cout<<num<<' name:'<<name<<' sex:'<<sex<<endl;
		}
};

Student st1,st2;
```

#### 2. 在声明类的同时定义对象
```C++
class Student 
{
	private:
		int num;
		char name[20];
		char sex;
	public:
		void display()
		{
			cout<<num<<' name:'<<name<<' sex:'<<sex<<endl;
		}
}st1,st2;
```

### 类的成员函数
一般而言，类的成员函数要注意调用的权限
- 工具函数：支持类中其他成员的操作，不给用户调用，设置为 ` private `
- 对外接口函数：被外界调用、给用户使用的函数，设置为 ` public `  
#### 1. 类外定义成员函数


#### 2. 内置成员函数
[[C++基础#内置函数\|C++基础#内置函数]]
