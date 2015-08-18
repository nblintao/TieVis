#include "Point.h"

//***************************************************
//
//   initialize_Point
//      allocates memory and constructs a new Point
//
//**************************************************
void initialize_Point(Point *p, coord_t x, coord_t y, coord_t z, coord_t w, size_tt dim)
{
  p->coord.d = (coord_t *)malloc(dim * sizeof(coord_t));
  p->coord.d[0] = x;
  p->coord.d[1] = y;
  if (dim > 2)
    p->coord.d[2] = z;
  if (dim > 3)
    p->coord.d[3] = w;
  p->dim = dim;
  p->type = 1;
}

void initialize_Point_f(Point *p, float x, float y, float z, float w, size_tt dim)
{
  p->coord.f = (float *)malloc(dim * sizeof(float));
  p->coord.f[0] = x;
  p->coord.f[1] = y;
  if (dim > 2)
    p->coord.f[2] = z;
  if (dim > 3)
    p->coord.f[3] = w;
  p->dim = dim;
  p->type = 2;
}

//***************************************************
//
//   construct_Point
//      constructs a new Point
//
//**************************************************
Point * construct_Point( coord_t x, coord_t y, coord_t z, coord_t w, size_tt dim)
{
  Point *p = (Point *)malloc(sizeof(Point));
  p->coord.d = (coord_t *)malloc(dim * sizeof(coord_t));
  p->coord.d[0] = x;
  p->coord.d[1] = y;
  if (dim > 2)
    p->coord.d[2] = z;
  if (dim > 3)
    p->coord.d[3] = w;
  p->dim = dim;
  p->type = 1;
  return p;
}

Point * construct_Point_f( float x, float y, coord_t z, coord_t w, size_tt dim)
{
  Point *p = (Point *)malloc(sizeof(Point));
  p->coord.f = (float *)malloc(dim * sizeof(float));
  p->coord.f[0] = x;
  p->coord.f[1] = y;
  if (dim > 2)
    p->coord.f[2] = z;
  if (dim > 3)
    p->coord.f[3] = w;
  p->dim = dim;
  p->type = 2;
  return p;
}

//***************************************************
//
//   free_Point
//      free memory used by a Point
//
//**************************************************
void free_Point(Point * p1)
{
  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      free(p1->coord.d);
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      free(p1->coord.f);
    }
}

//*************************************************
//
//  adds two points, puts result in dest
//
//*************************************************
void point_plus(Point *dest, Point *p1, Point *p2)
{
  int i;
  if (p1->dim != p2->dim)
    debug("TRYING TO ADD POINTS THAT ARE OF DIFFERENT DIMENSIONS\n");
  dest->dim = p1->dim;
  dest->coord.d = (coord_t *)malloc(dest->dim * sizeof(coord_t));
  for(i = 0; i < dest->dim; i ++)
    dest->coord.d[i] = p1->coord.d[i] + p2->coord.d[i];
}


//*************************************************
//
//  adds two points, puts result in the first point
//
//*************************************************
void point_plus_eq(Point *p1, Point *p2)
{
  int i;
  if (p1->dim != p2->dim)
    debug("TRYING TO ADD EQ POINTS THAT ARE OF DIFFERENT DIMENSIONS\n");
 if (p1->type != p2->type)
    debug("TRYING TO ADD EQ POINTS THAT ARE OF DIFFERENT TYPES\n");
  
  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.d[i] = p1->coord.d[i] + p2->coord.d[i];
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      for (i = 0; i < p1->dim; i ++)
	p1->coord.f[i] = p1->coord.f[i] + p2->coord.f[i];
    }
}


//***************************************************************
//
//     subtracts two points, puts result in dest
//
//**************************************************************
void point_minus(Point *dest, Point *p1, Point *p2)
{
  int i;
  if (p1->dim != p2->dim)
    debug("TRYING TO SUBTRACT POINTS THAT ARE OF DIFFERENT DIMENSIONS\n");
  if (p1->type != p2->type)
    debug("TRYING TO SUBTRACT POINTS THAT ARE OF DIFFERENT TYPES\n");

  dest->dim = p1->dim;
  dest->coord.d = (coord_t *)malloc(dest->dim * sizeof(coord_t));
  for(i = 0; i < dest->dim; i ++)
    dest->coord.d[i] = p1->coord.d[i] - p2->coord.d[i];
}

//***************************************************************
//
//     subtracts two points, puts result in first point
//
//**************************************************************
void point_minus_eq(Point *p1, Point *p2)
{
  int i;
  if (p1->dim != p2->dim)
    debug("TRYING TO SUBTRACT EQ POINTS THAT ARE OF DIFFERENT DIMENSIONS\n");

  if (p1->type != p2->type)
    debug("TRYING TO SUBTRACT EQ POINTS THAT ARE OF DIFFERENT TYPES\n");
  
  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.d[i] = p1->coord.d[i] - p2->coord.d[i];
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      for (i = 0; i < p1->dim; i ++)
	p1->coord.f[i] = p1->coord.f[i] - p2->coord.f[i];
    }
}

//***************************************************************
//
//     divides two points, puts result in dest
//
//**************************************************************
Point *point_div(Point *p1, coord_t constant)
{
  int i;
  Point *sum = (Point *)malloc(sizeof(Point));
  sum->dim = p1->dim;
  sum->type = p1->type;

  if (p1->type == 1)  /* coordinates are of type coord_t */
    {
      sum->coord.d = (coord_t *)malloc(sum->dim * sizeof(coord_t));
      for(i = 0; i < sum->dim; i ++)
	sum->coord.d[i] = p1->coord.d[i] / constant;
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      sum->coord.f = (float *)malloc(sum->dim * sizeof(float));
      for(i = 0; i < sum->dim; i ++)
	sum->coord.f[i] = p1->coord.f[i] / constant;
    }
  return sum;
}


//***************************************************************
//
//     divides two points, puts result in dest
//
//**************************************************************
Point *fpoint_div(Point *p1, float constant)
{
  int i;
  Point *sum = (Point *)malloc(sizeof(Point));
  sum->dim = p1->dim;
  sum->type = p1->type;

  if (p1->type == 1)  /* coordinates are of type coord_t */
    {
      sum->coord.d = (coord_t *)malloc(sum->dim * sizeof(coord_t));
      for(i = 0; i < sum->dim; i ++)
	sum->coord.d[i] = (coord_t)(p1->coord.d[i] / constant);
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      sum->coord.f = (float *)malloc(sum->dim * sizeof(float));
      for(i = 0; i < sum->dim; i ++)
	sum->coord.f[i] = p1->coord.f[i] / constant;
    }
  return sum;
}


//***************************************************************
//
//     divides two points, puts result in first point
//
//**************************************************************
void point_div_eq(Point *p1, coord_t constant)
{
  int i;

  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.d[i] = p1->coord.d[i] / constant;
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.f[i] = p1->coord.f[i] / constant;
    }
}

//***************************************************************
//
//     divides two points, puts result in first point
//
//**************************************************************
void fpoint_div_eq(Point *p1, float constant)
{
  int i;

  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.d[i] = (coord_t)(p1->coord.d[i] / constant);
      //p1->coord.d[i] = (coord_t)ROUND(p1->coord.d[i] / constant);
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.f[i] = p1->coord.f[i] / constant;
    }
}

//***************************************************************
//
//     multiplies two points, puts result in dest
//
//**************************************************************
Point *point_mult(Point *p1, coord_t constant)
{
  int i;
  Point *sum = (Point *)malloc(sizeof(Point));
  sum->dim = p1->dim;
  sum->type = p1->type;

  sum->coord.d = (coord_t *)malloc(sum->dim * sizeof(coord_t));
  for(i = 0; i < sum->dim; i ++)
    sum->coord.d[i] = p1->coord.d[i] * constant;
  return sum;
}


//***************************************************************
//
//     multiplies two points, puts result in first point
//
//**************************************************************
void point_mult_eq(Point *p1, coord_t constant)
{
  int i;

  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.d[i] = p1->coord.d[i] * constant;
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.f[i] = p1->coord.f[i] * constant;
    }
}


//***************************************************************
//
//     multiplies two points, puts result in dest
//
//**************************************************************
Point *fpoint_mult(Point *p1, float constant)
{
  int i;
  Point *sum = (Point *)malloc(sizeof(Point));
  sum->dim = p1->dim;
  sum->type = p1->type;

  if (p1->type == 1)  /* coordinates are of type coord_t */
    {
      sum->coord.d = (coord_t *)malloc(sum->dim * sizeof(coord_t));
      for(i = 0; i < sum->dim; i ++)
	sum->coord.d[i] = (coord_t)(p1->coord.d[i] * constant);
      //sum->coord.d[i] = (coord_t)ROUND(p1->coord.d[i] * constant);
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      sum->coord.f = (float *)malloc(sum->dim * sizeof(float));
      for(i = 0; i < sum->dim; i ++)
	sum->coord.f[i] = p1->coord.f[i] * constant;
    }
  return sum;
}


//***************************************************************
//
//     multiplies two points, puts result in first point
//
//**************************************************************
void fpoint_mult_eq(Point *p1, float constant)
{
  int i;

  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      for(i = 0; i < p1->dim; i ++)
	//p1->coord.d[i] = (coord_t)ROUND(p1->coord.d[i] * constant);
	p1->coord.d[i] = (coord_t)(p1->coord.d[i] * constant);
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      for(i = 0; i < p1->dim; i ++)
	p1->coord.f[i] = p1->coord.f[i] * constant;
    }
}


//**************************************************************
//
//	Method name :   point_scalar_product()
//
//      Description : scalar product of vectors associated with
//      points
//
//**************************************************************
const coord_t point_scalar_product(Point *p1, Point *p2)
{
    coord_t result = 0;
    size_tt ind;

    if (p1->dim != p2->dim)
      debug("TRYING TO COMPUTE SCALAR PRODUCT OF POINTS THAT ARE OF DIFFERENT DIMENSIONS\n");

    for(ind = 0; ind < p2->dim; ind++)
        result += p1->coord.d[ind] * p2->coord.d[ind];

    return result;
}


//***************************************************************
//
//     compute scalar product of two points
//
//**************************************************************
const float fpoint_scalar_product(Point *p1, Point *p2)
{
    float result = 0;
    size_tt ind;

    if (p1->dim != p2->dim)
      debug("TRYING TO COMPUTE SCALAR PRODUCT OF POINTS THAT ARE OF DIFFERENT DIMENSIONS\n");

    for(ind = 0; ind < p2->dim; ind++)
        result += p1->coord.f[ind] * p2->coord.f[ind];

    return result;
}


//*************************************************************************
//
//         creates a copy of a Point
//
//*************************************************************************
void point_duplicate(Point *p2, Point *p1) /* copy coordinates of p1 into p2 */
{
  int i;

  if (p1->dim != p2->dim)
    debug("TRYING TO DUPLICATE POINTS THAT ARE OF DIFFERENT DIMENSIONS\n");

  if (p1->type == 1)    /* coordinates are of type coord_t */
    {
      for (i = 0; i < p1->dim; i ++)
	p2->coord.d[i] = p1->coord.d[i];
    }
  else if (p1->type == 2)  /* coordinates are of type float */
    {
      for (i = 0; i < p1->dim; i ++)
	p2->coord.f[i] = p1->coord.f[i];
    }
}

//**************************************************************
//
//	Method name : norm2 (float)
//
//	Description : the square of the norm
//
//**************************************************************
const float fnorm2(Point *p1) 
{
    float result = 0;
    size_tt ind;

    if (p1->type == 1)  /* coordinates are of type coord_t */
      {
	for(ind = 0; ind < p1->dim; ind++)
	  result += (float)p1->coord.d[ind] * (float)p1->coord.d[ind];
      }
    else if (p1->type == 2)  /* coordinates are of type float */
      {
	for(ind = 0; ind < p1->dim; ind++)
	  result += p1->coord.f[ind] * p1->coord.f[ind];
      }
    return result;
}

//**************************************************************
//
//	Method name : norm2
//
//	Description : the square of the norm
//
//**************************************************************
const unsigned long norm2(Point *p1)
{
    unsigned long result = 0;
    size_tt ind;

    if (p1->type == 1)  /* coordinates are of type coord_t */
      {
	for(ind = 0; ind < p1->dim; ind++)
	  result += (unsigned long)p1->coord.d[ind] * (unsigned long)p1->coord.d[ind];
      }
    else if (p1->type == 2)  /* coordinates are of type float */
      {
	for(ind = 0; ind < p1->dim; ind++)
	  result += (unsigned long)p1->coord.f[ind] * (unsigned long)p1->coord.f[ind];
      }
    return result;
}

//**************************************************************
//
//	Method name : norm
//
//	Description : the norm of a vector
//
//**************************************************************
const unsigned long norm(Point *p1) 
{
    return ROUND_L( sqrt( norm2(p1) ) );
}

//**************************************************************
//
//	Method name : fnorm
//
//	Description : the norm of a vector
//
//**************************************************************
const float fnorm(Point *p1) 
{
    return sqrt( norm2(p1) );
}


/* Compares the x coordinate of two points.
 * Returns -1 if point1 < point2,
 *          1 if point1 > point2,
 *          0 if points are equal
 */

int compare_x_coord(Point *p1, Point *p2)
{
  if (p1->type == 1)  /* coordinates are of type coord_t */
    {
      if(p1->coord.d[0] < p2->coord.d[0])
	return -1;
      else if (p1->coord.d[0] > p2->coord.d[0])
	return 1;
      else return 0;
    }
  else if (p1->type == 2) /* coordinates are of type float */
    {
      if(p1->coord.f[0] < p2->coord.f[0])
	return -1;
      else if (p1->coord.f[0] > p2->coord.f[0])
	return 1;
      else return 0;
    }
  return 0;
}

//**************************************************************
//
//     returns the specified coordinate of a point
//     pos has following values: 0 - x, 1 - y, 2 - z
//
//**************************************************************
coord_t get_coord(Point *p1, int pos)
{
  if (p1->dim < (pos + 1))
    {
      debug("TRYING TO GET A COORDINATE FROM A SMALLER DIMENSION POINT\n");
      return -999;
    }
  if (p1->type == 1)  /* coordinates are of type coord_t */
    {
      return p1->coord.d[pos];
    }
  else if (p1->type == 2)
    {
      debug("TRYING TO GET AN INTEGER COORDINATE FROM A FLOAT POINT\n");
      exit(0);
      return 0;
    }
  return 0;
}


//**************************************************************
//
//   reset point coordinates to 0
//
//**************************************************************
void set_to_zero(Point *p1)
{
  if (p1->type == 1)  /* coordinates are of type coord_t */
    {
      p1->coord.d[0] = 0;
      p1->coord.d[1] = 0;
      if (p1->dim > 2)
	p1->coord.d[2] = 0;
      if (p1->dim > 3)
	p1->coord.d[3] = 0;
    }
  else if (p1->type == 2) /* coordinates are of type float */
    {
      p1->coord.f[0] = 0;
      p1->coord.f[1] = 0;
      if (p1->dim > 2)
	p1->coord.f[2] = 0;
      if (p1->dim > 3)
	p1->coord.f[3] = 0;
    }
}















