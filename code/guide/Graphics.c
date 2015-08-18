#include "Graphics.h"

//*************************************************************
//
//    This function checks for disconnected components
//    of a graph and splits them into separate adjacency lists.
//    All graphic properties are also separated for each component.
//
//*************************************************************

VisualGraphics *get_graph_components(VisualGraphics *initGraphics, int ignore_color)
{
  // for each vertex, new_position stores its new adjacency list and position
  // new_position[x][0] = i;   vertex x is in the i-th adjacency list
  // new_position[x][1] = j;   vertex x is is the j-th element in the above adjacency list
  int **new_position; 
  Graph *initGraph = initGraphics->graph;  // the initial graph strucutre 
  Graph *new_graph;  //array of new graph strucutres
  int numOfVert = initGraph->numOfVert;
  int i, vert;
  int curr_adjList;
  int *numVert_adjList;  //number of vertices in each adjList
  int numOfComponents;

  VisualGraphics *new_graphics;

  //These variables will store new graphics properties for each component
  EdgeGraphics *init_Egraphics = initGraphics->edge_graphics;
  EdgeGraphics *new_Egraphics = NULL;
  NodeGraphics *init_Ngraphics = initGraphics->node_graphics;
  NodeGraphics *new_Ngraphics = NULL;

  new_position = malloc(numOfVert  * sizeof(int *));

  debug("Entering get_graph_components\n");

  for (i = 0; i < numOfVert; i ++)
    {
      new_position[i] = (int *) malloc( 2 * sizeof(int));
      new_position[i][0] = -1;  //-1 indicates vertex not processed
    }

  curr_adjList = 0;
  
  // Calculate number of adjacency list
  // Figure out what vertices each adjacency list will contain
  for (vert = 0; vert < numOfVert; vert ++)
    {
      if (new_position[vert][0] == -1) /* only make bfs for unprocessed elements */
	{
	  int *processed = bfs(initGraph, vert, numOfVert); 
	  int index;
	  int curr_position = 0;    //position in new adjacency list
	  new_position[vert][0] = curr_adjList;
	  new_position[vert][1] = curr_position++;

	  /* mark all vertices in this bfs (connected component)  with curr_adjList */
	  for (index = vert + 1; index < numOfVert; index ++)
	    if (processed[index] == 1) /* element in bfs tree and current adj list */
	      {
		new_position[index][0] = curr_adjList;
	        new_position[index][1] = curr_position++;
		debug4("new_position[%d] = %d, %d\n",index, curr_adjList, curr_position -1);
	      }
	  /* free processed array */
	  free(processed);
	  curr_adjList++;
	}
    }

  if (curr_adjList == 1)   //there's only one component
    {
      //return the original structures
      initGraphics->numComponents = 1;
      
      //free memory
      for (i = 0; i < numOfVert; i++)
	free(new_position[i]);
      free(new_position);

      return initGraphics;
    }

  //initialize # of vertices in each adjList to 0
  numVert_adjList = (int *) malloc( curr_adjList * sizeof(int));
  for (i = 0; i < curr_adjList; i ++)
    numVert_adjList[i] = 0;

  //count number of vertices in each adj list
  for (vert = 0; vert < numOfVert; vert ++)
    numVert_adjList[new_position[vert][0]]++;
    
  new_graph = (Graph *) malloc (curr_adjList * sizeof(Graph));

  //only do this if color properties were recorded from gml file
  if (!ignore_color)
    {
      new_Egraphics = (EdgeGraphics *) malloc (curr_adjList * sizeof(EdgeGraphics));
      new_Ngraphics = (NodeGraphics *) malloc (curr_adjList * sizeof(NodeGraphics));
    }

  // initialize the adjacency lists and graphics data structures
  for (i = 0; i < curr_adjList; i ++)
    {
      new_graph[i].numOfVert = numVert_adjList[i];
      new_graph[i].adjList = malloc((new_graph[i].numOfVert + 1) * sizeof(size_tt *));
      new_graph[i].adjList[0] = (size_tt *)malloc(new_graph[i].numOfVert * sizeof( size_tt));

      if (!ignore_color)
	{
	  new_Egraphics[i].loops = (RGB_color *) malloc (new_graph[i].numOfVert * sizeof(RGB_color));
	  new_Egraphics[i].colors = malloc(new_graph[i].numOfVert * sizeof(RGB_color *));
	  new_Egraphics[i].bidirectional = malloc (new_graph[i].numOfVert * sizeof(char *));
	  new_Ngraphics[i].colors = (RGB_color *) malloc (new_graph[i].numOfVert * sizeof(RGB_color));
	}
    }
  
  //process each vertex and transfer old adjacency list entries to new adjacency list
  for (vert = 0; vert < numOfVert; vert ++)
    {
      int adjListNum, newVert;
      int adjVert_index, numAdjVert;
      size_tt **old_adjList;
      size_tt **new_adjList;

      EdgeGraphics *old_eg = NULL;
      EdgeGraphics *new_eg = NULL;

      NodeGraphics *old_ng = NULL;
      NodeGraphics *new_ng = NULL;

      adjListNum = new_position[vert][0];  //index of adjList in the Graph array
      newVert = new_position[vert][1];

      old_adjList = initGraph->adjList;
      new_adjList =  new_graph[adjListNum].adjList;
      numAdjVert = old_adjList[0][vert];

      if (!ignore_color)
	{
	  old_eg = init_Egraphics;
	  new_eg = &new_Egraphics[adjListNum];
	  old_ng = init_Ngraphics;
	  new_ng = &new_Ngraphics[adjListNum];
	}

      //transfer adjacency list entries
      new_adjList[0][newVert] = numAdjVert;
      new_adjList[newVert + 1] = (size_tt *) malloc(numAdjVert * sizeof(size_tt));
      
      for(adjVert_index = 0; adjVert_index < numAdjVert; adjVert_index ++)
	{
	  size_tt adjVert = old_adjList[vert + 1][adjVert_index];
	  new_adjList[newVert + 1][adjVert_index] = new_position[adjVert][1];
	}

      if (!ignore_color)
	{
	  //transfer edge graphics entries
	  copyColor(&old_eg->loops[vert], &new_eg->loops[newVert]);
	  new_eg->colors[newVert] = old_eg->colors[vert];
	  new_eg->bidirectional[newVert] = old_eg->bidirectional[vert];
	  
	  //transfer node graphics entries
	  copyColor(&old_ng->colors[vert], &new_ng->colors[newVert]);
	}
    }

  //printing new array of adjacency lists
  for (i = 0; i < curr_adjList; i ++)
    {
      size_tt **adjList = new_graph[i].adjList;
      int numOfVert = new_graph[i].numOfVert;
      int v,j;
      debug2("adjList(%d): \n",i);
      for(v=0; v< numOfVert; v++){
	debug4("%d:(adjList[0][%d]=%d) : ",v, v, adjList[0][v]);
	for(j=0; j < adjList[0][v]; j++){
	  debug2("%d ",adjList[v+1][j]);
	}
	debug("\n");
      }
      
    }


  numOfComponents = curr_adjList;
  new_graphics = (VisualGraphics *) malloc (sizeof(VisualGraphics));
  new_graphics->graph = new_graph;
  new_graphics->edge_graphics = new_Egraphics;
  new_graphics->node_graphics = new_Ngraphics;
  new_graphics->numComponents = numOfComponents;
  new_graphics->directed = initGraphics->directed;

  if (!ignore_color)
    {
      //printing new color array
      for (i = 0; i < curr_adjList; i ++)
	{
	  int v,j;
	  debug("colors: \n");
	  for(v=0; v< new_graphics->graph[i].numOfVert; v++){
	    RGB_color *color =& new_graphics->edge_graphics[i].loops[v];
	    debug4("%d:(color[%d]=%d, ",v, v, new_graphics->graph[i].adjList[0][v]);
	    debug5("loop=(%d,%d,%d,%d)) : ", color->R, color->G, color->B, color->opaque);
	    for(j=0; j < new_graphics->graph[i].adjList[0][v]; j++){
	      color = &new_graphics->edge_graphics[i].colors[v][j];
	      debug5("(%d,%d,%d,%d) ",color->R, color->G, color->B,color->opaque);
	    }
	    debug("\n");
	  }
	}
    }

  // free memory occupied by graphics structures used before breakup into components
  if (!ignore_color)
    {
      free(initGraphics->node_graphics->colors);
      free(initGraphics->node_graphics);
      free(initGraphics->edge_graphics->colors);
      free(initGraphics->edge_graphics->loops);
      free(initGraphics->edge_graphics->bidirectional);
      free(initGraphics->edge_graphics);
    }

  for (i = 0; i < numOfVert; i++)
    free(new_position[i]);
  free(new_position);
  free(numVert_adjList);
  free_Graph(initGraphics->graph);
  free(initGraphics);

  return new_graphics;
}

//*****************************************************
//
//       frees all memory used for graphics
//
//****************************************************
void free_graphics(VisualGraphics *graphics)
{
  int i;

  //make sure that graphic properties were used and structures created
  if (graphics->node_graphics && graphics->edge_graphics)
    {  // free all the graphics structures

      for (i = graphics->numComponents - 1; i >= 0; i --)
	{
	  //free node graphics
	  free(graphics->node_graphics[i].colors);

	  //make sure that the graphic property exists before freeing
	  if (graphics->graph[i].numOfVert)
	    {
	      free(graphics->edge_graphics[i].colors);
	      free(graphics->edge_graphics[i].bidirectional);
	    }
	  free(graphics->edge_graphics[i].loops);

	}

      free(graphics->node_graphics);
      free(graphics->edge_graphics);
      free(graphics->graph);
    }
  else  //only free the Graph structure
    {
      for (i = 0; i < graphics->numComponents; i ++)
	{
	  free_Graph(&graphics->graph[i]);
	}
      free(graphics->graph);
    }

  free(graphics);
}


//*******************************************************
//
//  converts a decimal number into RGB components
//
//******************************************************
void setColor(RGB_color *color, long num)
{
  if (num == -1)
    {
      color->opaque = 1;
      color->R = color->G = color->B = 111;
    }
  else
    {
      color->R = GET_R(num);
      color->G = GET_G(num);
      color->B = GET_B(num);
      color->opaque = 0;
    }
  debug5("setting color (%d,%d,%d,%d)\n",color->R, color->G, color->B, color->opaque);
}


//*******************************************************
//
//    copies RGB color between two structures 
//
//*******************************************************
void copyColor(RGB_color *src, RGB_color *dest)
{
  dest->R = src->R;
  dest->G = src->G;
  dest->B = src->B;
  dest->opaque = src->opaque;
}


//*****************************************************
//
//   checks equality of RGB color to decimal 
//   representation of a color
//
//*****************************************************
int colorEquals(RGB_color *color, long num)
{
  if (num == -1) 
    { 
      if ((color->R == 111) && 
	  (color->G == 111) && 
	  (color->B == 111))
	return 1;
    }
  else if ((color->R == GET_R(num)) &&
	   (color->G == GET_G(num)) && 
	   (color->B == GET_G(num)))
    return 1;
  return 0;
}


