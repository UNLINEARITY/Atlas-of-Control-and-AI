---
{"dg-publish":true,"dg-path":"计算机/Python/List.md","permalink":"/计算机/Python/List/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-05-21T15:20:27.860+08:00","updated":"2025-11-17T10:04:53.543+08:00"}
---


The list is not just a list but can also be used as a stack or a queue.

`[ ]`    create lists with block quotes 
Its contents are objects of whatever type you like, separated by commas
can access the individual elements

数组只能包含一种数据类型，list 可以包含不同的数据类型

### 对 List 的操作
#### Creat  
```python
list()
l1=[1,2,[True,'str'],{'name':'non'}]

l1=[0] * 4  # 初始化一个长度为4的list
l2=[]
```


#### Index 
```python
my_list=[1,2,3]
my_list[1]  # 2 
my_list[-1]  # 3 the last element   
my_list[-2]  # 2 the 2nd last element


l1=[1,2,[4,5]]
l1[2]  # [4,5]
l1[2][1]  # 5 

l1[0]=400  #l1= [400 ,2,[4,5]]
```

```python
a = [3, 5, 7, 9]

# 判断元素是否在list中，并得到索引
x = 7  # 查找元素
if x in a:
    idx = a.index(x)
    print(f"{x} 在索引位置 {idx}")
else:
    print(f"{x} 不在列表中")
    
    
# 得到所有索引
a = [3, 5, 7, 5, 9, 5]
x = 5
idx_list = [i for i, val in enumerate(a) if val == x]
print(idx_list)  # [1, 3, 5]
```

#### Loop Over 
```python
my_list = [1, 2, 3, 4, 5]
for n in my_list:
	print(n)
```

#### Add
```python
my_list = [1, 2] 
my_list.append('a')  # [1, 2, 'a']

l1 = [1, 2]
l2 = [3, 4]
l3 = l1 + l2   # [1, 2, 3, 4]

l1.extend(l2)
#  l1  [1, 2, 3, 4]
#  l2  [3, 4]
```

#### Remove 
`pop() ` method removes and returns value ：移除指定索引的元素，并返回该元素的值, 未指定参数时，默认弹出最后一个元素
`del` removes it without returning anything：移除特定索引的元素（不会返回值）
`remove()`  remove a specific value : 移除特定值的元素
`clear()`   remove all items : 清除所有的元素 
使用 [[set\|Set]]  移除重复的元素 

```python
my_list = [1, 2, 3, 4, 5] 
my_list.pop()   #  5 
# my_list =[1, 2, 3, 4] 

my_list.pop(0)  # 1 
# my_list =[2, 3, 4] 

my_list = [1, 2, 3, 4, 5]
del my_list[0]
#  my_list   [2, 3, 4, 5]

my_list = [1, 2, 3, 2, 5]
my_list.remove(2)  # [1, 3, 2, 5]
my_list.remove(2)  # [1, 3, 5]

my_list.clear()  # []


my_list = [1, 2, 2,2, 3, 5] 
list(set(my_list))  # [1, 2, 3, 5]
```
#### Sort 
[[Python 常用操作#sorted ()\|Python 常用操作#sorted ()]]

`list.sort()`    **在原数组上排序（修改原数组）**  不会返回任何值！！！是对原数组的操作
`list_sorted= sorted(list)`  返回新 list，而不修改原 list
默认升序排列，均可设置 `reverse=True`   降序排列

```python 
my_list = [10, 2, 5, 4, 2] 
my_list.sort() 
my_list  # [2, 2, 4, 5, 10] 

my_list.sort(reverse=True)
my_list  #  [10, 5, 4, 2, 2] 
sorted(my_list)  # [2, 2, 4, 5, 10]

sheep_sorted = sorted(sheep, reverse=True)
```


#### Slicing 
```
my_list[start:stop:step]
```

- `start` is the first element position **to include**
- `stop` is exclusive, meaning that the element at position `stop` won’t be included.
- `step` is the step size. more on this later.
- `start`, `stop`, and `step` are all optional.
- Negative values can be used too. 

```python 
my_list = [1, 2, 3, 4, 5, 6, 7, 8] 
my_list[0:3]   # [1, 2, 3] 
my_list[:3]    # [1, 2, 3] 
my_list[4:]    # [5, 6, 7, 8]
my_list[::2]   # [1, 3, 5, 7]
my_list[-1:-3:-1]  # [8,7]
```

#### Reverse 
```
lst = [1, 2, 3, 4] 
lst.reverse() 
lst  # [4, 3, 2, 1] 

lst[::-1]  # [4, 3, 2, 1] 
lst  # [1, 2, 3, 4]  

rev = reversed(lst)  # [4, 3, 2, 1] 
```

