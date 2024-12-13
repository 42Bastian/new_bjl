#include <stdio.h>
#include <stdlib.h>

typedef int bool;

static bool compare( int l, int r )
{
  return l <= r;
}

void _heapsort( int* a, int count )
{
  int start = count / 2;
  int end = count-1;
  int root;
  int child;
  int l;
  int r;
  int n = 0;
  for ( ; end != 0 ; )  {
    --start;
    root = start;
    if ( start < 0 ) {
      int tmp = a[end];
      a[end] = a[0];
      a[0] = tmp;

      --end;
//->      if ( end == 0 ) break;
      root = 0;
    }

    child = root;

    for ( ;; ) {
      ++n;
      child <<= 1;
      ++child;
      l = a[child];

      if ( child != end ) {

        if ( child > end )
          break;

        r = a[child+1];
        if ( compare( l, r ) ) {
          ++child;
          l = r;
        }
      }

      r = a[root];

      if ( compare( l, r ) ) /* note reverse compare!!! */
        break;

      a[child] = r;
      a[root] = l;
      root = child;
    }
  }
  printf("Count: %d\n",n);
}


int tab[128];

int main()
{
  //  srandomdev();

  for(int i = 0; i < sizeof(tab)/sizeof(int); ++i){
    tab[i] = (int)random()*2;
  }
//->  printf(" dc.l ");
//->  for(int i = 0; i < sizeof(tab)/sizeof(int); ++i){
//->    printf("$%08x,",tab[i]);
//->    if ( (i & 7) == 7 ) printf("\n dc.l ");
//->  }
//->  printf("\n");
  _heapsort( tab, sizeof(tab)/sizeof(int) );
  _heapsort( tab, sizeof(tab)/sizeof(int) );

  for(int i = 0; i < sizeof(tab)/sizeof(int); ++i){
    printf("%08x ",tab[i]);
  }
  printf("\n");
  for(int i = 0; i < sizeof(tab)/sizeof(int)-1; ++i){
    printf("%08x ",tab[i+1]-tab[i]);
  }
  printf("\n");
}
