---
{"dg-path":"Manim/Mobjects.md","dg-publish":true,"permalink":"/Manim/Mobjects/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-10-21T22:10:29.901+08:00","updated":"2025-10-23T18:57:33.936+08:00"}
---



> **Mobjects are the basic building blocks for all manim animations**.

任何可以在屏幕上显示的对象都是 `mobject`，即使它本质上不一定是数学的。
Any object that can be displayed on the screen is a `mobject`, even if it is not necessarily mathematical in nature.  

### 一、创建和显示 Creating and displaying mobjects 

To display a mobject on the screen, call the `add()` method of the containing Scene.
To remove a mobject from the screen, simply call the `remove()` method from the containing Scene

```python
from manim import *
class CreatingMobjects(Scene):
    def construct(self):
        circle = Circle()
        self.add(circle)
        self.wait(1)
        self.remove(circle)
        self.wait(1)
```


### 二、放置  Placing mobjects
By default, mobjects are placed at the center of coordinates, or _origin_, when they are first created. They are also given some default colors.

#### 放置方法：Placing method 
`shift()`  初始化对象位置时，确认放置的位置 the Shapes scene places the mobjects by using the shift () method 

`move_to()`  将对象移动到相对于原点的位置 uses absolute units , measured relative to the `ORIGIN`

`next_to()` uses relative units , measured from the mobject passed as the first argument.

`align_to()`  as a way to determine the border to use for alignment，作为确定用于对齐的边框的一种方式

```python
# 初始位置设置
circle=Circle()
circle.shift(ORIGN/UP/DOWN/LEFT/RIGHT)
#  UP/DOWN/LEFT/RIGHT 上、下、左、右单位向量
square1=Square().move_to(UP*2)
square2=Square().next_to(circle,UP*2)
triangle=Triangle().align_to(circle, LEFT)
```

#### Module Attributes

位置常量

| Constant | definitions                                |
| -------- | ------------------------------------------ |
| `ORIGIN` | The center of the coordinate system.       |
| `UP`     | One unit step in the positive Y direction. |
| `DOWN`   | One unit step in the negative Y direction. |
| `RIGHT`  | One unit step in the positive X direction. |
| `LEFT`   | One unit step in the negative X direction. |
| `IN`     | One unit step in the negative Z direction. |
| `OUT`    | One unit step in the positive Z direction. |
| `UL`     | One step up plus one step left.            |
| `UR`     | One step up plus one step right.           |
| `DL`     | One step down plus one step left.          |
| `DR`     | One step down plus one step right.         |

|常量|值|含义|
|:--|:--|:--|
|`RIGHT`|`np.array([1, 0, 0])`|世界坐标系 +X|
|`LEFT`|`np.array([-1, 0, 0])`|世界坐标系 -X|
|`UP`|`np.array([0, 1, 0])`|世界坐标系 +Y|
|`DOWN`|`np.array([0, -1, 0])`|世界坐标系 -Y|
|`IN`|`np.array([0, 0, -1])`|世界坐标系 -Z（指向屏幕里）|
|`OUT`|`np.array([0, 0, 1])`|世界坐标系 +Z（指向屏幕外）|


### 三、改变样式 Styling mobjects
`set_stroke()`   changes the visual style of the mobject’s border  改变边界

`set_fill()`  changes the style of the interior 改变填充

`set_fill(_color=None_, opacity=None, family=True)`
- color (ParsableManimColor | None) – Fill color of the VMobject.
- opacity (float | None) – Fill opacity of the VMobject.默认情况下，大多数 mobject 具有完全透明的内部，因此必须指定 `opacity` 参数才能显示颜色。不透明度为 `1.0` 表示完全不透明，而 `0.0` 表示完全透明。
- family (bool) – If True, the fill color of all submobjects is also set.


```python
circle.set_stroke(color= COLOR, width= )  # 设置线条
circle.set_fill(COLOR, opacity= )   # 设置填充
```


| COLOR        | 支持的[[颜色\|颜色]]                           |
| ------------ | ----------------------------------- |
| `ManimColor` | Internal representation of a color. |
| `HSV`        | HSV Color Space                     |
| `RGBA`       | RGBA Color Space                    |

![Pasted image 20251022215611.png](../img/user/Functional%20files/Photo%20Resources/Pasted%20image%2020251022215611.png)

|Color Name|RGB Hex Code|Color Name|RGB Hex Code|
|---|---|---|---|
|`BLACK`|`#000000`|`BLUE`|`#58C4DD`|
|`BLUE_A`|`#C7E9F1`|`BLUE_B`|`#9CDCEB`|
|`BLUE_C`|`#58C4DD`|`BLUE_D`|`#29ABCA`|
|`BLUE_E`|`#236B8E`|`DARKER_GRAY`|`#222222`|
|`DARKER_GREY`|`#222222`|`DARK_BLUE`|`#236B8E`|
|`DARK_BROWN`|`#8B4513`|`DARK_GRAY`|`#444444`|
|`DARK_GREY`|`#444444`|`GOLD`|`#F0AC5F`|
|`GOLD_A`|`#F7C797`|`GOLD_B`|`#F9B775`|
|`GOLD_C`|`#F0AC5F`|`GOLD_D`|`#E1A158`|
|`GOLD_E`|`#C78D46`|`GRAY`|`#888888`|
|`GRAY_A`|`#DDDDDD`|`GRAY_B`|`#BBBBBB`|
|`GRAY_BROWN`|`#736357`|`GRAY_C`|`#888888`|
|`GRAY_D`|`#444444`|`GRAY_E`|`#222222`|
|`GREEN`|`#83C167`|`GREEN_A`|`#C9E2AE`|
|`GREEN_B`|`#A6CF8C`|`GREEN_C`|`#83C167`|
|`GREEN_D`|`#77B05D`|`GREEN_E`|`#699C52`|
|`GREY`|`#888888`|`GREY_A`|`#DDDDDD`|
|`GREY_B`|`#BBBBBB`|`GREY_BROWN`|`#736357`|
|`GREY_C`|`#888888`|`GREY_D`|`#444444`|
|`GREY_E`|`#222222`|`LIGHTER_GRAY`|`#DDDDDD`|
|`LIGHTER_GREY`|`#DDDDDD`|`LIGHT_BROWN`|`#CD853F`|
|`LIGHT_GRAY`|`#BBBBBB`|`LIGHT_GREY`|`#BBBBBB`|
|`LIGHT_PINK`|`#DC75CD`|`LOGO_BLACK`|`#343434`|
|`LOGO_BLUE`|`#525893`|`LOGO_GREEN`|`#87C2A5`|
|`LOGO_RED`|`#E07A5F`|`LOGO_WHITE`|`#ECE7E2`|
|`MAROON`|`#C55F73`|`MAROON_A`|`#ECABC1`|
|`MAROON_B`|`#EC92AB`|`MAROON_C`|`#C55F73`|
|`MAROON_D`|`#A24D61`|`MAROON_E`|`#94424F`|
|`ORANGE`|`#FF862F`|`PINK`|`#D147BD`|
|`PURE_BLUE`|`#0000FF`|`PURE_GREEN`|`#00FF00`|
|`PURE_RED`|`#FF0000`|`PURPLE`|`#9A72AC`|
|`PURPLE_A`|`#CAA3E8`|`PURPLE_B`|`#B189C6`|
|`PURPLE_C`|`#9A72AC`|`PURPLE_D`|`#715582`|
|`PURPLE_E`|`#644172`|`RED`|`#FC6255`|
|`RED_A`|`#F7A1A3`|`RED_B`|`#FF8080`|
|`RED_C`|`#FC6255`|`RED_D`|`#E65A4C`|
|`RED_E`|`#CF5044`|`TEAL`|`#5CD0B3`|
|`TEAL_A`|`#ACEAD7`|`TEAL_B`|`#76DDC0`|
|`TEAL_C`|`#5CD0B3`|`TEAL_D`|`#55C1A7`|
|`TEAL_E`|`#49A88F`|`WHITE`|`#FFFFFF`|
|`YELLOW`|`#FFFF00`|`YELLOW_A`|`#FFF1B6`|
|`YELLOW_B`|`#FFEA94`|`YELLOW_C`|`#FFFF00`|
|`YELLOW_D`|`#F4D345`|`YELLOW_E`|`#E8C11C`|

### 四、改变出现顺序  Mobject on-screen order

the order of the arguments of `add ()` determines the order that the mobjects are displayed on the screen, with the left-most arguments being put in the back.

`add ()`  参数的顺序决定了 mobject 在屏幕上的显示顺序，最左边的参数放在后面。



### 五、常用的 Mobjects 

