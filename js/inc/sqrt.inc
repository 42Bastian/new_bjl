;-*-asm-*-

;;; Treating input as unsigned number!
;;; R0 - input/output
;;; LR - return
;;; r1..r3 temporary registers

sqrt::
	normi	r0,r1
	move	r0,r2
	addq	#23,r1
	moveq	#0,r0
	bclr	#0,r1
	moveq	#1,r3
	neg	r1
	jr	.enter
	sh	r1,r3
.loop
	shrq	#2,r3
.enter
	move	r0,r1
	jump	eq,(LR)
	add	r3,r1
	cmp	r1,r2
	jr	cs,.loop
	shrq	#1,r0
	sub	r1,r2
	jr	.loop
	add	r3,r0
