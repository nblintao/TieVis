#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <math.h>
#include "bfs.h"

//#define DEBUG 0  

#ifdef DEBUG
#define debug5(a,b,c,d,e) fprintf(stderr, a,b,c,d,e);
#define debug4(a,b,c,d) fprintf(stderr, a,b,c,d);
#define debug3(a,b,c) fprintf(stderr, a,b,c);
#define debug2(a,b)   fprintf(stderr, a,b);
#define debug(a)      fprintf(stderr, a);

#else
#define debug(a);
#define debug2(a,b);
#define debug3(a,b,c);
#define debug4(a,b,c,d);
#define debug5(a,b,c,d,e);
#endif

#ifndef GRAPH_H
#define GRAPH_H




typedef unsigned short size_tt;


typedef struct graph {
 size_tt numOfVert;
 size_tt **adjList; // adjacency list of the graph
} Graph;

unsigned long idum;

Graph * tree(size_tt depth, size_tt base);
Graph * twistedTorus( size_tt h, size_tt w,  size_tt t1, size_tt t2);
Graph *  torus( size_tt h, size_tt w );
Graph * pow2(size_tt exp, Graph *graph);
Graph * hyper_Cube( size_tt dim );
Graph * double_Graph(Graph *graph);
Graph * mesh( size_tt height );
Graph * mesh_Graph(size_tt h, size_tt w);
Graph * meshT(size_tt h);
Graph * square_Cylinder( size_tt h, size_tt w);
Graph * moebius( size_tt h, size_tt w);
Graph * complete_Graph( size_tt _numOfVert );
Graph * path_Graph( size_tt _numOfVert );
Graph * cycle_Graph( size_tt _numOfVert );
size_tt **  rand_cpt_Graph( size_tt _numOfVert );
Graph * rand_Graph( size_tt h, size_tt w);
Graph * sierpinski(size_tt h, size_tt density);
void sierpinski_recurse(size_tt **adjList,int maxLevel,int currentLevel,size_tt a, size_tt b, size_tt c);
size_tt sierpinski_recurse3D(size_tt **adjList,int maxLevel,int currentLevel,size_tt a, size_tt b, 
			     size_tt c, size_tt d,int flag);
void rand_Perm(size_tt *array, size_tt len, size_tt *newArray, size_tt newLen);
void swap(size_tt *a, size_tt *b);
void addEdge(size_tt **adjList, size_tt a, size_tt b);
unsigned long fast_Rand();
void sfast_Rand(unsigned int seed);
  
void free_Graph(Graph *graph);

#endif
