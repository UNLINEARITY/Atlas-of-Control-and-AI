---
{"dg-publish":true,"dg-path":"计算机/C++/C++基础.md","permalink":"/计算机/C++/C++基础/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-06-28T16:29:43.000+08:00","updated":"2025-11-17T10:04:53.543+08:00"}
---


### 最简单的 C++程序

```C++
#include<iostream>
using namespace std;
int main()
{
	cout<<"This is a C++ program.\n";
	
	return 0;
}
```

- `#include<iostream>`  预处理，引入头文件 header file，[[输入输出流\|输入输出流]]
- `using namespace std;`  使用[[命名空间\|命名空间]] std 标准库
- `int main()`  主函数，C++ 要求主函数为 int 型
- `return 0;` 向操作系统返回 0 

   
### 一、C++的输入输出
[[输入输出流\|输入输出流]]

#### 1. 标准输出 cout
` cout `  输出流对象
` << `   原为左移运算符，现在还可作为输出信息的 **插入运算符**
 
#### 2. 标准输入 cin 
` cin  `   输入流对象
` >> `   原为右移运算符，现在还可作为输入信息的 **提取运算符**
从输入设备取得数据，并送到输入流 `cin` 中


### 二、函数相关扩展
#### 1. 函数原型声明
C++ 中：函数调用前**必须对所调用的函数作函数原型声明**，在编译时只检查参数类型，不检查参数名

```C++
//  函数类型 函数名(参数表)；

int max(int x,int y);
int max(int,int);
```

#### 2. 函数重载
C++中允许在同一作用域中用**同一函数名**定义**多个函数**（这些函数的**参数个数**或**参数类型**不相同）

```C++
int max(int a,int b)
{
	if(a>b) return a;
	else return b; 
}

int max(int a,int b, int c)   // 参数个数不同
{
	if(b>a) a=b;
	if(c>a) a=c;
	return a;
}

float max(float a,float b, float c) // 参数类型不同
{
	if(b>a) a=b;
	if(c>a) a=c;
	return a;
}

int a,b,c;
float d,e,f;
cin>>a>>b>>c;
cin>>d>>e>>f;

cout<<max(a,b)<<endl;
cout<<max(a,b,c)<<endl;
cout<<max(d,e,f)<<endl;
```


#### 3. 函数模板
(terminology::**Function Template**)  
对函数重载进一步简化：建立一个通用函数，使用虚拟类型代替函数的类型和形参的类型

```C++
template<typename T>  // or   template<class T>
template<typename T1, typename T2> // 设置多个虚拟类型

T max(T a,T b,T c)
{
	if(b>a) a=b;
	if(c>a) a=c;
	return a;
}

int x1=1,x2=2,x3=3;
float y1=0.9,y2=10.1,y3=1.9;
double z1=41.78,z2=90.89,z3=10.80;
cout<<max(x1,x2,x3)<<endl;
cout<<max(y1,y2,y3)<<endl;
cout<<max(z1,z2,z3)<<endl;
```


#### 4. 有默认参数的函数
C++可以在函数声明时给形参默认值，就不一定要和实参一一对应，注意函数实参和形参的结合是从左到右进行的，指定的默认形参必须**放到形参的最右端**

一个函数不能既作为重载函数，又作为有默认参数的函数（存在二义性，系统无法执行）

```C++
float area(float r=7.5); // 声明时 给定默认值
area();  // 调用时，可以无需指定

void f1(float a,int b=9,double c=90.8,char d='c'); 
f1(2); f1(2,5); f1(2,4,7) ; f1(2,5,7.9,'g'); // 都是正确的
```

#### 5. 内置函数 inline 
在编译时将所调用函数的代码嵌入主调函数中，提高一定的执行效率、节省运行时间（但是增加了目标程序的长度，比较适用于**规模很小且使用频繁**的函数）

在定义函数时，在函数类型前加上 `inline`  关键字

```C++
inline int max(int a,int b)
{
	if(a>b) return a;
	else return b; 
}
```



### 三、常变量定义
在 C 语言中，使用 ` #define `  来定义符号常量，但是实际上只是在预编译时进行字符替换：预编译后不再有定义的标识符，不是变量、没有类型、不占用存储单元、容易出错

```C
int a=1;b=2;
#define PI 3.14159 
#define R a+b
cout<< PI*R*R << endl;   
// 实际为 3.14159*a+b*a+b 出现错误！
```

C++中，使用 `const` 定义常变量：具有变量的属性，有数据类型，占用存储单元，有地址，有指针指向，只是程序运行期间变量的值是固定的、不能改变

```C++
const float PI= 3.14159;
```

### 四、变量引用
(terminology::**reference**)  alias    `&` 引用声明符
对一个变量的引用的所有操作，实际上都是对原来变量的操作
引用不是独立的变量或数据类型，建立引用时**必须与某一种类型的数据相联系**、指定代表哪个变量，**只有声明、没有定义、不分配存储单元**

核心作用：利用引用作为函数参数，以扩充函数传递数据的功能 

```C++
int a;
int &b=a;  // 使得 b 成为 a 的引用/别名
int &c=b;  // 此时 b c 都是 a 的引用，一个变量可以有多个引用;但是一个引用不能对应多个变量
// int &d; 错误，未指定变量
// float x;  int &y=x; 错误，类型不匹配
```

```C++
int i=3,j=5;

// 变量名作为形参
void swap(int a,int b)
{
	int temp;
	temp=a;
	a=b;
	b=temp;
}
swap(i,j);
cout<<i<<' '<<j<<endl;  // 3 5  未交换
```


传递变量的[[指针\|指针]]

```C++
// 传递变量的指针
void swap(int *p1,int *p2)
{
	int temp;
	temp=*p1;
	*p1=*p2;
	*p2=temp;
}
swap(i,j);
cout<<i<<' '<<j<<endl;  // 5 3  实现交换
```

传递变量的别名，将变量的引用作为函数形参

```C++
// 变量的引用作为形参
void swap(int &a,int &b)
{
	int temp;
	temp=a;
	a=b;
	b=temp;
}
swap(i,j);
cout<<i<<' '<<j<<endl;  // 5 3  实现交换
```

### 五、作用域运算符
[[命名空间\|命名空间]]


### 字符串类 String
```C++ 
#include<string>   // 引入  头文件
string str1;       // 声明string变量
string str2="Hello!"; // 声明时，直接赋值
string str3[4]={"hello","I love","C++","yes"} // 声明字符串数组并初始化

str1=str2;            // 字符串变量相互赋值； 复制

cin>>str1;   // 直接输入给字符串变量
cout<<str2;  // 直接输出字符串变量

str1[0]="h";    // 对字符索引，直接操作


```



### 动态分配与撤销内存
C 语言中使用库函数 malloc 分配、free 撤销内存


