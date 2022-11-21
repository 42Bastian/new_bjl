;;; -*-asm-*-
;;;
;;; Draw a single pixel line.
;;;
;;; currScreen.a should point to the current screen

;;; ----------------------------------------
;;; draw
;;;
;;; r2 - color
;;; r3 - x0
;;; r4 - y0
;;; r5 - x1
;;; r6 - y1

draw::

dx	reg 13
dy	reg 12
m	reg 11
cnt	reg 10
dir_x	reg 9
step_y	reg 8
a1inc	reg 7
;;; -- parameter
y1	reg 6
x1	reg 5
y0	reg 4
x0	reg 3
color	reg 2!

	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDINC,tmp0
	movefa	currScreen.a,tmp1
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	tmp1,(blitter)	;_BLIT_A1_BASE

	movei	#.noslope,tmp0
	moveq	#0,dir_x
	moveq	#1,step_y
	move	y1,dy
	moveq	#1,a1inc

	move	x1,dx
	sub	y0,dy
	moveq	#0,m
	jr	ne,.no_hori
	sub	x0,dx

	jump	pl,(tmp0)	; y-inc = 0, x-inc = 1
	move	dx,cnt

	subq	#2,a1inc
	jump	(tmp0)
	shrq	#16,a1inc	; y-inc = 0, x-inc = -1

.no_hori
	jr	ne,.no_vert
	moveq	#1,tmp1

	shlq	#16,a1inc	; y-inc = 1, x-inc = 0
	jump	(tmp0)
	move	dy,cnt

.no_vert
	moveq	#1,dir_x
	jr	pl,.noswap0
	abs	dx

	move	x1,x0
	move	y1,y0
	neg	step_y
.noswap0
	addqt	#1,dy
	abs	dy
	jr	cc,.pos
	addqt	#1,dx
	neg	step_y
.pos
	cmp	dy,dx
	move	dx,cnt
	jr	ne,.sw
	move	dy,m

	;; dx == dy
	moveq	#0,m
	move	step_y,a1inc
	moveq	#0,dir_x
	shlq	#16,a1inc
	jr	.noslope
	addqt	#1,a1inc
.sw
	jr	cc,.no_swap
	shlq	#16,m

	shlq	#16,dx
	move	dy,cnt
	move	dx,m
	subq	#2,dir_x
.no_swap
	div	cnt,m
.noslope
	move	y0,tmp1
	abs	cnt
	shlq	#16,tmp1
	or	x0,tmp1

	WAITBLITTER

	store	tmp2,(blitter+_BLIT_PATD)
	store	tmp2,(blitter+_BLIT_PATD+4) ;VJ
	moveq	#0,tmp2

	cmpq	#0,dir_x
	store	tmp1,(blitter+_BLIT_A1_PIXEL)
	jr	eq,.cont
	store	tmp2,(blitter+_BLIT_A1_FPIXEL)
	jr	mi,.xstep
	nop

	imult	step_y,m
	shlq	#16,step_y
	moveq	#1,a1inc
	jr	pl,.cont
	shlq	#16,m

	jr	.cont
	or	step_y,a1inc
.xstep
	shlq	#16,step_y
	move	step_y,a1inc
.cont
	bset	#16,cnt

	store	a1inc,(blitter+_BLIT_A1_INC)
	store	m,(blitter+_BLIT_A1_FINC)
	movei	#B_PATDSEL|B_CLIP_A1*0|B_UPDA1|B_UPDA1F,tmp1
	store	cnt,(blitter+_BLIT_COUNT)
	store	tmp1,(blitter+_BLIT_CMD)
//->	WAITBLITTER

	jump	(LR)
	nop

	UNREG	dx,dy,m,cnt,dir_x,step_y,a1inc
