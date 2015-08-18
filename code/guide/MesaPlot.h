
#ifndef _MESA_PLOT_H
#define _MESA_PLOT_H

#include <GL/glut.h>
#include <string.h>
#include "DrawGraph.h"
#include "Graphics.h"

#define abs_f(a) ((a > 0.0) ? a : -a)

void draw_Graph(int argc, char** argv);
void plotGraph(int argc, char **argv, VisualGraphics *_graphics, DrawGraph *_dg, int _width, int _height, int _slowTime );
void init();
void init2();
void lighting();
void display();
void reshape(int w, int h);
void keyboard(unsigned char key, int x, int y);
void mouse(int button, int state, int x, int y);
void special(int key, int x, int y);
void move_Forward();
void move_Backward();
void x_Rotate_CC();
void x_Rotate_CW();
void y_Rotate_CC();
void y_Rotate_CW();
void z_Rotate_CC();
void z_Rotate_CW();
void engine();
void drawLoop(float x, float y, float z);
void drawDirectedEdge(float x2, float y2, float z2);
void drawArc(float x2, float y2, float z2);
void errorCallback(GLenum errorCode);
GLdouble *processHits(GLint hits, GLuint buffer[]);
int * sort_components_by_diam(DrawGraph *Dgraph, int maxDiam, int numComponents);
void free_memory();
#endif
