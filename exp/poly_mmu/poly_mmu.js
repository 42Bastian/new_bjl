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
_8Bit	set 0
GOURAUD	set 0
HIDDEN	set 1


	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

	unreg LR
*
* parameters
*
XYZ_POS		equ GPU_ENDRAM-3*4
ANGLE		equ XYZ_POS-3*4
PROJ_POINTS	equ ANGLE-4
POINTS		equ PROJ_POINTS-4
X_SAVE		equ POINTS-4
SCREEN		equ X_SAVE-4
FACES::		equ SCREEN-4
FLAG		equ FACES-4


* rez
max_x	equ 384-1
max_y	equ 200

IF max_x=383
BLIT_WIDTH	equ BLIT_WID384
ELSE
BLIT_WIDTH	equ BLIT_WID192
ENDIF
****************
* MACROs       *

* note, as long as we have a dummy register
* we may use it. both version need the same time

	MACRO SWAP
	move \0,dummy
	move \1,\0
	move dummy,\1

;	xor	\0,\1
;	xor	\1,\0
;	xor	\0,\1
	ENDM

	MACRO WAITBLITTER
.\waitblit	load (blitter),dummy
	btst	#0,dummy
	jr	z,.\waitblit
	nop
	ENDM

	MACRO WAITBLITTER1
.\waitblit	load (blitter+$38),dummy
	btst	#0,dummy
	jr	z,.\waitblit
	nop
	ENDM

****************

	 run $f03000
****************
* Init
	movei	#GPU_REMAIN,r0
	xor	r1,r1
	store	r1,(r0)
	movei	#$f02100,r0
	store	r1,(r0)
****************
* main loop
main_loop:
	movei	#FLAG,r0
	xor	r1,r1
	store	r1,(r0)
.wait	cmpq	#0,r1
	load (r0),r1
	jr	z,.wait
	nop
****************
* CLS

blitter		reg 14
screen_ptr	reg 1
dummy		reg 0

CLS::	movei	#BLIT_A1_BASE,blitter
	movei	#SCREEN,screen_ptr
	movei	#BLIT_WID384|BLIT_PITCH1|BLIT_PIXEL32,dummy
	load	(screen_ptr),screen_ptr
	store	dummy,(blitter+4)
	xor	dummy,dummy
	store	screen_ptr,(blitter)
	store	dummy,(blitter+_BLIT_A1_PIXEL)	; pel ptr
	store	dummy,(blitter+_BLIT_A1_FPIXEL)	; pel ptr frac
	movei	#BLIT_PATD,blitter
	store	dummy,(blitter)
	store	dummy,(blitter+4)
 IF _8Bit
	movei	#1<<16|(384*200)>>2,dummy
 ELSE
	movei	#1<<16|(384*200<<1)>>2,dummy
 ENDIF
	movei	#BLIT_CMD,blitter
	store	dummy,(blitter+4)
	movei	#BLIT_PATDSEL,dummy
	store	dummy,(blitter)
;	WAITBLITTER
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
	movei	#64,dummy
	load	(r14),a		; from the table
	load	(r14+4),c
	load	(r14+8),e
	move	a,b
	add	dummy,a
	move	c,d
	add	dummy,c
	move	e,f
	add	dummy,e

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

	movei	#SinTab,r14
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
	moveq	#3,dummy		; 3x1-Matrix
	store	dummy,(mtx_addr)
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
rot_mat_ptr	reg 1

	move	r14,rot_mat_ptr

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

proj_ptr.a	reg 15


* REG 0	 = dummy
	movei	#POINTS,r14
	load	(r14),xyz_ptr
	load	(xyz_ptr),counter
	addq	#4,xyz_ptr
	load	(r14+4),proj_ptr	; point-data from external RAM
	moveta	proj_ptr,proj_ptr.a

	movei	#XYZ_POS,r14
	load	(r14+8),z_pos
	load	(r14+4),y_pos
	load	(r14),x_pos

***************
	movei	#$f02118,hi_phrase
	movei	#.loop_xyz,LOOP
	movei	#.cont1,CONT1

	loadp	(xyz_ptr),y0	; y/z pre-load

	movei	#700,dist
	movei	#max_x>>1,xcenter
	movei	#max_y>>1,ycenter

.loop_xyz
	moveta	y0,r0
	load	(hi_phrase),x0
	addq	#8,xyz_ptr
	moveta	x0,r1
	store	rot_mat_ptr,(mtx_addr)	; GPU increases address !!
	nop			; *** clear WRITE BACK score-board
	mmult	r0,x1		; x1=m1*x0+m2*y0+m3*z0
	nop			; *** clear WRITE BACK score-board
	mmult	r0,y1		; y1=m4*x0+m5*y0+m6*z0
	sharq	#15,x1
	nop			; *** clear WRITE BACK score-board
	mmult	r0,z1		; z1=m7*x0+m8*y0+m9*z0
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
	move	z1,dummy
	jump	z,(CONT1)
	abs	z1
	div	z1,x1
	xor	dummy,x0
	jr	nn,.cont0
	nop
	neg	x1
.cont0	div	z1,y1
	xor	dummy,y0
	jump	nn,(CONT1)
	nop
	neg	y1

.cont1
	add	xcenter,x1
	add	ycenter,y1
	shlq	#16,x1
	shlq	#16,y1
	shrq	#16,y1
	or	x1,y1
	subq	#1,counter
	store	y1,(proj_ptr)	; save Xscreen/Yscreen
	addqt	#4,proj_ptr
	jump	nz,(LOOP)
	loadp	(xyz_ptr),y0

	UNREG counter,LOOP
	UNREG dist,xcenter,ycenter
	UNREG x0,y0,z0,x1,y1,z1
	UNREG hi_phrase,xyz_ptr,proj_ptr
	UNREG x_pos,y_pos,z_pos,CONT1
	UNREG mtx_addr,rot_mat_ptr
****************
* draw polys
RETURN		reg 30
x_save.a	reg 29
xy0.a		reg 28
inc_color.a	reg 27
EDGE.a		reg 26
DRAW_LINES.a	reg 25

x0		reg 26
y0		reg 25
x1		reg 24
y1		reg 23
x2		reg 22
y2		reg 21

blitter		reg 14
proj_ptr	reg 15
pptr		reg 10
pptr.a		reg 10

color		reg 6
screen_ptr	reg 5
POLYGON		reg 4
ENDE		reg 3
LOOP		reg 2

* REG 0 = dummy

Drawfaces::
	movei	#FACES,r14
	load	(r14),pptr
	moveta	pptr,pptr.a
	load	(r14+4),screen_ptr
*load	(r14+8),dummy
	movei	#_x_save,dummy		; save left/right X in internal RAM
	moveta	dummy,x_save.a
	movei	#.loop,LOOP
	movei	#.exit,ENDE
	movei	#$1<<8,dummy
	moveta	dummy,inc_color.a
	movei	#$00,color
 IF GOURAUD=0
	movei	#$ff,color
 ENDIF
	movei	#polygon,POLYGON
	movei	#return,RETURN
	movefa	proj_ptr.a,proj_ptr

	movei	#Edge,dummy
	moveta	dummy,EDGE.a
	movei	#DrawLines,dummy
	moveta	dummy,DRAW_LINES.a
*
** setup Blitter
*
	movei	#$f02200,blitter
	WAITBLITTER1	  ; aber erst warten !

	store	screen_ptr,(blitter)
 IF _8Bit
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WIDTH|BLIT_XADDPHR,dummy
 ELSE
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WIDTH|BLIT_XADDPHR,dummy
 ENDIF
	store	dummy,(blitter+$04)
	movei	#$00010000,dummy
	store	dummy,(blitter+$1c)
	moveq	#0,dummy
	store	dummy,(blitter+$08)	; clip size
	store	dummy,(blitter+$0c)	; pel ptr
	store	dummy,(blitter+$10)	; step
	store	dummy,(blitter+$14)	; step fract
	store	dummy,(blitter+$18)	; pel ptr fract
	store	dummy,(blitter+$1c)	; inc
	store	dummy,(blitter+$20)	; inc fract
	store	dummy,(blitter+$2c)	; window mask
	store	dummy,(blitter+$30)	; window ptr
	store	dummy,(blitter+$34)	; a2 step
	store	dummy,(blitter+$78)	; coll contrl

	movei	#$10000,dummy
	store	dummy,(blitter+$70)	; int inc
	movei	#$20002000,dummy
	store	dummy,(blitter+$40)
	store	dummy,(blitter+$44)

	movei	#$f02238,blitter
****************
.loop
	load	(pptr),dummy
	addq	#4,pptr
	cmpq	#-1,dummy
	load	(proj_ptr+dummy),y0
	jump	z,(ENDE)
	nop
	load	(pptr),dummy
	addq	#4,pptr
	load	(proj_ptr+dummy),y1
	load	(pptr),dummy
	movefa	pptr.a,pptr
	load	(proj_ptr+dummy),y2
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
.cont	load	(pptr),dummy
	cmpq	#-1,dummy
	addqt	#4,pptr
	jr	nz,.cont
	moveta	pptr,pptr.a
 ENDIF

return	movefa	inc_color.a,dummy
	add	dummy,color
	jump	(LOOP)
	movefa	pptr.a,pptr

.exit	movei	#main_loop,r0
	jump	(r0)

	UNREG LOOP,x0,y0,x1,y1,x2,y2,blitter
****************
* faces	: point-list
* proj	:  x1,y1,x2,y2,x3,y3..

x0.a		reg 24
y0.a		reg 23
* pptr = 10
point		reg 11
EDGE		reg 12
POLY_LOOP	reg 13
DRAW_LINES	reg 14

x1		reg 20
y1		reg 21
x2		reg 22
y2		reg 23


polygon::

	;; Setup min/max X table
	movefa	x_save.a,dummy
	movei	#max_y,point
	movei	#max_x<<16,x1	; minX:maxX
.loop0
	subq	#1,point
	store	x1,(dummy)
	jr	nz,.loop0
	addqt	#4,dummy

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

	UNREG point,EDGE,DRAW_LINES,x1,x2,y1,y2
****************
* edge (x1,y1)-(x2,y2)
* Bresenham-Algo.
****************
* trashed registers : 16..29
y_count	reg 17

step	reg 18
LOOP	reg 19
x1	reg 20
y1	reg 21
x2	reg 22
y2	reg 23

d_x	reg 24
delta_x	reg 25
delta_y	reg 26
delta	reg 27
dummy1	reg 28

ptr	reg 23	; redefined reg. !!

Edge::	move	y2,delta_y
	move	y2,r24
	sub	y1,delta_y
	move	y1,r25
	jr	nn,.cont0
	move	x1,dummy	; (x1,y1) <-> (x2,y2)
	move	x2,x1
	move	dummy,x2
	move	r24,y1
	move	r25,y2
	neg	delta_y

.cont0	move	x2,delta_x
	movei	#max_y,y_count
	sub	x1,delta_x
	jr	nn,.cont1
	moveq	#1,d_x
	neg	delta_x
	subq	#2,d_x
.cont1	cmp	delta_x,delta_y
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
	movei	#.positiv0,dummy
	jump	nn,(dummy)
	nop
	jump	z,(dummy)
	nop
.loop001
	cmpq	#0,delta
.loop002
	jr	nn,.cont04
	add	d_x,x1
	subq	#1,step
	jr	nn,.loop001
	add	delta_y,delta
	jump	(POLY_LOOP)		;.exit
	nop
.cont04
	add	delta_y,delta
	sub	delta_x,delta
	subq	#1,step
	jump	n,(POLY_LOOP)	  ;.exit
	addq	#1,y1
	jr	n,.loop002
	cmpq	#0,delta
.positiv0
	sub	y1,y_count
	jump	n,(POLY_LOOP)		;.exit
	movefa	x_save.a,ptr
	jump	z,(POLY_LOOP)		;.exit
	shlq	#2,y1		; as ptr for x-save
	add	y1,ptr

CONT2	reg 21		; redef
CONT3	reg 16

	movei	#.cont2,CONT2
	movei	#.cont3,CONT3
	load	(ptr),dummy1
	sub	delta_y,delta_x
.loop0	move	dummy1,dummy
	move	dummy1,x2
	shlq	#16,dummy
	sharq	#16,x2
	sharq	#16,dummy

	cmp	x1,x2
	jump	n,(CONT2)
	cmp	dummy,x1
	move	x1,x2
.cont2	jump	n,(CONT3)
	shlq	#16,x2
	move	x1,dummy
.cont3	or	x2,dummy

	cmpq	#0,delta
	move	dummy,dummy1
	jr	nn,.cont4
	add	d_x,x1
	subq	#1,step
	jump	nn,(LOOP)
	add	delta_y,delta
	jump	(POLY_LOOP)
	nop

.cont4	sub	delta_x,delta
	subq	#1,y_count
	store	dummy1,(ptr)
	jump	z,(POLY_LOOP)	  ;exit
	subq	#1,step
	addqt	#4,ptr
	jump	nn,(LOOP)
	load	(ptr),dummy1
	jump	(POLY_LOOP)
	nop
****************
.cont5	movei	#.loop1,LOOP
	shlq	#1,delta_x
	move	delta_x,delta
	move	delta_y,step
	sub	delta_y,delta
	shlq	#1,delta_y

	movei	#.positiv1,dummy
	cmpq	#0,y1
	jump	nn,(dummy)
	nop
	jump	z,(dummy)
	nop

.loop11	cmpq	#0,delta
	jr	nn,.cont18
	add	delta_x,delta
	addq	#1,y1
	jump	nn,(dummy)
	subq	#1,step
	jr	nn,.loop11
	nop
	jump	(POLY_LOOP)		;exit
.cont18	add	d_x,x1
	sub	delta_y,delta
	addq	#1,y1
	jump	nn,(dummy)
	subq	#1,step
	jr	nn,.loop11
	nop
.exit01	jump	(POLY_LOOP)
	nop

.positiv1	sub	y1,y_count
	jump	n,(POLY_LOOP)		;exit
	movefa	x_save.a,ptr
	jump	z,(POLY_LOOP)		;.exit
	shlq	#2,y1		; ptr for x-save
	add	y1,ptr

CONT6	reg 21		; redef
CONT7	reg 16		; redef

	movei	#.cont6,CONT6
	movei	#.cont7,CONT7

	load	(ptr),dummy
	sub	delta_x,delta_y
.loop1	move	dummy,x2
	shlq	#16,dummy
	sharq	#16,x2
	sharq	#16,dummy
	cmp	x1,x2
	jump	n,(CONT6)
	cmp	dummy,x1
	move	x1,x2
.cont6	jump	n,(CONT7)
	shlq	#16,x2
	move	x1,dummy
.cont7	or	dummy,x2

	cmpq	#0,delta
	store	x2,(ptr)
	jr	nn,.cont8
	subq	#1,y_count
	addqt	#4,ptr
	jump	z,(POLY_LOOP)	  ; exit
	subq	#1,step
	load	(ptr),dummy
	jump	nn,(LOOP)
	add	delta_x,delta
	jump	(POLY_LOOP)
	nop

.cont8	addqt	#4,ptr
	jump	z,(POLY_LOOP)		; y_count=0 => exit
	sub	delta_y,delta
	subq	#1,step
	load	(ptr),dummy
	jump	nn,(LOOP)	; step >= 0 => LOOP
	add	d_x,x1
	jump	(POLY_LOOP)
	nop

	unreg	LOOP,delta_x,delta_y,x1,y1,y2,x2,dummy1
****************
* draw H-Lines

pel_ptr		reg 29
bstart		reg 28
xptr		reg 27
LOOP2		reg 26
LOOP		reg 25
line_counter	reg 24
leave_it	reg 23
x1		reg 22
x2		reg 21
y1		reg 20

CONT1		reg 18
bcounter	reg 17
bpattern	reg 16
blitter		reg 14

* dummy = 0
DrawLines::
	move	color,dummy
	movei	#BLIT_A1_PIXEL,pel_ptr
	shlq	#16,dummy
	movei	#BLIT_PATD,bpattern
	or	color,dummy
	movei	#B_DSTEN|B_PATDSEL|B_GOURD*GOURAUD,bstart
	store	dummy,(bpattern)
	addq	#4,bpattern
	movefa	x_save.a,xptr
	store	dummy,(bpattern)

	movei	#max_y+1,line_counter
	movei	#max_x<<16,leave_it
	movei	#$f02238,blitter
	movei	#.loop3,LOOP
	movei	#.loop2,LOOP2
	movei	#.cont1,CONT1

	;; find lowest Y
	xor	y1,y1
	subq	#1,y1
.loop2	load	(xptr),x2
	subq	#1,line_counter
	addqt	#4,xptr
	jump	z,(RETURN)
	cmp	leave_it,x2	; still original min/max?
	addqt	#1,y1
	jump	z,(LOOP2)

.loop3
	move	x2,x1
	shlq	#16,x2
	jump	n,(CONT1)
	sharq	#16,x1
	jr	nn,._0
	cmp	leave_it,x2
	moveq	#0,x1
._0	jr	n,._1
	shrq	#16,x2
	movei	#max_x,x2
._1
* Blitter
	sub	x1,x2
	jump	n,(CONT1)
	shlq	#16,x1
	addq	#1,x2
	or	y1,x1
	bset	#16,x2
	rorq	#16,x1
	WAITBLITTER
	store	x1,(pel_ptr)
	store	x2,(blitter+4)
	store	bstart,(blitter)

.cont1	subq	#1,line_counter
	load	(xptr),x2
	jump	z,(RETURN)
	cmp	leave_it,x2
	addqt	#4,xptr
	jump	nz,(LOOP)
	addq	#1,y1

.goon1	jump	(RETURN)
	nop

	unreg pel_ptr,bstart,xptr,line_counter,bpattern
	unreg x1,x2,y1,blitter,leave_it,bcounter
	unreg LOOP,LOOP2,CONT1
****************
* Sine-table   *
	ALIGN 4
SinTab::
DC.L 0,804,1608,2410,3212,4011,4808,5602
DC.L 6393,7179,7962,8739,9512,10278,11039,11793
DC.L 12539,13279,14010,14732,15446,16151,16846,17530
DC.L 18204,18868,19519,20159,20787,21403,22005,22594
DC.L 23170,23731,24279,24811,25329,25832,26319,26790
DC.L 27245,27683,28105,28510,28898,29268,29621,29956
DC.L 30273,30571,30852,31113,31356,31580,31785,31971
DC.L 32137,32285,32412,32521,32609,32678,32728,32757
DC.L 32767,32757,32728,32678,32609,32521,32412,32285
DC.L 32137,31971,31785,31580,31356,31113,30852,30571
DC.L 30273,29956,29621,29268,28898,28510,28105,27683
DC.L 27245,26790,26319,25832,25329,24811,24279,23731
DC.L 23170,22594,22005,21403,20787,20159,19519,18868
DC.L 18204,17530,16846,16151,15446,14732,14010,13279
DC.L 12539,11793,11039,10278,9512,8739,7962,7179
DC.L 6393,5602,4808,4011,3212,2410,1608,804
DC.L 0,-804,-1608,-2410,-3212,-4011,-4808,-5602
DC.L -6393,-7179,-7962,-8739,-9512,-10278,-11039,-11793
DC.L -12539,-13279,-14010,-14732,-15446,-16151,-16846,-17530
DC.L -18204,-18868,-19519,-20159,-20787,-21403,-22005,-22594
DC.L -23170,-23731,-24279,-24811,-25329,-25832,-26319,-26790
DC.L -27245,-27683,-28105,-28510,-28898,-29268,-29621,-29956
DC.L -30273,-30571,-30852,-31113,-31356,-31580,-31785,-31971
DC.L -32137,-32285,-32412,-32521,-32609,-32678,-32728,-32757
DC.L -32767,-32757,-32728,-32678,-32609,-32521,-32412,-32285
DC.L -32137,-31971,-31785,-31580,-31356,-31113,-30852,-30571
DC.L -30273,-29956,-29621,-29268,-28898,-28510,-28105,-27683
DC.L -27245,-26790,-26319,-25832,-25329,-24811,-24279,-23731
DC.L -23170,-22594,-22005,-21403,-20787,-20159,-19519,-18868
DC.L -18204,-17530,-16846,-16151,-15446,-14732,-14010,-13279
DC.L -12539,-11793,-11039,-10278,-9512,-8739,-7962,-7179
DC.L -6393,-5602,-4808,-4011,-3212,-2410,-1608,-804
****************
	align 4
rot_mat	equ *
_x_save	equ rot_mat+9*4
ende:	equ _x_save+max_y*4
echo "ENDE : %Hende"

end
