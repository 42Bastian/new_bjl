;;; -*-asm-*-

	gpu

genau		equ 13
delta0		EQU 116
r_min0		EQU -16967
i_max0		EQU 12992


max_xy		reg 26
max_iter	reg 25
screen_ptr	reg 24
;;->i_max		reg 23
;;->r_min		reg 22
delta		reg 21
screen		reg 20
AGAIN		reg 19
XLOOP		reg 18
YLOOP		reg 17
ITER_LOOP	reg 16
ITER_END	reg 15
ColorTab	reg 14
cancel		reg 13
ModuloMaske	reg 12
iter_count	reg 11
ColorPtr	reg 10
temp1		reg  9
temp2		reg  8
x_count		reg  7
y_count		reg  6
_r1		reg  5
_i1		reg  4
_i0		reg  3
_r0		reg  2
_i		reg  1
_r		reg  0


screen	equ $100000

	run	$f03000

	moveq	#224/16,max_xy
	shlq	#4,max_xy

	moveq	#delta0/4,delta
	shlq	#2,delta

	moveq	#4,cancel
	shlq	#genau*2,cancel

	moveq	#31,max_iter
	shlq	#3,max_iter

	movei	#iter_end,ITER_END
	moveq	#iter_loop - xloop,ITER_LOOP
	moveq	#xloop - yloop,XLOOP
	moveq	#yloop - again,YLOOP
_pc:	move	pc,AGAIN
	addq	#again - _pc, AGAIN
	add	AGAIN,YLOOP
	add	YLOOP,XLOOP
	add	XLOOP,ITER_LOOP
again:
	moveq	#screen>>16,screen_ptr
	shlq	#16,screen_ptr
	move	delta,_i0
	mult	max_xy,_i0
	shrq	#1,_i0

	move	max_xy,y_count
yloop:
	move	max_xy,x_count
	movei	#r_min0,_r0
xloop:
	move	max_iter,iter_count

	moveq	#0,ColorPtr
	move	_r0,_r
	move	_i0,_i
	move	_r,_r1
	move	_i,_i1
iter_loop
	imult	_r1,_r1			; r^2
	imult	_i1,_i1			; i^2

	move	_r1,temp1
	move	_r1,temp2
	add	_i1,temp1		; r^2+i^2
	sub	_i1,temp2		; r^2-i^2
	cmp	cancel,temp1
	addqt	#4,ColorPtr
	jump	nn,(ITER_END)

	imult	_r,_i
	sharq	#genau,temp2		; normalize
	sharq	#genau-1,_i

	add	_r0,temp2		; temp2 = r^2-i^2+r0
	add	_i0,_i			; i = 2*i*r+i0

	move	temp2,_r
	subq	#1,iter_count
	move	_i,_i1
	jump	nz,(ITER_LOOP)
	move	temp2,_r1

	moveq	#0,ColorPtr
iter_end:

	add	delta,_r0
	subq	#1,x_count
	storeb	ColorPtr,(screen_ptr)
	jump	nz,(XLOOP)
	addq	#1,screen_ptr

	subq	#1,y_count
	jump	nz,(YLOOP)
	sub	delta,_i0

	subq	#4,delta
	cmpq	#12,delta
	jump	pl,(AGAIN)
	addq	#8,max_iter
	jump	(AGAIN)
	addq	#4,delta
