;;; -*-asm-*-
;;; memcpy with blitter
;;; A0 : src
;;; A1 : dst
;;; d0 : size in bytes

memcpy:
	move.l	a2,-(sp)
	lea	A1_BASE,a2
mc0:
	move.l	d0,d1
	cmp.l	#$20000,d0
	blo.s	mc1
	move.l	#$20000,d1
mc1:
	sub.l	d1,d0
	move.l	a1,(a2)
	adda.l	d1,a1
	move.l	a0,_BLIT_A2_BASE(a2)
	adda.l	d1,a0
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,_BLIT_A1_FLAGS(a2)
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,_BLIT_A2_FLAGS(a2)
	lsr.l	#2,d1
	bset	#16,d1
	move.l	d1,_BLIT_COUNT(a2)
	moveq	#0,d1
	move.l	d1,_BLIT_A1_PIXEL(a2)
	move.l	d1,_BLIT_A2_PIXEL(a2)

	move.l	#BLIT_SRCEN|BLIT_LFU_REPLACE,d1
	move.l	d1,_BLIT_CMD(a2)
mc_wbl1:
	move.l	_BLIT_CMD(a2),d1
	btst	#0,d1
	beq.s	mc_wbl1
	tst.l	d0
	bne.s	mc0
	move.l	(sp)+,a2
	rts
