#include "misf.h"

/* use_random specifies whether to use random functions or make bfs  trees */
MISF *create_misf(Graph *G, int use_random, int numOfInitVert, int skip_filtration)
{

  int numOfVert = G->numOfVert;
  size_tt log_2_n = ilogb(numOfVert) + 2;
  size_tt *misfsize = (size_tt *)malloc(log_2_n * sizeof(size_tt));
  size_tt *misf = malloc(numOfVert * sizeof(size_tt));
  int count;
  int level;
  MISF * result;

  printf("Number of Vertices: %d\n",numOfVert);
  debug2("log 2 n is %d\n",log_2_n);

  /* initialize vertice depth array */
  vertDepth = (size_tt *)malloc(numOfVert * sizeof(size_tt));

  for (count = 0; count < numOfVert; count ++)
    {
      misf[count] = count;
      vertDepth[count] = 0;   /* initially all elements belong to level 0 */
    }

  diam = sqrt(numOfVert);

  // Skip the filtration, and return the initialized misf
  if (skip_filtration)
    {
      debug2("Diameter: %d\n",diam);
      debug2("first el: %d\n", misf[0]);
      result = (MISF *)malloc(sizeof(MISF));
      result->depth = 1;
      result->size = (size_tt *)malloc(sizeof(size_tt));
      result->size[0] = numOfVert;
      result->filt = misf;
      return result;
    }

  /*for (count = 0; count < numOfVert; count ++)
    {
      int randNum = rand() % (numOfVert -1);
      int randNum2 = rand() % (numOfVert-1);
      swap(&misf[randNum], &misf[randNum2]);
      }*/

  /* order the vertices in descending order by degree */
  order_by_deg(G, misf, numOfVert);
  debug("Finished ordering by degree\n");

  misfsize[0] = G->numOfVert;
  debug2("misf level 0 is of size %d\n",misfsize[0]);
  
  printf("misf[0]=%d\n",numOfVert);

  diam = sqrt(numOfVert);


  for (level = 1; level < log_2_n; level ++)
    {
      size_tt misf_index; //stores index of location where more misf elements for the current level can be placed
      int marked_index;
      size_tt prev_misfsize = misfsize[level - 1];
      int *marked;

      /* EITHER A RANDOM FUNCTION OR BFS TREES WILL BE USED */
      if (use_random)
	  marked = rand_bfs(misf, prev_misfsize);
      else
	marked = create_bfs(G, misf, prev_misfsize, level);

      misfsize[level] = marked[0];
      
      debug3("misf level %d is of size %d\n",level,misfsize[level]);
      printf("misf[%d]=%d\n",level,misfsize[level]);
      misf_index = 0;
      for(marked_index = 1; marked_index <= misfsize[level - 1]; marked_index ++)
	{

	  if (marked[marked_index] == 1)
	    {
	      vertDepth[misf[marked_index - 1]] = level;
	      swap(&misf[misf_index++], &misf[marked_index-1]);
	    }
	}

      if (misfsize[level] < numOfInitVert + 1)
	{
	  int count;
	  //debug3("curr level of size %d is less than initVert %d\n",misfsize[level], numOfInitVert);
	  for (count = misfsize[level]; count < numOfInitVert; count ++)
	    vertDepth[misf[count]] = level;
	  misfsize[level] = numOfInitVert;
	  log_2_n = level + 1;
	}

      /* free marked[] */
      free(marked);

    }
  /* make sure the last level has 3 elements */  
  if (misfsize[log_2_n - 1] > numOfInitVert)
	{
	  int count;
	  for (count = numOfInitVert; count < misfsize[log_2_n - 1]; count ++)
	    vertDepth[misf[count]] = log_2_n - 2;
	  misfsize[log_2_n - 1] = numOfInitVert;
	}

  result = (MISF *)malloc(sizeof(MISF));
  result->depth = log_2_n;
  result->size = misfsize;
  result->filt = misf;
  return result;
}

void destroy_misf(MISF *misf)
{
  free(misf->size);
  free(misf->filt);
  free(misf);
}

/////////////////////////////////////////////////
//
//   order vertices by degree in ascending order
//   vertices with degree 0 are placed at the end
//
//////////////////////////////////////////////////
void order_by_deg(Graph *G, size_tt *misf, int numOfVert)
{
  size_tt *numDeg;   /* numDeg[index] stores # of vertices with degree 'index' */
  size_tt *offset;
  size_tt *degProcessed; /* holds how many vertices of degree 'index' were placed in misf */
  int min = 9999999;
  int max = -1;
  int vert, index;
  
  for(vert = 0; vert < numOfVert; vert ++)
    {
      if (G->adjList[0][vert] < min)
	min = G->adjList[0][vert];
      if (G->adjList[0][vert] > max)
	max = G->adjList[0][vert];
    }

  offset = (size_tt *)malloc((max + 1) * sizeof(size_tt));
  degProcessed = (size_tt*)malloc((max + 1) * sizeof(size_tt));
  numDeg = (size_tt *)malloc((max + 1) * sizeof(size_tt));  /* entries with index < min are ignored,
							 all entries with min <= index <=max are valid */
  for (index = 0; index <= max; index ++)
    {
      numDeg[index] = 0;
      degProcessed[index] = 0;
    }

  for (vert = 0; vert < numOfVert; vert ++)
    numDeg[G->adjList[0][vert]] ++;

  offset[0] = 0;  // we need this in case the max <= 1
  offset[1] = 0;
  /* set offset[index] to hold offset from beginning of sorted array at which vertices with degree index start */
  for (index = 2; index <= max; index ++)
    offset[index] = offset[index - 1] + numDeg[index - 1];

  offset[0] = offset[max] + numDeg[max];
  for (vert = 0; vert < numOfVert; vert ++)
    {
      int deg = G->adjList[0][vert];
      int position = offset[deg] + degProcessed[deg];
      misf[position] = vert;
      degProcessed[deg] ++;
    }

  //free memory
  free(numDeg);
  free(offset);
  free(degProcessed);
}






