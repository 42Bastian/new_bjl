*-*-asm-*-
* TextScreen (8x8 Font)
* created 24.9.95
* (c) Bastian Schick
*****************
* var-base is A6
* predefined constants: max_x_txt,max_y_txt,(max_x_txt>>3)
*	     variables: TextScreen.l,Cursor.l
*
* subroutines:
* PrintA0,PrintBIN16,PrintBIN,PrintDEZ,PrintDEZ2,PrintHEX,PrintHEXl,PrintDigit,PrintChar
* InitTxtScreen(d0.w = ColorIndex,d1.l = Color)
*****************
**********************
PrintA0::	  movem.l d0/a0,-(sp)
loop_pa:	  move.b  (a0)+,d0
		beq.s	exit_pa
		bsr	PrintChar
		bra.s	loop_pa
exit_pa:	  movem.l (sp)+,d0/a0
		rts
PrintBIN16:	  movem.l d0-d2,-(sp)
		moveq	#15,d1
		move.l	d0,d2
loop_pb16:	  moveq	  #0,d0
		add.w	d2,d2
		bcc.s	ok_pb16
		addq.w	#1,d0
ok_pb16:	  bsr	  PrintDigit
		dbra	d1,loop_pb16
		movem.l (sp)+,d0-d2
		rts
PrintBIN::	  movem.l d0-d2,-(sp)
		moveq	#31,d1
		move.l	d0,d2
loop_pb:	  moveq	  #0,d0
		add.l	d2,d2
		bcc.s	ok_pb
		addq.w	#1,d0
ok_pb:		  bsr	  PrintDigit
		dbra	d1,loop_pb
		movem.l (sp)+,d0-d2
		rts
PrintDEZ::	move.l  d0,-(sp)
		and.l	#$000FFFF,d0
		divu	#10000,d0
		bsr	PrintDigit
		swap	d0
		ext.l	d0
		divu	#1000,d0
		bsr	PrintDigit
		swap	d0
		ext.l	d0
		divu	#100,d0
		bsr	PrintDigit
		swap	d0
		ext.l	d0
		divu	#10,d0
		bsr	PrintDigit
		swap	d0
		ext.l	d0
		bsr	PrintDigit
		move.l	(sp)+,d0
		rts
PrintDEZ2::	  and.l	  #$0000FFFF,d0
		divu	#10,d0
		bsr.s	PrintDigit
		swap	d0
		ext.l	d0
		bra.s	PrintDigit

PrintHEXl::	  move.l  d0,-(sp)
		swap	d0
		bsr.s	PrintHEX
		move.l	(sp),d0
		bsr.s	PrintHEX
		moveq	#" ",d0
		bsr.s	PrintChar
		move.l	(sp)+,d0
		rts
PrintHEX::	  move.w  d0,-(sp)
		move.b	(sp),d0
		bsr.s	PrintHEX1
		move.w	(sp)+,d0
PrintHEX1:	  move.w  d0,-(sp)
		lsr.w	#4,d0
		and.w	#$000F,d0
		move.b	Ziffern(pc,d0.w),d0
		bsr.s	PrintChar
		moveq	#$0F,d0
		and.w	(sp),d0
		move.b	Ziffern(pc,d0.w),d0
		bsr.s	PrintChar
		move.w	(sp)+,d0
		rts
Ziffern:	  DC.B "0123456789ABCDEF"
InitTxtScreen::	  add.w d0,d0
		lea $f00400,a0
		move.l d1,0(a0,d0.w)
		move.l	TextScreen(a6),a0
		move.w	#(((max_x_txt>>3)*max_y_txt)>>2)-1,d0
		moveq	#0,d1
.loop:		  move.l  d1,(a0)+
		dbra	d0,.loop
		move.l d1,Cursor(a6)
		rts
PrintDigit::	  add.b	  #"0",d0
PrintChar::	  movem.l d0/a0-a1,-(sp)
		and.w	#$00FF,d0
		add.w	d0,d0
		add.w	d0,d0
		add.w	d0,d0
		lea	ASCII(pc),a0
		lea	8(a0,d0.w),a0
		move.l	TextScreen(a6),a1
		move.w	Cursor+2(a6),d0
		mulu	#max_x_txt,d0
		add.w	Cursor(a6),d0
		adda.w	d0,a1
		addq.w	#1,Cursor(a6)
		cmpi.w	#(max_x_txt>>3),Cursor(a6)
		bne.s	ok_pc
		clr.w	Cursor(a6)
		addq.w	#1,Cursor+2(a6)
		cmpi.w	#max_y_txt>>8,Cursor+2(a6)
		bne.s	ok_pc
		clr.w	Cursor+2(a6)
ok_pc::
		move.b  (a0)+,(a1)
		move.b	(a0)+,(max_x_txt>>3)(a1)
		move.b	(a0)+,2*(max_x_txt>>3)(a1)
		move.b	(a0)+,3*(max_x_txt>>3)(a1)
		move.b	(a0)+,4*(max_x_txt>>3)(a1)
		move.b	(a0)+,5*(max_x_txt>>3)(a1)
		move.b	(a0)+,6*(max_x_txt>>3)(a1)
		move.b	(a0)+,7*(max_x_txt>>3)(a1)
		tst.l	tsInvert(a6)
		beq.s	pc_exit
		not.b	(a1)
		not.b	(max_x_txt>>3)(a1)
		not.b	2*(max_x_txt>>3)(a1)
		not.b	3*(max_x_txt>>3)(a1)
		not.b	4*(max_x_txt>>3)(a1)
		not.b	5*(max_x_txt>>3)(a1)
		not.b	6*(max_x_txt>>3)(a1)
		not.b	7*(max_x_txt>>3)(a1)
pc_exit:
		movem.l (sp)+,d0/a0-a1
		rts
		IF ^^defined ASCII = 0
ASCII:		  .incbin "font/light8x8.fnt"
		ENDIF
* FNT-Header
* dc.l "JFNT"
* dc.b first_char,last_char
* dc.b height
* dc.b dummy  ; perhabs soon width ?)
