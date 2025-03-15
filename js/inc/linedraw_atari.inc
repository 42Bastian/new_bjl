;;; -*-asm-*-
;;;
;;; Draw a single pixel line (based on SDK code)
;;;
;;; currScreen.a should point to the current screen
;;;
;;;  16.16 divide must be enabled!
;;; ----------------------------------------
;;; draw
;;;
;;; r4 - y0
;;; r3 - x0
;;; r2 - color
;;; r1 - y1
;;; r0 - x1
draw::

SPEED_OPT	EQU 0

tmp	reg 8
cnt	reg 7
finc	reg 6
inc	reg 5
;;; -- parameter
y0	reg 4
x0	reg 3
color	reg 2!
y1	reg 1!
x1	reg 0!

	shlq	#16,x0
	shlq	#16,y0
	shlq	#16,x1
	shlq	#16,y1

	sub	y0,y1
	sub	x0,x1
	move	x1,tmp
	move	y1,cnt
	abs	tmp
	abs	cnt
	add	tmp,cnt

	abs	y1
	jr	cc,.posy
	div	cnt,y1
 IF SPEED_OPT = 1
	shrq	#16,x0
	or	x0,y0
	jr	.ycont
 ELSE
	or	y1,y1
 ENDIF
	neg	y1
.posy
	shrq	#16,x0
	or	x0,y0
.ycont
	move	y1,inc
	abs	x1

	jr	cc,.posx
	div	cnt,x1
 IF SPEED_OPT = 1
	move	y1,finc
	shrq	#16,inc
	shlq	#16,finc
	shlq	#16,inc
	jr	.xcont
 ELSE
	or	x1,x1
 ENDIF
	neg	x1
.posx
	move	y1,finc
	shrq	#16,inc
	shlq	#16,finc
	shlq	#16,inc
.xcont
	move	x1,tmp
	shlq	#16,x1
	shrq	#16,tmp
	shrq	#16,x1
	or	tmp,inc
	or	x1,finc

	shrq	#16,cnt
	moveq	#0,x1
	bset	#16,cnt

	WAITBLITTER

	store	color,(blitter+_BLIT_PATD)

	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDINC,tmp0
	movefa	currScreen.a,color
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	color,(blitter)	;_BLIT_A1_BASE

	store	y0,(blitter+_BLIT_A1_PIXEL)
	store	x1,(blitter+_BLIT_A1_FPIXEL)
	store	inc,(blitter+_BLIT_A1_INC)
	store	finc,(blitter+_BLIT_A1_FINC)
	store	cnt,(blitter+_BLIT_COUNT)

	bset	#16,x1	; B_PATDSEL
	jump	(LR)
	store	x1,(blitter+_BLIT_CMD)

	UNREG	tmp,cnt,inc,finc
	UNREG	x0,y0,x1,y1,color

draw_e::
draw_size	equ draw_e-draw
	echo "DRAW: %ddraw_size"
