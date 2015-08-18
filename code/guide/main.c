
#include "misf.h"
#include "DrawGraph.h"
#include "MesaPlot.h"
#include "gml_converter.h"
#include "Graphics.h"
#include <time.h>

void cases(int argc, char** argv);

size_tt _numOfVert = 5;
char *graphStr = "cycle";
size_tt _T = 4;
size_tt _p1           = 0;
size_tt _p2           = 0;
size_tt _numOfInitVert= 4;
int _dim = 3;
int _displayPar = 1;
int _width            = 700;
int _height           = 700;
int _slow = 0;
int _random = 0;
int _breakComponents = 1;
int _FR_full = 0;
int _FR_levels = 1;
int _plot_all_vert = 0;    //indicates whether only FR all is to be used
int _rounds = 20;
int _finalRounds = 30;
float _heat_fraction = 0.17;
float _r = 0.15;  //parameters of update_Local_Temp_v2()
float _s = 3.0;
long **edge_colors;
long _background_color = 0;
long _foreground_color = 0x00ff00;
int _use_gml_color = 1;

int main(int argc, char **argv)
{
  int count;
  int numComponents = 0;
  VisualGraphics *graphics;
  DrawGraph *dg;
  clock_t c0, c1;
  time_t t0, t1;

  t0 = time(NULL);
  c0 = clock();

  cases(argc, argv);
  
  graphics = (VisualGraphics *) malloc (sizeof(VisualGraphics));
  graphics->numComponents = 1;
  graphics->directed = 0;
  graphics->edge_graphics = NULL;
  graphics->node_graphics = NULL;

  if( strcmp(graphStr, "complete") == 0 )
    {
      graphics->graph = complete_Graph( _numOfVert );
    } 
  else if( strcmp(graphStr, "random" ) == 0)
        graphics->graph = rand_Graph( _numOfVert, _T );
  else if( strcmp(graphStr,  "path" ) == 0)
        graphics->graph = path_Graph( _numOfVert );
  else if( strcmp(graphStr, "cycle") == 0 )
        graphics->graph = cycle_Graph( _numOfVert );
  else if( strcmp(graphStr, "hypercube") == 0)
        graphics->graph = hyper_Cube( _numOfVert ); //one should test if
        // _numOfVert is a power of 2
  else if( strcmp(graphStr, "cylinder") == 0)
        graphics->graph = square_Cylinder( _numOfVert, _T);
  else if( strcmp(graphStr,  "moebius" ) == 0)
        graphics->graph = moebius( _numOfVert, _T);
  else if( strcmp(graphStr, "torus") == 0)
        graphics->graph = torus( _numOfVert, _T);
  else if( strcmp(graphStr, "mesh") == 0)
        graphics->graph = mesh( _numOfVert );
  else if( strcmp(graphStr, "meshT") == 0)
        graphics->graph = meshT( _numOfVert);
  else if (strcmp(graphStr,  "twistedtorus") == 0)
      graphics->graph = twistedTorus(_numOfVert, _T, _p1, _p2);
  else if (strcmp(graphStr, "tree") == 0)
        graphics->graph = tree(_numOfVert, _T);
  else if (strcmp(graphStr, "sierpinski") == 0)
        graphics->graph = sierpinski(_numOfVert, _T);
  else   //the graph is a GML file
    {
      int v,j;
      read_gml_file(graphStr);
      graphics = get_graphics(_foreground_color, !_use_gml_color);
      
      //if not recording colors from gml file, make graph undirected
      if (!_use_gml_color)
	graphics->directed = 0;
      else
	{
	  debug("colors: \n");
	  for(v=0; v< graphics->graph->numOfVert; v++){
	    RGB_color *color =& graphics->edge_graphics->loops[v];
	    debug4("%d:(color[%d]=%d, ",v, v, graphics->graph->adjList[0][v]);
	    debug5("loop=(%d,%d,%d,%d)) : ", color->R, color->G, color->B, color->opaque);
	    for(j=0; j < graphics->graph->adjList[0][v]; j++){
	      color = &graphics->edge_graphics->colors[v][j];
	      debug5("(%d,%d,%d,%d) ",color->R, color->G, color->B,color->opaque);
	    }
	    debug("\n");
	  }
	}
      free_gml();

      //ASSUMPTION: NONE OF THE INTERNAL GRAPHS HAVE MORE THAN 1 COMPONENT
      if (_breakComponents)
	{
	  graphics = get_graph_components(graphics, !_use_gml_color);
	  if (!_use_gml_color)
	    {
	      graphics->edge_graphics = NULL;
	      graphics->node_graphics = NULL;
	    }
	}
    }


  setColor(&graphics->bgColor, _background_color);
  setColor(&graphics->fgColor, _foreground_color);

  debug("**********************************************************\n**************************************\n");
  if (graphics->numComponents == 1)
    {
      debug("~~~~~~~~~~~~~Graph has 1 component\n");
    }
  else
    {
      debug2("~~~~~~~~~~~~~Graph has %d components\n",graphics->numComponents);
      for (count = 0; count < numComponents; count ++)
	debug3("numOfVert of component %d = %d\n", count, graphics->graph[count].numOfVert);
    }

  // Process each graph component and create a DrawGraph structure for each one
  dg = init_DG(graphics->graph, graphics->numComponents, _dim,  _numOfInitVert, _displayPar, _random, _FR_full, _FR_levels, _plot_all_vert, _rounds, _finalRounds, _heat_fraction, _r, _s);

  //dg->edge = 700 * 700 / _numOfVert;
  dg->edge = 32;
  if (_displayPar == 0)
    {
      int i;
      for (i = 0; i < graphics->numComponents; i ++)
	{
	  misf_engine(&graphics->graph[i], &dg[i]);
	}
    }
  else
    {
      plotGraph(argc, argv, graphics, dg, 700, 700, _slow);
    }

  c1 = clock();
  t1 = time(NULL);
        
  printf("\nUser time=%fs\nReal time=%fs\n" ,(c1-c0)/(double)CLOCKS_PER_SEC,difftime(t1,t0) );
 
  plotGraph(argc, argv, graphics, dg, 700, 700, _slow);
  
  return 0;
}


void cases(int argc, char** argv)
{
    int c;
    int arg;

    for(arg = 1; arg < argc; arg++){
        if( (argv[arg])[0] == '-' ){
            c = argv[arg][1];
            switch(c){
                case '#':
                    _numOfVert = atoi(argv[++arg]);
                    break;
		    case 'r':
                    _rounds = atoi(argv[++arg]);
                    break;
                case 'R':
                    _finalRounds = atoi(argv[++arg]);
                    break;
	        case '1':
                    _p1 = atoi(argv[++arg]);
                    break;
                case '2':
                    _p2 = atoi(argv[++arg]);
                    break;
		    /*case 'n':
	            _numOfItr = atoi(argv[++arg]);
		    break;*/
                case 'i':
	            _numOfInitVert = atoi(argv[++arg]);
		    break;
	        case 'C':
		    _use_gml_color = atoi(argv[++arg]);
		    break;
		case 'B':
		    _background_color = strtol(argv[++arg], NULL, 16);
		    break;
	        case 'F':
		    _foreground_color = strtol(argv[++arg], NULL, 16);
		    break;
                case 'S':
	            _s = atof(argv[++arg]);
	            break;
                case 'T':
		  debug2("T is %d\n",_T);
	            _T = atoi(argv[++arg]); //thickness for cylinder and torus
	            break;
	        case 'd':
                    _dim = atoi(argv[++arg]);
                    break;
                case 'g': //type of graph: complete, path, cycle,
                          //hypercube - needs extra parameter -P
                          //to specify dim,
                          //squareTorus - cycle * square - needs extra
                          //parameter -P to specify the num of el in
                          //cycle,
                          //squareCylinder - path * square - needs extra
                          //parameter -P to specify the num of el in
                          //path,
                    graphStr = argv[++arg];
                    break;
  	        case 'f':  //flag to use the full version of FR function
		    _FR_full = 1;
		    break;
	        case 'l':  //# levels FR is to be run on
		    _FR_levels = atoi(argv[++arg]);
		    break;
	        case 'h':  // heat to edge decimal ratio
		    _heat_fraction = atof(argv[++arg]);
		    break;
	        case 's':
		    _slow = atoi(argv[++arg]);
		    break;
                case 'p':  
		    _plot_all_vert = 1;
		    break;
                case 'D'://display ON/OFF switch, 0 = OFF, 1 = ON
                    _displayPar = atoi(argv[++arg]);
                    break;
	        case 'b':  //break-up components switch
		    _breakComponents = atoi(argv[++arg]);
		    break;
	        case '?':
		    _random = 1;
		    break;
                default:
                    debug2("illegal option %c\n",  (char)c);
                    debug("usage: main [#doiecsrgpbf]\n");
		    debug("# numOfVert\n");
		    debug("i number of vertices in the highest level\n");
		    debug("r rounds\n");
		    debug("t tinit_factor\n");
		    debug("f full version of Fruchterman Reingold\n");
		    debug("l # levels FR is to be applied to\n");
		    debug("n numOfItr\n");
		    debug("d depth_ratio\n");
		    debug("e edge\n");
		    debug("w width\n");
		    debug("g graph type: complete, path, cycle, torus, cylinder, hypercube\n");
		    debug("T extra parameter for torus, cylinder, and hypercube\n");
		    debug("b break up graph into disconnected components\n");
		    debug("p plot all vertices in the beginning\n");
		    debug("R final Rounds\n");
		    debug("h heat to edge decimal ratio\n");
		    debug("C read color and edge direction from GML files\n");
		    debug("B background color in hexadecimal format (omit 0x)\n");
		    debug("F foreground color in hexadecimal format (omit 0x)\n");
            }
        }
    }
}














