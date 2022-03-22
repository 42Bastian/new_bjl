;;; -*-asm-*-

	dsp

genau		equ 13
delta0		EQU 80
r_min0		EQU 9116
i_max0		EQU 12992

__PC		reg 27
max_xy		reg 26
screen_ptr	reg 24
delta		reg 21
screen		reg 20

XLOOP		reg 18
YLOOP		reg 17
ITER_LOOP	reg 16
ITER_END	reg 15
r_max		reg 13
ModuloMaske	reg 12
iter_count	reg 11
color		reg 10
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

	run	$f03000		; to make lyxas happy, code is PC relative

	moveq	#224/16,max_xy
	shlq	#4,max_xy

	moveq	#delta0/4,delta
	shlq	#2,delta

	moveq	#screen>>16,screen_ptr
	shlq	#16,screen_ptr

	moveq	#31,r_max
	shlq	#7,r_max

	move	delta,_i0
	mult	max_xy,_i0
	shrq	#1,_i0

	moveq	#yloop - _pc, YLOOP
	moveq	#xloop - yloop,XLOOP
	moveq	#iter_loop - xloop,ITER_LOOP
	moveq	#(iter_end-iter_loop)/2,ITER_END
	shlq	#1,ITER_END

_pc:	move	pc,__PC
	add	__PC,YLOOP
	add	YLOOP,XLOOP
	add	XLOOP,ITER_LOOP
	add	ITER_LOOP,ITER_END
	btst	#16,__PC		; check if running on DSP or GPU
	jr	z,yloop
	move	max_xy,y_count
	addqt	#1,screen_ptr
	sub	delta,r_max
yloop:
	move	max_xy,x_count
	move	r_max,_r0
xloop:
	move	max_xy,iter_count
	moveq	#0,color
	move	_r0,_r
	move	_r0,_r1
	move	_i0,_i
	move	_i0,_i1
iter_loop
	imult	_r1,_r1			; r^2
	imult	_i1,_i1			; i^2

	move	_r1,temp1
	move	_r1,temp2
	add	_i1,temp1		; r^2+i^2
	sub	_i1,temp2		; r^2-i^2
	shrq	#2*genau+2,temp1
	addqt	#4,color
	jump	nz,(ITER_END)

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

	moveq	#0,color
iter_end:
	sub	delta,_r0
	sub	delta,_r0
	subq	#2,x_count
	storeb	color,(screen_ptr)
	jump	nz,(XLOOP)
	addqt	#2,screen_ptr

	subq	#1,y_count
	jump	nz,(YLOOP)
	sub	delta,_i0
end:
	jr	end
//->	nop			; GPU/DSP may crash at end, but not 2 bytes left
