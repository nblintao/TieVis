巫老师的意思是如果来不及做的话，可以考虑把每个矩阵当成一个高维向量，用投影的方法做一个可视化

巫老师的意思是每个矩阵都可以看成一个高维数据，那我们就可以通过计算相似度来做投影

我们可以想办法把每一个矩阵拆分成多个高维向量

但是构建这些高维的向量需要一个标准

我们可以把这些向量投影到平面上，加上时间信息，那我们就有可能可以找到一些跟时间相关的pattern

咱们现在的一个问题就是矩阵画出来看不出来有什么有意思的东西

巫老师这个方向我们有可能可以找到一些pattern



对于一个动态变化的网络数据，每一帧都是一个graph。每个graph可以用一个邻接矩阵表示，但邻接矩阵中的每个数值表示的不是边的权重，而是边对图的影响程度。
边的影响程度这个度量标准已经有了，你可以假设每个矩阵都已经算好。
现在的想法是：把每个矩阵拆分成多个高维向量，把这些向量投影到平面上。将每个时刻的投影都放上去，有可能可以找到一些跟时间相关的pattern。
目前主要需要研究一下怎么构建这些高维向量，需要个怎么样的标准。