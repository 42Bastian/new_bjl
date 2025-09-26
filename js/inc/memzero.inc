;;; -*-asm-*-
;;; memzero
;;; r0 - destination
;;; r1 - size
	align	4
memzero::
	PUSHLR	r14
	movei	#BLIT_A1_BASE,r14

	move	pc,LR
	addq	#4,LR

	move	r1,r2
.mz0:
	shrq	#17,r2
	move	r1,r3
	jr	eq,.mz1
	store	r0,(r14)
	moveq	#1,r3
	shlq	#17,r3
.mz1:
	sub	r3,r1
	add	r3,r0
	shrq	#2,r3
	bset	#16,r3
	store	r3,(r14+_BLIT_COUNT)
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r3
	store	r3,(r14+_BLIT_A1_FLAGS)
	moveq	#0,r3
	store	r3,(r14+_BLIT_A1_PIXEL)
	store	r3,(r14+_BLIT_CMD)
.mz2:	load	(r14+_BLIT_CMD),r3
	shrq	#1,r3
	jr	cc,.mz2
	cmpq	#0,r1
	jump	ne,(LR)
	move	r1,r2
	nop
	POPLR	r14
