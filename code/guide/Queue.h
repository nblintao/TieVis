#ifndef QUEUE_H
#define QUEUE_H

#include "Graph.h"

/* Simple queue structure and operations to be used in BFS */
typedef struct queue{
  unsigned long size;
  unsigned long count;
  unsigned long frontPtr;
  unsigned long backPtr;
  size_tt *elements;
} Queue;

/* makes a new Q and initializes all values */
Queue *new_Q(unsigned long size);

void enqueue(Queue *Q, size_tt entry);

size_tt dequeue(Queue *Q);

int queue_size(Queue *Q);

void free_queue(Queue *Q);
#endif
