# REPORT 2015/8/6
Tao LIN

## 上次讨论的方法整理

一种层次结构+预计算的方法

### 目标
可以一次性在屏幕上画100万节点

###出发点
#### 社交网络特性
社会网络里，一般community之间的联系比较弱。
真实社交网络里，都是大世界，小网络的，一个人最多150个好友。
社交网络有很多规律，比如幂律分布。社交网络分成很多团。也有结构洞。

利用社交网络的稀疏性和聚集性。**查查**看是否有专门面向社交网络的布局算法。
（Node-attribute graph layout for small-world networks。
用基于点聚类，然后高维投影的方法。
斐然做过的lamp，可以基于聚类信息快速投影生成100万节点的布局。
3000个点在屏幕上就看不清楚了。）
#### 预计算
预计算的方法好像较少用到图布局。
预计算的好处是容易并行。你想，1万个节点，如果分解为10个节点一组计算，需要1000个力引导计算。若变成纹理查找表，gpu里可能可以完成。

### 层次结构
对于大图，层次构建图的层次结构，最小单位是10个节点。
如果数据预处理好，就不需要在线做聚类。2000年siggraph的qsplat的论文（**问朱标**），就是预先聚类，实时调度。当时非常有名

### 预计算
预先计算10个节点的小图的所有布局（若只考虑节点间是否有边，一共2^10种情形，1024种）。可以到20。

### 考虑

- **查找**这种思路和已有的是否重合？
- **简单看看**Grip的代码，层次力引导。
布局效果不知道如何？

### 数据
网易数据，10万人形成50个community。那么，我们可以对50个community再聚类为5大类。这样，构建的层次有5,50，。。。
巫老师已经把网易数据的子群都做好了，你们可以找他的学生去要数据，用来做测试。
网易数据是时变的，有600帧。

### 解决visual clutter的问题
先不考虑，先考虑效率。
去年海东他们做的蓝噪声采样。特别是对于不同类别的节点，可以套用海东那个多类蓝噪声。蓝噪声计算特别慢。不知道是否也可以预计算。（先别看）

### 动态布局

动态图布局一般的思路是利用帧间连贯性，比如Kwanliu ma的2014论文


## 探索

### 关于预计算的数据量
10个节点只考虑节点间是否有边的话应该不是2^10种。如果把节点当作不同的话，应该是2^(C(10,2))种。如果把节点当作相同的，会少（还没想清楚怎么算）。


### 类似工作

#### A Meta Heuristic for Graph Drawing: Learning the Optimal Graph-Drawing Method for Clustered Graphs
Machine learning的方法。建立数据库，训练出一个分类器，能将feature vector映射到最合适的（给定“合适”的标准）layout算法。

TopoLayout文中对此文的介绍
>Niggemann and Stein describe a multilevel algorithm based on the recursive application of ?-maximization clustering. For each recursively clustered subgraph, the algorithm constructs a feature vector containing statistics about the subgraph, including the number of connected components, biconnected components, and ?-clusters found. An optimal layout for a feature vector is found through regression learning on a large database of graphs. Each graph in the database is drawn with several layout algorithms and evaluated using a quality metric, then the best drawing is selected. Although the work produces some visually convincing results, the largest graph drawn was a thousand nodes. No explicit performance numbers were given, but the time required for precomputation is a major limitation.

#### TopoLayout: Multilevel Graph Layout by Topological Features
分成四步。decomposition，feature layout，crossing reduction，overlap elimination。
##### decomposition
根据拓扑特征对图进行有层次地分解，使得每一次要处理的图是个比较简单的图形，如tree, bioconnected components, HDE, complete, cluster，其他是unknown。
##### feature layout
 tree, circular, HDE, and force-directed
##### 摘要
>We describe TopoLayout, a feature-based, multilevel algorithm that draws undirected graphs based on the topological features they contain. Topological features are detected recursively inside the graph, and their subgraphs are collapsed into single nodes, forming a graph hierarchy. Each feature is drawn with an algorithm tuned for its topology. As would be expected from a feature-based approach, the runtime and visual quality of TopoLayout depends on the number and types of topological features present in the graph. We show experimental results comparing speed and visual quality for TopoLayout against four other multilevel algorithms on a variety of data sets with a range of connectivities and sizes. TopoLayout frequently improves the results in terms of speed and visual quality on these data sets.