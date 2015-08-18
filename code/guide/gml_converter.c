

#include "gml_converter.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int directed_flag = 0;          //marks whether the graph is directed or not
Gml_Graph *gml_graph;           //this is the structure that contains all graph properties
int numOfNodes = 0;
Bin_Tree_Node *bin_tree_root;   //pointer to binary search tree that contains gml id's and corresponding vert #s
struct GML_pair* list;
struct GML_stat* stat;
long  DEFAULT_COLOR;


//*************************************************************************
//
//       Reads a gml file and converts all tags into structures
//       used by the gml converter
//
//*************************************************************************
void read_gml_file (char* fileName) 
{
  //Graph *result;
    FILE *file;
    stat = (struct GML_stat*)malloc(sizeof(struct GML_stat));

    stat->key_list = NULL;
 
    file = fopen (fileName, "r");
    if (file == 0) 
      printf ("\n No such file: %s", fileName);
    else 
      {
	GML_init ();
	list = GML_parser (file, stat, 0);
	
	if (stat->err.err_num != GML_OK) 
	  {
	    printf ("An error occured while reading line %d column %d of %s:\n", stat->err.line, stat->err.column, fileName);
	    
	    switch (stat->err.err_num) 
	      {
	      case GML_UNEXPECTED:
		printf ("UNEXPECTED CHARACTER");
		break;
		
	      case GML_SYNTAX:
		printf ("SYNTAX ERROR"); 
		break;
		    
	      case GML_PREMATURE_EOF:
		printf ("PREMATURE EOF IN STRING");
		break;
		
	      case GML_TOO_MANY_DIGITS:
		printf ("NUMBER WITH TOO MANY DIGITS");
		break;
		
	      case GML_OPEN_BRACKET:
		printf ("OPEN BRACKETS LEFT AT EOF");
		break;
		
	      case GML_TOO_MANY_BRACKETS:
		printf ("TOO MANY CLOSING BRACKETS");
		break;
		
	      default:
		break;
	      }
	    
	    printf ("\n");
	  }      
	
	get_graph_properties(list, 0, NULL);
	return;
      }
    debug("Error in read_gml_file\n");
    exit(0);
}

//*************************************************************
//
//    Free all structure used by gml converter
//
//*************************************************************
void free_gml()
{
  GML_free_list (list, stat->key_list);
  free_bin_tree(bin_tree_root);
  free_gml_graph(gml_graph, GML_GRAPH);
}

//*********************************************************************
//
//    THIS FUNCTION RECURSIVELY TRAVERSES THE LIST OF KEYWORDS
//    AND PUTS THEM IN HIERARCHICAL STRUCTURES THAT CORRESPOND
//    TO GML SYNTAX.
//
// ********************************************************************


void get_graph_properties(struct GML_pair *list, int type, void *parent)
{
  struct GML_pair* tmp = list;
  list_ptr curr_list;

  switch(type)
  {
    case GML_NODE:
      curr_list.node = (Node *)parent;
      break;
    case GML_EDGE:
      curr_list.edge = (Edge *)parent;
      break;
    case GML_GRAPHICS:
      curr_list.graphics = (Graphics *)parent;
      break;
    case GML_LABELGRAPHICS:
      curr_list.labelGraphics = (LabelGraphics *)parent;
      break;
    case GML_GRAPH:
      curr_list.graph = (Gml_Graph *)parent;
      break;
    default:
      break;
  }

  while (tmp) 
  {
  
    switch (tmp->kind) 
    {
      case GML_INT:
	if (!strcmp(tmp->key, "id"))
	  curr_list.node->id = tmp->value.integer;
	else if (!strcmp(tmp->key, "source"))
	  curr_list.edge->source = tmp->value.integer;
	else if (!strcmp(tmp->key, "target"))
	  curr_list.edge->target = tmp->value.integer;
	else if (!strcmp(tmp->key, "directed"))
	  directed_flag = tmp->value.integer;
	else if (!strcmp(tmp->key, "visible"))
	  curr_list.graphics->visible = tmp->value.integer;
	break;
	
      case GML_DOUBLE:
	if (!strcmp(tmp->key, "w"))
	  curr_list.graphics->w = tmp->value.floating;
	else if (!strcmp(tmp->key, "h"))
	  curr_list.graphics->h = tmp->value.floating;
       	break;
	
      case GML_STRING:
	if (!strcmp(tmp->key, "label"))
	  curr_list.node->label = (char *)strdup(tmp->value.string);
                                       //NOTE: if the label belongs to an edge, it will still be 
	                               //placed correctly because label field is in same location 
	                               //in Node and Edge structs
	else if (!strcmp(tmp->key, "type"))
	  curr_list.graphics->type = (char *)strdup(tmp->value.string);  
	                               //Same as above applies to 'type' field of graphics & labelGraphics
	else if (!strcmp(tmp->key, "fill"))
	  curr_list.graphics->fill = (char *)strdup(tmp->value.string);
	else if (!strcmp(tmp->key, "outline"))
	  curr_list.graphics->outline = (char *)strdup(tmp->value.string);
	else if (!strcmp(tmp->key, "stipple"))
	  curr_list.graphics->stipple = (char *)strdup(tmp->value.string);
	else if (!strcmp(tmp->key, "arrow"))
	  curr_list.graphics->arrow = (char *)strdup(tmp->value.string);
	else if (!strcmp(tmp->key, "font"))
	  curr_list.graphics->font = (char *)strdup(tmp->value.string);
	break;
	
      case GML_LIST:
	if (!strcmp(tmp->key, "node"))
	{
	    //initialize a new node
	    Node *new_node = (Node *)malloc(sizeof(Node));
	    new_node->label = NULL;
	    new_node->graphics = NULL;
	    new_node->labelGraphics = NULL;
	    new_node->next = NULL;
	    new_node->id = -1;
	    if (gml_graph->nodes_front == NULL)      //this is the first node
	    {
		gml_graph->nodes_front = new_node;
		gml_graph->nodes_back = new_node;
	    }
	    else
	    {
		gml_graph->nodes_back->next = new_node;
		gml_graph->nodes_back = new_node;
	    }
	    
	    //increment the count of nodes
	    numOfNodes ++;

	    get_graph_properties(tmp->value.list, GML_NODE, new_node);
	}
	else if (!strcmp(tmp->key, "edge"))
	{
	    //initialize a new node
	    Edge *new_edge = (Edge *)malloc(sizeof(Edge));
	    new_edge->label = NULL;
	    new_edge->graphics = NULL;
	    new_edge->labelGraphics = NULL;
	    new_edge->next = NULL;
	    new_edge->source = -1;
	    new_edge->target = -1;
	    if (gml_graph->edges_front == NULL)      //this is the first edge
	    {
		gml_graph->edges_front = new_edge;
		gml_graph->edges_back = new_edge;
	    }
	    else
	    {
		gml_graph->edges_back->next = new_edge;
		gml_graph->edges_back = new_edge;
	    }
	    get_graph_properties(tmp->value.list, GML_EDGE, new_edge);
	}
	else if (!strcmp(tmp->key, "graphics"))
	  {
	    //initialize a new graphics
	    Graphics *new_graphics = (Graphics *)malloc(sizeof(Graphics));
	    new_graphics->type = NULL;
	    new_graphics->w = 0;
	    new_graphics->h = 0;
	    new_graphics->visible = 1;
	    new_graphics->fill = NULL;
	    new_graphics->outline = NULL;
	    new_graphics->stipple = NULL;
	    new_graphics->arrow = NULL;
	    new_graphics->font = NULL;
	    
	    //attach the new graphics to the parent structure
	    curr_list.node->graphics = (struct Graphics *)new_graphics;
	    
	    get_graph_properties(tmp->value.list, GML_GRAPHICS, new_graphics);
	  }
	else if (!strcmp(tmp->key, "LabelGraphics"))
	  {
	    //initialize a new labelGraphics
	    LabelGraphics *new_labelGraphics = (LabelGraphics *)malloc(sizeof(LabelGraphics));
	    new_labelGraphics->type = NULL;
	    
	    //attach the new labelGraphics to the parent structure
	    curr_list.node->labelGraphics = (struct LabelGraphics *)new_labelGraphics;
	    
	    get_graph_properties(tmp->value.list, GML_LABELGRAPHICS, new_labelGraphics);
	  }
	else if (!strcmp(tmp->key, "graph"))
	  {
	    //initialize a new graph
	    //make sure to use the global variable, so it can be accessed later
	    gml_graph = (Gml_Graph *)malloc(sizeof(Gml_Graph));      
	    gml_graph->nodes_front = NULL;
	    gml_graph->nodes_back = NULL;
	    gml_graph->edges_front = NULL;
	    gml_graph->edges_back = NULL;
	    get_graph_properties(tmp->value.list, GML_GRAPH, gml_graph);
	  }
	break;
	
      default:
	break;
    }
    
    tmp = tmp->next;
  }
  
}

//***************************************************
//
//      convert a gml graph into an adjacency list
//
//***************************************************

VisualGraphics * get_graphics(long foreground_color, int ignore_color)
{
  VisualGraphics *graphics = (VisualGraphics *)malloc(sizeof(VisualGraphics));
  Graph *graph = (Graph *)malloc(sizeof(Graph));
  size_tt numOfVert = numOfNodes;
  size_tt ** adjList;
  size_tt *degree;
  int i, v, j;
  EdgeGraphics *edge_graphics = NULL;
  NodeGraphics *node_graphics = NULL;

  Node *curr_gml_node = gml_graph->nodes_front;
  Edge *curr_gml_edge = gml_graph->edges_front;

  debug("Entering get_adj_list()\n");

  DEFAULT_COLOR = foreground_color;

  adjList = malloc((numOfVert + 1) * sizeof(size_tt *));
  adjList[0] = (size_tt *)malloc(numOfVert * sizeof( size_tt));

  //initialize the degree of each vertex
  degree = (size_tt *)malloc(numOfVert  * sizeof(size_tt));

  if (!ignore_color)
    {
      node_graphics = (NodeGraphics *)malloc(sizeof(NodeGraphics));
      node_graphics->colors = (RGB_color *)malloc(numOfVert * sizeof(RGB_color));
    }
  //add all node id's and their corresponding vertex numbers to binary search tree
  //record the color of each node
  for (i = 0; i < numOfVert; i ++)
    {
      char *curr_color;
      add_bin_node(bin_tree_root, curr_gml_node->id, i);

      if (!ignore_color)
	{
	  //process the color
	  if (curr_gml_node->graphics)
	    curr_color = ((Graphics *)curr_gml_node->graphics)->fill;
	  else
	    curr_color = NULL;

	  if (curr_color != NULL)
	    setColor(&node_graphics->colors[i], strtol(&curr_color[1], NULL, 16));
	  else
	    setColor(&node_graphics->colors[i], DEFAULT_COLOR);
	}

      curr_gml_node = curr_gml_node->next;
      degree[i] =0;
    }

  debug("processed nodes\n");

  //count the degree of each vertex (node)
  while(curr_gml_edge != NULL)
  {
      int source = curr_gml_edge->source;
      int target = curr_gml_edge->target;
      degree[lookup_bin_node(bin_tree_root, source)] ++;
      
      //Since the graph is undirected, we need to add an edge target->source
      degree[lookup_bin_node(bin_tree_root, target)] ++;

      curr_gml_edge = curr_gml_edge ->next;
  }

  //setting degrees for all vertices and allocating memory
  for(i = 0; i < numOfVert; i ++) 
  {
    //printf("node %d: degree %d\n",i, degree[i]);
    adjList[0][i]=0;      //this counter will be incremented every time an edge is added
    adjList[i + 1 ] = (size_tt *)malloc(degree[i] * sizeof(size_tt));
  }

  if (!ignore_color)
    {
      //Store all the color properties for the edges
      //    colors[i][j] = x  implies edge i->j is of color x
      //    if x == -1 then the edge is not to be drawn
      edge_graphics = (EdgeGraphics *)malloc(sizeof(EdgeGraphics));
      edge_graphics->colors = malloc(numOfVert * sizeof(RGB_color *));
      edge_graphics->loops = (RGB_color *)malloc(numOfVert * sizeof(RGB_color));
      edge_graphics->bidirectional = malloc(numOfVert * sizeof(char *));

      for (i = 0; i < numOfVert; i ++)
	{
	  edge_graphics->colors[i] = (RGB_color *)malloc(degree[i] * sizeof(RGB_color));
	  setColor(&edge_graphics->loops[i], -1);
	  edge_graphics->bidirectional[i] = (char *)malloc(degree[i] * sizeof(char));
	}
    }

  debug("Initialized degrees for all vertices\n");

  //Add edges into the adjacency list
  curr_gml_edge = gml_graph->edges_front;
  while(curr_gml_edge != NULL)
    {
      int source = curr_gml_edge->source;
      int target = curr_gml_edge->target;
      //get vertex number corresponding to the source
      int source_vertNum = lookup_bin_node(bin_tree_root, source);
      //get vertex number corresponding to the target
      int target_vertNum = lookup_bin_node(bin_tree_root, target);
      int curr_degree = adjList[0][source_vertNum];
      
      //Ensure that a directed edge is not added twice and 
      //that self loops are not added
      if (!exists_edge(adjList, source_vertNum, target_vertNum) && !(source == target))
	{
	  char * curr_color;
	  debug5("edge from %d(%d) to %d(%d)\n",source, source_vertNum, target, target_vertNum);
	  //add new edge to adjacency list
	  adjList[source_vertNum + 1][curr_degree] = target_vertNum;
	  adjList[0][source_vertNum] ++;
	  
	  if (!ignore_color)
	    {
	      //Record the color for this edge
	      //fill parameter will be of the form "#ffffff" so skip the first character
	      if (curr_gml_edge->graphics)
		curr_color = ((Graphics *)curr_gml_edge->graphics)->fill;
	      else
		curr_color = NULL;

	      if (curr_color != NULL)
		setColor(&edge_graphics->colors[source_vertNum][curr_degree], strtol(&curr_color[1], NULL, 16));
	      else 
		setColor(&edge_graphics->colors[source_vertNum][curr_degree], DEFAULT_COLOR);
	    
	      if (directed_flag)
		edge_graphics->bidirectional[source_vertNum][curr_degree] = 0;  //single directional
	    } //end if (!ignore_color..

	  curr_degree = adjList[0][target_vertNum];
	  
	  //add the reverse edge to adjacency list
	  adjList[target_vertNum + 1][curr_degree] = source_vertNum;
	  adjList[0][target_vertNum] ++;

	  if (!ignore_color)
	    {
	      /* if the graph is directed then the reverse edge should be marked to be ignored.
		 if that edge is also in the graph it will be processed later on */
	      if (directed_flag)
		setColor(&edge_graphics->colors[target_vertNum][curr_degree], -1);
	    }
	}
      else if (!ignore_color && source == target)
	{
	  // CURRENT VERTEX CONTAINS A SELF-LOOP
	  char *curr_color;
	  if (curr_gml_edge->graphics)
	    curr_color = ((Graphics *)curr_gml_edge->graphics)->fill;
	  else 
	    curr_color = NULL;

	  if (curr_color != NULL)
	    setColor(&edge_graphics->loops[source_vertNum], strtol(&curr_color[1], NULL, 16));
	  else
	    setColor(&edge_graphics->loops[source_vertNum], DEFAULT_COLOR);
	}
      else if (!ignore_color)
	{
	  //EDGE IS ALREADY IN ADJACENCY LIST, MUST RECORD COLOR
	  char *curr_color;
	  int overt_index = 0;
	  int reverse_vert_index;   //index of the target vertex in the reverse edge
	  int i;
	  //find the position of the target vertex
	  for (i = 0; i < curr_degree; i ++)
	    if (adjList[source_vertNum + 1][i] == target_vertNum)
	      overt_index = i;

	  //CHECK TO MAKE SURE THIS VERTEX IS NOT A REPETITION OF A PREVIOUS VERTEX
	  if (colorEquals(&edge_graphics->colors[source_vertNum][overt_index], -1))
	    {
	      if (directed_flag)
		{
		  //find position of target vertex in the reverse edge
		  reverse_vert_index = exists_edge(adjList, target_vertNum, source_vertNum)-1;
		  debug3("edge (%d,%d) is bidirectional\n",source_vertNum, target_vertNum);
		  edge_graphics->bidirectional[source_vertNum][overt_index] = 1;
		  edge_graphics->bidirectional[target_vertNum][reverse_vert_index] = 1;
		}
	      
	      if (curr_gml_edge->graphics)
		curr_color = ((Graphics *)curr_gml_edge->graphics)->fill;
	      else
		curr_color = NULL;
	      
	      if (curr_color != NULL)
		setColor(&edge_graphics->colors[source_vertNum][overt_index], strtol(&curr_color[1], NULL, 16));
	      else 
		setColor(&edge_graphics->colors[source_vertNum][overt_index], DEFAULT_COLOR);
	    }
	}

      curr_gml_edge = curr_gml_edge->next;
  debug("done\n");
    }

  debug("adjList: \n");
  for(v=0; v< numOfVert; v++){
    debug4("%d:(adjList[0][%d]=%d) : ",v, v, adjList[0][v]);
    for(j=0; j < adjList[0][v]; j++){
      debug2("%d ",adjList[v+1][j]);
    }
    debug("\n");
  }
  
  graph->numOfVert = numOfVert;
  graph->adjList = adjList;
  graphics->graph = graph;
  graphics->edge_graphics = edge_graphics;
  graphics->node_graphics = node_graphics;
  graphics->directed = directed_flag;
  graphics->numComponents = 1;
  return graphics;
}

//*************************************************************
//
//    Checks for existence of an edge in the adjacency list
//
//************************************************************
int exists_edge(size_tt **adjList, int source, int target)
{
  int i;
  for (i = 0; i < adjList[0][source]; i ++)
    if(adjList[source+1][i] == target)
      return i + 1;
  return 0;
}


//************************************************
//
//    BINARY SEARCH TREE FUNCTIONS:
//    ADD_BIN_NODE, LOOKUP_BIN_NODE, FREE_BIN_TREE
//
//************************************************

void add_bin_node(Bin_Tree_Node *root, int id, int vertNum)
{
  if (bin_tree_root == NULL)     //this case only applies if the tree is empty
    {
      bin_tree_root = (Bin_Tree_Node *)malloc(sizeof(Bin_Tree_Node));
      bin_tree_root->id = id;
      bin_tree_root->vertNum = vertNum;
      bin_tree_root->left = NULL;
      bin_tree_root->right = NULL;
    }
  else if (id <= root->id)
    {
      if (root->left == NULL)
	{ //put new node as left child of root
	  Bin_Tree_Node *new = (Bin_Tree_Node *)malloc(sizeof(Bin_Tree_Node));
	  new->id = id;
	  new->vertNum = vertNum;
	  new->left = NULL;
	  new->right = NULL;
	  root->left = new;
	}
      else  //add new node to left subtree
	add_bin_node(root->left, id, vertNum);
    }
  else   //id > bin_tree_root->id
    {
      if (root->right == NULL)
	{ //put new node as right child of root
	  Bin_Tree_Node *new = (Bin_Tree_Node *)malloc(sizeof(Bin_Tree_Node));
	  new->id = id;
	  new->vertNum = vertNum;
	  new->left = NULL;
	  new->right = NULL;
	  root->right = new;
	}
      else  //add new node to right subtree
	add_bin_node(root->right, id, vertNum);
    }
}

// takes a gml node id and returns a vertex number in the adjacency list
int lookup_bin_node(Bin_Tree_Node *root, int id)
{
  if (root == NULL)
    {
      printf("ERROR: CANNOT FIND GML NODE ID IN THE SEARCH TREE\n");
      exit(0);
    }

  if (id == root->id)
    return root->vertNum;
  else if (id <= root->id)
    return lookup_bin_node(root->left, id);
  else
    return lookup_bin_node(root->right, id);
}


void free_bin_tree(Bin_Tree_Node *root)
{
  if (root == NULL)
    return;
  free_bin_tree(root->right);
  free_bin_tree(root->left);
  free(root);
}

void free_gml_graph(void *parent, int type)
{
  list_ptr curr_list;

  if (parent == NULL)
    return;

  switch(type)
  {
    case GML_NODE:
      curr_list.node = (Node *)parent;
      free_gml_graph(curr_list.node->graphics, GML_GRAPHICS);
      free_gml_graph(curr_list.node->labelGraphics, GML_LABELGRAPHICS);
      free(curr_list.node);
      break;
    case GML_EDGE:
      curr_list.edge = (Edge *)parent;
      free_gml_graph(curr_list.edge->graphics, GML_GRAPHICS);
      free_gml_graph(curr_list.edge->labelGraphics, GML_LABELGRAPHICS);
      free(curr_list.edge);
      break;
    case GML_GRAPHICS:
      curr_list.graphics = (Graphics *)parent;
      free(curr_list.graphics);
      break;
    case GML_LABELGRAPHICS:
      curr_list.labelGraphics = (LabelGraphics *)parent;
      free(curr_list.labelGraphics);
      break;
    case GML_GRAPH:
      curr_list.graph = (Gml_Graph *)parent;
      //free nodes
      while(curr_list.graph->nodes_front != NULL)
	{
	  Node *temp = curr_list.graph->nodes_front->next;
	  free_gml_graph(curr_list.graph->nodes_front, GML_NODE);
	  curr_list.graph->nodes_front = temp;
	}
      //free edges
      while(curr_list.graph->edges_front != NULL)
	{
	  Edge *temp = curr_list.graph->edges_front->next;
	  free_gml_graph(curr_list.graph->edges_front, GML_EDGE);
	  curr_list.graph->edges_front = temp;
	}
      free(curr_list.graph);
      
    default:
      break;
  }

}


