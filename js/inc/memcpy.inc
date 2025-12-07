;;; -*-asm-*-
;;; memcpy(dst, src, size)
;;; r0 : dst
;;; r1 : src
;;; r2 : size in bytes


	align	4
memcpy::
	moveq	#3,r3
	PUSHLR	r14
	not	r3
	movei	#BLIT_A1_BASE,r14
	and	r3,r0
	and	r3,r1
	and	r3,r2
	move	pc,LR
	move	r2,r3
	addq	#8,LR
	shrq	#17,r3
.mc0:
	store	r1,(r14+_BLIT_A2_BASE)	; source
	move	r2,r3
	jr	eq,.mc1
	store	r0,(r14) 		; destination
	moveq	#1,r3
	shlq	#17,r3
.mc1:
	sub	r3,r2
	add	r3,r0
	add	r3,r1
	shrq	#2,r3
	bset	#16,r3
	store	r3,(r14+_BLIT_COUNT)
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,r3
	store	r3,(r14+_BLIT_A1_FLAGS)
	store	r3,(r14+_BLIT_A2_FLAGS)
	moveq	#0,r3
	store	r3,(r14+_BLIT_A1_PIXEL)
	store	r3,(r14+_BLIT_A2_PIXEL)
	movei	#BLIT_SRCEN|BLIT_LFU_REPLACE,r3
	store	r3,(r14+_BLIT_CMD)

.mc2:	load	(r14+_BLIT_CMD),r3
	shrq	#1,r3
	jr	cc,.mc2
	nop
	cmpq	#0,r2
	move	r2,r3
	jump	ne,(LR)
	shrq	#17,r3

 if memcpy < $f03000
	nop
 endif
	POPLR	r14
