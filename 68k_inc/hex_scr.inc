*****************
* Hex-Print routines using a "Hex" font

; Define next, if characters are stored in a row.
FONT_BY_ROW EQU 1

*****************
* var-base is A6
* predefined constants: max_x_txt,max_y_txt,(max_x_txt>>3)
*            variables: TextScreen.l,Cursor.l
*
* subroutines:
* PrintDEZ,PrintDEZ2,PrintHEX,PrintHEXl,PrintHEXb
* InitHexScreen(d0.w = ColorIndex,d1.l = Color)
*****************
PrintDEZ::
	move.l	d0,-(sp)
	tst.l	d0
	bpl.s	pd1
	not.l	tsInvert(a6)		; print negative numbers inverted
	neg.l	d0
pd1:
	and.l	#$0000FFFF,d0
	divu	#100,d0
	bsr.s	PrintDEZ2
	swap	d0
	bsr.s	PrintDEZ2
	clr.l	tsInvert(a6)
	move.l  (sp)+,d0
	rts
PrintDEZ2::
	movem.l	d0/d1,-(sp)
	and.l	#$FF,d0
	divu	#10,d0
	move.l	d0,d1
	swap	d1
	lsl.b	#4,d0
	or.b	d1,d0
	bsr.s   PrintHEXb
	movem.l	(sp)+,d0/d1
	rts

PrintHEXl::
	move.l  d0,-(sp)
	swap    d0
	bsr.s   PrintHEX
	move.l	(sp),d0
	bsr.s   PrintHEX
	move.w	#$100,d0
	bsr.s   PrintHEX1
	move.l  (sp)+,d0
	rts
PrintHEX::
	move.w  d0,-(sp)
	move.b  (sp),d0
	bsr.s   PrintHEXb
	move.w  (sp)+,d0
PrintHEXb:
	and.w	#$ff,d0
PrintHEX1:
	movem.l d0/a0-a1,-(sp)

	cmpi.w  #(max_x_txt>>3),Cursor(a6)
	blo.s   ok_ph1
	clr.w   Cursor(a6)
	addq.w  #1,Cursor+2(a6)
	cmpi.w  #max_y_txt/6,Cursor+2(a6)
	bls.s   ok_ph1
	clr.w   Cursor+2(a6)
ok_ph1:
	move.l  TextScreen(a6),a1
	move.w  Cursor+2(a6),d0
	mulu    #max_x_txt/8*6,d0
	add.w   Cursor(a6),d0
	adda.w  d0,a1

	addq.w  #1,Cursor(a6)

	move.l	(sp),d0
	and.w   #$1FF,d0
 IF FONT_BY_ROW = 1
	mulu	#5,d0
 ELSE
	btst	#8,d0
	bne.s	_space
 ENDIF
	lea	font(pc,d0.w),a0
 IF FONT_BY_ROW = 1
	move.b  (a0)+,(a1)
	move.b  (a0)+,(max_x_txt>>3)(a1)
	move.b  (a0)+,2*(max_x_txt>>3)(a1)
	move.b  (a0)+,3*(max_x_txt>>3)(a1)
	move.b  (a0),4*(max_x_txt>>3)(a1)
 ELSE
	move.b  (a0),(a1)
	move.b  $100(a0),(max_x_txt>>3)(a1)
	move.b  $200(a0),2*(max_x_txt>>3)(a1)
	move.b  $300(a0),3*(max_x_txt>>3)(a1)
	move.b  $400(a0),4*(max_x_txt>>3)(a1)
 ENDIF
phexit0:
	clr.b	5*(max_x_txt>>3)(a1)
	tst.l	tsInvert(a6)
	beq.s	phexit
	not.b	(a1)
	not.b	(max_x_txt>>3)(a1)
	not.b	2*(max_x_txt>>3)(a1)
	not.b	3*(max_x_txt>>3)(a1)
	not.b	4*(max_x_txt>>3)(a1)
	not.b	5*(max_x_txt>>3)(a1)

phexit:
	movem.l (sp)+,d0/a0-a1
	rts

 IF FONT_BY_ROW = 0
_space:
	clr.b	(a1)
	clr.b	(max_x_txt>>3)(a1)
	clr.b	2*(max_x_txt>>3)(a1)
	clr.b	3*(max_x_txt>>3)(a1)
	clr.b	4*(max_x_txt>>3)(a1)
	bra.s	phexit0
 ENDIF


InitHexScreen::
	add.w d0,d0
	lea $f00400,a0
	move.l d1,0(a0,d0.w)
	move.l  TextScreen(a6),a0
	move.w  #(((max_x_txt>>3)*max_y_txt)>>2)-1,d0
	moveq   #0,d1
.loop:
	move.l  d1,(a0)+
	dbra    d0,.loop
	move.l d1,Cursor(a6)
	rts
font:
 IF FONT_BY_ROW = 1
	.incbin "font/hexfont_8x5.bin"
 ELSE
	.incbin "font/hexfont_8x5_column.bin"
 ENDIF
	.long
