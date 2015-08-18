#include "Queue.h"


/* makes a new Q and initializes all values */
Queue *new_Q(unsigned long size)
{
  Queue *newQ = (Queue *)malloc(sizeof(Queue));
  newQ->size = size;
  newQ->count = 0;
  newQ->frontPtr = 0;
  newQ->backPtr = 0;
  newQ->elements = (size_tt *)malloc(size * sizeof(size_tt));
  return newQ;
}

void enqueue(Queue *Q, size_tt entry)
{
  if (Q->count < Q->size)
    {
      Q->count ++;
      Q->elements[Q->backPtr ++] = entry;
    }
}
size_tt dequeue(Queue *Q)
{
  if (Q->count > 0 && (Q->frontPtr + 1) < Q->size)
    {
      Q->count --;
      return Q->elements[Q->frontPtr++];
    }
  return -1;
}

int queue_size(Queue *Q)
{
  return Q->count;
}

void free_queue(Queue *Q)
{
  free(Q->elements);
  free(Q);
}
