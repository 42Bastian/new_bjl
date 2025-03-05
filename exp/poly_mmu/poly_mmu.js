;;; -*-asm-*-
* POLYGON-Routinen
*
*  31.05.95     build in Soft-Clipping
*   2. 6.95     new projection 3D->2D (with x/y/z-pos)
*               Soft-Clipping ok  (except some small bugs)
*   3. 6.95     build in MMULT
*  30. 6.95     build in Flag INTERN
*  17. 9.95     Interleaving improved / 8 Bit-Test
*  20. 9.95     Test with Gouraud-Shading
*   8.12.97     Translated the poor comments to English
*-----------------------------------------------------
*  May 2022     Move over to new lyxass and rmac/rln

GPU	set 1
_8Bit::	set 0
GOURAUD	set 0
HIDDEN	set 1

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	unreg LR,LR.a,SP,SP.a
	REGTOP	31
*
* parameters
*
XYZ_POS		equ GPU_ENDRAM-3*4
ANGLE		equ XYZ_POS-3*4
POINTS		equ ANGLE-4
SCREEN		equ POINTS-4
FACES::		equ SCREEN-4
FLAG		equ FACES-4

	echo "FLAG: %HFLAG"

* rez
max_x	equ 384
max_y	equ 200

IF max_x=384
BLIT_WIDTH	equ BLIT_WID384
ELSE
BLIT_WIDTH	equ BLIT_WID192
ENDIF
****************
* MACROs       *

* note, as long as we have a tmp0 register
* we may use it. both version need the same time

	MACRO SWAP
	move \0,tmp0
	move \1,\0
	move tmp0,\1

;	xor	\0,\1
;	xor	\1,\0
;	xor	\0,\1
	ENDM

	MACRO WAITBLITTER
.\waitblit	load (blitter+$38),tmp0
	btst	#0,tmp0
	jr	z,.\waitblit
	nop
	ENDM

****************
x_save.a	reg 31

tmp0		reg 0

	 run $f03000
****************
* Init
	xor	r1,r1
	movei	#$f02100,r0
	store	r1,(r0)

	movei	#x_save,tmp0		; save left/right X in internal RAM
	moveta	tmp0,x_save.a

	movei	#max_y,r1
	movei	#(max_x)<<16,r2	; minX:maxX
.loop0
	subq	#1,r1
	store	r2,(tmp0)
	jr	nz,.loop0
	addqt	#4,tmp0

****************
* main loop
main_loop:
	movei	#FLAG,r0
	xor	r1,r1
	store	r1,(r0)
	moveq	#3,r2
	movei	#$f02114,r3
	store	r2,(r3)
.wait	cmpq	#0,r1
	jr	z,.wait
	load	(r0),r1

****************
* CLS

blitter		reg 14
screen_ptr	reg 1

CLS::
	movei	#BLIT_A1_BASE,blitter
	movei	#SCREEN,screen_ptr
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,tmp0
	load	(screen_ptr),screen_ptr
	store	tmp0,(blitter+4)
	xor	tmp0,tmp0
	store	screen_ptr,(blitter)
	store	tmp0,(blitter+_BLIT_A1_PIXEL)	; pel ptr
 IF _8Bit
	movei	#1<<16|(384*200),tmp0
 ELSE
	movei	#1<<16|(384*200>>1),tmp0
 ENDIF
	store	tmp0,(blitter+$3c)
	movei	#BLIT_LFU_ZERO,tmp0
	store	tmp0,(blitter+$38)

UNREG blitter,screen_ptr
****************
* compute rotation matrix
* a=cos(gamma) b=sin(gamma)
* c=cos(beta)  d=sin(beta)
* e=cos(alpha) f=sin(alpha)

a		reg 20
b		reg 19
c		reg 18
d		reg 17
e		reg 16
f		reg 15
af		reg 14
bf		reg 13
ae		reg 12
be		reg 11
mtx_addr	reg 10

m1		reg 9	;
m2		reg 8	;
m3		reg 7	;          / ac adf-be ade+bf \
m4		reg 6	;          |                  |
m5		reg 5	; D(x,y,z)=| bc bdf+ae bde-af |
m6		reg 4	;          |                  |
m7		reg 3	;          \-d    cf     ce   /
m8		reg 2	;
m9		reg 1	;

rotate::
	movei	#ANGLE,r14	; fetch cosine and sine
	movei	#64,tmp0
	load	(r14),a		; from the table
	load	(r14+4),c
	load	(r14+8),e
	move	a,b
	add	tmp0,a
	move	c,d
	add	tmp0,c
	move	e,f
	add	tmp0,e

	shlq	#24,b
	shlq	#24,d
	shrq	#22,b
	shrq	#22,d

	shlq	#24,f
	shlq	#24,a
	shrq	#22,f
	shrq	#22,a

	shlq	#24,c
	shlq	#24,e
	shrq	#22,c
	shrq	#22,e

//->	movei	#SinTab,r14
	movei	#$4004,r14
	load	(r14+a),a	; sin alpha
	load	(r14+b),b	; cos alpha
	load	(r14+c),c	; sin beta
	load	(r14+d),d	; cos beta
	load	(r14+e),e	; sin gamma
	load	(r14+f),f	; cos gamma
*
** compute rotational matrix
*
	move	a,af
	move	a,ae
	imult	f,af
	imult	e,ae
	sharq	#15,af
	sharq	#15,ae

	move	b,bf
	move	b,be
	imult	f,bf
	imult	e,be
	sharq	#15,bf
	sharq	#15,be

	move	a,m1
	move	af,m2
	imult	c,m1
	imult	d,m2
	sharq	#15,m1
	sharq	#15,m2

	sub	be,m2

	move	ae,m3
	move	b,m4
	imult	d,m3
	imult	c,m4
	sharq	#15,m3
	sharq	#15,m4

	add	bf,m3

	move	bf,m5
	move	be,m6
	imult	d,m5
	imult	d,m6
	sharq	#15,m5
	sharq	#15,m6

	add	ae,m5
	sub	af,m6

	move	d,m7
	move	f,m8
	neg	m7
	imult	c,m8
	move	c,m9
	sharq	#15,m8
	imult	e,m9
	sharq	#15,m9
*
* now move it into the local ram (for MMULT !)
*
	movei	#$f02104,mtx_addr
	moveq	#3,tmp0		; 3x1-Matrix
	store	tmp0,(mtx_addr)
	addq	#4,mtx_addr
	movei	#rot_mat,r14
	store	m3,(r14)
	store	m2,(r14+4)
	store	m1,(r14+8)
	store	m6,(r14+12)
	store	m5,(r14+16)
	store	m4,(r14+20)
	store	m9,(r14+24)
	store	m8,(r14+28)
	store	m7,(r14+32)

	UNREG m1,m2,m3,m4,m5,m6,m7,m8,m9
	UNREG a,b,c,d,e,f,af,bf,ae,be	; release registers
;---------------

****************
* rotate and project
counter		REG 29
LOOP		REG 28
dist		REG 27

xcenter		REG 25
ycenter		REG 24
hi_phrase	REG 23
x0		reg 22
y0		reg 21
z0		reg 20
x1		reg 19
y1		reg 18
z1		reg 17
xyz_ptr		reg 16
proj_ptr	reg 15

x_pos		reg 14
y_pos		reg 13
z_pos		reg 12
CONT1		reg 11

rot_mat_ptr	reg 9

proj_ptr.a	reg 15

	move	r14,rot_mat_ptr
* REG 0	 = tmp0
	movei	#POINTS,xyz_ptr
	load	(xyz_ptr),xyz_ptr
	load	(xyz_ptr),counter
	addq	#4,xyz_ptr
	movei	#proj_points,proj_ptr
	moveta	proj_ptr,proj_ptr.a

	movei	#XYZ_POS,r14
	load	(r14+8),z_pos
	load	(r14+4),y_pos
	load	(r14),x_pos
***************
	movei	#.loop_xyz,LOOP
	movei	#.cont1,CONT1

	load	(xyz_ptr),x0	; y/z pre-load
	movei	#700,dist
	movei	#max_x>>1,xcenter
	movei	#max_y>>1,ycenter

.loop_xyz
	addqt	#4,xyz_ptr
	moveta	x0,r1
	load	(xyz_ptr),y0
	addqt	#4,xyz_ptr
	moveta	y0,r0
	store	rot_mat_ptr,(mtx_addr)	; GPU increases address !!
	nop			; *** clear WRITE BACK score-board
	mmult	r0,x1		; x1=m1*x0+m2*y0+m3*z0
	nop			; *** clear WRITE BACK score-board
	mmult	r0,y1		; y1=m4*x0+m5*y0+m6*z0
	nop			; *** clear WRITE BACK score-board
	mmult	r0,z1		; z1=m7*x0+m8*y0+m9*z0
	sharq	#15,x1
	sharq	#15,y1
	sharq	#15,z1
****************
* 3D->2D
*          (x'+x_pos)*dist
* x_proj = ---------------
*           z'+z_pos+dist
*
*          (y'+y_pos)*dist
* y_proj = ---------------
*           z'+z_pos+dist
****************
	add	x_pos,x1
	add	y_pos,y1
	move	x1,x0
	move	y1,y0
	abs	x1
	abs	y1
	mult	dist,x1
	add	z_pos,z1
	mult	dist,y1
	add	dist,z1		; z'=z+z_pos+dist
	move	z1,tmp0
	jump	z,(CONT1)
	abs	z1

	div	z1,x1
	xor	tmp0,x0
	jr	nn,.cont0
	nop
	neg	x1
.cont0
	or	x1,x1
	div	z1,y1
	xor	tmp0,y0
	jump	nn,(CONT1)
	add	xcenter,x1
	neg	y1
.cont1
	add	ycenter,y1
	shlq	#16,x1
	shlq	#16,y1
	shrq	#16,y1
	or	x1,y1
	load	(xyz_ptr),x0
	subq	#1,counter
	store	y1,(proj_ptr)	; save Xscreen/Yscreen
	jump	nz,(LOOP)
	addqt	#4,proj_ptr


	UNREG counter,LOOP
	UNREG dist,xcenter,ycenter
	UNREG x0,y0,z0,x1,y1,z1
	UNREG hi_phrase,xyz_ptr
	UNREG x_pos,y_pos,z_pos,CONT1
	UNREG mtx_addr,rot_mat_ptr
****************
* draw polys
xy0.a		reg 99
inc_color.a	reg 99
EDGE.a		reg 99
DRAW_LINES.a	reg 99
pptr.a		reg 99

ENDE		reg 31
RETURN		reg 30
x0		reg 26
y0		reg 25
x1		reg 24
y1		reg 23
x2		reg 22
y2		reg 21
color		reg 20

blitter		reg 14
pptr		reg 10

screen_ptr	reg 5
POLYGON		reg 4
LOOP		reg 2

* REG 0 = tmp0

Drawfaces::
	movei	#FACES,r14
	load	(r14),pptr
	moveta	pptr,pptr.a
	load	(r14+4),screen_ptr
	movei	#.exit,ENDE
	moveq	#1,tmp0
	moveq	#4,color

 IF _8Bit = 0
	shlq	#8,tmp0
 IF GOURAUD = 0
	subq	#5,color
	shrq	#25,color
 ENDIF
 ENDIF
	moveta	tmp0,inc_color.a
	movei	#polygon,POLYGON
	movei	#return,RETURN
	movefa	proj_ptr.a,proj_ptr

	movei	#Edge,tmp0
	moveta	tmp0,EDGE.a
	movei	#DrawLines,tmp0
	moveta	tmp0,DRAW_LINES.a
*
** setup Blitter
*
	movei	#$f02200,blitter
	WAITBLITTER

	store	screen_ptr,(blitter)
 IF _8Bit
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WIDTH|BLIT_XADDPHR,tmp0
 ELSE
 IF GOURAUD
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPIX,tmp0
 ELSE
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPHR,tmp0
 ENDIF
 ENDIF
	store	tmp0,(blitter+$04)
	movei	#$00010000,tmp0
	store	tmp0,(blitter+$1c)
 IF 0
	moveq	#0,tmp0
	store	tmp0,(blitter+$08)	; clip size
	store	tmp0,(blitter+$0c)	; pel ptr
	store	tmp0,(blitter+$10)	; step
	store	tmp0,(blitter+$14)	; step fract
	store	tmp0,(blitter+$18)	; pel ptr fract
	store	tmp0,(blitter+$1c)	; inc
	store	tmp0,(blitter+$20)	; inc fract
	store	tmp0,(blitter+$2c)	; window mask
	store	tmp0,(blitter+$30)	; window ptr
	store	tmp0,(blitter+$34)	; a2 step
	store	tmp0,(blitter+$78)	; coll contrl
 ENDIF
	movei	#$00010000,tmp0
	store	tmp0,(blitter+$70)	; int inc
	movei	#$20002000,tmp0
	store	tmp0,(blitter+$40)
	store	tmp0,(blitter+$44)

****************
.loop
	load	(pptr),tmp0
	addq	#4,pptr
	cmpq	#-1,tmp0
	load	(proj_ptr+tmp0),y0
	jump	z,(ENDE)
	nop
	load	(pptr),tmp0
	addq	#4,pptr
	load	(proj_ptr+tmp0),y1
	load	(pptr),tmp0
	movefa	pptr.a,pptr
	load	(proj_ptr+tmp0),y2
** Hidden surface
	move	y0,x0
	shlq	#16,y0
	sharq	#16,x0
	sharq	#16,y0

	move	y1,x1
	shlq	#16,y1
	sharq	#16,x1
	sharq	#16,y1

	move	y2,x2
	shlq	#16,y2
	sharq	#16,x2
	sharq	#16,y2

	sub	y1,y2
	sub	x1,x2
	sub	x0,x1
	neg	x2
	imult	x1,y2	; (x1-x0)*(x2-y1)
	sub	y0,y1
	imult	x2,y1	; (x1-x2)*(y1-y0)
	add	y1,y2
 IF HIDDEN=0
	jump	(POLYGON)
	nop
 ELSE
	jump	nn,(POLYGON)
	nop
.cont	load	(pptr),tmp0
	cmpq	#-1,tmp0
	addqt	#4,pptr
	jr	nz,.cont
	moveta	pptr,pptr.a
 ENDIF

return:
	movefa	inc_color.a,tmp0
	add	tmp0,color
 IF _8Bit
	sat8	color
//-> ELSE
//->	sat16	color
 ENDIF
	movei	#.loop,LOOP
	jump	(LOOP)
	movefa	pptr.a,pptr

.exit	movei	#main_loop,r0
	jump	(r0)
	nop

	UNREG LOOP,x0,y0,x1,y1,x2,y2,screen_ptr
****************
* faces	: point-list
* proj	:  x1,y1,x2,y2,x3,y3..

x0.a		reg 99
y0.a		reg 99

point		reg 29

y2		reg 23
x2		reg 22
y1		reg 21
x1		reg 19

y_min		reg 18
* pptr = 10

EDGE		reg 99
POLY_LOOP	reg 99
DRAW_LINES	reg 99

	regmap

polygon::
	movei	#.poly_loop,POLY_LOOP
	movefa	pptr.a,pptr
	movefa	proj_ptr.a,proj_ptr

	movefa	EDGE.a,EDGE
	movefa	DRAW_LINES.a,DRAW_LINES

	;; get first point
	load	(pptr),point
	addq	#4,pptr
	moveta	pptr,pptr.a
	load	(proj_ptr+point),y1
	move	y1,x1
	shlq	#16,y1

	sharq	#16,x1
	sharq	#16,y1

	moveta	x1,x0.a
	moveta	y1,y0.a
	movei	#max_y+1,y_min

.poly_loop
	load	(pptr),point
	addq	#4,pptr
	cmpq	#-1,point	; last?
	moveta	pptr,pptr.a
	jump	z,(DRAW_LINES)
	load	(proj_ptr+point),y2
	movefa	y0.a,y1
	movefa	x0.a,x1
	move	y2,x2
	shlq	#16,y2

	sharq	#16,x2
	sharq	#16,y2

	moveta	x2,x0.a
	moveta	y2,y0.a

	UNREG point,EDGE
****************
* edge (x1,y1)-(x2,y2)
* Bresenham-Algo.
****************
delta	reg 99
delta_y	reg 99
delta_x	reg 99
d_x	reg 99
LOOP	reg 99
step	reg 99
y_count	reg 99
ptr	reg 99

tmp1	reg 1

	regmap
Edge::
	move	y2,delta_y
	move	y2,r24
	sub	y1,delta_y
	move	y1,r25
	jr	nn,.cont0
	move	x1,tmp0	; (x1,y1) <-> (x2,y2)
	move	x2,x1
	move	tmp0,x2
	move	r24,y1
	move	r25,y2
	neg	delta_y

.cont0
	move	x2,delta_x
	movei	#max_y,y_count
	sub	x1,delta_x
	jr	nn,.cont1
	moveq	#1,d_x
	neg	delta_x
	subq	#2,d_x
.cont1
	cmp	delta_x,delta_y
	movei	#.cont5,LOOP
	jump	nn,(LOOP)	; delta_x<delta_y => LOOP
	nop
***************
	;; delta_y >= delta_x
	shlq	#1,delta_y
	movei	#.loop0,LOOP
	move	delta_y,delta
	move	delta_x,step
	sub	delta_x,delta
	shlq	#1,delta_x

	cmpq	#0,y1
	movei	#.positiv0,tmp0
	jump	nn,(tmp0)
//->	nop			; Atari says, NOP is needed ;-)
	jump	z,(tmp0)

	cmpq	#0,delta
.loop001
	jr	nn,.cont04
	add	d_x,x1
	subq	#1,step
	jr	nn,.loop001
	add	delta_y,delta
	jump	(POLY_LOOP)		;.exit

.cont04
	add	delta_y,delta
	sub	delta_x,delta
	subq	#1,step
	jump	n,(POLY_LOOP)	  ;.exit
	addq	#1,y1
	jr	n,.loop001
	cmpq	#0,delta

.positiv0
	cmp	y1,y_min
	jr	n,.min1
	sub	y1,y_count
	move	y1,y_min
.min1

	movefa	x_save.a,ptr
	jump	n,(POLY_LOOP)
//->	nop			; Atari says, NOP is needed ;-)
	jump	z,(POLY_LOOP)
	shlq	#2,y1		; as ptr for x-save
	add	y1,ptr

	load	(ptr),tmp0
	sub	delta_y,delta_x
.loop0
	move	tmp0,x2
	shlq	#16,tmp0
	sharq	#16,x2
	sharq	#16,tmp0

.loop_x_step
	cmp	x1,x2
	jr	n,.cont2
	cmp	tmp0,x1
	move	x1,x2
.cont2
	move	x2,tmp1
	jr	n,.cont3
	shlq	#16,tmp1
	move	x1,tmp0
.cont3
	cmpq	#0,delta
	jr	nn,.cont4
	add	d_x,x1
	subq	#1,step
	jr	nn,.loop_x_step
	add	delta_y,delta

	jump	(POLY_LOOP)

.cont4
	or	tmp0,tmp1
	sub	delta_x,delta
	subq	#1,y_count
	store	tmp1,(ptr)
	jump	z,(POLY_LOOP)	  ;exit
	subq	#1,step
	addqt	#4,ptr
	jump	nn,(LOOP)
	load	(ptr),tmp0

	jump	(POLY_LOOP)

****************
.cont5
	shlq	#1,delta_x
	movei	#.loop1,LOOP
	move	delta_x,delta
	move	delta_y,step
	sub	delta_y,delta
	shlq	#1,delta_y

	movei	#.positiv1,tmp0
	cmpq	#0,y1
	jump	nn,(tmp0)
//->	nop			; Atari says, NOP is needed ;-)
	jump	z,(tmp0)

	cmpq	#0,delta
.loop11
	jr	nn,.cont18
	add	delta_x,delta

	addq	#1,y1
	jump	nn,(tmp0)
	subq	#1,step
	jr	nn,.loop11
	cmpq	#0,delta
	jump	(POLY_LOOP)		;exit
.cont18
	add	d_x,x1
	sub	delta_y,delta
	addq	#1,y1
	jump	nn,(tmp0)
	subq	#1,step
	jr	nn,.loop11
	cmpq	#0,delta

	jump	(POLY_LOOP)

.positiv1
	cmp	y1,y_min
	jr	n,.min2
	sub	y1,y_count
	move	y1,y_min
.min2
	movefa	x_save.a,ptr
	jump	n,(POLY_LOOP)
//->	nop			; Atari says, NOP is needed ;-)
	jump	z,(POLY_LOOP)		;.exit
	shlq	#2,y1		; ptr for x-save
	add	y1,ptr

	load	(ptr),tmp0
	sub	delta_x,delta_y
.loop1
	move	tmp0,x2
	shlq	#16,tmp0
	sharq	#16,x2
	sharq	#16,tmp0

	cmp	x1,x2
	jr	n,.cont6
	cmp	tmp0,x1
	move	x1,x2
.cont6
	jr	n,.cont7
	shlq	#16,x2
	move	x1,tmp0
.cont7
	or	tmp0,x2

	cmpq	#0,delta
	store	x2,(ptr)
	jr	nn,.cont8
	subq	#1,y_count

	addqt	#4,ptr
	jump	z,(POLY_LOOP)	  ; exit
	subq	#1,step
	load	(ptr),tmp0
	jump	nn,(LOOP)
	add	delta_x,delta
	jump	(POLY_LOOP)
	nop

.cont8
	addqt	#4,ptr
	jump	z,(POLY_LOOP)		; y_count=0 => exit
	sub	delta_y,delta
	subq	#1,step
	load	(ptr),tmp0
	jump	nn,(LOOP)	; step >= 0 => LOOP
	add	d_x,x1
	jump	(POLY_LOOP)
	nop

 UNREG delta,delta_x,delta_y,d_x,step,y_count,ptr,tmp1,LOOP

 UNREG x0.a,y0.a,x1,x2,y1,y2,DRAW_LINES,POLY_LOOP,POLYGON

****************
* draw H-Lines

bstart		reg 99
xptr		reg 99
LOOP2		reg 99
LOOP		reg 99
leave_it	reg 99
x1		reg 99
x2		reg 99
y1		reg 99
CONT1		reg 99
x2_next		reg 99

DrawLines::
	move	color,tmp0
 IF _8Bit
	shlq	#8,tmp0
	or	color,tmp0
	shlq	#8,tmp0
	or	color,tmp0
	shlq	#8,tmp0
	or	color,tmp0
 ELSE
	shlq	#16,tmp0
	or	color,tmp0
 ENDIF
	store	tmp0,(blitter+_BLIT_PATD)
	store	tmp0,(blitter+_BLIT_PATD+4)
 IF GOURAUD
	movei	#$28000,tmp0
	store	tmp0,(blitter+_BLIT_IINC)
 ENDIF
	movei	#B_PATDSEL|B_GOURD*GOURAUD,bstart
	movefa	x_save.a,xptr

	movei	#(max_x)<<16,leave_it
	movei	#.loop3,LOOP
	store	leave_it,(xptr)
	movei	#.cont1,CONT1

	move	y_min,y1
	shlq	#2,y_min
	add	y_min,xptr
	load	(xptr),x2
	store	leave_it,(xptr)
	addq	#4,xptr

.loop3
	load	(xptr),x2_next
	store	leave_it,(xptr)
	move	x2,x1
	shlq	#16,x2
	sharq	#16,x1
	jr	nn,._0
	cmp	leave_it,x2
	moveq	#0,x1
._0	jr	n,._1
	sharq	#16,x2
	movei	#max_x-1,x2
._1
	jump	eq,(CONT1)
	sub	x1,x2
	jump	n,(CONT1)
	shlq	#16,x1
	addq	#1,x2
	or	y1,x1
	bset	#16,x2
	rorq	#16,x1
	WAITBLITTER
	store	x1,(blitter+_BLIT_A1_PIXEL)
	store	x2,(blitter+_BLIT_COUNT)
	store	bstart,(blitter+_BLIT_CMD)
.cont1
	move	x2_next,x2
	store	leave_it,(xptr)
	cmp	leave_it,x2
	addqt	#4,xptr
	jump	nz,(LOOP)
	addq	#1,y1

	jump	(RETURN)
	nop

	unreg bstart,xptr
	unreg x1,x2,y1,blitter,leave_it
	unreg LOOP,LOOP2,CONT1
****************
	align 4
rot_mat		ds.l 9
x_save		ds.l max_y+1
	align 8
points		ds.l 134*2
proj_points	ds.l 134
ende:		equ *

	echo "points: %Hpoints"
	echo "ENDE : %Hende"

end
