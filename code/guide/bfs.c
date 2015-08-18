#include "bfs.h"

//******************************************************************************
//
//     applies bfs search to vertices
//     determines which vertices should be preserved for next MISF level
//
//*****************************************************************************
int *create_bfs(Graph *graph, size_tt *vertices, int num_vert, int level)
{
  int depthLim = pow(2, level);
  int count;
  int numKept = 0;
  int *marked = (int *)malloc( (num_vert + 1) * sizeof(int));
  
  debug("Entering create_bfs\n");
  debug2("level: %d\n",level);

  diam = 0; //make sure this is reinitialized for each component 

  /* mark all vertices unprocessed (-1) */
  for (count = 0; count <= num_vert; count ++)
    marked[count] = -1;

  for (count = 0; count < num_vert; count ++)
    {
      if (marked[count+1] == -1) /* only make bfs for unprocessed elements */
	{
	  /* all vertices in processed[] are listed 1..n */
	  /* so processed[2] holds the flag for vert2, in misf[] this isn't so */
	  int *processed = bfs(graph, vertices[count], depthLim); 
	  int index;
	  marked[count + 1] = 1;
	  numKept ++;
	  /* updated marked[] for all vertices processed in bfs */
	  for (index = count + 1; index < num_vert; index ++)
	    if (processed[vertices[index]] == 1) /* element in bfs tree, won't be in next level */
	      marked[index + 1] = 0;
	  
	  /* free processed array */
	  free(processed);
	  debug("freed memory\n");
	}
    }
  marked[0] = numKept;
  debug("Leaving create_bfs\n");
  return marked;
}


//*********************************************************************************
//
//    creates a breadth first search tree using only 
//      the elements provided in prev_misf_level 
//
//*********************************************************************************
int *bfs(Graph *graph, size_tt root, int depthLim)
{
  int count;
  int *color = (int *)malloc(graph->numOfVert * sizeof(int));  //0 is white, -1 is gray, 1 is black
  Queue *vertQ = new_Q(2 * graph->numOfVert);  //manages gray vertices & their dist from root
  int currDepth;
  size_tt vert;
  
  debug2("Entering bfs, root is %d\n",root);

  for (count = 0; count < graph->numOfVert; count ++)
    {
      color[count] = 0; //0 is white
    }
  
  currDepth = 1;
  vert = root;
 
  while((currDepth <= depthLim + 1))
    {
      size_tt deg;
      color[vert] = 1;  //vertex is processed, set color to black
      debug3("bfs: vertex %d is in bfs of %d\n",vert,root);

      deg = graph->adjList[0][vert];
      debug2("deg=%d\n",deg);
      for(count = 0; count < deg; count ++)
	{
	  size_tt adjVert = graph->adjList[vert+1][count];
	  if (color[adjVert] == 0) //if color is white
	    {
	      color[adjVert] = -1;  //set to gray
	      enqueue(vertQ, adjVert); //add the new vertex to queue
	      enqueue(vertQ, currDepth); //add adjVert's distance from root to queue
	    }  
	}
      if (queue_size(vertQ) > 0)
	{
	  vert = dequeue(vertQ);
	  currDepth = dequeue(vertQ) + 1;
       	}
      else
	break;
    }
  if (diam < currDepth)
  diam = currDepth;
  free(vertQ);
  return color;
}



//***********************************************************************
//
//    randomly determines vertices to be preserved for next MISF level
//
//***********************************************************************
int *rand_bfs(size_tt* vertices, int num_vert)
{
  /* 0 is vertex kept, 1 is vertex removed; first entry holds # of vertices kept */
  int *marked = (int *)malloc( (num_vert + 1) * sizeof(int));  
  int count;
  int numKept = num_vert;
  debug("Entering rand_bfs\n");
  srand(time(0));
  while(numKept == num_vert) /* make sure all elements aren't kept */
    {
      numKept = 0;
      for (count = 1; count <= num_vert; count ++)
	{
	  int randNum = rand() % 5;
	  debug2("random number %d\n",randNum);
	  if (randNum % 2 == 0)
	    {
	      debug2("vertex %d kept\n",vertices[count-1]);
	      marked[count] = 1;
	      numKept ++;
	    }
	  else 
	    marked[count] = 0;
	}
    }
  marked[0] = numKept;
  debug("Leaving rand_bfs\n");
  return marked;
}

//*********************************************************************************
//
//   calculate set of neighbors for the specified vertes
//
// UPDATE nbr[] USING BFS TREES 
// RETURN: ARRAY OF 3 CLOSEST VERTICES TO root 
//
//*********************************************************************************
size_tt **nbr_bfs(Graph *graph, size_tt root, size_tt ***nbrs, size_tt *nbr, size_tt *vertDepth)
{
  int count;
  int i;
  int *color = (int *)malloc(graph->numOfVert * sizeof(int));  //0 is white, -1 is gray, 1 is black
  Queue *vertQ = new_Q(2 * graph->numOfVert);  //manages gray vertices & their dist from root
  int currDepth;
  size_tt vert;
  size_tt bottomNbrsLayer = 0; // the index i of the first free nbrs[root][i]

  // memory allocation for rootNbrs and nbrCounter
  size_tt *nbrCounter = (size_tt *)malloc((vertDepth[root] + 1) * sizeof(size_tt));

  /* Setting up variables for determining set of 3 closest neighbors for placement of vertex 'root' */
  size_tt numOfCloseVert = 3; /* we allocate an extra index for storing the HEIGHT OF BFS */
  size_tt **closeVert;
  size_tt closeVertItr = 0;
  int closeVertDone = 0;

  /* closeVert[x][0] will hold vertex at pos x*/
  /* closeVert[x][1] will hold distance of closeVert[x][0] from root*/
  closeVert = malloc(numOfCloseVert * sizeof(size_tt *));
  for (i = 0; i < numOfCloseVert; i ++)
    closeVert[i] = (size_tt *)malloc(2*sizeof(size_tt));

  debug("Entering nbr_bfs\n");

  nbrs[root] = malloc((vertDepth[root]+2) * sizeof(size_tt *));
  for(i=0; i <= vertDepth[root]; i++)
    {
      /* 1 slot for vertex and 1 (the next one) */
      /* for its distance from the root */
      nbrs[root][i] = (size_tt *)malloc((2*nbr[i]) * sizeof(size_tt));
      nbrCounter[i] = 0;
    }
  for (count = 0; count < graph->numOfVert; count ++)
    {
      color[count] = 0; //0 is white
    }
  color[root] = 1;
  
  currDepth = 1;
  vert = root;
 
  do{
      size_tt deg;
      color[vert] = 1;  //vertex is processed, set color to black

      deg = graph->adjList[0][vert];

      for(count = 0; count < deg; count ++)
	{
	  size_tt adjVert = graph->adjList[vert+1][count];
	  //debug2("next adjacent vertex is %d\n",adjVert);
	  if (color[adjVert] == 0) //if color is white
	    {
	      color[adjVert] = -1;  //set to gray
	      enqueue(vertQ, adjVert); //add the new vertex to queue
	      enqueue(vertQ, currDepth); //add adjVert's distance from root to queue 
	      for(i = bottomNbrsLayer; i <= min(vertDepth[adjVert], vertDepth[root]); i++)
		{
		  if(nbrCounter[i] < 2*nbr[i])
		    {
		      debug4("%d's neighborhood: %d (level %d) added\n",root,adjVert,i);
		      nbrs[root][i][nbrCounter[i]++] = adjVert;
		      nbrs[root][i][nbrCounter[i]++] = currDepth;
		    } 
		  else
		    bottomNbrsLayer = i+1;
		}

	      if( !closeVertDone && closeVertItr < numOfCloseVert && vertDepth[adjVert] > vertDepth[root])
		{
		  debug4("vertDepth[%d]=%d, vertDepth[root]=%d\n",adjVert, vertDepth[adjVert],vertDepth[root]);
                    closeVert[closeVertItr][1] = currDepth;
                    closeVert[closeVertItr++][0] = adjVert;
		    
		    if( closeVertItr == numOfCloseVert )
                        closeVertDone = 1;
		}
	    }
	}
      if (queue_size(vertQ) > 0)
	{
	  vert = dequeue(vertQ);
	  /*debug2("just dequeued %d\n",vert);*/
	  currDepth = dequeue(vertQ) + 1;
       	}
      else
	break;

    } while  ((!closeVertDone || (bottomNbrsLayer <= vertDepth[root])) && ( queue_size(vertQ) >=0 ));
  debug("Leaving nbr_bfs\n");
  
  free(vertQ);
  free(color);
  free(nbrCounter);
  return closeVert;
}








