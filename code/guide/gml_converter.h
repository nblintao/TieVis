#ifndef GML_CONVERTER_H
#define GML_CONVERTER_H

#define GML_NODE 1
#define GML_EDGE 2
#define GML_GRAPHICS 3
#define GML_LABELGRAPHICS 4
#define GML_GRAPH 5

#include "gml_parser.h"
#include "Graphics.h"

typedef struct graphics {
  int id;
  char *type;     //currently supported types are: text
  float w;
  float h;
  short visible;  //either 0 or 1
  char *fill;     //defines a color that fills interior of object
  char *outline;  //color of outline of the object
  char *stipple;
  char *arrow;    //direction of directed edges, possible values: none, first, last, both
  char *font;
} Graphics;

typedef struct labelGraphics {
  int id;
  char *type;
} LabelGraphics;

typedef struct node {
  int id;
  char *label;
  struct Graphics* graphics;
  struct LabelGraphics *labelGraphics;
  struct node *next;
} Node;

typedef struct edge {
  int id;
  char *label;   // text associated with the edge
  struct Graphics* graphics;
  struct LabelGraphics *labelGraphics;
  struct edge *next;
  int source;    // source node (vertex)
  int target;    // target node (vertex)
} Edge;

typedef struct gml_graph {
  int id;
  char *label;   //text associated with the graph
  Node *nodes_front;
  Node *nodes_back;
  Edge *edges_front;
  Edge *edges_back;
} Gml_Graph;

typedef union list_ptr {
  Graphics *graphics;
  LabelGraphics *labelGraphics;
  Node *node;
  Edge *edge;
  Gml_Graph *graph;
} list_ptr;

//this modified binary search tree is used to associate node id's with vertex numbers
typedef struct bin_tree_node {
  int id;       //id from gml file,          >>>>>>>>>>NOTE:  the tree is sorted by ID
  int vertNum;  //number a gml node is assigned in an adjacency list
  struct bin_tree_node *left;
  struct bin_tree_node *right;
} Bin_Tree_Node;
  
void read_gml_file (char* fileName) ;
void get_graph_properties(struct GML_pair *list, int type, void *parent);
VisualGraphics * get_graphics(long foreground_color, int ignore_color);
void free_gml();
int exists_edge(size_tt **adjList, int source, int target);
long **get_edge_colors();
void free_gml_graph(void *ptr, int type);

//binary search tree functions
void add_bin_node(Bin_Tree_Node *root, int id, int vertNum);
int lookup_bin_node(Bin_Tree_Node *root, int id);
void free_bin_tree(Bin_Tree_Node *root);


#endif



