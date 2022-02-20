;;*****************
;; MANDEL.Q
;; created '94 (c) Bastian Schick
;; last modified
;;
;; 24.09.95	 new videoinit,button-control ...
;; 07.05.96	 adapted for NEWSRC
;; 08.10.96	 Tom & Jerry parallel


		.68000

	.include "68k_mac/help.mac"

	.include "68k_inc/jaguar.inc"	; get equates

ColorTable	equ $f00400
ScreenMode	EQU $06C1		 ; 16Bit-CRY
ScreenBytes	EQU 224
DefaultIter	EQU 100
max_x		SET 223
max_y		SET 223
rez		EQU 13		 ; max. 13
max_iter	EQU 20000

screen		EQU $100000

TxtScreen	EQU $100000+(max_x+1)*(max_y+1)
CrossScreen	EQU TxtScreen+32*32

vars		equ $10000
;---------------
; Variablen
	RSRESET
	RSO OBL,8
	RSO OBL0,8
	RSW count_obj
	RSW a_vdb
	RSW a_vde
	RSW YOffset
	RSW tab,256
	RSW r_min
	RSW i_max
	RSW delta
	RSW iter
	RSL Cursor
	RSW VI_flag
	RSL _objects,512
	.include "68k_var/keyboard.var"
	RSL StackBottom,100
	RSL Stack
;---------------
	.macro VSYNC
	clr.w VI_flag(a6)
	tst.w VI_flag(a6)
	beq.s *-4
	.endm

//->	.incbin "header.jag"
start:
	.include "68k_inc/startup.inc"
;;*****************
;;	Apfel	*
apfel0:
	move.w #$2700,sr
	lea	vars,a6
	move.l	#$2000,sp


	lea	(a6),a0
	move.w #(Stack-OBL)>>2-1,d0
clear_loop:
	clr.l (a0)+
	dbra d0,clear_loop
	lea	Objekte(pc),a0
	lea	_objects(a6),a1
	moveq.l	#(Objekte_End - Objekte)/4+1,d0
copy_obj:
	move.l	(a0)+,(a1)+
	dbra	d0,copy_obj

	bsr	InitTxtScreen

	lea	CrossScreen,a5
	bsr	VideoInit
	bsr	InitOP

	lea	my_irq(pc),a0
	move.l	a0,$00000100.w

	lea	$f00000,a0
	clr.w	$E2(a0)
	move.w	#$1F01,$E0(a0)
	move	#$2000,sr
	clr.w	$0026(a0)	 ; OPF

	bsr	InitDSP
	bsr	InitGPU

	move.l #$FF0FFFFF,KeyMask(a6)	; only repeat cursor-keys

	moveq	#4,d0
	bsr	CreateTable		; init Clut

	move.w	#26591*2-1,$F10000	; 500Hz Timer
	moveq	#0,d0
	move.w	d0,$F00058		; background black
	move.l	d0,$f0002a		; border black

apfel1:
	move.w	#-16967,r_min(a6)	;set start parameter
	move.w	#13025,i_max(a6)
	move.w	#116,delta(a6)
	move.w	#DefaultIter,iter(a6)

	move.l	$100.w,a3
	move.l #$1234abce,a0
	move	a0,usp
apfel:
	IF 1 = 0
	lea	screen,a0
	move.w	#224*224-1,d0
lop:
	st (a0)+
	dbra	d0,lop
	ENDIF

	move.w	#(max_x+1)/2,d2
	move.w	d2,d3
	move.w	d2,d6
	mulu	delta(a6),d6
	movea.l d6,a3
	adda.w	r_min(a6),a3		; compute current r0
	movea.w i_max(a6),a4
	suba.w	d6,a4			; current i0
	moveq	#-1,d7
	bsr	PrintXY

	movea.l DSPcode+4(pc),a0	; init DSP-parameter
	lea	-16(a0),a0
	move.w	delta(a6),d0
	ext.l	d0
	move.l	d0,(a0)+
	move.w	r_min(a6),d0
	ext.l	d0
	move.l	d0,(a0)+
	move.w	i_max(a6),d0
	ext.l	d0
	move.l	d0,(a0)+
	move.w	iter(a6),d0
	ext.l	d0
	move.l	d0,(a0)+
	bsr	PrintIter

	movea.l GPUcode+4(pc),a1	; init GPU-parameter
	lea	-16(a1),a1
	move.w	delta(a6),d0
	ext.l	d0
	move.l	d0,(a1)+
	move.w	r_min(a6),d0
	ext.l	d0
	move.l	d0,(a1)+
	move.w	i_max(a6),d0
	ext.l	d0
	move.l	d0,(a1)+
	move.w	iter(a6),d0
	ext.l	d0
	move.l	d0,(a1)+

	movem.l a2-a3,-(sp)
	moveq #0,d0
	lea $f02110,a3
	lea $f1a110,a2
	move.l d0,4(a2)		; stop DSP
	move.l d0,4(a3)		; stop GPU
	move.l a0,(a2)+		; set DSP-PC
	move.l a1,(a3)+		; set GPU-PC
	moveq #1,d0

	move.w	#$FFFF,$F10002	; 65536*500Hz => 131.7 s
	move.l	d0,(a2)		; start DSP
	move.l	d0,(a3)		; start GPU
	movem.l (sp)+,a2-a3
wait_dsp:

	bsr ClearCross
wait0:
	moveq #-1,d1
	bsr draw_cross

wait01:
	bsr	PrintXY
wait:
	move.l $f02114,d0
	or.l $f1a114,d0
	btst	#0,d0
	beq.s	notime
	move.w	#$FFFF,d0
	sub.w	$F10038,d0
	ext.l	d0
	add.l d0,d0
	addq.l #5,d0
	divu	#10,d0
	bsr	  PrintTime
notime:
	bsr GetKey
	beq.s wait

	move.l d0,d1
	cmp.l #$10001,d0
	beq	exit

	btst	#29,d0		; "A"
	bne	set_lo
	btst	#25,d0		; "B"
	bne	clr_lo
	btst	#13,d0		; "C"
	bne	get_iter
	btst	#9,d0			; OPTION
	bne	apfel1
	and.l	#$0F00FF,d1
	bne.s	do_color
	tst.w	d7
	bmi	move_cross
	bra.s	size_square

;;*****************
;;    do_color	*
do_color:
	pea	wait(pc)
	moveq	#0,d0
	btst	#19,d1
	bne	CreateTable
	moveq	#1,d0
	btst	#7,d1
	bne	CreateTable
	moveq	#2,d0
	btst	#3,d1
	bne	CreateTable
	moveq	#3,d0
	btst	#18,d1
	bne	CreateTable
	moveq	#4,d0
	btst	#6,d1
	bne	CreateTable
	rts
;;*****************
;;   size square  *
size_square:
	btst	#22,d0	 ; links
	bne.s	cross_small
	btst	#23,d0	 ; rechts
	bne.s	cross_wide
	btst	#20,d0	 ; hoch
	bne.s	cross_small
	btst	#21,d0	 ; runter
	beq	wait
cross_wide:
	cmp.w	#max_x,d2
	beq	wait
	cmp.w	#max_y,d3
	beq	wait

	moveq #0,d0
	bsr	draw_cross
	addq.w	#1,d2
	adda.w	delta(a6),a3
	addq.w	#1,d3
	suba.w	delta(a6),a4
	bra	wait0
cross_small:
	tst.w	d2
	beq	wait
	tst.w	d3
	beq	wait
	moveq #0,d0
	bsr	draw_cross
	subq.w	#1,d2
	suba.w	delta(a6),a3
	subq.w	#1,d3
	adda.w	delta(a6),a4
	bra	wait0
;;*****************
;;   move_cross	*
move_cross:
	and.l #$00f00000,d0
	beq wait
	pea	cont_move(pc)
	btst	#22,d0	 ; links
	bne.s	cross_left
	btst	#23,d0
	bne.s	cross_right
	addq.l	#4,sp
cont_move:
	pea	wait01(pc)
	btst	#21,d0
	bne.s	cross_down
	btst	#20,d0
	bne.s	cross_up
nothing:
	rts

cross_up:
	tst.w	d3
	beq.s	nothing
	moveq #0,d1
	bsr	draw_cross
	subq.w	#1,d3
	adda.w	delta(a6),a4
	moveq #-1,d1
	bra	draw_cross

cross_down:
	cmp.w	#max_y,d3
	beq.s	nothing
	moveq #0,d1
	bsr	draw_cross
	addq.w	#1,d3
	suba.w	delta(a6),a4
	moveq #-1,d1
	bra	draw_cross

cross_left:
	tst.w	d2
	beq.s	nothing
	moveq #0,d1
	bsr	draw_cross
	subq.w	#1,d2
	suba.w	delta(a6),a3
	moveq #-1,d1
	bra	draw_cross

cross_right:
	cmp.w	#max_x,d2
	beq.s	nothing
	moveq #0,d1
	bsr	draw_cross
	addq.w	#1,d2
	adda.w	delta(a6),a3
	moveq #-1,d1
	bra	draw_cross
;;*****************
;;    set cross	*
clr_lo:
	tst.w	d7
	bmi	wait
	exg	d6,d2
	exg	d7,d3
	moveq #0,d1
	bsr	draw_cross	 ; clear old marker
	exg	d6,d2
	exg	d7,d3
	moveq	#-1,d7
	bra	wait01

set_lo:
	tst.w d7
	bpl.s compute
	move.w	d2,d6
	move.w	d3,d7
	cmp.w	#max_x,d2
	beq.s	set_lo1
	addq.w	#1,d2
set_lo1:
	cmp.w	#max_y,d3
	beq	wait0
	addq.w	#1,d3
	bra	wait0
;;*****************
;;    compute	*
compute:
	tst.w	d7
	bmi	wait
	move.w	d2,d0
	sub.w	d6,d0
	bpl.s	ok_comp
	neg.w	d0
	exg	d6,d2
	exg	d7,d3
ok_comp:
	muls	delta(a6),d6
	add.w	d6,r_min(a6)
	muls	delta(a6),d7
	sub.w	d7,i_max(a6)
	muls	delta(a6),d0
	divs	#max_x,d0
	move.w	d0,delta(a6)
;>	bne.s	get_iter
	bne apfel
	move.w	#1,delta(a6)
;>	bra.s	get_iter
	bra apfel
exit:
	jmp	reset
	illegal
	nop
	bra	start
;;*****************
;;    get_iter	*
get_iter:
	move.w	iter(a6),d7
	ext.l	d7
get_iter0:
	move.w	#512,Cursor+2(a6)
	move.w	d7,d6
	bsr	dezout5
wait1:
	bsr	GetKey
	beq.s	wait1
	btst	#23,d0
	bne.s	iter_plus
	btst	#22,d0
	bne.s	iter_minus
	btst	#0,d0	 ; "#"
	beq.s	cont_gi
	move.w	#max_iter,d7
	bra.s	get_iter0
cont_gi:
	btst	#29,d0	 ; "A"
	beq.s	wait1
	move.w	d7,iter(a6)
	bra	apfel
iter_minus:
	cmp.w	#5,d7
	ble.s	wait1
	subq.w	#5,d7
	subq.w	#5,d7
	bra.s	get_iter0
iter_plus:
	cmpi.w	#max_iter,d7
	bge.s	wait1
	addq.w	#5,d7
	addq.w	#5,d7
	bra.s	get_iter0
;;*****************
KeyDelay	EQU 10
	.include "68k_inc/keyboard.inc"
;;*****************
;;	dezout	*
dezout5:
	divu	#10000,d6
	bsr.s	print0
dezout4:
	divu	#1000,d6
	bsr.s	print0
dezout3:
	divu	#100,d6
	bsr.s	print0
dezout2:
	divu	#10,d6
	bsr	print0
print0:
	move.w	d6,d0
	bsr	PrintZiffer
	swap	d6
	ext.l	d6
	rts
printFix:
;	 bsr.s	 printA0
fixout:	move.w	d6,d5
	moveq	#10,d0
	ext.l	d5
	bpl.s	ok_sign
	neg.l	d5
	moveq	#11,d0
ok_sign:
	bsr	PrintZiffer
	move.l	d5,d6
	moveq	#rez,d0
	lsr.l	d0,d6
	bsr.s	dezout2
	moveq	#12,d0
	bsr	PrintZiffer
	lsl.w	#16-rez,d5
	moveq	#0,d6
	moveq	#rez-1,d0
	moveq	#0,d1
	lea	_10er+24(pc),a0
loopfo:	add.w	d5,d5
	bcc.s	noadd
	move.w	(a0),d1
	add.l	d1,d6
noadd:	subq.w	#2,a0
	dbra	d0,loopfo
	bra.s	dezout5

_10er:	DC.W 12,24,49,98,195,390,781,1563,3125,6250,12500,25000,50000
;;*****************
;;    draw_cross  *
draw_cross:
	movem.l d0/a0-a1,-(sp)
	lea $f02200,a0		; Blitter-base
dc_1:
	move.l $38(a0),d0
	btst #0,d0
	beq.s dc_1
	move.l #CrossScreen,(a0)
	move.l #PITCH1|PIXEL16|WID224|XADDPIX,4(a0)
	lea pattern(pc),a1
	move.l a1,$24(a0)
	move.l #PITCH1|PIXEL16|WID8|XADDPIX|$8000,$28(a0)
	move.l #7,$2c(a0)

	moveq #0,d0
	move.w d2,d0
	move.l d0,$c(a0)
	move.l #$10000|(-1&$ffff),$10(a0)
	moveq #0,d0
	move.l d0,$14(a0)
	move.l d0,$18(a0)
	move.l d0,$30(a0)

	move.l #224<<16|1,$3c(a0)
	move.l #DSTEN|SRCEN|UPDA1|LFU_XOR,$38(a0)

dc_2:
	move.l $38(a0),d0
	btst #0,d0
	beq.s dc_2

	move.w d3,d0
	swap d0
	clr.w d0
	move.l d0,$c(a0)
	move.l #PITCH1|PIXEL16|WID224,4(a0)
	move.l #PITCH1|PIXEL16|WID8|$8000,$28(a0)
	move.l #$10000|224,$3c(a0)
	move.l #DSTEN|SRCEN|UPDA1|LFU_XOR,$38(a0)

	tst.w d1
	beq.s ._99

	move.w d3,d0
	sub.w #16,d0
	bpl.s ._ok0
	moveq #0,d0
._ok0:
	cmp.w #224-32,d0
	blo.s ._ok1
	move.w #224-32,d0
._ok1:
	add.w d0,d0
	add.w YOffset(a6),d0
	move.w	d0,_objects+(text_y-Objekte)(a6)

._99:
	movem.l (sp)+,d0/a0-a1
	rts

	.phrase
pattern:
	dc.l $00ff00ff,$88008800,$00ff00ff,$88008800
;;*****************
;; ClearCross	*

ClearCross::
	movem.l d0/a0,-(sp)
	lea $f02200,a0		; Blitter-base
._1:
	move.l $38(a0),d0
	btst #0,d0
	beq.s ._1
	moveq #0,d0
	move.l #CrossScreen,(a0)	   ; set dest
	move.l #PITCH1|PIXEL32|WID3584,4(a0)
	move.l d0,$c(a0)	; pixel pointer
	move.l d0,$10(a0)	; step value
	move.l d0,$68(a0)
	move.l d0,$6c(a0)	; patter
	move.l #$10000|(224*224/2),$3c(a0)
	move.l #PATDSEL,$38(a0)
	movem.l (sp)+,d0/a0
	rts
;;*****************
;;	Print	*
PrintIter:
	move.l	d6,-(sp)
	move.w	#512,Cursor+2(a6)
	move.w	d0,d6
	bsr	dezout5
	move.l	(sp)+,d6
	rts

PrintTime:
	move.l	d6,-(sp)
	move.w	#768,Cursor+2(a6)
	move.w	d0,d6
	divu #100,d6
	swap d6
	move.w d6,-(sp)
	clr.w d6
	swap d6
	bsr	dezout3
	moveq #12,d0
	bsr PrintZiffer
	moveq #0,d6
	move.w (sp)+,d6
	bsr dezout2
	move.l	(sp)+,d6
	rts

PrintXY:
	movem.l d5-d6/a0,-(sp)
	clr.w	 Cursor+2(a6)
	move.w	a3,d6
	bsr	fixout
;>	move.w	d2,d6
;>	bsr	  dezout5

	move.w	#256,Cursor+2(a6)
	move.w	a4,d6
	bsr	fixout
;	 move.w	 d3,d6
;	 bsr	 dezout5
	movem.l (sp)+,d5-d6/a0
	rts
;;*****************
;; InitTxtScreen  *
InitTxtScreen:
	lea	TxtScreen,a0
;>	move.l	#$F0FF,$F00400	 ; CLUT init
;>	move.l	#$80FF80FF,$F00404
	move.w	#32*20-1,d0
	moveq	#0,d1
loop_its:
	move.l	d1,(a0)+
	dbra	d0,loop_its
	rts

PrintZiffer:
	movem.l d0/a0-a1,-(sp)
	add.w	d0,d0
	add.w	d0,d0
	add.w	d0,d0
	lea	_0(pc,d0.w),a0
	lea	TxtScreen,a1
	adda.l	Cursor(a6),a1
	addq.l	#1,Cursor(a6)
	move.b	(a0)+,(a1)
	move.b	(a0)+,32(a1)
	move.b	(a0)+,64(a1)
	move.b	(a0)+,96(a1)
	move.b	(a0)+,128(a1)
	move.b	(a0)+,160(a1)
	move.b	(a0)+,192(a1)
	move.b	(a0)+,224(a1)
	movem.l (sp)+,d0/a0-a1
	rts
_0:
	.incbin "bin/zahlen.bin"
;;*****************
;;  CreateTable	*
CreateTable:
	movem.l d0-d7,-(sp)
	lea	ColorTable,a0
	add.w	d0,d0
	move.w	colors(pc,d0.w),d0
	jsr	color1(pc,d0.w)
	movem.l (sp)+,d0-d7
	rts

colors:
	DC.W color1-color1,color2-color1,color3-color1
	DC.W color4-color1,color5-color1

color1:
	moveq	#31,d0
	move.w	#$FF,d1
	move.w	#$0100,d2
loop3_ct:
	moveq	#7,d3
loop31_ct:
	move.w	d1,(a0)+
	add.w	d2,d1
	dbra	d3,loop31_ct
	and.w	#$F0FF,d1
	add.w	#$1000,d1
	dbra	d0,loop3_ct
	clr.w	ColorTable
	rts

color2:	moveq	#31,d0
	move.w	#$80FF,d1
	move.w	#$0100,d2
loop_ct:
	moveq	#7,d3
loop1_ct:
	move.w	d1,(a0)+
	add.w	d2,d1
	dbra	d3,loop1_ct
	and.w	#$F0FF,d1
	add.w	#$1000,d1
	dbra	d0,loop_ct
	clr.w	ColorTable
	rts

color3:
	move.w	#254,d7
	move.l	#254*8,d0
	clr.w	(a0)+
loop2_ct:
	move.w	d0,(a0)+
	subq.w	#8,d0
	dbra	d7,loop2_ct
	rts

color4:
	moveq	#0,d7
	moveq	#15,d6
	moveq	#0,d0	 ; x
loopx_ct:
	move.w	d0,d5
	moveq	#0,d1	 ; y
loopy1_ct:
	move.w	d0,d2
	lsl.w	#4,d2
	or.w	d1,d2
	lsl.w	#8,d2
	st	d2
	move.w	d2,(a0)+
	addq.w	#1,d1
	dbra	d5,loopy1_ct
	move.w	d0,d5
	moveq	#0,d1
	bra.s	into_ct
loopy2_ct:
	move.w	d5,d2
	lsl.w	#4,d2
	or.w	d0,d2
	lsl.w	#8,d2
	st	d2
	move.w	d2,(a0)+
into_ct:
	dbra	d5,loopy2_ct
	addq.w	#1,d0
	dbra	d6,loopx_ct
	clr.w	ColorTable
	rts

color5:
	moveq	#31,d0
	move.w	#$08FF,d1
	move.w	#$1000,d2
loop5_ct:
	moveq	#7,d3
loop6_ct:
	move.w	d1,(a0)+
	sub.w	d2,d1
	dbra	d3,loop6_ct
	and.w	#$0FFF,d1
;	 or.w	 #$0800,d1
	add.w	#$0200,d1
	dbra	d0,loop5_ct
	clr.w	ColorTable
	rts
;;*****************
;; Init- und Hilfsroutines for screen handling
;; (c) 1994 Bastian Schick
;;****************
;; Objekt-Defs	 *
NEXT_OBJ	 = 1
;;**************************************
;; BitMap oder Scaled BitMap - Objekte *
;;**************************************
	RSRESET
	RSW obj_bm_type		       ;; Type
	RSW obj_bm_l		       ;; size of object (for MakeOBL)
	RSL obj_bm_data		       ;; Data
	RSW obj_bm_x		       ;; X
	RSW obj_bm_y		       ;; Y pos in Halbzeilen
	RSW obj_bm_height	       ;; Height ODER cc bei BRANCH OBJECT
	RSW obj_bm_link		       ;; distance to next object
	RSB obj_bm_bits		       ;; Bits pro Pixel
	RSB obj_bm_pitch	       ;; Pitch
	RSW obj_bm_dwidth	       ;; Breite in Phrases
	RSW obj_bm_iwidth	       ;; Bildbreite (sichtbar)
	RSB obj_bm_cindex	       ;; Farb-Offset
	RSB obj_bm_flags	       ;; Flags
	RSW obj_bm_firstpx	       ;; FirstPixel
obj_bm_len	= RSCOUNT

	RSB obj_dummy1
	RSB obj_sc_rem
	RSB obj_sc_vscale
	RSB obj_sc_hscale	       ;; extension for Scaled BitMap
obj_sc_len	= RSCOUNT

;;*************
;; GPU-Object *
;;*************
	RSRESET
	RSW obj_gp_type
	RSW obj_gp_l		       ;; size of object (for MakeOBL)
	RSL obj_gp_data1
	RSL obj_gp_data2
	RSW obj_gp_link

obj_gp_len	= RSCOUNT
;;****************
;; Branch-Object *
;;****************
	RSRESET
	RSW obj_br_type
	RSW obj_br_l		       ;; size of object
	RSW obj_br_y
	RSW obj_br_cc		       ;; Bedingung
	RSW obj_br_link,2
obj_br_len	= RSCOUNT

	macro BRA_OBJ y_pos,cc,dest
	dc.w 3,obj_br_len
	dc.w \y_pos	    ;; y
	if \cc = "<"
	dc.w 1
	else
	if \cc = ">"
	dc.w 2
	else
	if \cc = "="
	dc.w 0
	endif
	endif
	endif
	dc.w \dest,NEXT_OBJ
	endm

;;**************
;; Stop-Object *
;;**************
	RSRESET
	RSW obj_st_type
	RSW obj_st_l
	RSW obj_st_int
	RSL obj_st_data1
	RSL obj_st_data2
obj_st_len	= RSCOUNT
;;****************
;;    MakeOBL	 *
MakeOBL:
	movem.l d0-a4,-(sp)

	move.l	#$FF000000,d4

	lea	OBL(a6),a0
	lea	OBL(a6),a1
	lea	(a1),a4		 ;; start merken
	moveq	#0,d7		 ;; object counter

	lea	_objects(a6),a2	  ;; source
loop_mo:
	lea	(a2),a3		 ;; Ptr auf akt. Objekt retten
	movem.w (a2)+,d1/d5	 ;; Type
	tst.w	d1
	bpl.s	ok_mo
	cmp.w	#$AFFE,d1
	beq	exit_mo
	lea	-4(a2,d5.w),a2
	bra.s	loop_mo

ok_mo:
	addq.w	#1,d7
	and.w	#7,d1
	ext.l	d1
	move.w	d1,d0
	subq.w	#2,d0
	bmi	bm_sc_mo
	beq	gpu_mo		 ;; 2=GPU-Object
	subq.w	#2,d0
	bmi.s	branch_mo	 ;; 3=Branch Object
;; Stop-Objekt erzeugen
	moveq	#1,d0
	and.w	(a2)+,d0
	lsl.w	#3,d0
	or.w	d0,d1		 ;; Interrupt Flag
	movem.l (a2)+,d0/d2

	lsl.l	#4,d2
	or.l	d2,d1
	move.l	d0,(a0)+
	move.l	d1,(a0)+
	lea	24(a0),a0
	lea	32(a1),a1
	bra.s	loop_mo
;; branch_object
branch_mo:
	move.w	#$07FF,d0
	and.w	(a2)+,d0
	lsl.w	#3,d0
	or.w	d0,d1		 ;; Ypos
	moveq	#7,d0
	and.w	(a2)+,d0
	swap	d0
	lsr.l	#2,d0
	or.l	d0,d1		 ;; CC

	move.l	a1,d3		 ;; akt. Pos merken
	move.w	(a2)+,d0	 ;; nächstes Objekt falls CC true
	bpl.s	ok_bra_mo
	neg.w	d0
	move.l	a4,d3		 ;; sonst absolute
ok_bra_mo:
	asl.w	#5,d0		 ;; * 32
	ext.l	d0
	add.l	d3,d0
	lsr.l	#3,d0
	ror.l	#8,d0
	move.l	d0,d3
	and.l	d4,d0
	or.l	d0,d1		 ;; Link (24..31)
	move.l	d3,d0
	and.l	#$00FFFFFF,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+

	move.w	#($07FF<<3)|3,d1 ;; Branch Always
	ext.l	d1
	move.w	(a2)+,d0	 ;; nächstes Objekt
	asl.w	#5,d0		 ;; * 32
	ext.l	d0
	add.l	a1,d0
	lsr.l	#3,d0
	ror.l	#8,d0
	move.l	d0,d3
	and.l	d4,d0
	or.l	d0,d1		 ;; Link (24..31)
	move.l	d3,d0
	and.l	#$00FFFFFF,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+
	lea	16(a0),a0
	lea	32(a1),a1
	bra	loop_mo
;; GPU Object
gpu_mo:
	movem.l (a2)+,d0/d1
	and.w	#$FFF8,d1
	addq #2,d1
	move.l	d0,(a0)+
	move.l	d1,(a0)+

	move.w	#($07FF<<3)|3,d1 ;; Branch Always
	ext.l	d1
	move.w	(a2)+,d0	 ;; nächstes Objekt
	lsl.w	#5,d0		 ;; * 32
	ext.l	d0
	add.l	a1,d0
	lsr.l	#3,d0
	ror.l	#8,d0
	move.l	d0,d3
	and.l	d4,d0
	or.l	d0,d1		 ;; Link (24..31)
	move.l	d3,d0
	and.l	#$00FFFFFF,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+
	lea	16(a0),a0
	lea	32(a1),a1
	bra	loop_mo

;; BitMap oder Scaled BitMap
bm_sc_mo:
	moveq	#-8,d0
	and.l	(a2)+,d0	 ;; Data-Adress (3..23)
	bpl.s	ok_bm_sc_mo
	neg.l d0
	add.l	a6,d0
ok_bm_sc_mo:
	lsl.l	#8,d0		 ;; an 63..43

	move.w	(a2)+,d6	 ;; X
	and.w	#$0FFF,d6	 ;; im 2. Phrase 0..11
	ext.l	d6

	move.w	(a2)+,d3
	and.w	#$07FF,d3
	lsl.w	#3,d3
	or.w	d3,d1		 ;; Y-Pos (3..13)

	moveq	#0,d3
	move.w	(a2)+,d3
	and.w	#$03FF,d3
	swap	d3
	lsr.l	#2,d3
	or.l	d3,d1		 ;; Höhe (14..23)

	move.w	(a2)+,d3	 ;; nächstes Objekt
	lsl.w	#5,d3		 ;; * 32
	ext.l	d3
	add.l	a1,d3
	lsr.l	#3,d3
	ror.l	#8,d3
	move.l	d3,d2		 ;; Link retten
	and.l	d4,d3
	or.l	d3,d1		 ;; Link (24..31)

	move.l	d2,d3
	and.l	#$00FFFFFF,d3
	or.l	d3,d0
	move.l	d0,(a0)+
	move.l	d1,(a0)+

	moveq	#7,d0
	and.b	(a2)+,d0
	ror.w	#4,d0
	or.w	d0,d6		 ;; Depth (12..14)

	moveq	#7,d0
	and.b	(a2)+,d0
	swap	d0
	lsr.l	#1,d0
	or.l	d0,d6		 ;; Pitch (15..17)

	moveq	#0,d0
	move.w	(a2)+,d0
	and.w	#$03FF,d0
	lsl.w	#2,d0
	swap	d0
	or.l	d0,d6		 ;; Dwidth (18..27)

	moveq	#0,d0
	move.w	(a2)+,d0
	and.w	#$03FF,d0
	ror.l	#4,d0
	move.l	d0,d1
	clr.w	d0
	or.l	d0,d6		 ;; IWidth (28..31)
	ext.l	d1		 ;; und (32..37)

	move   #$fe,d0
	and.b	(a2)+,d0
	lsl.w	#5,d0
	or.w	d0,d1		 ;; Index (38..44)

	moveq	#$0F,d0
	and.b	(a2)+,d0
	swap	d0
	lsr.l	#3,d0
	or.l	d0,d1		 ;; Flags (45..48)

	moveq	#$3F,d0
	and.w	(a2)+,d0

	add.w	d0,d0
	swap	d0
	or.l	d0,d1
	move.l	d1,(a0)+
	move.l	d6,(a0)+

	lea	16(a0),a0
	lea	32(a1),a1
	cmp.w	#obj_sc_len,d5	 ;; Sized Object
	bne	loop_mo
	move.l	(a2)+,-12(a0)
;;		    move.b  d0,-8(a0)
;;		    move.b  d1,-9(a0)
;;		    move.b  d2,-10(a0)
;;		    clr.b   -11(a0)
	bra	loop_mo
exit_mo:
	move.l	#$affedead,(a0)+
	moveq	#4,d0
	move.l	d0,(a0)+

	addq.w	#1,d7
	move.w	d7,count_obj(a6)
	movem.l (sp)+,d0-a4
	rts
;;****************
;;   videoinit	 *

;; THESE ARE THE NTSC DEFINITIONS
ntsc_width	= 1409
ntsc_hmid	= 823

ntsc_height	= 241
ntsc_vmid	= 266

;; THESE ARE THE PAL DEFINITIONS
pal_width	= 1381
pal_hmid	= 843

pal_height	= 287
pal_vmid	= 322

VideoInit:
	movem.l d0-d3/a0,-(sp)
	lea	$00F00000,a0
	move.w	#pal_vmid-pal_height,d0		;; vdb
	move.w	#pal_vmid+pal_height,d1		;; vde
	move.w	#((pal_width>>1)-1)|$0400,d2	;; hde
	move.w	#pal_hmid-(pal_width>>1)+4,d3	;; hdb
	btst	#4,$00F14003
	beq.s	VideoInit1			;; =0 => PAL
	move.w	#ntsc_vmid-ntsc_height,d0
	move.w	#ntsc_vmid+ntsc_height,d1
	move.w	#((ntsc_width>>1)-1)|$0400,d2
	move.w	#ntsc_hmid-(ntsc_width>>1)+4,d3
VideoInit1:
	move.w	d0,$0046(a0)		; VDB
	move.w	#$ffff,$0048(a0)	; VDE
	move.w	d2,$003C(a0)		; HDE
	move.w	d3,$0038(a0)		; HDB1
	move.w	d3,$003A(a0)		; HDB2

	move.w	d0,a_vdb(a6)
	move.w	d1,a_vde(a6)

	movem.l (sp)+,d0-d3/a0
	rts
;;****************
;;    InitOP	 *
InitOP:
	lea	$F00000,a0
	move.w	a_vde(a6),d0
	bset	#0,d0
	move.w	d0,$4E(a0)
	move.w	d0,$48(a0)
	bclr	#0,d0

	;; patch object list with VDE
//->	move.w	d0,_objects+(bra1-Objekte+4)(a6) ;; branch if count > vde

	sub.w #448,d0
	lsr.w #1,d0
	move.w d0,YOffset(a6)
	move.w d0,_objects+(obj0_y-Objekte)(a6)
	move.w d0,_objects+(obj1_y-Objekte)(a6)
	bsr	MakeOBL

	lea	$00F00000,a0
	lea	OBL(a6),a1
	move.l	a1,d0
	swap	d0
	move.l	d0,$20(a0)	 ; OPL = $10000
	move.w	#ScreenMode,$28(a0)
	rts
;;****************
;;	IRQ	 *
my_irq:
	movem.l d0-d1,-(sp)
	btst	#0,$00F000E1
	beq.s	no_vi

	subq.w	#1,VI_flag(a6)
	bsr	MakeOBL

	bsr	Keyboard
no_vi:
	move.l	#$0101<<16,$00F000E0
	movem.l (sp)+,d0-d1
	rte
;;****************
;;    Objekte	 *

Objekte:
//->;; 0
//->		BRA_OBJ 30,"<",-5		; y<30 => STOP
//->bra1:
//->		BRA_OBJ 601,">",-5		; y>601 => STOP
;; 2
;; Text-Screen
		DC.W 0,obj_bm_len
		DC.L TxtScreen
		DC.W 16				; x_start
text_y:		DC.W 0				; y_start
		DC.W 32				; height

		DC.W NEXT_OBJ
		DC.B 0,1			; 1 Bit Farbtiefe
		DC.W 256>>6,128>>6
		DC.B 0,4			; transparent
		DC.W 0
;; 3
		dc.w 0,obj_bm_len
		dc.l screen
		dc.w 192-112+12
obj0_y:		dc.w 0
		dc.w 224
		dc.w NEXT_OBJ
		dc.b 3,1
		dc.w 224>>3,224>>3
		dc.b 0,0
		dc.w 0
;; 4
		dc.w 0,obj_bm_len
		dc.l CrossScreen
		dc.w 192-112+12
obj1_y:		dc.w 0
		dc.w 224
		dc.w NEXT_OBJ
		dc.b 4,1
		dc.w 224>>2,224>>2
		dc.b 0,4
		dc.w 0
;; 5
		DC.W $AFFE	 ; generates STOPOBJ
Objekte_End:

 if Objekte_End - Objekte > 256
	error
 endif
;;****************
;;   InitDSP	 *
InitDSP:
	moveq	#0,d0
	lea	$f1a110,a0
	lea	DSPcode+4(pc),a1
	move.l	d0,4(a0)		; DSP halt
	movea.l (a1)+,a2
	move.l	a2,(a0)			; Start-Adresse
	move.l	(a1)+,d1		; length in Bytes
	lsr.l	#2,d1
._1:
	move.l	(a1)+,(a2)+
	dbra	d1,._1
	move.l #$4000,$f1a100
	rts

DSPcode:
	.incbin	"jerry.o"

;;****************
;;   InitGPU	 *
InitGPU:
	moveq	#0,d0
	lea	$f02110,a0
	lea	GPUcode+4(pc),a1
	move.l	d0,4(a0)		; DSP halt
	movea.l (a1)+,a2
	move.l	a2,(a0)			; Start-Address
	move.l	(a1)+,d1		; length in Bytes
	lsr.l	#2,d1
._1:
	move.l	(a1)+,(a2)+
	dbra	d1,._1
	move.l #$4000,$f02100

	rts

GPUcode:
	.incbin "tom.o"

	.include "68k_inc/reset.inc"

;;****************

jag_end:
	END
