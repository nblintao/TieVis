#ifndef MISF_H
#define MISF_H

#include "bfs.h"
#include "Graph.h"

typedef struct {
  int depth;
  size_tt *size;
  size_tt *filt;
} MISF;

size_tt *vertDepth;

MISF *create_misf(Graph *G, int use_random, int numOfInitVert, int skip_filtration);
void destroy_misf(MISF *misf);
void order_by_deg(Graph *G, size_tt *misf, int numOfVert);
#endif
