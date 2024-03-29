;; -*-asm-*-
;;*****************
;; Object List building
;; (c) 1994 Bastian Schick
;;****************

;;; ----------------------------------------
;;; MakeOBL()
;;; A0 - background list
;;; A1 - active list
;;; A2 - object description
;;; ----------------------------------------
MakeOBL:
	movem.l d0-a4,-(sp)

	move.l	#$FF000000,d4
	move.l	a1,a4		; save start of list
	lea	-32(a1),a1	; prepapre for add
	moveq	#0,d7		; object counter
loop_mo:
	lea	32(a1),a1
loop_mo1:
	lea	(a2),a3		; save ptr to next object
	movem.w (a2)+,d1/d5	; type
	tst.w	d1
	bpl.s	ok_mo
	cmp.w	#OBJ_EOF,d1
	beq	exit_mo
	lea	-4(a2,d5.w),a2
	bra.s	loop_mo1

ok_mo:
	addq.w  #1,d7
	and.w	#7,d1
	ext.l	d1
	move.w	d1,d0
	subq.w	#2,d0
	bmi	bm_sc_mo
	beq	gpu_mo		; 2=GPU-Object
	subq.w	#2,d0
	bmi.s	branch_mo	; 3=Branch Object
* Stop-Objekt erzeugen
	moveq	#1,d0
	and.w	(a2)+,d0
	lsl.w	#3,d0
	or.w	d0,d1		; Interrupt Flag
	movem.l (a2)+,d0/d2

	lsl.l	#4,d2
	or.l	d2,d1
	move.l	d0,(a0)+
	move.l	d1,(a0)+
	lea	24(a0),a0
	bra.s	loop_mo
* branch_object
branch_mo:
	move.w  #$07FF,d0
	and.w	(a2)+,d0
	lsl.w	#3,d0
	or.w	d0,d1		; Ypos
	moveq	#7,d0
	and.w	(a2)+,d0
	swap	d0
	lsr.l	#2,d0
	or.l	d0,d1		; CC

	move.l	a1,d3		; save current position
	move.w	(a2)+,d0	; next object if CC true
	bpl.s	ok_bra_mo	; pos => rel. link
	neg.w	d0
	move.l	a4,d3		; else absolute
ok_bra_mo:
	asl.w	#5,d0
	ext.l	d0
	add.l	d3,d0
	lsr.l	#3,d0
	ror.l	#8,d0
	move.l	d0,d3
	and.l	d4,d0
	or.l	d0,d1		; Link (24..31)
	move.l	d3,d0
	and.l	#$FFFFFF,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+

	move.w	#($07FF<<3)|3,d1; Branch Always
	ext.l	d1
	move.w	(a2)+,d0	; next object
	asl.w	#5,d0
	ext.l	d0
	add.l	a1,d0
	lsr.l	#3,d0
	ror.l	#8,d0
	move.l	d0,d3
	and.l	d4,d0
	or.l	d0,d1		; Link (24..31)
	move.l	d3,d0
	and.l	#$FFFFFF,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+
	lea	16(a0),a0
	bra	loop_mo
* GPU Object
gpu_mo:
	move.w  #$03FF,d0
	and.w	(a2)+,d0
	lsl.w	#3,d0
	or.w	d0,d1
	movem.l (a2)+,d0/d2
	swap	d2
	lsr.w	#3,d2
	and.w	#$E000,d2
	or.l	d2,d1
	move.l	d0,(a0)+
	move.l	d1,(a0)+

	move.w	#($07FF<<3)|3,d1 ; Branch Always
	ext.l	d1
	move.w	(a2)+,d0	; next object
	lsl.w	#5,d0
	ext.l	d0
	add.l	a1,d0
	lsr.l	#3,d0
	ror.l	#8,d0
	move.l	d0,d3
	and.l	d4,d0
	or.l	d0,d1		; Link (24..31)
	move.l	d3,d0
	and.l	#$FFFFFF,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+
	lea	16(a0),a0
	bra	loop_mo

* BitMap oder Scaled BitMap
bm_sc_mo:
	moveq	#$F8,d0
	and.l	(a2)+,d0	; Data-Address (3..23)
	bpl.s	ok_bm_sc_mo
	add.l	a6,d0
	add.l	vars,d0
ok_bm_sc_mo:
	lsl.l	#8,d0		; move to 63..43

	move.l	#$0fff,d6
	and.w	(a2)+,d6	; X (in 2. Phrase 0..11)

	move.w	(a2)+,d3
	and.w	#$07FF,d3
	lsl.w	#3,d3
	or.w	d3,d1		; Y-Pos (3..13)

	move.l	#$03ff,d3
	and.w	(a2)+,d3
	swap	d3
	lsr.l	#2,d3
	or.l	d3,d1		; height (14..23)

	move.w	(a2)+,d3	; next object
	lsl.w	#5,d3
	ext.l	d3
	add.l	a1,d3
	lsr.l	#3,d3
	ror.l	#8,d3
	move.l	d3,d2		; save Link
	and.l	d4,d3
	or.l	d3,d1		; Link (24..31)

	move.l	d2,d3
	and.l	#$FFFFFF,d3
	or.l	d3,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+

	moveq	#7,d0
	and.b	(a2)+,d0
	ror.w	#4,d0
	or.w	d0,d6		; Depth (12..14)

	moveq	#7,d0
	and.b	(a2)+,d0
	swap	d0
	lsr.l	#1,d0
	or.l	d0,d6		; Pitch (15..17)

	moveq	#0,d0
	move.w	(a2)+,d0
	and.w	#$03FF,d0
	lsl.w	#2,d0
	swap	d0
	or.l	d0,d6		; Dwidth (18..27)

	moveq	#0,d0
	move.w	(a2)+,d0
	and.w	#$03FF,d0
	ror.l	#4,d0
	move.l	d0,d1
	clr.w	d0
	or.l	d0,d6		; IWidth (28..31)
	ext.l	d1		; and (32..37)

	move.w	#$FE,d0
	and.b	(a2)+,d0
	lsr.b	#1,d0

	lsl.w	#6,d0
	or.w	d0,d1		; Index (38..44)

	moveq	#$0F,d0
	and.b	(a2)+,d0
	swap	d0
	lsr.l	#3,d0
	or.l	d0,d1		; Flags (45..48)

	moveq	#$3F,d0
	and.w	(a2)+,d0

	add.w	d0,d0
	swap	d0
	or.l	d0,d1
	move.l	d1,(a0)+
	move.l	d6,(a0)+

	lea	16(a0),a0
	cmp.w	#obj_sc_len,d5	; Sized Object
	bne	loop_mo
	move.l	(a2)+,-12(a0)
	bra	loop_mo

exit_mo:
	clr.l	(a0)+
	moveq	#4,d0
	move.l	d0,(a0)+
	addq.w	#1,d7
	move.w	d7,count_obj(a6)
	movem.l (sp)+,d0-a4
	rts
