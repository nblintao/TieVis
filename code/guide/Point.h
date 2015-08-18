#ifndef POINT_H
#define POINT_H

/*#define DEBUG_POINT*/
#include "Graph.h"
#include <stdio.h>
#include <stdlib.h>

typedef int coord_t; // this is the type of the coordinates of points
                     // in the rest of the code we will use coord_t
                     // instead of any particular type for the ease
                     // of future changes and portability

#define ROUND(a)       ((a)>0 ? (int)((a)+0.5) : -(int)(0.5-(a)))
#define ROUND_L(a) ((a)>0 ? (unsigned long)((a)+0.5) : -(unsigned long)(0.5-(a)))

/* DEFINITION OF THE STRUCTURE OF POINT */

typedef struct point {
    size_tt dim;  // dimension of the ambient space of the point
  union {
    coord_t *d;    // its coordinates 
    float *f;
  } coord;
  int type;   // 1 = coord_t, 2 = float
} Point;

void initialize_Point(Point *p, coord_t x, coord_t y, coord_t z, coord_t w, size_tt dim);

void initialize_Point_f(Point *p, float x, float y, float z, float w, size_tt dim);

Point * construct_Point( coord_t x, coord_t y, coord_t z, coord_t w, size_tt dim);

Point * construct_Point_f( float x, float y, coord_t z, coord_t w, size_tt dim);

void free_Point(Point * p1);

void point_plus(Point *dest, Point *p1, Point *p2);

void point_plus_eq(Point *p1, Point *p2);

void point_minus(Point *dest, Point *p1, Point *p2);

void point_minus_eq(Point *p1, Point *p2);

Point *point_div(Point *p1, coord_t constant);

Point *fpoint_div(Point *p1, float constant);

void point_div_eq(Point *p1, coord_t constant);

Point *point_mult(Point *p1, coord_t constant);

Point *fpoint_mult(Point *p1, float constant);

void point_mult_eq(Point *p1, coord_t constant);

void fpoint_mult_eq(Point *p1, float constant);

void fpoint_div_eq(Point *p1, float constant);

void point_duplicate(Point *p1, Point *p2);

const coord_t point_scalar_product(Point *p1, Point *p2);

const float fpoint_scalar_product(Point *p1, Point *p2);

const float fnorm2(Point *p1);

const unsigned long norm2(Point *p1);

const unsigned long norm(Point *p1);

const float fnorm(Point *p1);

int compare_x_coord(Point *p1, Point *p2);

coord_t get_coord(Point *p1, int pos);

void set_to_zero(Point *p1);

#endif







