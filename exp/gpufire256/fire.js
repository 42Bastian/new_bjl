;;; -*-asm-*-

	gpu

screen		equ $100000

	run	$802008

	moveq	#$10,r20
	shlq	#16,r20		; r20 = $100000
	movei	#160*120,r23
	moveq	#10,r24
	shlq	#4,r24		; r24 = 160
	move	r20,r21
	add	r24,r21		; r21 = $1000a0
	move	r21,r22
	addqt	#1,r22		; r22 = $1000a1
	moveq	#$f,r14
	shlq	#20,r14		; r14 = $f00000
	movei	#loop,r29
loop:
	move	r23,r0		; r0 = 160*120
	move	r20,r1		; r1 = x,y
	move	r21,r2		; r2 = x,y+1
	move	r22,r3		; r3 = x+1,y+1
x:
	loadb	(r3),r4		; x+1,y+1
	addqt	#1,r3
	loadb	(r2),r5		; x,y+1
	addqt	#1,r2
	add	r5,r4
	add	r5,r4
	loadb	(r1),r6
	xor	r5,r4
	add	r6,r4
	xor	r6,r4
	shlq	#24,r4
	shrq	#26,r4
	subq	#1,r0
	storeb	r4,(r1)
	nop
	jr	nz,x
	addqt	#1,r1

	move	r24,r0
fill:
	load	(r14+4),r2
	xor	r2,r4
	add	r2,r4
	storeb	r4,(r1)
	subq	#1,r0
	jr	nz,fill
	addqt	#1,r1

	jump	(r29)
	nop
