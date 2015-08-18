#ifndef GRAPHICS_H
#define GRAPHICS_H

#include "Graph.h"

//These macros will extract the requested component out of a color represented by 6-digit hex number
#define GET_R(a) ((a >>16) & 0x0000ff)
#define GET_G(a) ((a >> 8) & 0x0000ff)
#define GET_B(a) (a & 0x0000ff)

typedef struct RGB_color {
  unsigned int R:8;
  unsigned int G:8;
  unsigned int B:8;
  unsigned int opaque:1;
} RGB_color;

typedef struct edgeGraphics {
  RGB_color *loops;
  RGB_color **colors;
  char **bidirectional;  //indicated whether the edge is bidirectional
} EdgeGraphics;

typedef struct nodeGraphics {
  RGB_color *colors;
} NodeGraphics;

typedef struct visualGraphics {
  Graph *graph;
  EdgeGraphics *edge_graphics;
  NodeGraphics *node_graphics;
  int directed;
  int numComponents;
  RGB_color bgColor;
  RGB_color fgColor;
} VisualGraphics;

VisualGraphics *get_graph_components(VisualGraphics *initGraph, int ignore_color);  
void free_graphics(VisualGraphics *graphics);
void setColor(RGB_color *color, long num);
void copyColor(RGB_color *src, RGB_color *dest);
int colorEquals(RGB_color *color, long num);
#endif
