;-*-asm-*-
sqrt::
	cmpq	#0,r0
	move	r0,r2
	jr	pl_nz,.ok
	normi	r0,r1
	jump	(LR)
.ok:	moveq	#0,r0

	;; short
	subq	#4,r1
	moveq	#16,r3
	bclr	#0,r1
	ror	r1,r3

	;; quick
//->	movei	#$80,r3
//->	bset	#0,r1
//->	ror	r1,r3
.loop
	jump	eq,(LR)
	move	r0,r1		; temp
	add	r3,r1
	shrq	#1,r0
	cmp	r1,r2
	jr	mi,.1
	nop
	sub	r1,r2
	add	r3,r0
.1	jr	.loop
	shrq	#2,r3
