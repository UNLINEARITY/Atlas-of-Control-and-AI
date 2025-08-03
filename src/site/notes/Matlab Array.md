---
{"dg-publish":true,"dg-path":"编程语言/Matlab Array.md","permalink":"/编程语言/Matlab Array/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-08-02T10:36:28.413+08:00","updated":"2025-08-03T10:59:25.717+08:00"}
---


All MATLAB variables are _arrays_. So, each numeric variable can contain multiple numbers. You can store related data in one variable by using an array.      所有的变量都是[[数组\|数组]]

Because arrays are a basic programming tool in the MATLAB language, it's important to get to know them and the terminology used to describe them.

![Functional files/Photo Resources/Pasted image 20250718005356.png](/img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020250718005356.png)
### 标量  scalar 
In MATLAB, a single number, called a _scalar_, is represented by a 1-by-1 array, meaning the array contains one row and one column.

### 向量 vector
#### 1. 直接列写
When you separate numbers by using spaces , MATLAB combines the numbers into a _row vector_, which is an array with one row and multiple columns (1-by-_n_). 

When you separate numbers by using semicolons, MATLAB creates a _column vector_ (_n_-by-1).

#### 2. ：运算符
`y=Start : Spaceing : End`

知道**步长**
For long vectors, entering individual numbers is not practical. An alternative, shorthand method for creating evenly spaced vectors is to use the colon operator (`:`) and specify only the start and end values.
the `:` operator uses a default spacing of `1`. However, you can specify a different spacing.
#### 3. linspace
`y=linspace(first,last,number_of_elements)`
知道**数字的个数**
If you know the number of elements you want in a vector (instead of the spacing between each element), you can use the  `linspace`     function.  
Note the use of commas (`,`) to separate inputs to the `linspace` function.

#### 向量转置
Transpose `x` from a row vector to a column vector using the transpose operator `'`.   

>[!note] 注意
>Both `linspace` and the `:` operator create row vectors. 都产生行向量
>如果要生成列向量，可以转置  `x=x'`
>


```MATLAB
x=[3 5]  
x=[3;5]

y=20 : 2 :26   determine the size of an existing matrix
rand(size(x))   x=2
y=data(:,2)  %% 提取所有行的第二列


```

特殊关键字 `end`   行或列的最后一个索引

use only one index with a matrix, MATLAB traverses down each column in order.  如果对一个矩阵只给一个参数进行索引，则从左到右遍历列

