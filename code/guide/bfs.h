#ifndef BFS_H
#define BFS_H

#include <math.h>
#include <time.h>
#include "Graph.h"
#include "Queue.h"

#define min(a,b) ((a) < (b) ? (a) : (b))
#define max(a,b) ((a) > (b) ? (a) : (b))

int diam;
int *create_bfs(Graph *graph, size_tt *vertices, int num_vert, int level);
int *bfs(Graph *graph, size_tt root, int depthLim);
int *rand_bfs(size_tt* vertices, int num_vert);
size_tt ** nbr_bfs(Graph *graph, size_tt root, size_tt ***nbrs, size_tt *nbr, size_tt *vertDepth);

#endif
