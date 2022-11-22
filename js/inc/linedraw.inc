;;; -*-asm-*-
;;;
;;; Draw a single pixel line.
;;;
;;; currScreen.a should point to the current screen

;;; ----------------------------------------
;;; draw
;;;
;;; r4 - y0
;;; r3 - x0
;;; r2 - color
;;; r1 - y1
;;; r0 - x1
draw::

dx	reg 10
dy	reg 9
m	reg 8
cnt	reg 7
dir_x	reg 6
step_y	reg 5
a1inc	reg 4
;;; -- parameter
y0	reg 4!
x0	reg 3
color	reg 2!
y1	reg 1!
x1	reg 0!

	move	y1,dy
	move	x1,dx
	sub	y0,dy
	sub	x0,dx
	moveq	#1,dir_x
	jr	pl,.noswap0
	moveq	#1,step_y

	move	x1,x0
	move	y1,y0
	neg	step_y
.noswap0
	abs	dy
	jr	cc,.pos
	abs	dx
	neg	step_y
.pos
	cmp	dy,dx
	move	dx,cnt
	jr	ne,.not_diag
	move	dy,m

	;; dx == dy
	moveq	#0,m
	moveq	#0,dir_x
	shlq	#16,step_y
	jr	.diagonal
	addqt	#1,step_y	; => becomes A1_INC
.not_diag
	jr	cc,.no_swap
	shlq	#16,m

	shlq	#16,dx
	move	dy,cnt
	move	dx,m
	subq	#2,dir_x	; swap x_inc 1 => y_inc 1
.no_swap
	div	cnt,m
.diagonal
	shlq	#16,y0
	movei	#$80008000,tmp1	; start in the middle of the 1st pixel
	or	x0,y0

	WAITBLITTER

	store	color,(blitter+_BLIT_PATD)
	store	color,(blitter+_BLIT_PATD+4) ;VJ

	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDINC,tmp0
	movefa	currScreen.a,color
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	color,(blitter)	;_BLIT_A1_BASE

	cmpq	#0,dir_x
	store	y0,(blitter+_BLIT_A1_PIXEL)
	jr	eq,.cont_dia
	store	tmp1,(blitter+_BLIT_A1_FPIXEL)
	jr	mi,.xstep
	moveq	#1,a1inc
	imult	step_y,m	; set sign
	shlq	#16,step_y	; test sign
	jr	pl,.cont
	shlq	#16,m

	jr	.cont
	or	step_y,a1inc
.xstep
	shlq	#16,step_y
.cont_dia
	move	step_y,a1inc
.cont
	bset	#16,cnt
	store	a1inc,(blitter+_BLIT_A1_INC)
	addq	#1,cnt
	store	m,(blitter+_BLIT_A1_FINC)
	moveq	#0,tmp1
	store	cnt,(blitter+_BLIT_COUNT)
	bset	#16,tmp1	; B_PATDSEL
	jump	(LR)
	store	tmp1,(blitter+_BLIT_CMD)

	UNREG	dx,dy,m,cnt,dir_x,step_y,a1inc
	UNREG	x0,y0,x1,y1,color

draw_e::
draw_size	equ draw_e-draw
	echo "DRAW: %ddraw_size"
