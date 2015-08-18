#include "MesaPlot.h"

int width = 1000;
int height = 1000;
GLdouble margin = 0.1;
Graph *graph;
DrawGraph *Dgraph;
int dgraph_free = 0;
coord_t boxSize = 1;
GLuint blueMarble = 0;
GLuint blueMarble2 = 1;
GLuint redMarble2 = 2;
GLuint bluePoint = 3;
GLuint redPoint = 4;
GLuint yellowPoint = 5;
GLuint greenPoint = 6;
GLuint genericPoint = 7;
GLuint finalDrawing;
const int VIEW_TURN_RATE = 2;
const float ZOOM_FACTOR = .1;
int color = 0;
int dim;
int average_edge_length;
int numOfVert;
int mlistSwitch = 1;   //indicates whether graph is still being processed (1) or final graph is ready (0)
int xspin = 0;
int yspin = 0;
int zspin = 0;
float dist = 1;
Point *baricenter;
size_tt numOfInitVert;
size_tt slowTime = 1;
int createList = 0;
GLfloat **Vertices;
GLenum mode = GL_RENDER;
Point *projVect;
Point *nProjVect;
Point *e1;
Point *e2;
Point *e3;
Point *component_offset;  // offset from real origin that will be the origin of each component
GLuint selected_vertex = -1;
GLuint selected_vertex_component = -1;
GLdouble sel_vert_depth = 0;
int numComponents = 1;
int directed = 0;
int MAX_VERT_NUM = 1000;
EdgeGraphics *edge_graphics;
NodeGraphics *node_graphics;
VisualGraphics *visualGraphics;
RGB_color *bgColor;
//foreground color
GLfloat mat_amb_diff_fg[] = {0.0, 0.0, 0.0, 1.0};

//parameters used for drawing arrows
#define ARROW_PIVOT_ANGLE_RATIO 4
float arrow_width;
float arrow_length;

//parameters for drawing loops
GLdouble loop_radius;
GLdouble loop_rotation_angle;


static void project(DrawGraph *dgraph, size_tt vert, GLfloat *x, GLfloat *y, GLfloat *z);

void plotGraph(int argc, char **argv, VisualGraphics *_graphics, DrawGraph *_dg, int _width, int _height, int _slowTime )
{
  int counter;
  int totalNumVert = 0;
  int totalDiam = 0;
  int maxNumVert = 0;
  int *sortedComp;
  int maxDiam = -1;
  int centerRadius;
  int lastCoord;
  int axis;   // 0 - x, 1 - y, 2 - z
  int posDir; //indicates whether move is in positive or negative direction
  int lastMax;  //records the max diameter of the outer level of components
  int edge;

  //initialize all local variables
  graph      = _graphics->graph;
  Dgraph     = _dg;
  numComponents = _graphics->numComponents;
  directed = _graphics->directed;
  edge_graphics = _graphics->edge_graphics;
  node_graphics = _graphics->node_graphics;
  Vertices = malloc(numComponents * sizeof(GLfloat *));

  //set background color
  bgColor = &_graphics->bgColor;
  visualGraphics = _graphics;

  //set foreground color
  mat_amb_diff_fg[0] = _graphics->fgColor.R/255.0;
  mat_amb_diff_fg[1] = _graphics->fgColor.G/255.0;
  mat_amb_diff_fg[2] = _graphics->fgColor.B/255.0;

  //calculate the total diameter of all components
  for(counter = 0; counter < numComponents; counter ++)
    {
      Vertices[counter] = (GLfloat *)malloc(min(dim, 3) * graph[counter].numOfVert * sizeof(GLfloat));
      totalNumVert += graph[counter].numOfVert;
      maxNumVert = max(maxNumVert, graph[counter].numOfVert);
      totalDiam += Dgraph[counter].diameter;
      debug3("diam of %d is %d\n", counter, Dgraph[counter].diameter);
      if (Dgraph[counter].diameter > maxDiam)
	maxDiam = Dgraph[counter].diameter;
    }

  MAX_VERT_NUM = maxNumVert;

  debug2("total num of vert : %d\n",totalNumVert);
  debug2("total diameter: %d\n",totalDiam);
  //numOfVert  = totalNumVert;
  width      = _width;
  height     = _height;
  dim        = Dgraph->dim;
  numOfInitVert = Dgraph->numOfInitVert;
  slowTime = _slowTime;
  Dgraph->edge = 32;
  average_edge_length = sqrt(width * height / totalNumVert);
  debug2("edge is %d\n", Dgraph->edge);

  edge = Dgraph->edge;

  //these variables used for drawing of edges and loops
  arrow_width = 1;
  arrow_length = 3;

  loop_radius = 5;
  loop_rotation_angle = asin(arrow_length/(2 * loop_radius)) * 180.0/M_PI;


  /**************************************************************************
   *  Sort the components by degree. Place the biggest one at the origin and
   *  place the smaller components outside of the diameter of the biggest 
   ***************************************************************************/

  sortedComp = sort_components_by_diam(Dgraph, maxDiam, numComponents);
  component_offset = (Point *)malloc(numComponents * sizeof(Point));
  initialize_Point(&component_offset[sortedComp[0]], 0, 0, 0, 0, dim);
  debug3("offset of component 0: (%d,%d)\n",  get_coord(&component_offset[0], 0),  get_coord(&component_offset[0], 1) );
  centerRadius = ROUND((float)Dgraph[sortedComp[0]].diameter / 2.0);
  //we start off by moving up in y direction
  axis = 1;
  posDir = 1;
  lastCoord = 0;
  lastMax = 0;


  for(counter = 1; counter < numComponents; counter ++)
    {
      int diam = Dgraph[sortedComp[counter]].diameter;
      //keep track of biggest diameter of current level
      if (diam > lastMax)
	lastMax = diam;

      if (posDir)
	lastCoord += ROUND( (diam + 1.0)/2.0);
      else 
	lastCoord -= ROUND( (diam + 1.0)/2.0);

      if (axis == 0)
	initialize_Point(&component_offset[sortedComp[counter]], lastCoord*edge, centerRadius*edge, 0, 0, dim);
      else if (axis == 1)
	initialize_Point(&component_offset[sortedComp[counter]], centerRadius*edge, lastCoord*edge, 0, 0, dim);
      else 
	initialize_Point(&component_offset[sortedComp[counter]], centerRadius*edge, 0, lastCoord*edge, 0, dim);

      debug4("offset of component %d: (%d,%d)\n", sortedComp[counter], get_coord(&component_offset[sortedComp[counter]], 0),  get_coord(&component_offset[sortedComp[counter]], 1));
      // Movement is counter clockwise
      if (posDir && lastCoord > abs(centerRadius))
	{
	  if (centerRadius > 0)  //finished move in positive y, will move in negative x
	    {
	      axis = 0;
	      posDir = 0;
	      lastCoord = 0;
	    }
	  else  //finished moving in positive x, will move in positive y
	    {
	      centerRadius *= -1;  //becomes positive
	      axis = 1;
	      posDir = 1;
	      lastCoord = 0;
	      //centerRadius will be moved at the edge of current level
	      centerRadius += lastMax + 2;
	      lastMax = 0;
	    }
	}
      else  if (!posDir && lastCoord < -abs(centerRadius)) 
	// last movement was in negative direction along 'axis'
	{
	  if (centerRadius > 0)  //finished move in negative x, will move in negative y
	    {
	      centerRadius *= -1;  //becomes negative
	      axis = 0;
	      posDir = 0;
	      lastCoord = 0;
	    }
	  else  //finished moving in negative y, will move in positive x
	    {
	      axis = 0;
	      posDir = 1;
	      lastCoord = 0;
	    }
	}
	
    }
  /********************************************************
   *  End sort components
   *******************************************************/


  
  boxSize = (coord_t)(Dgraph->edge  * 1.5 * centerRadius) + 50;
 

  // computer project vector for 4D graphs
  if( dim == 4 )
    {
      float pe1, pe2, pe3, e1e2, e1e3, e2e3;
      coord_t box2Size = 2 * boxSize + 1;

      srand(time(NULL));
      
      projVect  = construct_Point_f(
             (GLfloat)(rand() % box2Size) - boxSize,
             (GLfloat)(rand() % box2Size) - boxSize,
             (GLfloat)(rand() % box2Size) - boxSize,
             (GLfloat)(rand() % box2Size) - boxSize, dim);
        

        nProjVect = fpoint_div(projVect,fnorm(projVect));
    
        //
        // COMPUTING ORTHONORMAL BASIS OF THE PLANE PERPENDICULAR TO PROJVECT
        //
    
        // choosing e1
        e1 = construct_Point_f((GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize, dim);
    
        pe1 = nProjVect->coord.f[0] * e1->coord.f[0] +
	      nProjVect->coord.f[1] * e1->coord.f[1] +
	      nProjVect->coord.f[2] * e1->coord.f[2] +
              nProjVect->coord.f[3] * e1->coord.f[3];

	point_minus_eq(e1, fpoint_mult(nProjVect, pe1));
	
        fpoint_div_eq(e1, (double)fnorm(e1));

        // choosing e2
        e2 = construct_Point_f((GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize, dim);

        pe2 = fpoint_scalar_product(nProjVect, e2);
        e1e2 = fpoint_scalar_product( e1, e2);
    
	point_minus_eq(e2, fpoint_mult(nProjVect, pe2));
	point_minus_eq(e2, fpoint_mult(e1, e1e2));
	fpoint_div_eq(e2, (double)fnorm(e2));

        while( (0.9 < e1e2 && e1e2 < 1.1) || (-1.1 < e1e2 && e1e2 < -0.9))
	{
            e2 = construct_Point_f((GLfloat)(rand() % box2Size) - boxSize,
                                   (GLfloat)(rand() % box2Size) - boxSize,
                                   (GLfloat)(rand() % box2Size) - boxSize,
                                   (GLfloat)(rand() % box2Size) - boxSize, dim);
        
            pe2 = nProjVect->coord.f[0] * e2->coord.f[0] +
                  nProjVect->coord.f[1] * e2->coord.f[1] +
                  nProjVect->coord.f[2] * e2->coord.f[2] +
                  nProjVect->coord.f[3] * e2->coord.f[3];

	    point_minus_eq(e2, fpoint_mult(nProjVect, pe2));
	    e1e2 = fpoint_scalar_product( e1, e2);
	    point_minus_eq(e2, fpoint_mult(e1, e1e2));
	    fpoint_div_eq(e2, (double)fnorm(e2));

        }
    
        // choosing e3
        e3 = construct_Point_f((GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize,
                               (GLfloat)(rand() % box2Size) - boxSize, dim);

        pe3 = nProjVect->coord.f[0] * e3->coord.f[0] +
              nProjVect->coord.f[1] * e3->coord.f[1] +
              nProjVect->coord.f[2] * e3->coord.f[2] +
              nProjVect->coord.f[3] * e3->coord.f[3];
	
	point_minus_eq(e3, fpoint_mult(nProjVect, pe3));
        e1e3 = fpoint_scalar_product(e1, e3);
	point_minus_eq(e3, fpoint_mult(e1, e1e3));
	e2e3 = fpoint_scalar_product(e2, e3);
	point_minus_eq(e3, fpoint_mult(e2, e2e3));
	fpoint_div_eq(e3, (double)fnorm(e3));
 
        //checking if e3 is not too close to e1 or e2

        while( (0.9 < e1e3 && e1e3 < 1.1) || (-1.1 < e1e3 && e1e3 < -0.9) ||
               (0.9 < e2e3 && e2e3 < 1.1) || (-1.1 < e2e3 && e2e3 < -0.9)){
            e3 = construct_Point_f((GLfloat)(rand() % box2Size) - boxSize,
                                   (GLfloat)(rand() % box2Size) - boxSize,
                                   (GLfloat)(rand() % box2Size) - boxSize,
                                   (GLfloat)(rand() % box2Size) - boxSize, dim);
        
            pe3 = nProjVect->coord.f[0] * e3->coord.f[0] +
                  nProjVect->coord.f[1] * e3->coord.f[1] +
                  nProjVect->coord.f[2] * e3->coord.f[2] +
                  nProjVect->coord.f[3] * e3->coord.f[3];
	    
	    point_minus_eq(e3, fpoint_mult(nProjVect, pe3));
	    e1e3 = fpoint_scalar_product(e1, e3);
	    point_minus_eq(e3, fpoint_mult(e1, e1e3));
	    e2e3 = fpoint_scalar_product(e2, e3);
	    point_minus_eq(e3, fpoint_mult(e2, e2e3));
	    fpoint_div_eq(e3, (double)fnorm(e3));
        }

//      debug("projVect="<< projVect<<"\nnProjVect="<< nProjVect<<
//            "\ne1="<< e1<<", e1*nProjVect="<<e1*nProjVect<< 
//            "\ne2="<< e2<<", e2*nProjVect="<<e2*nProjVect<<", e1*e2="<<e1*e2<<
//            "\ne3="<< e3<<", e3*nProjVect="<<e3*nProjVect<<
//            ", e1*e3="<<e1*e3<<", e2*e3="<<e2*e3);
//      exit(1);
    }

  draw_Graph(argc, argv);
}



void draw_Graph(int argc, char** argv)
{
    glutInit(&argc, argv);
    glutInitDisplayMode (GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize (width, height);
    glutInitWindowPosition(205, 25);
    glutCreateWindow(argv[0]);
    init();
    init2();
    glutDisplayFunc(display);
    glutReshapeFunc(reshape);
    glutKeyboardFunc (keyboard);
    glutMouseFunc(mouse);
    glutSpecialFunc(special);
    glutIdleFunc(engine);
    debug("Initializing\n");

    glutMainLoop();

}

void init()
{

   GLfloat no_mat[] = { 0.0, 0.0, 0.0, 1.0 };
   GLfloat mat_diffuse_blue[] = { 0.1, 0.5, 0.8, 1.0 };
   GLfloat mat_diffuse_red[] = { 1.0, 0.1, 0.1, 1.0 };
   GLfloat mat_amb_diff_yellow[]  = {1.0, 1.0, 0.0, 1.0};
   //GLfloat mat_amb_diff_green[]  = {0.0, 1.0, 0.0, 1.0};
   GLfloat mat_specular[] = { 1.0, 1.0, 1.0, 1.0 };
   GLfloat high_shininess[] = { 100.0 };

   GLint shorterEdge = (width > height) ? height : width;
   GLfloat MarbleRadius;

   glMaterialfv(GL_FRONT, GL_AMBIENT, no_mat);
   glMaterialfv(GL_FRONT, GL_DIFFUSE, mat_diffuse_blue);
   glMaterialfv(GL_FRONT, GL_SPECULAR, mat_specular);
   glMaterialfv(GL_FRONT, GL_SHININESS, high_shininess);
   glMaterialfv(GL_FRONT, GL_EMISSION, no_mat);

   glEnable(GL_DEPTH_TEST);
   glShadeModel(GL_SMOOTH);

  
   MarbleRadius = 10;

//   blueMarble2
   glNewList (blueMarble2, GL_COMPILE);
   glMaterialfv(GL_FRONT, GL_DIFFUSE, mat_amb_diff_yellow);
   glutSolidSphere(MarbleRadius * boxSize / shorterEdge, 5, 5);
   glEndList();

//   redMarble2 
   glNewList (redMarble2, GL_COMPILE);
   glMaterialfv(GL_FRONT, GL_DIFFUSE, mat_diffuse_red);
   glutSolidSphere(MarbleRadius * boxSize /shorterEdge, 5, 5);
   glEndList();
   
}

void init2()
{
   GLfloat mat_amb_diff_red[]   = {1.0, 0.0, 0.0, 1.0};
   GLfloat mat_amb_diff_blue[]    = {0.0, 0.0, 1.0, 1.0};
   GLfloat mat_amb_diff_yellow[]  = {1.0, 1.0, 0.0, 1.0};
   GLfloat mat_amb_diff_green[]   = {0.0, 1.0, 0.0, 1.0};


   //   if(color)
   //glClearColor(1.0, 1.0, 1.0, 0.0);
   //else
   //glClearColor(0.0, 0.0, 0.0, 0.0);

   glClearColor(bgColor->R/255.0, bgColor->G/255.0, bgColor->B/255.0, 0.0);

//   bluePoint
   glNewList (bluePoint, GL_COMPILE);
   glPointSize(1.5);
   glMaterialfv(GL_FRONT, GL_AMBIENT, mat_amb_diff_blue);
   glBegin(GL_POINTS);
   glVertex3f(0,0,0);
   glEnd();
   glEndList();

// yellowPoint
   glNewList (yellowPoint, GL_COMPILE);
   glPointSize(1.5);
   glMaterialfv(GL_FRONT, GL_AMBIENT, mat_amb_diff_yellow);
   glBegin(GL_POINTS);
   glVertex3f(0,0,0);
   glEnd();
   glEndList();

//   redPoint
   glNewList (redPoint, GL_COMPILE);
   glPointSize(1.5);
   glMaterialfv(GL_FRONT, GL_AMBIENT, mat_amb_diff_red);
   glBegin(GL_POINTS);
   glVertex3f(0,0,0);
   glEnd();
   glEndList();

//   greenPoint
   glNewList (greenPoint, GL_COMPILE);
   glPointSize(1.5);
   glMaterialfv(GL_FRONT, GL_AMBIENT, mat_amb_diff_green);
   glBegin(GL_POINTS);
   glVertex3f(0,0,0);
   glEnd();
   glEndList();

// genericPoint (with fgColor)
   glNewList (genericPoint, GL_COMPILE);
   glPointSize(1.5);
   glMaterialfv(GL_FRONT, GL_AMBIENT, mat_amb_diff_fg);
   glBegin(GL_POINTS);
   glVertex3f(0,0,0);
   glEnd();
   glEndList();
}


void display()
{
    
    size_tt marbleTreshold = 80;
    size_tt mSize = numOfInitVert; 
    size_tt misfSize = 0;
    size_tt prevMisfSize = 0;
    size_tt misfLevel = 0;
    size_tt vert;
    int v;
    int currComp;  // current component
    int numOfVert;

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    //for each component, draw graph
    for(currComp = 0; currComp < numComponents; currComp ++)
      {
	DrawGraph * dgraph = &Dgraph[currComp];  //draw graph struct for current component
	Graph * gr = &graph[currComp];
	EdgeGraphics *curr_edge_gr = NULL;
	NodeGraphics *curr_node_gr = NULL;
	GLfloat *vertices = Vertices[currComp];
	numOfVert = graph[currComp].numOfVert;

	//check whether edge and node graphic properties were read in from gml file, will be null for internal graphs
	if (edge_graphics)
	   curr_edge_gr = &edge_graphics[currComp];

	if (node_graphics)
	  curr_node_gr = &node_graphics[currComp];

	//only perform in intermideate stages of algorithm
	if(mlistSwitch)
	  {
	    debug("Displaying graph\n");
	    debug2("Component %d\n", currComp);
	    debug2("depth %d\n",dgraph->misf->depth);
	    if (dgraph->currLevel < 0)
	      misfLevel = 0;
	    else
	      misfLevel = dgraph->currLevel;
	    
	    misfSize = dgraph->misf->size[misfLevel];
	    
	    if (misfSize == numOfInitVert)
	      prevMisfSize = 0;
	    else 
	      prevMisfSize = dgraph->misf->size[misfLevel + 1];
	    
	    debug2("misfSize %d\n",misfSize);
	  }
	
	if(createList && !currComp)
	  {
	    // draw nice (antialiased) edges
	    finalDrawing = glGenLists(1);
	    glEnable(GL_LINE_SMOOTH);
	    glEnable(GL_BLEND);
	    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	    glHint(GL_LINE_SMOOTH_HINT, GL_FASTEST);
	  }
	lighting();
	
	//only perform in intermideate stages of algorithm
	if(mlistSwitch )
	  {
	    if(createList && !currComp)
	      glNewList(finalDrawing, GL_COMPILE);
	    
	    // compute the baricenter of the current set of vertices
	    if(misfSize == dgraph->numOfInitVert || misfSize != mSize )
	      {
		{
		  baricenter = construct_Point(0, 0, 0, 0, dgraph->dim);
		  for(v = 0; v < misfSize; v++) 
		    point_plus_eq(baricenter,  &dgraph->pos[dgraph->misf->filt[v]]);
		  point_div_eq(baricenter, (coord_t)misfSize);
		}
		
		// shift position vectors so that the baricenter is
		// at (0,0,0)
		
		{
		  for(v = 0; v < misfSize; v++) 
		    point_minus_eq(&dgraph->pos[dgraph->misf->filt[v]], baricenter);
		}
		mSize = misfSize;
	      }

	    // translate the coordinate plane to be centered around origin of current component

	    // draw vertices
	    for(v = 0; v < misfSize; v++) 
	      {
		vert = dgraph->misf->filt[v];
		//debug2("vertex to be drawn %d\n",vert);
		glPushMatrix();

		// apply the offset for this component
		if (dim == 3)
		  glTranslatef ((GLfloat)(component_offset[currComp].coord.d[0]),
				(GLfloat)(component_offset[currComp].coord.d[1]),
				(GLfloat)(component_offset[currComp].coord.d[2]));
		else /* dim = 2 */
		  glTranslatef ((GLfloat)(component_offset[currComp].coord.d[0]),
				(GLfloat)(component_offset[currComp].coord.d[1]),
				0.0);
		// end apply offset

		if( dim == 4 )
		  {
		    GLfloat x, y, z;
		    project(dgraph, vert, &x, &y, &z);
		    glTranslatef(x, y, z);
		  } 
		else if (dim == 3)
		  glTranslatef ((GLfloat)(dgraph->pos[vert].coord.d[0]),
				(GLfloat)(dgraph->pos[vert].coord.d[1]),
				(GLfloat)(dgraph->pos[vert].coord.d[2]));
		else /* dim = 2 */
		  glTranslatef ((GLfloat)(dgraph->pos[vert].coord.d[0]),
				(GLfloat)(dgraph->pos[vert].coord.d[1]),
				0.0);      
		
		if(v >= prevMisfSize && !dgraph->createList)
		  if(misfSize < marbleTreshold)
                    glCallList(blueMarble2);
		  else
		    glCallList(yellowPoint);
		else
		  {
		    if(color) 
		      {
			if(misfSize < marbleTreshold)
			  glCallList(redMarble2);
			else
			  glCallList(redPoint);
		      }
		    else
		      {
			glCallList(greenPoint);
		      }
		  }

		glPopMatrix();
	      }// end of draw vertices

	    debug2("current level %d\n",dgraph->currLevel);

	    // draw edges
	    if( !misfLevel )
	      {
		int av;
		int vert;
		int axis;
		size_tt adjVert;
		debug("drawing edges\n");
		for(vert = 0; vert < numOfVert-1; vert++)
		  {
		    size_tt deg = gr->adjList[0][vert]; /* degree[vert] */
		    
		    for(adjVert = 0; adjVert < deg; adjVert++)
		      {
			if( (av = gr->adjList[vert+1][adjVert]) > vert )
			  {
			    //debug3("edge %d->%d\n", vert, av);

			    glMaterialfv(GL_FRONT, GL_AMBIENT_AND_DIFFUSE,
					   mat_amb_diff_fg);
			    glPushMatrix();

			    // apply the offset for this component
			    if (dim == 3)
			      glTranslatef ((GLfloat)(component_offset[currComp].coord.d[0]),
					    (GLfloat)(component_offset[currComp].coord.d[1]),
					    (GLfloat)(component_offset[currComp].coord.d[2]));
			    else /* dim = 2 */
			      glTranslatef ((GLfloat)(component_offset[currComp].coord.d[0]),
					    (GLfloat)(component_offset[currComp].coord.d[1]),
					    0.0);
			    // end apply offset

			    glBegin(GL_LINES);
			    if( dim == 4 )
			      {
				GLfloat x, y, z;
				project(dgraph, vert, &x, &y, &z);
				glVertex3f(x, y, z);
				project(dgraph, av, &x, &y, &z);
				glVertex3f(x, y, z);
			      } 
			    else if (dim == 3)
			      {
				glVertex3f((GLfloat)(dgraph->pos[vert].coord.d[0]),
					   (GLfloat)(dgraph->pos[vert].coord.d[1]),
					   (GLfloat)(dgraph->pos[vert].coord.d[2]));
				glVertex3f((GLfloat)(dgraph->pos[av].coord.d[0]),
					   (GLfloat)(dgraph->pos[av].coord.d[1]),
					   (GLfloat)(dgraph->pos[av].coord.d[2]));
			      }
			    else /* dim = 2 */
			      {
				glVertex2f((GLfloat)(dgraph->pos[vert].coord.d[0]),
					   (GLfloat)(dgraph->pos[vert].coord.d[1]));
				glVertex2f((GLfloat)(dgraph->pos[av].coord.d[0]),
					   (GLfloat)(dgraph->pos[av].coord.d[1]));
			      }
			    glEnd();
			    glPopMatrix();
			    //debug("end draw edges\n");
			  }
		      }
		  }


		/*  Store all vertex position in the vertices array that used to draw final graph */
		if (dim == 4)
		  {
		    GLfloat x, y, z;
		    for(vert = 0; vert < numOfVert; vert++)
		      {
			/* vertices are drawn in 3D because they are projected down */
			project(dgraph, vert, &x, &y, &z);
			
			vertices[3 * vert  + 0] = x + component_offset[currComp].coord.d[0];
			vertices[3 * vert  + 1] = y + component_offset[currComp].coord.d[1];
			vertices[3 * vert  + 2] = z + component_offset[currComp].coord.d[2];
			debug2("(%d)",vert);
			for (axis = 0; axis < 3; axis ++)
			  debug4("vertices[%d][%d]=%f,", currComp, 3 * vert+axis,vertices[3 * vert+axis]);
			debug("\n");
		      }
		  }
		else
		  {
		    for(vert = 0; vert < numOfVert; vert++)
		      {
			debug2("(%d)",vert);
			for(axis = 0; axis < dim; axis ++)
			  {
			    vertices[dim * vert + axis] = (GLfloat)dgraph->pos[vert].coord.d[axis] + component_offset[currComp].coord.d[axis];
			    debug4("vertices[%d][%d]=%f,", currComp, dim * vert+axis,vertices[dim * vert+axis]);
			  }
			debug("\n");
		      }
		  }
	  }// end of draw edges
	    
	    //intermediate stages are complete, final graph ready
	    if( createList && currComp == numComponents -1) 
	      {
		debug("create list is true\n");
		glEndList();
		mlistSwitch = 0;

		//free the memory used for drawgraph
		free_DrawGraph(Dgraph);
		dgraph_free = 1;
	      }
    
	  }
	else    //****************  draw final Drawing *********************
	  {
	    //GLfloat mat_amb_diff_green[]   = {0.0, 1.0, 0.0, 1.0};
	    //GLfloat mat_amb_diff_red[]   = {1.0, 0.0, 0.0, 1.0};
	    int i;
	    int vert;
	    int av;
	    size_tt adjVert; 
	    
	    dim = min(dim, 3);
	    
	    debug("final drawing\n");
	    
	    // Only perform these graphic effects before the first component
	    // They will stay active for each consecutive component
	    if (!currComp)
	      {
		lighting();
	      }
	    
	    glPushMatrix();
		
	    glMaterialfv(GL_FRONT, GL_AMBIENT_AND_DIFFUSE, mat_amb_diff_fg);

	    glRotatef(xspin, 1.0, 0.0, 0.0);
	    glRotatef(yspin, 0.0, 1.0, 0.0);
	    glRotatef(zspin, 0.0, 0.0, 1.0);
	    
	    glScalef(dist, dist, dist);
	    
	    //  --- Draw vertices
	    glEnableClientState(GL_VERTEX_ARRAY);
	      
	    glVertexPointer( min(dim, 3), GL_FLOAT, 0, vertices);

	    for (i = 0; i < numOfVert;i ++)
	      {
		//set individual colors for each vertex if specified
		if (curr_node_gr)
		  {
		    RGB_color curr_color = curr_node_gr->colors[i];
		    glEnable(GL_COLOR_MATERIAL);
		    glColorMaterial(GL_FRONT,GL_AMBIENT);
		    glColor3ub(curr_color.R, curr_color.G, curr_color.B);
		    glColorMaterial(GL_FRONT,GL_DIFFUSE);
		    glColor3ub(curr_color.R, curr_color.G, curr_color.B);	
		    glDisable(GL_COLOR_MATERIAL);
		  }
		
		//this is used for moving vertices with the mouse
		if (mode == GL_SELECT)
		  glLoadName(currComp * MAX_VERT_NUM + i);

		glBegin(GL_POINTS);
		glArrayElement(i);
		glEnd();
		
		//checking for loops
		if (curr_edge_gr && !(curr_edge_gr->loops[i].opaque))
		  { //this vertex has a self-loop
		    RGB_color curr_color = curr_edge_gr->loops[i];

		    debug2("Vertex %d has a loop\n", i);
		    glPushMatrix();

		    glEnable(GL_COLOR_MATERIAL);
		    glColorMaterial(GL_FRONT,GL_AMBIENT);
		    glColor3ub(curr_color.R, curr_color.G, curr_color.B);
		    glColorMaterial(GL_FRONT,GL_DIFFUSE);
		    glColor3ub(curr_color.R, curr_color.G, curr_color.B);
		    glDisable(GL_COLOR_MATERIAL);

		    //move the origin to the vertex
		    if (dim > 2)
		      {
			glTranslatef ((GLfloat)(vertices[3 * i + 0]),
				      (GLfloat)(vertices[3 * i + 1]),
				      (GLfloat)(vertices[3 * i + 2]));
			drawLoop(vertices[3 * i + 0], vertices[3 * i + 1], vertices[3 * i + 2]);
		      }
		    else /* dim = 2 */
		      {
			glTranslatef ((GLfloat)(vertices[2 * i + 0]),
				      (GLfloat)(vertices[2 * i + 1]),
				      0.0);
			drawLoop(vertices[2 * i + 0], vertices[2 * i + 1], 0);
		      }
		    glPopMatrix();
		  }    
	      }
	    
	    //  --- Draw edges
	    if (mode != GL_SELECT)
	      {
		Graph *gr = &graph[currComp];

		debug("drawing edges\n");
		for(vert = 0; vert < numOfVert; vert++)
		  {
		    size_tt deg = gr->adjList[0][vert]; /* degree[vert] */

		    for(adjVert = 0; adjVert < deg; adjVert++)
		      {
			/*  draw undirected edge */
			if( (av = gr->adjList[vert+1][adjVert]) > vert && !directed)
			  {
			    //set color for each edge if provided
			    if (curr_edge_gr)  //color provided
			      {
				RGB_color curr_color = curr_edge_gr->colors[vert][adjVert];

				glEnable(GL_COLOR_MATERIAL);
				glColorMaterial(GL_FRONT,GL_AMBIENT);
				glColor3ub(curr_color.R, curr_color.G, curr_color.B);
				glColorMaterial(GL_FRONT,GL_DIFFUSE);
				glColor3ub(curr_color.R, curr_color.G, curr_color.B);
				glDisable(GL_COLOR_MATERIAL);
			      }


			    glPushMatrix();
			    glBegin(GL_LINES);
			    
			    if (dim > 2)
			      {
				glVertex3f(vertices[3 * vert + 0],
					   vertices[3 * vert + 1],
					   vertices[3 * vert + 2]);
				glVertex3f(vertices[3 * av + 0],
					   vertices[3 * av + 1],
					   vertices[3 * av + 2]);
			      }
			    else 
			      { //dim = 2
				glVertex2f(vertices[2 * vert + 0],
					   vertices[2 * vert + 1]);
				glVertex2f(vertices[2 * av + 0],
					   vertices[2 * av + 1]);
			      }
			    glEnd();
			    glPopMatrix();
			  }
			/* draw directed edges (possibly bi-directed) */
			else if(directed && !curr_edge_gr->colors[vert][adjVert].opaque) 
			  {  //graph is directed and edge exists
			    RGB_color curr_color = curr_edge_gr->colors[vert][adjVert];

			    glEnable(GL_COLOR_MATERIAL);
			    glColorMaterial(GL_FRONT,GL_AMBIENT);
			    glColor3ub(curr_color.R, curr_color.G, curr_color.B);
			    glColorMaterial(GL_FRONT,GL_DIFFUSE);
			    glColor3ub(curr_color.R, curr_color.G, curr_color.B);
			    glDisable(GL_COLOR_MATERIAL);

			    glPushMatrix();
			    //draw edge as straight line if it's single directional
			    if (!curr_edge_gr->bidirectional[vert][adjVert])
			      {				
				if (dim > 2)
				  {
				    glTranslatef(vertices[3 * vert + 0],
						 vertices[3 * vert + 1],
						 vertices[3 * vert + 2]);
				    drawDirectedEdge(vertices[3 * av + 0] - vertices[3 * vert + 0],
						     vertices[3 * av + 1] - vertices[3 * vert + 1],
						     vertices[3 * av + 2] - vertices[3 * vert + 2]);
				  }
				else 
				  { //dim = 2
				    glTranslatef(vertices[2 * vert + 0],
						 vertices[2 * vert + 1],
						 0.0);
				    drawDirectedEdge(vertices[2 * av + 0] - vertices[2 * vert + 0],
						     vertices[2 * av + 1] - vertices[2 * vert + 1],
						     0.0);
				  }			
			      }
			    else  //edge is bidirectional
			      {
				if (dim > 2)
				  {
				    glTranslatef(vertices[3 * vert + 0],
						 vertices[3 * vert + 1],
						 vertices[3 * vert + 2]);
				    drawArc(vertices[3 * av + 0] - vertices[3 * vert + 0],
					    vertices[3 * av + 1] - vertices[3 * vert + 1],
					    vertices[3 * av + 2] - vertices[3 * vert + 2]);
				  }
				else
				  { //dim = 2
				    glTranslatef(vertices[2 * vert + 0],
						 vertices[2 * vert + 1],
						 0.0);
				    drawArc(vertices[2 * av + 0] - vertices[2 * vert + 0],
					    vertices[2 * av + 1] - vertices[2 * vert + 1],
					    0.0);
				  }
			      }
			    glPopMatrix();
			  }
		      } //end for (adjVert =0....
		  } //end for (vert = 0.....
	      } //enf if (mode != GL_SELECT)...
	     glPopMatrix();
	  }
      }
    glutSwapBuffers();
}

void lighting()
{
    float x = 2 * width;
    
    GLfloat position[] = {x, x, x, 1.0};
    GLfloat ambient[] = { 1.0, 1.0, 1.0, 1.0 };
    
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glEnable(GL_NORMALIZE);
    glDepthFunc(GL_LESS);
    glLightfv(GL_LIGHT0, GL_AMBIENT, ambient);
    glLightfv(GL_LIGHT0, GL_POSITION, position);

}


void reshape(int w, int h)
{   
    //update global window dimension variables accordingly
    width = w;
    height = h;

    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    if (w <= h ) {
        glOrtho (-(1.0 + margin) * boxSize,
                 (1.0 + margin) * boxSize,
                 -(((GLfloat)h)/(GLfloat)w + margin) * boxSize,
                 (((GLfloat)h)/(GLfloat)w + margin) * boxSize,
                 -10.0 * boxSize, 10.0 * boxSize);
    }
    else
      glOrtho(-(((GLfloat)w)/(GLfloat)h + margin) * boxSize,
	      (((GLfloat)w)/(GLfloat)h + margin) * boxSize,
	      -(1.0 + margin) * boxSize,
	      (1.0 + margin) * boxSize,
	      -10.0 * boxSize, 10.0 * boxSize);

    // glOrtho (-margin,(GLfloat)w/((GLfloat)h) + margin,
    //           -margin, 1.0 + margin,
    //           -10.0, 10.0);
    
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}


void keyboard(unsigned char key, int x, int y)
{
    switch (key) {
        case 'r':
            glutIdleFunc(engine);
            break;
        case 's':
            glutIdleFunc(NULL);
            break;
        case 'f':
            move_Forward();
            break;
        case 'b':
            move_Backward();
            break;
        case 'x':
            glutIdleFunc(x_Rotate_CC);
            break;
        case 'X':
            glutIdleFunc(x_Rotate_CW);
            break;
        case 'y':
            glutIdleFunc(y_Rotate_CC);
            break;
        case 'Y':
            glutIdleFunc(y_Rotate_CW);
            break;
        case 'z':
            glutIdleFunc(z_Rotate_CC);
            break;
        case 'Z':
            glutIdleFunc(z_Rotate_CW);
            break;
        case 27:
        case 'q':
        case 'Q':
	    //free all memory before exiting
	    if(!dgraph_free)
	      {
		free_DrawGraph(Dgraph);
	      }
	    free_graphics(visualGraphics);
	    free_memory();
            exit(0);
            break;
            
    }
}

#define BUFSIZE 512

//process mouse clicks, only used to move vertices
void mouse(int button, int state, int x, int y)
{
  char but[10];
  char position[4];
  GLuint selectBuf[BUFSIZE];
  GLint hits;
  GLint viewport[4];
  GLdouble mvmatrix[16], projmatrix[16];
  GLint realy;
  GLdouble wx, wy, wz;
  int i;
  GLdouble *depths;
  int currComp;

  switch (button)
    {
    case GLUT_LEFT_BUTTON:
      strcpy(but, "left");
      break;
    case GLUT_MIDDLE_BUTTON:
      strcpy(but, "middle");
      break;
    case GLUT_RIGHT_BUTTON:
      strcpy(but, "right");
      break;
    }

  switch (state)
    {
    case GLUT_UP:
      strcpy(position, "up");
      if (selected_vertex != -1)
	{
	  glGetIntegerv(GL_VIEWPORT, viewport);
	  glGetDoublev(GL_MODELVIEW_MATRIX, mvmatrix);
	  glGetDoublev(GL_PROJECTION_MATRIX, projmatrix);

	  realy = viewport[3] - (GLint) y - 1;
	  debug2("selected vertex is: %d\n", selected_vertex);
	  debug2("selected depth : %f\n", sel_vert_depth);
	  gluUnProject((GLdouble) x, (GLdouble) realy, sel_vert_depth - 0.5, mvmatrix, projmatrix, viewport, &wx, &wy, &wz);

	  /* take scaling into account and un-scale points before processing */
	  if (dist > 1)
	    {
	      wx /= dist;
	      wy /= dist;
	      wz /= dist;
	    }

	  debug4("new coords are (%f, %f, %f)\n",wx, wy, wz);

	  //update the vertex array to reflect new position of chosen vertex
	  Vertices[selected_vertex_component][dim * selected_vertex + 0] = wx;
	  Vertices[selected_vertex_component][dim * selected_vertex + 1] = wy;
	  if (dim > 2)
	    Vertices[selected_vertex_component][3 * selected_vertex + 2] = wz / 2.0;
	  glutPostRedisplay();
	  selected_vertex = -1;
	}
      break;

    case GLUT_DOWN:

      /* calculate the closest vertex if any and store a reference to it */

      glGetIntegerv(GL_VIEWPORT, viewport);
      glGetDoublev(GL_MODELVIEW_MATRIX, mvmatrix);
      glGetDoublev(GL_PROJECTION_MATRIX, projmatrix);
      glSelectBuffer(BUFSIZE, selectBuf);
      glRenderMode(GL_SELECT);

      realy = viewport[3] - (GLint) y - 1;

      glInitNames();
      glPushName(0);

      glMatrixMode(GL_PROJECTION);
      glPushMatrix();
      glLoadIdentity();
      //set the box around the click, within which vertices will be looked at
      gluPickMatrix((GLdouble) x, (GLdouble) realy, average_edge_length/2.0, average_edge_length/2.0, viewport);

      mode = GL_SELECT;
      debug2("boxSize %d\n",boxSize);
      if (width <= height ) 
	{
	  glOrtho (-(1.0 + margin) * boxSize,
                    (1.0 + margin) * boxSize,
                   -(((GLfloat)height)/(GLfloat)width + margin) * boxSize,
                    (((GLfloat)height)/(GLfloat)width + margin) * boxSize,
		   -10.0 * boxSize, 10.0 * boxSize);
	}
      else
	glOrtho(-(((GLfloat)width)/(GLfloat)height + margin) * boxSize,
		(((GLfloat)width)/(GLfloat)height + margin) * boxSize,
		-(1.0 + margin) * boxSize,
		(1.0 + margin) * boxSize,
		-10.0 * boxSize, 10.0 * boxSize);

      display();
      glPopMatrix();
      glFlush();

      hits = glRenderMode(GL_RENDER);
      debug2("HITS %d\n",hits);
      mode = GL_RENDER;
      
      // get the depth value (z coord)
      depths = processHits(hits, selectBuf);
      
      if (hits > 0) /* will determine vertex closest to position of mouse click */
	{
	  int smallest_dist = 9999999;
	  for (i = 0; i < hits; i ++)
	    {
	      float sum= 0;
	      int vert = selectBuf[i * 4 + 3];
	      debug2("PROCESSING vertex %d\n", vert);
	      debug2("z coord(depth) = %f\n",depths[i]);
	      gluUnProject((GLdouble) x, (GLdouble) realy, depths[i] - 0.5, mvmatrix, projmatrix, viewport, &wx, &wy, &wz);
	      wz /= 2.0;

	      /* take scaling into account and un-scale points before processing */
	      if (dist > 1)
		{
		  wx /= dist;
		  wy /= dist;
		  wz /= dist;
		}

	      debug4("world coords are (%f, %f, %f)\n",wx, wy, wz);

	      //get the component of the vertex
	      currComp = vert / MAX_VERT_NUM;
	      vert = vert % MAX_VERT_NUM;  //only the last 3 digits indicate the vertex number

	      if (dim == 2)
		{
		debug3("real coords are  (%f, %f)\n", Vertices[currComp][dim * vert], Vertices[currComp][dim * vert + 1]);
		}
	      else 
		debug4("real coords are  (%f, %f, %f)\n", Vertices[currComp][dim * vert], Vertices[currComp][dim * vert + 1], Vertices[0][dim * vert + 2]);
	      //calculating difference from real coords
	      sum += (wx - Vertices[currComp][dim * vert]) * (wx - Vertices[currComp][dim * vert]);
	      sum += (wy - Vertices[currComp][dim * vert + 1]) * (wy - Vertices[currComp][dim * vert + 1]);
	      if (dim > 2)
		sum += (wz - Vertices[currComp][dim * vert + 2]) * (wz - Vertices[currComp][dim * vert + 2]);
	      sum = sqrt(sum);
	      debug2("distance from real point: %f\n", sum);
	      if (sum < smallest_dist)
		{
		  selected_vertex = vert;
		  selected_vertex_component = currComp;
		  sel_vert_depth = depths[i];
		  smallest_dist = sum;
		}
	    }

	  free(depths);
	}

      strcpy(position, "down");
      break;
    }
  debug5("%s button is %s at (%d,%d)\n",but, position, x, y);
}

void special(int key, int x, int y)
{
    switch (key){
        case GLUT_KEY_RIGHT:
                glutIdleFunc(z_Rotate_CW);
            break;
        case GLUT_KEY_LEFT:
                glutIdleFunc(z_Rotate_CC);
            break;
        case GLUT_KEY_UP:
                glutIdleFunc(x_Rotate_CW);
            break;
        case GLUT_KEY_DOWN:
                glutIdleFunc(x_Rotate_CC);
            break;
    }
}


void move_Forward()
{
    dist += ZOOM_FACTOR;
    glutPostRedisplay();
}

void move_Backward()
{
    dist -= ZOOM_FACTOR;
    glutPostRedisplay();
}


void x_Rotate_CC()
{
  //no rotation for 2D drawings
  if (dim == 2)
    return;

    xspin = (xspin + VIEW_TURN_RATE) % 360;
    glutPostRedisplay();
}

void x_Rotate_CW()
{
  //no rotation for 2D drawings
  if (dim == 2)
    return;

    xspin = (xspin - VIEW_TURN_RATE) % 360;
    glutPostRedisplay();
}

void y_Rotate_CC()
{
  //no rotation for 2D drawings
  if (dim == 2)
    return;

    yspin = (yspin + VIEW_TURN_RATE) % 360;
    glutPostRedisplay();
}

void y_Rotate_CW()
{
  //no rotation for 2D drawings
  if (dim == 2)
    return;

    yspin = (yspin - VIEW_TURN_RATE) % 360;
    glutPostRedisplay();
}

void z_Rotate_CC()
{
  //no rotation for 2D drawings
  if (dim == 2)
    return;

    zspin = (zspin + VIEW_TURN_RATE) % 360;
    glutPostRedisplay();
}

void z_Rotate_CW()
{
  //no rotation for 2D drawings
  if (dim == 2)
    return;

    zspin = (zspin - VIEW_TURN_RATE) % 360;
    glutPostRedisplay();
}


void engine()
{

    static int turnIdleOff = 0;
    int i;

        
    if(slowTime)
      system("sleep 1s");
    
    // This flag is only set if all components have finished creating their lists
    // Next round is processed for all components
    createList = 1;

    for (i = 0; i < numComponents; i ++)
      {
	createList *= Dgraph[i].createList;
	misf_engine(&graph[i], &Dgraph[i]);
      }

    if(turnIdleOff)
        glutIdleFunc(NULL);
        
    if(createList)
      turnIdleOff = 1;
    
    glutPostRedisplay();
}

//**************************************************************************
//
//  draw a loop at the origin (which has been moved to the vertex position)
//  use coordinates to determine the direction of the loop
//
//*************************************************************************
void drawLoop(float x, float y, float z)
{
  GLUquadricObj *qobj;

  //debug2("drawLoop(): drawing a loop of radius %f\n", loop_radius);

  glPushMatrix();
  //debug4("x: %f y: %f z: %f\n",x, y ,z);

  if (abs_f(z)>abs_f(y) && abs_f(z) > abs_f(x))
    {
      float x_coord = abs_f(z)/z * arrow_length;

      glRotatef(-90, 1.0, 0.0, 0.0);
      //after rotation the z coordinate maps into the y coordinate
      //then the drawing is similar to the 'else if (abs_f(y) > abs_f(x))' clause

      //---- DRAWING THE ARROW ----------
      glRotatef(loop_rotation_angle, 0.0, 0.0, 1.0);

      //draw the direction arrow
      glBegin(GL_TRIANGLES);
        glVertex3f(0.0, 0.0, 0.0);
        glVertex3f(x_coord, -arrow_width, 0.0);
        glVertex3f(x_coord, arrow_width, 0.0);
      glEnd();
      
      glRotatef(-loop_rotation_angle, 0.0, 0.0, 1.0);
      //------ END DRAW ARROW ---------

      glTranslatef(0.0, (float)loop_radius  * z/abs_f(z), 0.0);
    }
  else if (abs_f(y) > abs_f(x))
    {
      float x_coord = abs_f(y)/y * arrow_length;

      //---- DRAWING THE ARROW ----------
      glRotatef(loop_rotation_angle, 0.0, 0.0, 1.0);

      //draw the direction arrow
      glBegin(GL_TRIANGLES);
        glVertex3f(0.0, 0.0, 0.0);
        glVertex3f(x_coord, -arrow_width, 0.0);
        glVertex3f(x_coord, arrow_width, 0.0);
      glEnd();

      glRotatef(-loop_rotation_angle, 0.0, 0.0, 1.0);
      //------ END DRAW ARROW ---------

      glTranslatef(0.0, (float)loop_radius * (float)y/abs_f(y), 0.0);
    }
  else
    {
      float y_coord = abs_f(x)/x * arrow_length;

      //---- DRAWING THE ARROW ----------
      glRotatef(loop_rotation_angle, 0.0, 0.0, 1.0);

      //draw the direction arrow
      glBegin(GL_TRIANGLES);
      glVertex3f(0.0, 0.0, 0.0);
      glVertex3f(-arrow_width, y_coord, 0.0);
      glVertex3f(arrow_width, y_coord, 0.0);
      glEnd();

      glRotatef(loop_rotation_angle, 0.0, 0.0, 1.0);
      //------ END DRAW ARROW ---------

      glTranslatef((float)loop_radius * (float)x/abs_f(x), 0.0, 0.0);
    }

  qobj = gluNewQuadric();
  gluQuadricCallback(qobj, GLU_ERROR, errorCallback);
  
  gluQuadricDrawStyle(qobj, GLU_SILHOUETTE);
  gluQuadricNormals(qobj, GLU_NONE);
  gluDisk(qobj, loop_radius-0.0000001, loop_radius, 7 *loop_radius, 1);
  glPopMatrix();
}

//****************************************************************************
//
//  Draw a single directed between two vertices
//  assumes first vertex to be at origin, so only second vertex is passed in
//
//****************************************************************************
void drawDirectedEdge(float x2, float y2, float z2)
{
  double rotation_radius;
  double rotation_angle;
  double dist; //distance between vertex 1 and vertex 2

  debug("Enter drawDirectedEdge\n");
  
  dist = sqrt(x2 * x2 + y2 * y2 + z2 * z2);
  
  glPushMatrix();
  
  //perform rotation in z-direction to make both points planar
  rotation_radius = sqrt(x2 * x2 + z2 * z2 );
  rotation_angle = asin(z2 / rotation_radius) * 180.0/M_PI;

  if ((x2 >= 0 ))  //counter-clockwise rotation is needed
    glRotatef(-rotation_angle, 0.0, 1.0, 0.0);
  else
    glRotatef(rotation_angle, 0.0, 1.0, 0.0);

  //perform rotation around the z-axis to line them up with same y-coords
  rotation_radius = sqrt(x2 * x2 + y2 * y2 + z2 * z2);
  rotation_angle = asin(y2 / rotation_radius) * 180.0/M_PI;
  glRotatef(rotation_angle, 0.0, 0.0, 1.0);


  //translate the plane so that the origin is arc_radius distance away from each point
  //rotation is only needed if the second vertex is to the left of the origin
  if (x2 < 0 || (x2 == 0 && y2 < 0))
    {
      glRotatef(180.0 - 2 * rotation_angle, 0.0, 0.0, 1.0);
    }

  // ----- DRAWING THE ARROW -----------
  //translate the plane to center around second vertex 
  glTranslatef(dist, 0.0, 0.0);

  //draw the direction arrow
  glBegin(GL_TRIANGLES);
  glVertex2f(0.0, 0.0);
  glVertex2f(- arrow_length, arrow_width);
  glVertex2f(- arrow_length, -arrow_width);
  glEnd();
  // ------ END DRAW ARROW ----------

  glPopMatrix();  
  
  glBegin(GL_LINES);			       
    glVertex3f(0.0, 0.0, 0.0);
    glVertex3f(x2, y2, z2);
  glEnd();

  debug("Leave drawDirectedEdge\n");
}

//*****************************************************************************
//
//   Draws two arches directed edges between two vertices
//   assumes first vertex to be at origin, so only second vertex is passed in
//
//****************************************************************************
void drawArc(float x2, float y2, float z2)
{
  //rotate the plane so both vertices are planar and are horizontal and draw arc
  GLUquadricObj *qobj;
  double arc_radius;
  float radius_dist_ratio = 1.5;
  double rotation_radius;
  double rotation_angle;
  double dist; //distance between vertex 1 and vertex 2
  double start_angle;
  double arc_angle;
  float arrow_rotation_angle;   //angle by which the arrow is rotated to line up with the arc

  debug("Enter drawArc\n");
  //debug4("drawArc(): params: x2: %f  y2: %f  z2: %f\n", x2, y2, z2);
  dist = sqrt(x2 * x2 + y2 * y2 + z2 * z2);
  arc_radius = dist * radius_dist_ratio;
  
  glPushMatrix();
  
  //perform rotation in z-direction to make both points planar
  rotation_radius = sqrt(x2 * x2 + z2 * z2 );
  rotation_angle = asin(z2 / rotation_radius) * 180.0/M_PI;

  if ((x2 >= 0 ))  //counter-clockwise rotation is needed
    glRotatef(-rotation_angle, 0.0, 1.0, 0.0);
  else
    glRotatef(rotation_angle, 0.0, 1.0, 0.0);
  //debug2("z rotation angle %f\n",rotation_angle);

  //perform rotation around the z-axis to line them up with same y-coords
  rotation_radius = sqrt(x2 * x2 + y2 * y2 + z2 * z2);
  rotation_angle = asin(y2 / rotation_radius) * 180.0/M_PI;
  glRotatef(rotation_angle, 0.0, 0.0, 1.0);

  //debug2("y rotation angle %f\n",rotation_angle);



  //translate the plane so that the origin is arc_radius distance away from each point
  //rotation is only needed if the second vertex is to the left of the origin
  if (x2 < 0 || (x2 == 0 && y2 < 0))
    {
      glRotatef(180.0 - 2 * rotation_angle, 0.0, 0.0, 1.0);
    }


  // ----- DRAWING THE ARROW -----------
  //translate the plane to center around second vertex 
  glTranslatef(dist, 0.0, 0.0);
  
  //rotate so arrow is lined up with the arc
  arrow_rotation_angle = asin(dist/(2 * arc_radius)) * (1 - 1 /(2 *  ARROW_PIVOT_ANGLE_RATIO)) * 180.0/M_PI;
  glRotatef(-arrow_rotation_angle, 0.0, 0.0, 1.0);

  //draw the direction arrow
  glBegin(GL_TRIANGLES);
  glVertex2f(0.0, 0.0);
  glVertex2f(- arrow_length, arrow_width);
  glVertex2f(- arrow_length, -arrow_width);
  glEnd();

  //rotate the plane back
  glRotatef(arrow_rotation_angle, 0.0, 0.0, 1.0);  
  // ---------END DRAWING ARROW -----


  //-------- DRAWING THE ARC ---------
  //move horizontally and vertically
  glTranslatef(-dist/2.0, -sqrt(arc_radius * arc_radius - dist/2 * dist/2), 0.0);
 
  //calculate angles and draw arc
  start_angle = -(asin(dist/(2 * arc_radius)) * 180.0/M_PI);
  arc_angle = -2 * start_angle;

  qobj = gluNewQuadric();
  gluQuadricCallback(qobj, GLU_ERROR, errorCallback);
  
  gluQuadricDrawStyle(qobj, GLU_SILHOUETTE);
  gluQuadricNormals(qobj, GLU_NONE);
  gluPartialDisk(qobj, arc_radius-0.0000001, arc_radius, arc_radius, 1, start_angle, arc_angle);
  // ------ END DRAW ARC ----------

  glPopMatrix();  

  debug("Leave drawArc\n");
}


void errorCallback(GLenum errorCode)
{
  const GLubyte *estring;

  estring = gluErrorString(errorCode);
  fprintf(stderr, "Quadric Error: %s\n", estring);
  exit(0);
}


//***************************************************************************
//
//  Project 4D position into 3D
//
//**************************************************************************
static void project(DrawGraph *dgraph, size_tt vert, GLfloat *x, GLfloat *y, GLfloat *z)
{
  // first we compute the projection of pos[vert] onto the plane p
  // perpendicular to projVect
  
  Point * pvProjVect;
  float proj_x, proj_y, proj_z, proj_w;

  // scalar product of nProjVect and dgraph->pos[vert]
  float pv =
            nProjVect->coord.f[0] * dgraph->pos[vert].coord.d[0] +
            nProjVect->coord.f[1] * dgraph->pos[vert].coord.d[1] +
            nProjVect->coord.f[2] * dgraph->pos[vert].coord.d[2] +
            nProjVect->coord.f[3] * dgraph->pos[vert].coord.d[3];

  pvProjVect = fpoint_mult(nProjVect, pv);
  
  proj_x = dgraph->pos[vert].coord.d[0] - pvProjVect->coord.f[0];
  proj_y = dgraph->pos[vert].coord.d[1] - pvProjVect->coord.f[1];
  proj_z = dgraph->pos[vert].coord.d[2] - pvProjVect->coord.f[2];
  proj_w = dgraph->pos[vert].coord.d[3] - pvProjVect->coord.f[3];                

  
  // next we compute the coordinates of proj in an orthonormal base
  // e1, e2, e3 of the plane p (calculated in the constructor of
  // MesaPlot.cpp)
            *x = proj_x * e1->coord.f[0] +
	        proj_y * e1->coord.f[1] +
	        proj_z * e1->coord.f[2] +
	        proj_w * e1->coord.f[3];
            *y = proj_x * e2->coord.f[0] +
	        proj_y * e2->coord.f[1] +
	        proj_z * e2->coord.f[2] +
	        proj_w * e2->coord.f[3];
            *z = proj_x * e3->coord.f[0] +
	        proj_y * e3->coord.f[1] +
	        proj_z * e3->coord.f[2] +
	        proj_w * e3->coord.f[3];
}


//**************************************************************
//
//   Processes vertices clicked by the mouse
//
//*************************************************************
GLdouble * processHits(GLint hits, GLuint buffer[])
{
  unsigned int i, j;
  GLuint names, *ptr;
  GLdouble *depths = (GLdouble *)malloc(hits * sizeof(GLdouble));

  debug2("hits = %d\n",hits);
  ptr = (GLuint *) buffer;
  for (i = 0; i < hits; i ++)
    {
      names = *ptr;
      debug2("number of names for hit = %d\n", names);
      ptr++;
      depths[i] = (GLdouble)*ptr/0x7fffffff;
      debug2("z1 is %g;", (float)*ptr/0x7fffffff);
      ptr++;
      debug2("z2 is %g\n", (float) *ptr/0x7fffffff);
      ptr++;
      debug("the name is ");
      for (j = 0; j < names; j ++)
	{
	  debug2("%d ", *ptr);
	  ptr++;
	}
      debug("\n");
    }
  return depths;
}

//*******************************************************************
//
//         sorts components by diameter in decreasing order 
//
//*******************************************************************
int * sort_components_by_diam(DrawGraph *dgraph, int maxDiam, int numComponents)
{
  /* NOTE: in the following arrays we ignore values at index 0 */

  int *diam_count;    //diam_count[index] - num of components with diam. index
  int *offset;
  int *comp_processed;  //comp_processed[index] - num of components with diam. index that were processed
  int i;
  int * sorted_components;
  
  diam_count = (int *) malloc ((maxDiam + 1) * sizeof(int));
  offset = (int *) malloc ((maxDiam + 1) * sizeof(int));
  comp_processed = (int *) malloc ((maxDiam + 1) * sizeof(int));

  for(i = 1; i <= maxDiam; i ++)
    {
      diam_count[i] = 0;
      comp_processed[i] = 0;
    }

  for (i = 0; i < numComponents; i ++)
    diam_count[dgraph[i].diameter] ++;

  // make sure offsets are for diameters in descending order
  offset[maxDiam] = 0;
  
  for (i = maxDiam - 1; i >= 1; i --)
    offset[i] = offset[i+1] + diam_count[i+1];

  sorted_components = (int *) malloc (numComponents * sizeof(int));
  for (i = 0; i < numComponents; i ++)
    {
      int diameter = dgraph[i].diameter;
      sorted_components[offset[diameter] + comp_processed[diameter]] = i;
      comp_processed[diameter] ++;
    }

  for (i = 0; i < numComponents; i ++)
    debug4("sorted at pos %d: %d   diam: %d\n", i, sorted_components[i], dgraph[sorted_components[i]].diameter);
  free(diam_count);
  free(offset);
  free(comp_processed);
  return sorted_components;
}



void free_memory()
{
  int i;
  for(i = 0; i < numComponents; i ++)
    {
      free(Vertices[i]);
      free_Point(&component_offset[i]);
    }
  free(Vertices);
  free(component_offset);
}

