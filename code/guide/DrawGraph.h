
#ifndef _DRAW_GRAPH_H
#define _DRAW_GRAPH_H

#include "misf.h"
#include "Point.h"
/*
  #define construct_point(x,y,z,w) ((dim == 2) ? construct_Point_2d(x,y) : ( (dim == 3) ? construct_Point_3d(x,y,z) : construct_Point_4d(x,y,z,w)))*/

typedef struct {
  MISF *misf;
  Point *pos;
  Point *disp;
  Point *oldDisp;
  coord_t *dispNorm;
  coord_t *oldDispNorm;
  int *heat;
  float *oldCos;
  int dim;
  int diameter;
  int edge;
  int currLevel;
  size_tt numOfInitVert;
  size_tt *nbr;
  size_tt ***nbrs;
  size_tt *vertDepth;
  int displayPar;
  int createList;
  int createListSwitch;
  int roundsCtr;
  int rounds;
  int firstRound;
  int ** edges;
} DrawGraph;

extern size_tt *vertDepth;
extern int diam;
int dim; /* dimension of the graph*/

DrawGraph *init_DG(Graph *G, int numComponents, int _dim, size_tt _numOfInitVert, int _displayPar, int randBFS, int FR_full, int FR_levels, int plot_all_vert, int _rounds, int _finalRounds, float _heat_fraction, float r, float s);
void misf_engine(Graph *G, DrawGraph *dg);
void set_nbr_size();
float sched(size_tt x, size_tt max, size_tt maxVal, size_tt min, size_tt minVal);
size_tt sched3(size_tt x, size_tt max, size_tt maxVal, size_tt min, size_tt minVal);
Point *random_point();
void KK_spring_local(size_tt vert, size_tt **closeVert, size_tt size);
void KK_spring(const size_tt vert,  size_tt *vertNbrs, size_tt misfLayer);
void FR_spring(const size_tt vert, size_tt *vertNbrs, size_tt misfLayer, Graph *graph);
void FR_spring_2(const size_tt vert, size_tt *vertNbrs, size_tt misfLayer, Graph *graph);
void FR_spring_full(const size_tt vert, Graph *graph);
void update_Local_Temp( size_tt vert );
void update_Local_Temp_v2( size_tt vert, float r, float s );
void print_point(Point *p);
int ** get_edge_list();
int count_initial_edge_crossings(int **edges);
int get_crossings_from_vertex(int vert, int **edges, Graph *graph);
int exists_crossing(int src1, int dest1, int src2, int dest2);
void free_DrawGraph(DrawGraph *dgraph);
#endif









