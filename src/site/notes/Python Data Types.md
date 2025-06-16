---
{"dg-publish":true,"dg-path":"编程语言/Python/Python Data Types.md","permalink":"/编程语言/Python/Python Data Types/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-04-16T13:01:27.467+08:00","updated":"2025-06-14T22:04:23.841+08:00"}
---


> When thinking about a problem, part of the solution is often choosing the right data type. Knowing what each data type is capable of will make it much easier to pick the right one. 

`Variable `: A variable is used to store information that can be referenced later on.

### Data Types 
`type()`
- Basic Data Types : store a single value
- Advanced Data Yypes : can store many items
[[Python Basic Data Types\|Python Basic Data Types]]
[[Python Comprehensions\|Python Comprehensions]]


|          | 类型                | 可变性       | 可迭代      | 类型构造函数      |
| -------- | ----------------- | --------- | -------- | ----------- |
| Basic    | Integer           | immutable |          | `int()`     |
| Basic    | Float             | immutable |          | `float()`   |
| Basic    | Boolean           | immutable |          | `bool()`    |
| Basic    | Complex numbers   | immutable |          | `complex()` |
| Basic    | [[String\|String]]        | immutable | Iterable | `str()`     |
| Advanced | [[Range\|Range]]         | immutable | Iterable | `range()`   |
| Advanced | [[Tuple\|Tuple]] 元组      | immutable | Iterable | `tuple()`   |
| Advanced | [[List\|List]]  列表      | mutable   | Iterable | `list()`    |
| Advanced | [[Set\|Set]]  集合       | mutable   | Iterable | `set()`     |
| Advanced | [[Dictionary\|Dictionary]] 字典 | mutable   | Iterable | `dict()`    |


- mutable  **可变**:  可以在原地修改其内容，不需要创建新对象
- immutable  **不可变** :  一旦创建，内容 (值或内部元素) 不能被修改，如果尝试“修改”，实际上会创建一个新对象。
**变量名只是一个标签**，**不可变对象的值本身永远不会变**，当重新赋值时，不是改变了对象，而是指向了新的对象。

对于不变对象来说，调用对象自身的任意方法，也不会改变该对象自身的内容。相反，这些方法会创建新的对象并返回，这样，就保证了不可变对象本身永远是不可变的。
### Iterator 
**Iterable**  **可迭代对象**     An object that implements another special method, called `__iter__`. This function returns an iterator.
是数据的容器，可以通过 `for` 循环遍历（但不能自己遍历，需要迭代器）。 
实现了 `__iter__()` 方法（返回一个迭代器）

**Iterator**  **迭代器**   An object that can be iterated, meaning we can keep asking it for a new element until there are no elements left. Elements are requested using a method called `__next__`.

可以记住遍历位置的对象。它用于逐个访问可迭代对象中的元素。
实现了 `__next__()` 方法 （返回下一个元素，没有元素时抛出 `StopIteration`）
实现了 `__iter__()` 方法（返回自身，使得迭代器本身也是可迭代的）

```python
# 可迭代对象：字符串
s = "hi"
for char in s:  # 这里偷偷生成了一个迭代器
    print(char)  # 输出 h, i

# 自己手动用迭代器
nums = [1, 2, 3]
iterator = iter(nums)  # 找一个"翻书的人"
print(next(iterator))  # 1（翻一页）
print(next(iterator))  # 2（再翻一页）
```

### 注意
Python 支持多种数据类型，在计算机内部，可以把任何数据都看成一个“对象”，而变量就是在程序中用来指向这些数据对象的，对变量赋值就是把数据和变量给关联起来。

对变量赋值 `x = y` 是把变量 `x` 指向真正的对象，该对象是变量 `y` 所指向的。随后对变量 `y` 的赋值_不影响_变量 `x` 的指向。

```python  
a = 'ABC'
b = a
a = 'XYZ'
print(b) 
>>> ABC
```

注意上面的 `b=a` 真正含义是 b 指向了 a 指向的数据 `ABC`，之后再改变 a 的值，不会影响 b 的值

