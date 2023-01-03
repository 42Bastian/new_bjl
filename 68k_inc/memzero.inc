;;; -*-asm-*-
;;; memzero
;;; a0 - destination
;;; d0 - size
memzero:
	move.l	(sp)+,a2	; get return address (zeroing stack!)
mz0:
	move.l	d0,d1
	cmp.l	#$20000,d0
	blo.s	mz1
	move.l	#$20000,d1
mz1:
	sub.l	d1,d0
	lea	A1_BASE,a1
	move.l	a0,(a1)
	adda.l	d1,a0
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,_BLIT_A1_FLAGS(a1)
	lsr.l	#2,d1
	bset	#16,d1
	move.l	d1,_BLIT_COUNT(a1)
	moveq	#0,d1
	move.l	d1,_BLIT_A1_PIXEL(a1)
	move.l	d1,_BLIT_CMD(a1)
wbl1:
	move.l	_BLIT_CMD(a1),d1
	btst	#0,d1
	beq.s	wbl1
	tst.l	d0
	bne.s	mz0
	jmp	(a2)
