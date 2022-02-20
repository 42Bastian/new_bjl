;; -*-asm-*-
;; Mandelbrot
;; 224*224*8 Bit and 100 iterations : <1 s
;;
;; (c) 1994 Bastian Schick
;;

	gpu

screen		equ $100000

pu_contrl	equ $f02114
start		equ $f03010

genau		equ 13

;;****************************
;; Regs

i_min		reg 0
r_min		reg 1

delta		reg 3
_i0		reg 4
y_count		reg 5
_r0		reg 6
x_count		reg 7

iter_count	reg 10
_r		reg 11
_i		reg 12
_r1		reg 13
_i1		reg 14
h1		reg 15

ColorIndex	reg 17
_2max_xy	reg 18

max_xy		reg 20		; window-size
LOOP_X		reg 24
LOOP_Y		reg 25
ITER_LOOP	reg 26
ITER_EXIT	reg 27

screen_ptr	reg 29
ITER_ENDE	reg 30

;; Alternative
MaxIter.a	reg 30
max_xy.a	reg 29
;;*********************

	run start

	movei	#iter_ende,ITER_ENDE
	movei	#screen,screen_ptr
	movei	#iter_loop,ITER_LOOP
	movei	#iter_exit,ITER_EXIT
	movei	#loop_y,LOOP_Y
	movei	#loop_x,LOOP_X
	movei	#224,max_xy

	movei	#start-16,r14
	load	(r14),delta
	load	(r14+4),r_min
	load	(r14+8),i_min
	load	(r14+12),r10
	moveta	r10,MaxIter.a

;;********************************

	move	i_min,_i0		; i0=i_min
	move	max_xy,y_count		; ycount = 224
	move	r_min,_r0		; r0=r_min

loop_y
	move	max_xy,x_count		; xcount = 224
	add	max_xy,screen_ptr
	sub	delta,_i0
	movefa	MaxIter.a,iter_count	; max_iter

loop_x
	moveq	#0,ColorIndex
	move	_r0,_r			; r=r0
	move	_i0,_i			; i=i0
	move	_r0,_r1
	move	_i0,_i1

	imult	_r1,_r1			; r^2

iter_loop
	REPT 3
	imult	_i1,_i1			; i^2

	move	_r1,h1
	sub	_i1,_r1			; r1= r^2-i^2
	add	_i1,h1			; h1= r^2+i^2
	sharq	#genau,_r1		; normalize r1

	shrq	#26+2,h1		; > 4 ?
	addqt	#1,ColorIndex
	jump	nz,(ITER_ENDE)

	imult	_r,_i
	add	_r0,_r1			; r1=r^2-i^2+r0
	sharq	#genau-1,_i
	move	_r1,_r
	add	_i0,_i			; i=2*i*r+i0

	subq	#1,iter_count
	move	_i,_i1
	jump	z,(ITER_EXIT)
	imult	_r1,_r1
	ENDR

	imult	_i1,_i1			; i^2

	move	_r1,h1
	sub	_i1,_r1			; r1= r^2-i^2
	add	_i1,h1			; h1= r^2+i^2
	sharq	#genau,_r1		; normalize r1

	shrq	#26+2,h1		; > 4 ?
	addqt	#1,ColorIndex
	jump	nz,(ITER_ENDE)

	imult	_r,_i
	add	_r0,_r1			; r1=r^2-i^2+r0
	sharq	#genau-1,_i
	move	_r1,_r
	add	_i0,_i			; i=2*i*r+i0

	subq	#1,iter_count
	move	_i,_i1
	jump	nz,(ITER_LOOP)
	imult	_r1,_r1

iter_exit
	moveq	#0,ColorIndex

iter_ende
	add	delta,_r0
	storeb	ColorIndex,(screen_ptr)
	subq	#1,x_count		; xcount -=1
	addqt	#1,screen_ptr
	jump	nz,(LOOP_X)
	movefa	MaxIter.a,iter_count	; max_iter

	subq	#2,y_count
	move	r_min,_r0		; r0=r_min
	jump	nz,(LOOP_Y)
	sub	delta,_i0		; i0 += delta
;;***********************
	movei	#pu_contrl,r3
	moveq	#0,r0
wait
	store	r0,(r3)
	jr	wait
	nop
;;***********************
