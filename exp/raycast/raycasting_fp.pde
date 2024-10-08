// Raycasting in Processing - Corrected DDA Version with Solid Colors
int fp = 128;
int scale = 2;

int posX = int(20.5*fp), posY = int(13.0*fp);  //x and y start position
int dirX, dirY;
int planeX, planeY;
int rotSpeed = 2;
int moveSpeed = fp/5;
int map_width = 24;
int map_height = 24;
int texWidth = 128;

int _width = 640/scale;
int _height = 480/scale;
int angle = 128;
int oldkey = 0;
int frame = 0;
int oldframe = 0;

int[] sitab = new int[256];

int si(int a)
{
  return sitab[a & 255];
}
int co(int a)
{
  return si((a & 255)+64);
}

int[][] worldMap = {
  {1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 1, 0, 2, 0, 0, 0, 0, 3, 0, 9, 0, 3, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 1, 3, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9},
  {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 0, 0, 0, 0, 0, 0, 2, 1, 3, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 4, 4, 4, 1, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 1},
  {1, 4, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 4, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 4, 4, 1, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
  {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
};

int[] texmap = new int[128*128];

void mandel()
{
  int x, y, iter;
  float rx0 = -1.9;
  float ry0 = -1.25;
  float dx = 2.5/128.;
  float dy = 2.5/128.;
  float rx, ry;
  int pos = 0;
  for (rx = rx0, x = 0; x < 128; ++x, rx += dx) {
    for (ry = ry0, y = 0; y < 128; ++y, ry += dy) {
      float ryi = 0;
      float rxi = 0;
      int c = 0;
      for (iter = 0; iter < 400; ++iter ) {
        float x2 = rxi*rxi;
        float y2 = ryi*ryi;
        if ((x2 + y2) > 4.0 ) {
          c = iter & 255;
          break;
        }
        ryi = 2.0*rxi*ryi+ry;
        rxi = x2-y2+rx;
      }
      texmap[pos] = c * 8 > 255 ? 255 : c*8;
      ++pos;
    }
  }
}

void setup() {
  size(320*2, 240*2);
  frameRate(30);
  for (int i = 0; i < 256; ++i) {
    sitab[i] = int(sin(i/128.*PI)*fp);
  }
  mandel();
}

void draw() {
  noStroke();
  fill(0, 120, 230);
  rect(0, 0, width, height/2);
  fill(30, 70, 30);
  rect(0, height/2, width, height/2);
  movePlayer();
  draw3DView();
  ++frame;
}

int map(int x, int y)
{
  return worldMap[y][x];
}
// Player Movement

void movePlayer() {

  if (keyPressed) {
    //if ( frame - oldframe > 3 )
    oldkey = 0;

    if ( key == oldkey ) return;
    oldkey = key;
    oldframe = frame;
    if (key == 'd') {
      angle += rotSpeed;
    }
    if (key == 'a') {
      angle -= rotSpeed;
    }

    if (key == 'w') {
      int nx = (posX + 2*dirX * moveSpeed/fp)/fp;
      int ny = (posY - dirY * moveSpeed/fp)/fp;
      if (map(nx, posY/fp) == 0) {
        posX += dirX * moveSpeed/fp;
      }

      if (map(posX/fp, ny) == 0) {
        posY -= dirY * moveSpeed/fp;
      }
    }
    if (key == 's') {
      int nx = (posX - dirX * moveSpeed/fp)/fp;

      if (map(nx, posY/fp) == 0) {
        posX -= dirX * moveSpeed/fp;
      }
      int ny = (posY + 2*dirY * moveSpeed/fp)/fp;
      if (map(posX/fp, ny)== 0) {
        posY += dirY * moveSpeed/fp;
      }
    }
  } else {
    oldkey = 0;
  }
  angle &= 255;
  dirX = -co(angle);
  dirY = si(angle);
  planeX = 6*si(angle)/8;
  planeY = 6*co(angle)/8;
  //println(posX/fp, posY/fp, angle/fp);
}


// Raycasting and Drawing Walls with Corrected DDA and Fisheye Fix
void draw3DView() {
  //println("-----------------");
  int cameraX = 0;
  int rayDirX, rayDirY;
  int mapX0 = posX/fp;
  int mapY0 = posY/fp;
  int sideDistX0 =  posX & (fp-1);
  int sideDistY0 = posY & (fp-1);

  for (int x = _width-1; x >= 0; --x, cameraX -= 6) {
    cameraX = 2*x*fp/_width-fp;
    //println(cameraX/10);

    //calculate ray position and direction
    rayDirX = (dirX + planeX * cameraX/fp);
    rayDirY = (dirY + planeY * cameraX/fp);

    int mapX = mapX0;
    int mapY = mapY0;

    int stepX = 0;
    int deltaDistX = fp*fp;
    int sideDistX =  sideDistX0;
    int stepY = 0;
    int deltaDistY = fp*fp;
    int sideDistY = sideDistY0;
    int n = 256;

    if ( fp <= 256 ) n = 1;

    if ( rayDirX != 0 ) {
      deltaDistX = abs(fp*fp / rayDirX);

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (sideDistX/n) * deltaDistX/(fp/n);
      } else {
        stepX = 1;
        sideDistX = (fp - sideDistX)/n * deltaDistX/(fp/n);
      }
    }

    if ( rayDirY!= 0 ) {
      deltaDistY = abs(fp*fp / rayDirY);

      if (rayDirY > 0) {
        stepY = -1;
        sideDistY = (sideDistY/n) * deltaDistY/(fp/n);
      } else {
        stepY = 1;
        sideDistY = (fp - sideDistY)/n * deltaDistY/(fp/n);
      }
    }

    if ( abs(sideDistX) > 32767 || abs(deltaDistY) > 32767 ) println("Error X");
    if ( abs(sideDistY) > 32767 || abs(deltaDistX) > 32767 ) println("Error Y");

    //perform DDA
    int hit = 0; //was there a wall hit?
    int side = 0; //was a NS or a EW wall hit?
    while (hit == 0 ) {
      //jump to next map square, either in x-direction, or in y-direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      //Check if ray has hit a wall
      hit = map(mapX, mapY);
    }
    //if ( deltaDistY > 100000 ) print(mapY,deltaDistY,rayDirY," ");
    int perpWallDist;
    if (side == 0) perpWallDist = (sideDistX - deltaDistX);
    else           perpWallDist = (sideDistY - deltaDistY);

    // side == 1 => left
    // side == 0 => back
    boolean front = (side == 0 && stepX < 0);
    boolean right = (side == 1 && stepY > 0);
    boolean left =  (side == 1 && stepY < 0);
    boolean back =  (side == 0 && stepX > 0);

    //Calculate _height of line to draw on screenewwd
    int line_height;
    line_height = (_height*fp / perpWallDist);

    //calculate lowest and highest pixel to fill in current stripe
    int drawStart = -line_height / 2 + _height / 2;
    if (drawStart < 0) drawStart = 0;
    int drawEnd = line_height / 2 + _height / 2;
    if (drawEnd >= _height) drawEnd = _height - 1;

    color shade;
    switch(hit) {
    case 1:
      if ( side == 0 )
        shade = color(255, 0, 0);
      else
        shade = color(255, 255, 0);
      break;
    case 2:
      if ( side == 0 )
        shade = color(0, 255, 0);
      else
        shade = color(128, 128, 0);
      break;
    case 3:
      if ( side == 0 )
        shade = color(0, 0, 255);
      else
        shade = color(255, 0, 0);
      break;
    case 4:
      if ( side == 0 )
        shade = color(255, 255, 255);
      else
        shade = color(192, 192, 192);
      break;
    case 5:
      if ( side == 0 )
        shade = color(128, 255, 255);
      else
        shade = color(255, 128, 128);
      break;
    default:
      shade = color(128, 128, 0);
    }
    /**/
    if ( front ) {
      shade = color(red(shade)/2, green(shade)/2, blue(shade)/2);
    }
    if ( right ) {
      shade = color(red(shade)/2, green(shade)/2, blue(shade)/2);
    }
    /**/

    /**/
    int wallX; //where exactly  the wall was hit
    if (side == 0) wallX = (posY - perpWallDist * rayDirY/fp);
    else           wallX = (posX + perpWallDist * rayDirX/fp);

    //x coordinate on the texture
    int texX = wallX & (texWidth-1);

    /* mirror texture depending on side */
    if ( front || right ) texX ^= (texWidth-1);

    // How much to increase the texture coordinate per screen pixel
    int step = fp*texWidth / line_height;
    // Starting texture coordinate
    int texPos = 0;
    if ( drawStart == 0 ) {
      texPos = (drawStart - _height / 2 + line_height / 2) * step;
    }
    for (int y = drawStart; y < drawEnd; ++y) {
      // Cast the texture coordinate to integer, and mask with (texHeight - 1) in case of overflow
      int texY = texPos/fp & (texWidth - 1);
      texPos += step;
      color c = shade;
      if ( hit == 9 ) {
        if ( front ) {
        c = color(0, 0, texmap[texY*128+texX]);
        } else if ( back ) {
          c = color( texmap[texY*128+texX],0,0);
        } else if ( left ){
          c = color(0, texmap[texY*128+texX],0);
        } else {
          c = color( texmap[texY*128+texX], texmap[texY*128+texX],0);
        }
         
      } else {
        int xor = side == 0 ? 16 : 32;
        if ( ((texX ^ texY) & xor) == 0 ) c >>= 1;
      }

      fill(c);
      rect(x*scale, y*scale, scale, scale);
      //make color darker for y-sides: R, G and B byte each divided through two with a "shift" and an "and"
    }
    /**/
    /**/
    // Draw the vertical slice of the wall
    fill(shade);
    //rect(x*scale, drawStart*scale, 1, line_height*scale);
    //rect(x*scale, drawStart*scale, scale, line_height*scale);
    /**/
  }
  fill(0);
  //rect(width/2, 0, 1, height);
}
