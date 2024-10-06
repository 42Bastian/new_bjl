;-*-Asm-*-
        GPU

        include <js/macro/help.mac>
        include <js/macro/joypad1.mac>

        include <js/symbols/blit_eq.js>
        include <js/symbols/jagregeq.js>
        include <js/symbols/joypad.js>

        UNREG   SP,SP.a,LR,LR.a

        MACRO   BRK
.\x     jr      .\x
        nop
        ENDM

        ;; return values
_MS_PER_FRAME   equ 0
_VBLS_PER_FRAME equ 4
_X_POS          equ 8
_Y_POS          equ 12
_ANGLE          equ 16

screen0::       equ $00080000
screen1::       equ $000a0000

parameter       equ $f03ff0

sintab          equ parameter-256*4
LastJoy         equ sintab-8

START_X         equ 15
START_Y         equ 17
START_ANGLE     equ 128

WORLD_WIDTH     equ 31

        ;; canvas
rez_x::         equ 320         ; 160/192/256/320
rez_y           equ 200

 IF rez_x = 320
BLIT_WID        EQU BLIT_WID320
 ENDIF

 IF rez_x = 256
BLIT_WID        EQU BLIT_WID256
 ENDIF

 IF rez_x = 192
BLIT_WID        EQU BLIT_WID192
 ENDIF

 IF rez_x = 160
BLIT_WID        EQU BLIT_WID160
 ENDIF

;;; ****************************************
;;; Fixpoint (max. 7, else rounding errors appear)

FP_BITS         EQU 7
FP              EQU (1<<FP_BITS)

        ;; global registers
IRQ_SP.a        REG 31
IRQ_RTS.a       REG 30
IRQ_FLAGADDR.a  REG 29
IRQ_FLAG.a      REG 28
obl1.a          reg 27
obl0.a          reg 26
obl_size.a      reg 25
LR.a            reg 24
world.a         reg 23

IRQScratch4.a   REG  4
IRQScratch3.a   REG  3
IRQScratch2.a   REG  2
IRQScratch1.a   REG  1
IRQScratch0.a   REG  0

IRQ_SP          REG 31
IRQ_RTS         REG 30
IRQ_FLAGADDR    REG 29
LR              REG 28
VBLFlag         REG 27


tmp2            reg 2
tmp1            reg 1
tmp0            reg 0

IRQ_STACK       EQU $f03020

MACRO WAITBLITTER
.\wait@
        load (blitter+$38),tmp0
        shrq #1,tmp0
        jr cc,.\wait@
        nop
ENDM

        run $f03000
GPUstart::
        include "irq.inc"

;;; ------------------------------------------------------------
init::
        movei   #$f02100,IRQ_FLAGADDR
        moveta  IRQ_FLAGADDR,IRQ_FLAGADDR.a

        movei   #1<<14|%11111<<9,r0     ; clear all ints, REGPAGE = 1
        store   r0,(IRQ_FLAGADDR)
        nop
        nop

        movei   #IRQ_STACK,IRQ_SP
        moveta  IRQ_SP,IRQ_SP.a

        ;; get OP lists from 68k
        movei   #parameter,r15
        load    (r15),r0
        moveta  r0,obl0.a
        load    (r15+4),r0
        moveta  r0,obl1.a
        load    (r15+8),r0
        moveta  r0,obl_size.a
        load    (r15+12),r0
        moveta  r0,world.a


        movei   #1<<14|%11111<<9|%01000<<4,r0
        store   r0,(IRQ_FLAGADDR)
        nop
        nop
;;; -----------------------------------------------------------------------
blitter         reg 14
sinptr          reg 15

currScreen.a    REG 99
BG.a            REG 99
LOOP.a          REG 99
pit.a           reg 99
time.a          reg 99
speed.a         reg 99

angle.a         reg 99
dirX.a          reg 99
dirY.a          reg 99
planeX.a        reg 99
planeY.a        reg 99
posX.a          reg 99
posY.a          reg 99

main::
        movei   #sintab,r15
        move    r15,r14
        movei   #128*4,r3
        movei   #127,r1
        moveq   #0,r2
singen:
        subq    #2,r1
        move    r2,r0
        shrq    #12-FP_BITS,r0
        store   r0,(r14)
        neg     r0
        add     r1,r2
        store   r0,(r14+r3)
        jr      ne,singen
        addqt   #4,r14

        movei   #$f02200,blitter

        movei   #screen1,r0
        moveta  r0,currScreen.a
        movei   #$f00058,r0
        moveta  r0,BG.a
        ;--------------------
        ;- Init ms-Timer
        subq    #8,r0
//->    movei   #$f00050,r0
        movei   #(26591-1)<<16|($ffff),r1
        store   r1,(r0)                 ; Start timer
        addq    #2,r0
        moveta  r0,pit.a

        movei   #START_X*FP+FP/2,tmp0
        movei   #START_Y*FP+FP/2,tmp1
        moveta  tmp0,posX.a
        moveta  tmp1,posY.a
        movei   #START_ANGLE<<2,tmp0
        moveta  tmp0,angle.a

        move    PC,r0
        addq    #6,r0
        moveta  r0,LOOP.a
loop:
        moveq   #3,tmp0
        movei   #$f02114,tmp1
        store   tmp0,(tmp1)     ; wakeup 68k

        xor     VBLFlag,VBLFlag
waitStart:
        jr      eq,waitStart    ; wait for VBL
        cmpq    #0,VBLFlag

        movefa  pit.a,r0
        loadw   (r0),r0
        moveta  r0,time.a

;;; ------------------------------
;;; CLS
;;; ------------------------------
        ;; sky
        moveq   #0,tmp0
        store   tmp0,(blitter+_BLIT_PATD)
        store   tmp0,(blitter+_BLIT_PATD+4)
        store   tmp0,(blitter+$40)
        store   tmp0,(blitter+$44)
        bset    #11,tmp0           ; == $800
        store   tmp0,(blitter+$70)      ; int inc
        movei   #BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDPHR,tmp0
        movefa  currScreen.a,tmp1
        store   tmp0,(blitter+_BLIT_A1_FLAGS)
        store   tmp1,(blitter)  ;_BLIT_A1_BASE
        moveq   #0,tmp1
        movei   #(1<<16)|(rez_y*rez_x/2),tmp2
        store   tmp1,(blitter+_BLIT_A1_PIXEL)
        movei   #B_PATDSEL|B_GOURD,tmp1
        store   tmp2,(blitter+_BLIT_COUNT)
        store   tmp1,(blitter+_BLIT_CMD)
        WAITBLITTER
        ;; floor
        movei   #$7f307f30,tmp0
        store   tmp0,(blitter+_BLIT_PATD)
        store   tmp0,(blitter+_BLIT_PATD+4)
        movei   #B_PATDSEL,tmp1
        store   tmp2,(blitter+_BLIT_COUNT)
        store   tmp1,(blitter+_BLIT_CMD)
//->    WAITBLITTER


;;; ------------------------------
;;; Landscape
;;; ------------------------------
x               reg 99
y               reg 99
dirX            reg 99
dirY            reg 99
cameraX         reg 99
rayDirX         reg 99
rayDirY         reg 99
stepX           reg 99
stepY           reg 99
sideDistX       reg 99
sideDistY       reg 99
deltaDistX      reg 99
deltaDistY      reg 99
fp              reg 99
world           reg 99

sideDistX.a     reg 99
sideDistY.a     reg 99
world0.a        reg 99

        movefa  angle.a,tmp2

;;->  dirX = -co(angle);
;;->  dirY = si(angle);
;;->  planeX = 5*si(angle)/8;
;;->  planeY = 5*co(angle)/8;

planeX  reg 99
planeY  reg 99

        movei   #64*4,tmp0
        add     tmp2,tmp0
        shlq    #32-10,tmp0
        shlq    #32-10,tmp2
        shrq    #32-10,tmp0
        shrq    #32-10,tmp2
        load    (sinptr+tmp0),dirX
        load    (sinptr+tmp2),dirY
        moveq   #7,tmp1
        move    dirX,planeY
        move    dirY,planeX
        neg     dirX
        imult   tmp1,planeX
        imult   tmp1,planeY
        sharq   #3,planeX
        sharq   #3,planeY
        moveta  planeX,planeX.a
        moveta  planeY,planeY.a

        unreg   planeX,planeY

        moveq   #0,fp
        movei   #rez_x-1,x
        bset    #FP_BITS,fp

        move    fp,tmp2
        subq    #1,tmp2
        movefa  posX.a,tmp0
        movefa  posY.a,tmp1
        and     tmp2,tmp0
        and     tmp2,tmp1
        moveta  tmp0,sideDistX.a
        moveta  tmp1,sideDistY.a

mapX            reg 99
mapY            reg 99

        movefa  posY.a,mapY
        movefa  posX.a,mapX
        shrq    #FP_BITS,mapY
        shrq    #FP_BITS,mapX
        movefa  world.a,world
        moveq   #WORLD_WIDTH,tmp0
        add     mapX,world
        mult    tmp0,mapY
        add     mapY,world
        moveta  world,world0.a

        unreg   mapX,mapY

        ;; prepare stripe drawing
        movei   #BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADD0|BLIT_YADD1,tmp1
        WAITBLITTER             ; wait for CLS to finish
        store   tmp1,(blitter+_BLIT_A1_FLAGS)

.x_loop:
        //cameraX = 2*x*fp/_width-fp;
        move    x,cameraX
        shlq    #FP_BITS+1,cameraX
        movei   #rez_x,tmp0
        div     tmp0,cameraX

//->    int mapX = int(posX) & ~(int(fp)-1);
//->    int mapY = int(posY) & ~(int(fp)-1);

        move    fp,deltaDistX
        mult    fp,deltaDistX
        move    deltaDistX,deltaDistY

;;->    rayDirX = (dirX + planeX * cameraX/fp);
;;->    rayDirY = (dirY + planeY * cameraX/fp);

        movefa  planeX.a,rayDirX
        movefa  planeY.a,rayDirY

        sub     fp,cameraX

        imult   cameraX,rayDirX
        imult   cameraX,rayDirY
        sharq   #FP_BITS,rayDirX
        sharq   #FP_BITS,rayDirY
        add     dirX,rayDirX
        add     dirY,rayDirY

//->    if ( rayDirX != 0 ) {
//->      deltaDistX = abs(fp*fp / rayDirX);
//->
//->      if (rayDirX < 0) {
//->        stepX = -1;
//->        sideDistX = sideDistX * deltaDistX/fp;
//->      } else {
//->        stepX = 1;
//->        sideDistX = (fp - sideDistX) * deltaDistX/fp;
//->      }
//->    }

        move    rayDirX,tmp0
        abs     tmp0
        moveq   #0,stepX
        jr      eq,.zeroRayX
        moveq   #0,sideDistX

        div     tmp0,deltaDistX
        movefa  sideDistX.a,sideDistX
        moveq   #1,stepX
        jr      cs,.negRayX
        subq    #2,stepX

        neg     sideDistX
        moveq   #1,stepX
        add     fp,sideDistX
.negRayX
        imult   deltaDistX,sideDistX
        sharq   #FP_BITS,sideDistX
.zeroRayX

        move    rayDirY,tmp0
        abs     tmp0
        moveq   #0,stepY
        jr      eq,.zeroRayY
        moveq   #0,sideDistY

        div     tmp0,deltaDistY
        movefa  sideDistY.a,sideDistY
        moveq   #WORLD_WIDTH,stepY
        jr      cc,.posRayY
        neg     stepY

        neg     sideDistY
        moveq   #WORLD_WIDTH,stepY
        add     fp,sideDistY
.posRayY:
        imult   deltaDistY,sideDistY
        sharq   #FP_BITS,sideDistY
.zeroRayY

        unreg rayDirX,rayDirY


//->    while (hit == 0 ) {
//->      //jump to next map square, either in x-direction, or in y-direction
//->      if (sideDistX < sideDistY) {
//->        sideDistX += deltaDistX;
//->        mapX += stepX;
//->        side = 0;
//->      } else {
//->        sideDistY += deltaDistY;
//->        mapY += stepY;
//->        side = 1;
//->      }
//->      //Check if ray has hit a wall
//->      hit = worldMap[int(mapX/fp)][int(mapY/fp)];
//->    }


side            reg 99
left            reg 99
color           reg 99
height          reg 99


        moveq   #0,color
        movefa  world0.a,world
.wall_loop
        cmpq    #0,color
        jr      ne,.doneWall
        cmp     sideDistX,sideDistY
        jr      mi,.yStep
        nop
        moveq   #0,side
        add     stepX,world
        add     deltaDistX,sideDistX
        jr      .wall_loop
        loadb   (world),color

.yStep:
        moveq   #1,side
        add     stepY,world
        add     deltaDistY,sideDistY
        jr      .wall_loop
        loadb   (world),color
.doneWall

        unreg   world


//->    int perpWallDist;
//->    if (side == 0) perpWallDist = (sideDistX - deltaDistX);
//->    else           perpWallDist = (sideDistY - deltaDistY);

perpWallDist    reg 99

        cmpq    #0,side
        move    deltaDistX,tmp0
        jr      eq,.front
        move    sideDistX,perpWallDist
        move    deltaDistY,tmp0
        move    sideDistY,perpWallDist
.front
        sub     tmp0,perpWallDist

//->    //Calculate _height of line to draw on screen
//->    int line_height;
//->    line_height = (_height*fp / perpWallDist);
        movei   #rez_y*FP/2,height
        div     perpWallDist,height

        unreg   perpWallDist

//->    // side == 1 => left
//->    // side == 0 => back
//->    boolean front = (side == 0 && stepX < 0);
//->    boolean right = (side == 1 && stepY < 0);
        shlq    #6,side
        jr      eq,.frontCol
        cmpq    #0,stepY
        jr      pl,.leftBlock
        nop
        jr      .leftBlock
        bset    #6,side
.frontCol
        cmpq    #0,stepX
        jr      pl,.leftBlock
        nop
        addq    #31,color
.leftBlock
        shlq    #8,color
        bset    #7,color
        or      side,color

        moveq   #1,tmp2
        and     x,tmp2
        shlq    #4,tmp2
        xor     tmp2,color

        movei   #rez_y/2,y
        move    height,tmp1
        sub     height,y
        jr      pl,.ok
        shlq    #16+1,tmp1
        moveq   #0,y
        movei   #rez_y<<16|1,tmp1
.ok
        bset    #0,tmp1
        shlq    #16,y
        movei   #B_PATDSEL,tmp2
        or      x,y
        WAITBLITTER
        store   y,(blitter+_BLIT_A1_PIXEL)
        store   tmp1,(blitter+_BLIT_COUNT)
        store   color,(blitter+_BLIT_PATD)
//->    store   color,(blitter+_BLIT_PATD+4) ;VJ only
        store   tmp2,(blitter+_BLIT_CMD)
.skip
        subq    #1,x
        movei   #.x_loop,tmp0
        jump    pl,(tmp0)
        subq    #2,cameraX

//->    movei   #B_PATDSEL,tmp2
//->    movei   #0<<16|rez_x/2,y
//->    movei   #(rez_y)<<16|1,tmp1
//->    movei   #$00010001,color
//->    WAITBLITTER
//->    store   y,(blitter+_BLIT_A1_PIXEL)
//->    store   tmp1,(blitter+_BLIT_COUNT)
//->    store   color,(blitter+_BLIT_PATD)
//->    store   color,(blitter+_BLIT_PATD+4) ;VJ only
//->    store   tmp2,(blitter+_BLIT_CMD)
//->    WAITBLITTER

        unreg height,x,y,side,left,fp

        unreg stepX,stepY,sideDistX,sideDistY,deltaDistX,deltaDistY
        unreg cameraX,color

        unreg sideDistX.a,sideDistY.a,world0.a

;;; ------------------------------
;;; move

posX    reg 99
posY    reg 99

        movefa  angle.a,tmp0
        addq    #4,tmp0

        JOYPAD1 3

        movefa  angle.a,tmp0
        btst    #JOY_RIGHT_BIT,r3
        moveq   #1<<2,tmp1
        jr      ne,.left
        btst    #JOY_LEFT_BIT,r3
        jr      eq,.neither
        nop
        neg     tmp1
.left
        add     tmp1,tmp0
        shlq    #32-10,tmp0
        shrq    #32-10,tmp0
        moveta  tmp0,angle.a
.neither
        moveq   #8,tmp2
        btst    #JOY_UP_BIT,r3
        movefa  posX.a,posX
        jr      ne,.forward
        movefa  posY.a,posY
        subq    #16,tmp2
        btst    #JOY_DOWN_BIT,r3
        movei   #.neither2,tmp0
        jump    eq,(tmp0)
.forward
        imult   tmp2,dirX
        imult   tmp2,dirY
        sharq   #FP_BITS,dirX
        sharq   #FP_BITS,dirY
        add     dirX,posX
        sub     dirY,posY
 IF 0
        move    posX,tmp0
        move    posY,tmp1
        shrq    #FP_BITS,tmp0
        shrq    #FP_BITS,tmp1
        moveq   #WORLD_WIDTH,tmp2
        mult    tmp2,tmp1
        movefa  world.a,tmp2
        add     tmp0,tmp2
        add     tmp1,tmp2
        loadb   (tmp2),tmp0
        cmpq    #0,tmp0
        jr      ne,.neither2
        nop
 ENDIF
        moveta  posX,posX.a
        moveta  posY,posY.a
.neither2

        unreg dirX,dirY,posX,posY
;;; ------------------------------
;;; time

        movefa  pit.a,r0
        movefa  time.a,r1
        loadw   (r0),r0
        sub     r0,r1
        moveq   #_MS_PER_FRAME,r0
        store   r1,(r0)
        moveq   #_X_POS,r0
        movefa  posX.a,r1
        shrq    #FP_BITS,r1
        store   r1,(r0)
        moveq   #_Y_POS,r0
        movefa  posY.a,r1
        shrq    #FP_BITS,r1
        store   r1,(r0)
        moveq   #_ANGLE,r0
        movefa  angle.a,r1
        shrq    #2,r1
        store   r1,(r0)

;;; ------------------------------
;;; swap

        movefa  obl0.a,r0
        movefa  obl1.a,r1
        moveta  r0,obl1.a
        moveta  r1,obl0.a
        movei   #screen0^screen1,r1
        movefa  currScreen.a,r2
        movefa  LOOP.a,r0
        xor     r1,r2
        jump    (r0)
        moveta  r2,currScreen.a

        align 4
