;;; -*-asm-*-

	gpu

_TOP	reg	10
_BTM	reg	11

TOP	reg	20
BTM	reg	21
SIZE	reg	22
WIDTH	reg	23
HBL	reg	24

INNER	reg	28
OUTER	reg	29

screen	equ $100000

	run	$f03000

	moveq	#$10,TOP
	shlq	#16,TOP		; TOP = $100000
	movei	#160*121/4,SIZE
	moveq	#10,WIDTH
	shlq	#4,WIDTH	; WIDTH = 224
	move	TOP,BTM
	add	WIDTH,BTM	; BTM = $1000a0
	movei	#$f00004,HBL
__pc	move	pc,INNER
	addq	#innerLoop-__pc,INNER
	move	SIZE,r0		; r0 = 160*120
	move	pc,OUTER
outerLoop:
	move	TOP,_TOP	; r1 = x,y
	move	BTM,_BTM	; r2 = x,y+1

innerLoop:
	moveq	#4,r2
	load	(_BTM),r3	; y+1,x,x+1,x+2,x+3
	addq	#4,_BTM
	load	(_TOP),r4
wordLoop:
	add	r3,r1		; x
	add	r3,r1		; x
	xor	r3,r1
	add	r4,r1
	xor	r4,r1
	shrq	#26,r1
	shlq	#8,r5
	shlq	#8,r4
	or	r1,r5
	subq	#1,r2
	move	r3,r1
	jr	nz,wordLoop
	shlq	#8,r3

	subq	#1,r0
	store	r5,(_TOP)
	jump	nz,(INNER)
	addqt	#4,_TOP

	move	WIDTH,r0
fill:
	loadw	(HBL),r2
	xor	r2,r5
	add	r2,r5
	storeb	r5,(_TOP)
	subq	#1,r0
	jr	nz,fill
	addqt	#1,_TOP

	jump	(OUTER)
	move	SIZE,r0		; r0 = 160*120
