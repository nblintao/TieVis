CC = gcc
CFLAGS = -Wall -I/usr/X11R6/include -L/usr/X11R6/lib -O3
LIBS =  -lGLU -lGL -lXmu -lXi -lm -lglut 
SRCS =    Queue.c bfs.c misf.c Point.c Graph.c DrawGraph.c MesaPlot.c main.c gml_scanner.c gml_parser.c gml_converter.c Graphics.c
OBJS =	$(SRCS:.c=.o)

main: $(OBJS) 
	$(CC) $(CFLAGS) $(OBJS) $(GML_OBJS) -o $@  $(LIBS)
.c.o : 
	$(CC) $(CFLAGS) -c $<
clean:
	rm -rf *.o *~ 
cleanO:
	rm -rf *.o  


