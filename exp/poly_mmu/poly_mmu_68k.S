BitsPerPel        = 4
****************************************************************************
* 2.6.95        256er Sinus-Tabelle
*                Aenderung der x/y/z-Position moeglich
*                RESET mit "#"+"*"
*                Anpassung des ScreenStarts falls 60Hz
* 7.5.96        Anpassung an NEWSRC
* 1.10.96       INCLUDE rather than hand-include ;-)
* 16.7.97       added Branch-Objects at the OL-start
*****************
* May 2022      port to new_bjl
****************

        .68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"
	.include "poly_mmu.equ"


****************

max_objekte	= 7*4			 ; 8 Objekte
;;->MOD		    SET 1
jag_prg:

vars		= $00030000

max_x_txt	= 384
max_y_txt	= 3*8

max_x		= 384>>0
max_y_gr	= 200>>0

screen1		= $00100000
screen2		= $00125800	;screen1+(max_x*(1<<BitsPerPel)>>3)*max_y_gr

******************
* Variablen
		RSRESET
		RSO ob_list,10
		RSB TxtScreen,(max_x_txt>>3)*max_y_txt
		.include "68k_var/text_scr.var"
		RSW count_obj
		RSW dummy
		RSW VI_count
		RSW swap_flag
		RSL _screen1
		RSL _screen2
		.include "68k_var/joypad1.var"
		RSW a_vde
		RSW a_vdb

		RSL object_ptr

		RSL angle_x
		RSL angle_y
		RSL angle_z
		RSL x_pos
		RSL y_pos
		RSL z_pos
		RSL max_time
		RSL StackBottom,200
		RSL stack,1

vars_len	= RSCOUNT
		IF vars_len > (100*1024)
		FAIL
		ENDIF
******************

xx:	bra.w	init
****************
* Sine-table   *
	.long
SinTab::
DC.L 0,804,1608,2410,3212,4011,4808,5602
DC.L 6393,7179,7962,8739,9512,10278,11039,11793
DC.L 12539,13279,14010,14732,15446,16151,16846,17530
DC.L 18204,18868,19519,20159,20787,21403,22005,22594
DC.L 23170,23731,24279,24811,25329,25832,26319,26790
DC.L 27245,27683,28105,28510,28898,29268,29621,29956
DC.L 30273,30571,30852,31113,31356,31580,31785,31971
DC.L 32137,32285,32412,32521,32609,32678,32728,32757
DC.L 32767,32757,32728,32678,32609,32521,32412,32285
DC.L 32137,31971,31785,31580,31356,31113,30852,30571
DC.L 30273,29956,29621,29268,28898,28510,28105,27683
DC.L 27245,26790,26319,25832,25329,24811,24279,23731
DC.L 23170,22594,22005,21403,20787,20159,19519,18868
DC.L 18204,17530,16846,16151,15446,14732,14010,13279
DC.L 12539,11793,11039,10278,9512,8739,7962,7179
DC.L 6393,5602,4808,4011,3212,2410,1608,804
DC.L 0,-804,-1608,-2410,-3212,-4011,-4808,-5602
DC.L -6393,-7179,-7962,-8739,-9512,-10278,-11039,-11793
DC.L -12539,-13279,-14010,-14732,-15446,-16151,-16846,-17530
DC.L -18204,-18868,-19519,-20159,-20787,-21403,-22005,-22594
DC.L -23170,-23731,-24279,-24811,-25329,-25832,-26319,-26790
DC.L -27245,-27683,-28105,-28510,-28898,-29268,-29621,-29956
DC.L -30273,-30571,-30852,-31113,-31356,-31580,-31785,-31971
DC.L -32137,-32285,-32412,-32521,-32609,-32678,-32728,-32757
DC.L -32767,-32757,-32728,-32678,-32609,-32521,-32412,-32285
DC.L -32137,-31971,-31785,-31580,-31356,-31113,-30852,-30571
DC.L -30273,-29956,-29621,-29268,-28898,-28510,-28105,-27683
DC.L -27245,-26790,-26319,-25832,-25329,-24811,-24279,-23731
DC.L -23170,-22594,-22005,-21403,-20787,-20159,-19519,-18868
DC.L -18204,-17530,-16846,-16151,-15446,-14732,-14010,-13279
DC.L -12539,-11793,-11039,-10278,-9512,-8739,-7962,-7179
DC.L -6393,-5602,-4808,-4011,-3212,-2410,-1608,-804


init:		INCLUDE "68k_inc/startup.inc"
******************
* Main
		lea	vars,a6
		lea	stack(a6),sp

		IF ^^defined MOD
		lea	INIT(pc),a0
		adda.l	#mod-INIT,a0
		bsr	PLAYER
		lea	vars,a6
		ENDIF

		lea	(a6),a0
		move.w	#vars_len>>2-1,d0
clearmem1:	clr.l	(a0)+
		dbra	d0,clearmem1

		move.l	#screen1,_screen1(a6)
		move.l	#screen2,_screen2(a6)
		bsr	VideoInit

 IF _8Bit = 1
		lea	$f00400,a0
		moveq	#0,d0
		moveq	#0,d1
setupCLUT:
		move.w	d0,(a0)+
		add.w	#$200,d0
		or.w	#$ff,d0
		addq.b	#1,d1
		bne.s	setupCLUT
 ENDIF
		move.w	#254,d0
		move.l	#$0FF0F0FF,d1
		lea	TxtScreen(a6),a0
		move.l	a0,TextScreen(a6)
		bsr	InitTxtScreen

		bsr	InitOP

		move.w #$4c1,$f00028

		lea	$000A0000,a0
		moveq	#0,d0
		moveq	#0,d1
		moveq	#0,d2
		moveq	#0,d3
		move.w	#$00020000>>4-1,d4
clearmem:	movem.l d0-d3,-(a0)
		dbra	d4,clearmem

		bsr	InitGPU
		bsr	InitObjekte

		move.w	#2659,$00F00050	 ; 1/10000s-Timer
		move.w	#$1F01,$00F000E0
;		move.w	#0,$00F10020
;		move.w	#5,$00F1A150

		IF ^^defined MOD
		move.l	#1,$00F1A114
		ENDIF

//->		bsr	cls1
//->		bsr	swap
//->		bsr	cls1
//->		bsr	swap

		clr.l	Cursor(a6)
		lea	Hallo(pc),a0
		bsr	PrintA0
		moveq	#1*4,d0

again:		move.l  d0,object_ptr(a6)
		lea	faces_tab(pc),a0
		movea.l 0(a0,d0.w),a0

		lea	vertices_tab(pc),a1
		movea.l 0(a1,d0.w),a1

		moveq	#0,d0
loop_cf:	tst.l	(a0)+
		bmi.s	exit_cf
loop1_cf:	tst.l	(a0)+
		bpl.s	loop1_cf
		addq.w	#1,d0
		bra.s	loop_cf
exit_cf:	move.l  #1,Cursor(a6)
		bsr	PrintDEZ
		lea	FaceTxt(pc),a0
		bsr	PrintA0

		move.l	(a1),d0
		bsr	PrintDEZ
		lea	PointsTxt(pc),a0
		bsr	PrintA0
		IF 1 = 1
		move.l	#20000,z_pos(a6)
		moveq	#0,d7
comes_loop:
		bsr	StartGPU
		bsr	swap
		addq.l	#2,d7
		sub.l	d7,z_pos(a6)
		bpl.s	comes_loop
		ENDIF

		clr.l	z_pos(a6)
		move.l	#5<<16|2,Cursor(a6)
		lea	ms(pc),a0
		bsr	PrintA0

		move.l	#22<<16|2,Cursor(a6)
		move.l	x_pos(a6),d0
		bsr	MyPrintDEZ
		move.w	#22+9,Cursor(a6)
		move.l	y_pos(a6),d0
		bsr	MyPrintDEZ
		move.w	#22+18,Cursor(a6)
		move.l	z_pos(a6),d0
		bsr	MyPrintDEZ

		move.w	#-1,$00F00052
into_loop:

		bsr	StartGPU
;		neg.l	x_pos(a6)
;		bsr	StartGPU
;		neg.l	x_pos(a6)

		move.w	#-1,d0
		sub.w	$00F00052,d0
		bsr	swap
;		move.w	#-1,d0
;		sub.w	$00F10038,d0
		move.w	#-1,$00F00052
		addq.l	#5,d0
		divu	#10,d0
		move.l	#$0002,Cursor(a6)
		ext.l	d0
		cmp.l	max_time(a6),d0
		blo.s	lo
		move.l	d0,max_time(a6)
		bsr	PrintDEZ
lo:		move.l	joy_pad(a6),d0
		move.l	d0,d1
		beq.s	into_loop
		and.l	#$22F02000,d0	 ; A-C+Cursor
		beq.s	no_xyz
		bsr.s	chg_x_pos
		bsr	chg_y_pos
		bsr	chg_z_pos

		move.l	#22<<16|2,Cursor(a6)
		move.l	x_pos(a6),d0
		bsr	MyPrintDEZ

		move.w	#22+9,Cursor(a6)
		move.l	y_pos(a6),d0
		bsr	MyPrintDEZ

		move.w	#22+18,Cursor(a6)
		move.l	z_pos(a6),d0
		bsr	MyPrintDEZ

		bra	into_loop
no_xyz:		btst	#9,d1
		beq	into_loop
		move.l	object_ptr(a6),d7
		addq.l	#4,d7
		cmp.l	#max_objekte,d7
		bne.s	cont_1
		moveq	#0,d7
cont_1:		clr.l	max_time(a6)
		move.l	d7,-(sp)
		moveq	#0,d7
go_loop:
		bsr	StartGPU
		bsr	swap
		addq.l	#4,d7
		add.l	d7,z_pos(a6)
		cmpi.l	#20000,z_pos(a6)
		blt.s	go_loop
		move.l	(sp)+,d0
		bra	again
******************
* chg_x_pos
chg_x_pos:	btst	#29,d0
		beq.s	chg_x_pos3	 ; nicht A =>
		move.l	d0,-(sp)	 ; joy retten
		swap	d0
		move.w	d0,d1

		and.w	#%0000000010010000,d0
		beq.s	chg_x_pos1
		addq.l	#4,x_pos(a6)
		bra.s	chg_x_pos2
chg_x_pos1:	and.w	#%0000000001100000,d1
		beq.s	chg_x_pos2
		subq.l	#4,x_pos(a6)
chg_x_pos2:	move.l  (sp)+,d0
chg_x_pos3:	rts
******************
* chg_y_pos
chg_y_pos:	btst	#25,d0
		beq.s	chg_y_pos3	 ; nicht B =>
		move.l	d0,-(sp)	 ; joy retten
		swap	d0
		move.w	d0,d1
		and.w	#%0000000010010000,d0
		beq.s	chg_y_pos1
		subq.l	#4,y_pos(a6)
		bra.s	chg_y_pos2
chg_y_pos1:	and.w	#%0000000001100000,d1
		beq.s	chg_y_pos2
		addq.l	#4,y_pos(a6)
chg_y_pos2:	move.l  (sp)+,d0
chg_y_pos3:	rts
******************
* chg_z_pos
chg_z_pos:	btst	#13,d0
		beq.s	chg_z_pos3	 ; nicht C =>
		move.l	d0,-(sp)	 ; joy retten
		swap	d0
		move.w	d0,d1
		and.w	#%0000000010010000,d0
		beq.s	chg_z_pos1
		addq.l	#8,z_pos(a6)
		bra.s	chg_z_pos2
chg_z_pos1:	and.w	#%0000000001100000,d1
		beq.s	chg_z_pos2
		subq.l	#8,z_pos(a6)
chg_z_pos2:	move.l  (sp)+,d0
chg_z_pos3:	rts
******************
* reset
reset:		move.w	#$1861,$00F00000
		move.l	$00E00004,-(sp)
		rts
******************

MyPrintDEZ::	moveq #" ",d1
		tst.l d0
		bpl.s ok1
		moveq #"-",d1
		neg.l d0
ok1:		move.l d0,-(sp)
		move.w d1,d0
		bsr PrintChar
		move.l (sp)+,d0
		bsr PrintDEZ
		rts

		.include "68k_inc/text_scr.inc"
		.include "68k_inc/joypad1.inc"
******************
* InitGPU
InitGPU:	lea	$00F02110,a0
		lea	GPUcode+4(pc),a1
		moveq	#0,d0
		move.l	d0,4(a0)	 ; GPU halt
		movea.l (a1)+,a2
		move.l	a2,(a0)
		move.l	(a1)+,d1	 ; Length in Bytes
		lsr.l	#2,d1
copy_gpu:	move.l	(a1)+,(a2)+
		dbra	d1,copy_gpu
		sub.l	#$00010000,d1
		bpl.s	copy_gpu
		move.l	#0<<11|1,d0
		move.l	d0,4(a0)
		rts
******************
* StartGPU
FLAG		= FACES-4
StartGPU:
		move.l  object_ptr(a6),d0
		lea	FACES,a0
		lea	faces_tab(pc),a1
		move.l	0(a1,d0.w),(a0)+
		move.l	_screen2(a6),(a0)+
		lea	vertices_tab(pc),a1
		move.l	0(a1,d0.w),(a0)+

		movem.l angle_x(a6),d0-d6
		movem.l d0-d6,(a0)

		lea	FLAG,a0
		subq.l	#1,(a0)
waitGPU:
		stop	#$2000	; wait for next interrupt
		tst.l	(a0)	; GPU done?
		bne.s	waitGPU
		rts
******************
* Init- und Hilfsroutine fuer den Bildschirm
* (c) 1994 Bastian Schick
**************************
* Bildschirm (low-level) *
**************************
* Objekt-Defs	*
NEXT_OBJ	 = 1

***************************************
* BitMap oder Scaled BitMap - Objekte *
***************************************
		RSRESET
		RSW obj_bm_type		; Type
		RSW obj_bm_l		 ; Groesse des Objektes (fuer MakeOBL)
		RSL obj_bm_data		; Data
		RSW obj_bm_x		 ; X
		RSW obj_bm_y		 ; Y pos in Halbzeilen
		RSW obj_bm_height	     ; Height ODER cc bei BRANCH OBJECT
		RSW obj_bm_link		; Abstand zum Naechsten Objekt in Objekten
		RSB obj_bm_bits		; Bits pro Pixel
		RSB obj_bm_pitch	     ; Pitch
		RSW obj_bm_dwidth	     ; Breite in Phrases
		RSW obj_bm_iwidth	     ; Bildbreite (sichtbar)
		RSB obj_bm_cindex	     ; Farb-Offset
		RSB obj_bm_flags	     ; Flags
		RSW obj_bm_firstpx	     ; FirstPixel
obj_bm_len	= RSCOUNT
		RSB obj_dummy1
		RSB obj_sc_rem
		RSB obj_sc_vscale
		RSB obj_sc_hscale	     ; Ergaenzungen fuer Scaled BitMap
obj_sc_len	= RSCOUNT

**************
* GPU-Object *
**************
		RSRESET
		RSW obj_gp_type
		RSW obj_gp_l		 ; Groesse des Objektes (fuer MakeOBL)
		RSL obj_gp_data1
		RSL obj_gp_data2
		RSW obj_gp_link

obj_gp_len	= RSCOUNT
*****************
* Branch-Object *
*****************
		RSRESET
		RSW obj_br_type
		RSW obj_br_l		 ; Groesse des Objektes (fuer MakeOBL)
		RSW obj_br_y
		RSW obj_br_cc		; Bedingung
		RSW obj_br_link,2
obj_br_len	= RSCOUNT


	macro BRA_OBJ y_pos,cc,dest
	dc.w 3,obj_br_len
	dc.w \y_pos	  ;; y
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
	dc.w \dest
	dc.w NEXT_OBJ
	endm

***************
* Stop-Object *
***************
		RSRESET
		RSW obj_st_type
		RSW obj_st_l
		RSW obj_st_int
		RSL obj_st_data1
		RSL obj_st_data2
obj_st_len	= RSCOUNT
*****************
*    MakeOBL	*
;;****************
;;    MakeOBL	 *
MakeOBL:
	movem.l d0-a4,-(sp)

	move.l	#$FF000000,d4

	lea	ob_list(a6),a0
	lea	ob_list(a6),a1

	lea	(a1),a4		 ;; save start
	moveq	#0,d7		 ;; object counter

	lea	Objekte(pc),a2	;; source
loop_mo:
	lea	(a2),a3		 ;; save current object
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
;; create Stop-Objekt
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

	move.l	a1,d3		 ;; current position
	move.w	(a2)+,d0	 ;; next object if CC true
	bpl.s	ok_bra_mo
	neg.w	d0
	move.l	a4,d3		 ;; else absolute
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
	move.w	(a2)+,d0	 ;; next object
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
	move.w	(a2)+,d0	 ;; next object
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

;; BitMap or Scaled BitMap
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
	or.l	d3,d1		 ;; height (14..23)

	move.w	(a2)+,d3	 ;; next Objekt
	lsl.w	#5,d3		 ;; * 32
	ext.l	d3
	add.l	a1,d3
	lsr.l	#3,d3
	ror.l	#8,d3
	move.l	d3,d2		 ;; save Link
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
	ext.l	d1		 ;; and (32..37)

	moveq	#$7f,d0
	and.b	(a2)+,d0
	lsl.w	#6,d0
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
;;		  move.b  d0,-8(a0)
;;		  move.b  d1,-9(a0)
;;		  move.b  d2,-10(a0)
;;		  clr.b   -11(a0)
	bra	loop_mo
exit_mo:
	move.l	#$affedead,(a0)+
	moveq	#4,d0
	move.l	d0,(a0)+

	addq.w	#1,d7
	move.w	d7,count_obj(a6)
	movem.l (sp)+,d0-a4
	rts
*****************
*    CopyOBL	*
CopyOBL:	movem.l d1/a0,-(sp)
		lea	ob_list(a6),a0
;>		lea	ob_list0(a6),a1
		move.w	count_obj(a6),d1
cobl:
		.rept 7
		move.l	(a1)+,(a0)+
		.endr
		dbra	d1,cobl
		movem.l (sp)+,d1/a0
		rts
*****************
*   videoinit	*
	.include "68k_inc/videoinit.inc"
*****************
*    InitOP	*
InitOP:
		bsr	MakeOBL
		bsr	CopyOBL

		lea	$00F00000,a0
		move.w a_vde(a6),d0
		addq.w #2,d0
		move.w d0,$4e(a0)
		lea	ob_list(a6),a1
		move.l	a1,d0
		swap	d0
		move.l	d0,$0020(a0)	 ; OPL = $10000
		move.l	#$1F03<<16,$00E0(a0)
		lea	my_irq(pc),a0
		move.l	a0,$00000100.w
		move	#$2000,sr
		rts
*****************
* Objekte
Objekte:
		BRA_OBJ 30,"<",-10		; y<30 => STOP
		BRA_OBJ 600,">",-10		 ; y>500 => STOP

* Text-Screen
		DC.W 0,obj_bm_len	 ; Type 0
		DC.L -TxtScreen
xy_text:	DC.W 14,70		 ; x,y
		DC.W max_y_txt		 ; Height
		DC.W NEXT_OBJ
		DC.B 0,1
		DC.W max_x_txt>>6,max_x_txt>>6 ; Dwidth,Iwidth
		DC.B $7f,0
		DC.W 0

screen1_type:
		DC.W 0,obj_bm_len
		DC.L screen1
xy_gra1:	DC.W 14,70+2*max_y_txt,max_y_gr
		DC.W NEXT_OBJ
 IF _8Bit = 1
		DC.B 3,1
		DC.W max_x*16>>7,max_x*16>>7
 ELSE
		DC.B 4,1
		DC.W max_x*16>>6,max_x*16>>6
 ENDIF
		DC.B 0,0
		DC.w 0


screen2_type:
		DC.W $ffff,obj_bm_len
		DC.L screen2
xy_gra2:	DC.W 14,70+2*max_y_txt,max_y_gr
		DC.W NEXT_OBJ
 IF _8Bit = 1
		DC.B 3,1
		DC.W max_x*16>>7,max_x*16>>7
 ELSE
		DC.B 4,1
		DC.W max_x*16>>6,max_x*16>>6
 ENDIF
		DC.B 0,0
		DC.w 0
*
		DC.W $AFFE
******************
* swap
swap:
	subq.w	#1,swap_flag(a6)
	stop	#$2000
	rts
******************
* IRQ
my_irq:		movem.l d0-d1/a0,-(sp)
		move.w	$00F000E0,d0
		btst	#0,d0
		beq.s	no_vi

		IF ^^defined MOD
		movem.l d0-a6,-(sp)
		bsr	PLAYER+28+4
		movem.l (sp)+,d0-a6
		ENDIF

		addq.w	#1,VI_count(a6)

		tst.w	swap_flag(a6)
		beq.s	no_swap
		lea	Objekte(pc),a0
		not.w	screen1_type-Objekte(a0)
		not.w	screen2_type-Objekte(a0)
		move.l	_screen1(a6),d1
		move.l	_screen2(a6),_screen1(a6)
		move.l	d1,_screen2(a6)
		clr.w	swap_flag(a6)
no_swap:
		bsr	MakeOBL

		bsr	GetJoyPad1
		move.l	joy_pad(a6),d1
		beq.s	no_key
		and.l	#$00010001,d1	 ; "#"+"*" =>
		cmp.l	#$00010001,d1
		beq	reset
		move.l	joy_pad(a6),d1
		btst	#28,d1		 ; PAUSE
		beq.s	no_key
		clr.l	max_time(a6)
		bra.s	cont_irq
no_key:
		addq.b	#1,angle_x+3(a6)
		addq.b	#1,angle_y+3(a6)
		addq.b	#1,angle_z+3(a6)
no_vi:
cont_irq:
		lsl.w	#8,d0
		or.w	#$0003,d0
		swap	d0
		move.l	d0,$00F000E0
		movem.l (sp)+,d0-d1/a0
		rte

******************
* text-data
Hallo:		DC.B "Cursor+A/B/C ---> Polygon-Test <--- PAUSE/OPTION",0
FaceTxt:	DC.B " faces/",0
PointsTxt:	DC.B " points",0
ms:		DC.B " ms/frame      X= 12345 Y= 12345 Z= 12345",0
		EVEN

******************
* InitObjekte
InitObjekte:	lea	faces_tab(pc),a0

		lea	faces_dia(pc),a1
		move.l	a1,(a0)+
		lea	faces_cube(pc),a1
		move.l	a1,(a0)+
		lea	faces_ball(pc),a1
		move.l	a1,(a0)+
		lea	faces_prisma(pc),a1
		move.l	a1,(a0)+
		lea	faces_kugel(pc),a1
		move.l	a1,(a0)+
		lea	faces_test(pc),a1
		move.l	a1,(a0)+
		lea	faces_robot(pc),a1
		move.l	a1,(a0)+
		lea	faces_tron(pc),a1
		move.l	a1,(a0)+

		lea	vertices_tab(pc),a0
		lea	vertices_dia(pc),a1
		move.l	a1,(a0)+
		lea	vertices_cube(pc),a1
		move.l	a1,(a0)+
		lea	vertices_ball(pc),a1
		move.l	a1,(a0)+
		lea	vertices_prisma(pc),a1
		move.l	a1,(a0)+
		lea	vertices_kugel(pc),a1
		move.l	a1,(a0)+
		lea	vertices_test(pc),a1
		move.l	a1,(a0)+
		lea	vertices_robot(pc),a1
		move.l	a1,(a0)+
		lea	vertices_tron(pc),a1
		move.l	a1,(a0)+

		rts
faces_tab:	DS.L max_objekte>>2
vertices_tab:	  DS.L max_objekte>>2

******************
* GPUcode
GPUcode:	.incbin "poly_mmu.o"

******************
	.phrase
		DC.L 0
******************
* diamant
vertices_dia:	  DC.L 20
		DC.W 0,$0000,$0000,-60,0,$0064,$0000,$0000,0,$005E,$0022,$0000,0,$004D,$0040,$0000
		DC.W 0,$0032,$0057,$0000,0,$0011,$0062,$0000,0,$FFEF,$0062,$0000,0,$FFCE,$0057,$0000
		DC.W 0,$FFB3,$0040,$0000,0,$FFA2,$0022,$0000,0,$FF9C,$0000,$0000,0,$FFA2,$FFDE,$0000
		DC.W 0,$FFB3,$FFC0,$0000,0,$FFCE,$FFA9,$0000,0,$FFEF,$FF9E,$0000,0,$0011,$FF9E,$0000
		DC.W 0,$0032,$FFA9,$0000,0,$004D,$FFC0,$0000,0,$005E,$FFDE,$0000,0,$0000,$0000,60
faces_dia:	DC.L 0*4,2*4,1*4,0*4,-1
		DC.L 0*4,3*4,2*4,0*4,-1
		DC.L 0*4,4*4,3*4,0*4,-1
		DC.L 0*4,5*4,4*4,0*4,-1
		DC.L 0*4,6*4,5*4,0*4,-1
		DC.L 0*4,7*4,6*4,0*4,-1
		DC.L 0*4,8*4,7*4,0*4,-1
		DC.L 0*4,9*4,8*4,0*4,-1
		DC.L 0*4,10*4,9*4,0*4,-1
		DC.L 0*4,11*4,10*4,0*4,-1
		DC.L 0*4,12*4,11*4,0*4,-1
		DC.L 0*4,13*4,12*4,0*4,-1
		DC.L 0*4,14*4,13*4,0*4,-1
		DC.L 0*4,15*4,14*4,0*4,-1
		DC.L 0*4,16*4,15*4,0*4,-1
		DC.L 0*4,17*4,16*4,0*4,-1
		DC.L 0*4,18*4,17*4,0*4,-1
		DC.L 0*4,1*4,18*4,0*4,-1
		DC.L 1*4,2*4,19*4,1*4,-1
		DC.L 2*4,3*4,19*4,2*4,-1
		DC.L 3*4,4*4,19*4,3*4,-1
		DC.L 4*4,5*4,19*4,4*4,-1
		DC.L 5*4,6*4,19*4,5*4,-1
		DC.L 6*4,7*4,19*4,6*4,-1
		DC.L 7*4,8*4,19*4,7*4,-1
		DC.L 8*4,9*4,19*4,8*4,-1
		DC.L 9*4,10*4,19*4,9*4,-1
		DC.L 10*4,11*4,19*4,10*4,-1
		DC.L 11*4,12*4,19*4,11*4,-1
		DC.L 12*4,13*4,19*4,12*4,-1
		DC.L 13*4,14*4,19*4,13*4,-1
		DC.L 14*4,15*4,19*4,14*4,-1
		DC.L 15*4,16*4,19*4,15*4,-1
		DC.L 16*4,17*4,19*4,16*4,-1
		DC.L 17*4,18*4,19*4,17*4,-1
		DC.L 18*4,1*4,19*4,18*4,-1
		DC.L -1
******************
		.phrase
		dc.l 0
******************
* ball
vertices_ball:	  DC.L 42
		DC.W 0,$0000,$0000,$FFBA,0,$0029,$0000,$FFC7,0,$0021,$0018,$FFC7,0,$000D,$0027,$FFC7
		DC.W 0,$FFF3,$0027,$FFC7,0,$FFDF,$0018,$FFC7,0,$FFD7,$0000,$FFC7,0,$FFDF,$FFE8,$FFC7
		DC.W 0,$FFF3,$FFD9,$FFC7,0,$000D,$FFD9,$FFC7,0,$0021,$FFE8,$FFC7,0,$0043,$0000,$FFEA
		DC.W 0,$0036,$0027,$FFEA,0,$0015,$003F,$FFEA,0,$FFEB,$003F,$FFEA,0,$FFCA,$0027,$FFEA
		DC.W 0,$FFBD,$0000,$FFEA,0,$FFCA,$FFD9,$FFEA,0,$FFEB,$FFC1,$FFEA,0,$0015,$FFC1,$FFEA
		DC.W 0,$0036,$FFD9,$FFEA,0,$0043,$0000,$0016,0,$0036,$0027,$0016,0,$0015,$003F,$0016
		DC.W 0,$FFEB,$003F,$0016,0,$FFCA,$0027,$0016,0,$FFBD,$0000,$0016,0,$FFCA,$FFD9,$0016
		DC.W 0,$FFEB,$FFC1,$0016,0,$0015,$FFC1,$0016,0,$0036,$FFD9,$0016,0,$0029,$0000,$0039
		DC.W 0,$0021,$0018,$0039,0,$000D,$0027,$0039,0,$FFF3,$0027,$0039,0,$FFDF,$0018,$0039
		DC.W 0,$FFD7,$0000,$0039,0,$FFDF,$FFE8,$0039,0,$FFF3,$FFD9,$0039,0,$000D,$FFD9,$0039
		DC.W 0,$0021,$FFE8,$0039,0,$0000,$0000,$0046
faces_ball:	DC.L 0*4,2*4,1*4,0*4,-1
		DC.L 0*4,3*4,2*4,0*4,-1
		DC.L 0*4,4*4,3*4,0*4,-1
		DC.L 0*4,5*4,4*4,0*4,-1
		DC.L 0*4,6*4,5*4,0*4,-1
		DC.L 0*4,7*4,6*4,0*4,-1
		DC.L 0*4,8*4,7*4,0*4,-1
		DC.L 0*4,9*4,8*4,0*4,-1
		DC.L 0*4,10*4,9*4,0*4,-1
		DC.L 0*4,1*4,10*4,0*4,-1
		DC.L 1*4,2*4,12*4,11*4,1*4,-1
		DC.L 2*4,3*4,13*4,12*4,2*4,-1
		DC.L 3*4,4*4,14*4,13*4,3*4,-1
		DC.L 4*4,5*4,15*4,14*4,4*4,-1
		DC.L 5*4,6*4,16*4,15*4,5*4,-1
		DC.L 6*4,7*4,17*4,16*4,6*4,-1
		DC.L 7*4,8*4,18*4,17*4,7*4,-1
		DC.L 8*4,9*4,19*4,18*4,8*4,-1
		DC.L 9*4,10*4,20*4,19*4,9*4,-1
		DC.L 10*4,1*4,11*4,20*4,10*4,-1
		DC.L 11*4,12*4,22*4,21*4,11*4,-1
		DC.L 12*4,13*4,23*4,22*4,12*4,-1
		DC.L 13*4,14*4,24*4,23*4,13*4,-1
		DC.L 14*4,15*4,25*4,24*4,14*4,-1
		DC.L 15*4,16*4,26*4,25*4,15*4,-1
		DC.L 16*4,17*4,27*4,26*4,16*4,-1
		DC.L 17*4,18*4,28*4,27*4,17*4,-1
		DC.L 18*4,19*4,29*4,28*4,18*4,-1
		DC.L 19*4,20*4,30*4,29*4,19*4,-1
		DC.L 20*4,11*4,21*4,30*4,20*4,-1
		DC.L 21*4,22*4,32*4,31*4,21*4,-1
		DC.L 22*4,23*4,33*4,32*4,22*4,-1
		DC.L 23*4,24*4,34*4,33*4,23*4,-1
		DC.L 24*4,25*4,35*4,34*4,24*4,-1
		DC.L 25*4,26*4,36*4,35*4,25*4,-1
		DC.L 26*4,27*4,37*4,36*4,26*4,-1
		DC.L 27*4,28*4,38*4,37*4,27*4,-1
		DC.L 28*4,29*4,39*4,38*4,28*4,-1
		DC.L 29*4,30*4,40*4,39*4,29*4,-1
		DC.L 30*4,21*4,31*4,40*4,30*4,-1
		DC.L 31*4,32*4,41*4,31*4,-1
		DC.L 32*4,33*4,41*4,32*4,-1
		DC.L 33*4,34*4,41*4,33*4,-1
		DC.L 34*4,35*4,41*4,34*4,-1
		DC.L 35*4,36*4,41*4,35*4,-1
		DC.L 36*4,37*4,41*4,36*4,-1
		DC.L 37*4,38*4,41*4,37*4,-1
		DC.L 38*4,39*4,41*4,38*4,-1
		DC.L 39*4,40*4,41*4,39*4,-1
		DC.L 40*4,31*4,41*4,40*4,-1
		DC.L -1
******************
		.phrase
		dc.l 0
******************
* prisma
vertices_prisma:    DC.L 5
		DC.W 0,0,0,-160
		DC.W 0,160,0,0		 ; spitze
		DC.W 0,-30,49,0
		DC.W 0,-30,-80,0
		DC.W 0,0,0,160

faces_prisma:	DC.L 0*4,2*4,1*4,0*4,-1
		DC.L 0*4,3*4,2*4,0*4,-1
		DC.L 0*4,1*4,3*4,0*4,-1
		DC.L 1*4,2*4,4*4,1*4,-1
		DC.L 2*4,3*4,4*4,2*4,-1
		DC.L 3*4,1*4,4*4,3*4,-1
		DC.L -1
******************
		.phrase
		dc.l 0
******************
* test
vertices_test:	  DC.L 18
		DC.W 0,$0000,$0000,$FF9C,0,$0057,$0000,$FFCE,0,$003D,$003D,$FFCE,0,$0000,$0057,$FFCE
		DC.W 0,$FFC3,$003D,$FFCE,0,$FFA9,$0000,$FFCE,0,$FFC3,$FFC3,$FFCE,0,$0000,$FFA9,$FFCE
		DC.W 0,$003D,$FFC3,$FFCE,0,$0057,$0000,$0032,0,$003D,$003D,$0032,0,$0000,$0057,$0032
		DC.W 0,$FFC3,$003D,$0032,0,$FFA9,$0000,$0032,0,$FFC3,$FFC3,$0032,0,$0000,$FFA9,$0032
		DC.W 0,$003D,$FFC3,$0032,0,$0000,$0000,$0064*2
faces_test:	DC.L 0*4,2*4,1*4,0*4,-1
		DC.L 0*4,3*4,2*4,0*4,-1
		DC.L 0*4,4*4,3*4,0*4,-1
		DC.L 0*4,5*4,4*4,0*4,-1
		DC.L 0*4,6*4,5*4,0*4,-1
		DC.L 0*4,7*4,6*4,0*4,-1
		DC.L 0*4,8*4,7*4,0*4,-1
		DC.L 0*4,1*4,8*4,0*4,-1
		DC.L 1*4,2*4,10*4,9*4,1*4,-1
		DC.L 2*4,3*4,11*4,10*4,2*4,-1
		DC.L 3*4,4*4,12*4,11*4,3*4,-1
		DC.L 4*4,5*4,13*4,12*4,4*4,-1
		DC.L 5*4,6*4,14*4,13*4,5*4,-1
		DC.L 6*4,7*4,15*4,14*4,6*4,-1
		DC.L 7*4,8*4,16*4,15*4,7*4,-1
		DC.L 8*4,1*4,9*4,16*4,8*4,-1
		DC.L 9*4,10*4,17*4,9*4,-1
		DC.L 10*4,11*4,17*4,10*4,-1
		DC.L 11*4,12*4,17*4,11*4,-1
		DC.L 12*4,13*4,17*4,12*4,-1
		DC.L 13*4,14*4,17*4,13*4,-1
		DC.L 14*4,15*4,17*4,14*4,-1
		DC.L 15*4,16*4,17*4,15*4,-1
		DC.L 16*4,9*4,17*4,16*4,-1
		DC.L -1
******************
		.phrase
		dc.l 0
******************
* kugel
vertices_kugel:	  DC.L 134
		DC.W 0,$0000,$0000,$FF9C,0,$001A,$0000,$FF9F,0,$0016,$000D,$FF9F,0,$000D,$0016,$FF9F
		DC.W 0,$0000,$001A,$FF9F,0,$FFF3,$0016,$FF9F,0,$FFEA,$000D,$FF9F,0,$FFE6,$0000,$FF9F
		DC.W 0,$FFEA,$FFF3,$FF9F,0,$FFF3,$FFEA,$FF9F,0,$0000,$FFE6,$FF9F,0,$000D,$FFEA,$FF9F
		DC.W 0,$0016,$FFF3,$FF9F,0,$0032,$0000,$FFA9,0,$002B,$0019,$FFA9,0,$0019,$002B,$FFA9
		DC.W 0,$0000,$0032,$FFA9,0,$FFE7,$002B,$FFA9,0,$FFD5,$0019,$FFA9,0,$FFCE,$0000,$FFA9
		DC.W 0,$FFD5,$FFE7,$FFA9,0,$FFE7,$FFD5,$FFA9,0,$0000,$FFCE,$FFA9,0,$0019,$FFD5,$FFA9
		DC.W 0,$002B,$FFE7,$FFA9,0,$0047,$0000,$FFB9,0,$003D,$0023,$FFB9,0,$0023,$003D,$FFB9
		DC.W 0,$0000,$0047,$FFB9,0,$FFDD,$003D,$FFB9,0,$FFC3,$0023,$FFB9,0,$FFB9,$0000,$FFB9
		DC.W 0,$FFC3,$FFDD,$FFB9,0,$FFDD,$FFC3,$FFB9,0,$0000,$FFB9,$FFB9,0,$0023,$FFC3,$FFB9
		DC.W 0,$003D,$FFDD,$FFB9,0,$0057,$0000,$FFCE,0,$004B,$002B,$FFCE,0,$002B,$004B,$FFCE
		DC.W 0,$0000,$0057,$FFCE,0,$FFD5,$004B,$FFCE,0,$FFB5,$002B,$FFCE,0,$FFA9,$0000,$FFCE
		DC.W 0,$FFB5,$FFD5,$FFCE,0,$FFD5,$FFB5,$FFCE,0,$0000,$FFA9,$FFCE,0,$002B,$FFB5,$FFCE
		DC.W 0,$004B,$FFD5,$FFCE,0,$0061,$0000,$FFE6,0,$0054,$0030,$FFE6,0,$0030,$0054,$FFE6
		DC.W 0,$0000,$0061,$FFE6,0,$FFD0,$0054,$FFE6,0,$FFAC,$0030,$FFE6,0,$FF9F,$0000,$FFE6
		DC.W 0,$FFAC,$FFD0,$FFE6,0,$FFD0,$FFAC,$FFE6,0,$0000,$FF9F,$FFE6,0,$0030,$FFAC,$FFE6
		DC.W 0,$0054,$FFD0,$FFE6,0,$0064,$0000,$0000,0,$0057,$0032,$0000,0,$0032,$0057,$0000
		DC.W 0,$0000,$0064,$0000,0,$FFCE,$0057,$0000,0,$FFA9,$0032,$0000,0,$FF9C,$0000,$0000
		DC.W 0,$FFA9,$FFCE,$0000,0,$FFCE,$FFA9,$0000,0,$0000,$FF9C,$0000,0,$0032,$FFA9,$0000
		DC.W 0,$0057,$FFCE,$0000,0,$0061,$0000,$001A,0,$0054,$0030,$001A,0,$0030,$0054,$001A
		DC.W 0,$0000,$0061,$001A,0,$FFD0,$0054,$001A,0,$FFAC,$0030,$001A,0,$FF9F,$0000,$001A
		DC.W 0,$FFAC,$FFD0,$001A,0,$FFD0,$FFAC,$001A,0,$0000,$FF9F,$001A,0,$0030,$FFAC,$001A
		DC.W 0,$0054,$FFD0,$001A,0,$0057,$0000,$0032,0,$004B,$002B,$0032,0,$002B,$004B,$0032
		DC.W 0,$0000,$0057,$0032,0,$FFD5,$004B,$0032,0,$FFB5,$002B,$0032,0,$FFA9,$0000,$0032
		DC.W 0,$FFB5,$FFD5,$0032,0,$FFD5,$FFB5,$0032,0,$0000,$FFA9,$0032,0,$002B,$FFB5,$0032
		DC.W 0,$004B,$FFD5,$0032,0,$0047,$0000,$0047,0,$003D,$0023,$0047,0,$0023,$003D,$0047
		DC.W 0,$0000,$0047,$0047,0,$FFDD,$003D,$0047,0,$FFC3,$0023,$0047,0,$FFB9,$0000,$0047
		DC.W 0,$FFC3,$FFDD,$0047,0,$FFDD,$FFC3,$0047,0,$0000,$FFB9,$0047,0,$0023,$FFC3,$0047
		DC.W 0,$003D,$FFDD,$0047,0,$0032,$0000,$0057,0,$002B,$0019,$0057,0,$0019,$002B,$0057
		DC.W 0,$0000,$0032,$0057,0,$FFE7,$002B,$0057,0,$FFD5,$0019,$0057,0,$FFCE,$0000,$0057
		DC.W 0,$FFD5,$FFE7,$0057,0,$FFE7,$FFD5,$0057,0,$0000,$FFCE,$0057,0,$0019,$FFD5,$0057
		DC.W 0,$002B,$FFE7,$0057,0,$001A,$0000,$0061,0,$0016,$000D,$0061,0,$000D,$0016,$0061
		DC.W 0,$0000,$001A,$0061,0,$FFF3,$0016,$0061,0,$FFEA,$000D,$0061,0,$FFE6,$0000,$0061
		DC.W 0,$FFEA,$FFF3,$0061,0,$FFF3,$FFEA,$0061,0,$0000,$FFE6,$0061,0,$000D,$FFEA,$0061
		DC.W 0,$0016,$FFF3,$0061,0,$0000,$0000,$0064
faces_kugel:	DC.L 0*4,2*4,1*4,0*4,-1
		DC.L 0*4,3*4,2*4,0*4,-1
		DC.L 0*4,4*4,3*4,0*4,-1
		DC.L 0*4,5*4,4*4,0*4,-1
		DC.L 0*4,6*4,5*4,0*4,-1
		DC.L 0*4,7*4,6*4,0*4,-1
		DC.L 0*4,8*4,7*4,0*4,-1
		DC.L 0*4,9*4,8*4,0*4,-1
		DC.L 0*4,10*4,9*4,0*4,-1
		DC.L 0*4,11*4,10*4,0*4,-1
		DC.L 0*4,12*4,11*4,0*4,-1
		DC.L 0*4,1*4,12*4,0*4,-1
		DC.L 1*4,2*4,14*4,13*4,1*4,-1
		DC.L 2*4,3*4,15*4,14*4,2*4,-1
		DC.L 3*4,4*4,16*4,15*4,3*4,-1
		DC.L 4*4,5*4,17*4,16*4,4*4,-1
		DC.L 5*4,6*4,18*4,17*4,5*4,-1
		DC.L 6*4,7*4,19*4,18*4,6*4,-1
		DC.L 7*4,8*4,20*4,19*4,7*4,-1
		DC.L 8*4,9*4,21*4,20*4,8*4,-1
		DC.L 9*4,10*4,22*4,21*4,9*4,-1
		DC.L 10*4,11*4,23*4,22*4,10*4,-1
		DC.L 11*4,12*4,24*4,23*4,11*4,-1
		DC.L 12*4,1*4,13*4,24*4,12*4,-1
		DC.L 13*4,14*4,26*4,25*4,13*4,-1
		DC.L 14*4,15*4,27*4,26*4,14*4,-1
		DC.L 15*4,16*4,28*4,27*4,15*4,-1
		DC.L 16*4,17*4,29*4,28*4,16*4,-1
		DC.L 17*4,18*4,30*4,29*4,17*4,-1
		DC.L 18*4,19*4,31*4,30*4,18*4,-1
		DC.L 19*4,20*4,32*4,31*4,19*4,-1
		DC.L 20*4,21*4,33*4,32*4,20*4,-1
		DC.L 21*4,22*4,34*4,33*4,21*4,-1
		DC.L 22*4,23*4,35*4,34*4,22*4,-1
		DC.L 23*4,24*4,36*4,35*4,23*4,-1
		DC.L 24*4,13*4,25*4,36*4,24*4,-1
		DC.L 25*4,26*4,38*4,37*4,25*4,-1
		DC.L 26*4,27*4,39*4,38*4,26*4,-1
		DC.L 27*4,28*4,40*4,39*4,27*4,-1
		DC.L 28*4,29*4,41*4,40*4,28*4,-1
		DC.L 29*4,30*4,42*4,41*4,29*4,-1
		DC.L 30*4,31*4,43*4,42*4,30*4,-1
		DC.L 31*4,32*4,44*4,43*4,31*4,-1
		DC.L 32*4,33*4,45*4,44*4,32*4,-1
		DC.L 33*4,34*4,46*4,45*4,33*4,-1
		DC.L 34*4,35*4,47*4,46*4,34*4,-1
		DC.L 35*4,36*4,48*4,47*4,35*4,-1
		DC.L 36*4,25*4,37*4,48*4,36*4,-1
		DC.L 37*4,38*4,50*4,49*4,37*4,-1
		DC.L 38*4,39*4,51*4,50*4,38*4,-1
		DC.L 39*4,40*4,52*4,51*4,39*4,-1
		DC.L 40*4,41*4,53*4,52*4,40*4,-1
		DC.L 41*4,42*4,54*4,53*4,41*4,-1
		DC.L 42*4,43*4,55*4,54*4,42*4,-1
		DC.L 43*4,44*4,56*4,55*4,43*4,-1
		DC.L 44*4,45*4,57*4,56*4,44*4,-1
		DC.L 45*4,46*4,58*4,57*4,45*4,-1
		DC.L 46*4,47*4,59*4,58*4,46*4,-1
		DC.L 47*4,48*4,60*4,59*4,47*4,-1
		DC.L 48*4,37*4,49*4,60*4,48*4,-1
		DC.L 49*4,50*4,62*4,61*4,49*4,-1
		DC.L 50*4,51*4,63*4,62*4,50*4,-1
		DC.L 51*4,52*4,64*4,63*4,51*4,-1
		DC.L 52*4,53*4,65*4,64*4,52*4,-1
		DC.L 53*4,54*4,66*4,65*4,53*4,-1
		DC.L 54*4,55*4,67*4,66*4,54*4,-1
		DC.L 55*4,56*4,68*4,67*4,55*4,-1
		DC.L 56*4,57*4,69*4,68*4,56*4,-1
		DC.L 57*4,58*4,70*4,69*4,57*4,-1
		DC.L 58*4,59*4,71*4,70*4,58*4,-1
		DC.L 59*4,60*4,72*4,71*4,59*4,-1
		DC.L 60*4,49*4,61*4,72*4,60*4,-1
		DC.L 61*4,62*4,74*4,73*4,61*4,-1
		DC.L 62*4,63*4,75*4,74*4,62*4,-1
		DC.L 63*4,64*4,76*4,75*4,63*4,-1
		DC.L 64*4,65*4,77*4,76*4,64*4,-1
		DC.L 65*4,66*4,78*4,77*4,65*4,-1
		DC.L 66*4,67*4,79*4,78*4,66*4,-1
		DC.L 67*4,68*4,80*4,79*4,67*4,-1
		DC.L 68*4,69*4,81*4,80*4,68*4,-1
		DC.L 69*4,70*4,82*4,81*4,69*4,-1
		DC.L 70*4,71*4,83*4,82*4,70*4,-1
		DC.L 71*4,72*4,84*4,83*4,71*4,-1
		DC.L 72*4,61*4,73*4,84*4,72*4,-1
		DC.L 73*4,74*4,86*4,85*4,73*4,-1
		DC.L 74*4,75*4,87*4,86*4,74*4,-1
		DC.L 75*4,76*4,88*4,87*4,75*4,-1
		DC.L 76*4,77*4,89*4,88*4,76*4,-1
		DC.L 77*4,78*4,90*4,89*4,77*4,-1
		DC.L 78*4,79*4,91*4,90*4,78*4,-1
		DC.L 79*4,80*4,92*4,91*4,79*4,-1
		DC.L 80*4,81*4,93*4,92*4,80*4,-1
		DC.L 81*4,82*4,94*4,93*4,81*4,-1
		DC.L 82*4,83*4,95*4,94*4,82*4,-1
		DC.L 83*4,84*4,96*4,95*4,83*4,-1
		DC.L 84*4,73*4,85*4,96*4,84*4,-1
		DC.L 85*4,86*4,98*4,97*4,85*4,-1
		DC.L 86*4,87*4,99*4,98*4,86*4,-1
		DC.L 87*4,88*4,100*4,99*4,87*4,-1
		DC.L 88*4,89*4,101*4,100*4,88*4,-1
		DC.L 89*4,90*4,102*4,101*4,89*4,-1
		DC.L 90*4,91*4,103*4,102*4,90*4,-1
		DC.L 91*4,92*4,104*4,103*4,91*4,-1
		DC.L 92*4,93*4,105*4,104*4,92*4,-1
		DC.L 93*4,94*4,106*4,105*4,93*4,-1
		DC.L 94*4,95*4,107*4,106*4,94*4,-1
		DC.L 95*4,96*4,108*4,107*4,95*4,-1
		DC.L 96*4,85*4,97*4,108*4,96*4,-1
		DC.L 97*4,98*4,110*4,109*4,97*4,-1
		DC.L 98*4,99*4,111*4,110*4,98*4,-1
		DC.L 99*4,100*4,112*4,111*4,99*4,-1
		DC.L 100*4,101*4,113*4,112*4,100*4,-1
		DC.L 101*4,102*4,114*4,113*4,101*4,-1
		DC.L 102*4,103*4,115*4,114*4,102*4,-1
		DC.L 103*4,104*4,116*4,115*4,103*4,-1
		DC.L 104*4,105*4,117*4,116*4,104*4,-1
		DC.L 105*4,106*4,118*4,117*4,105*4,-1
		DC.L 106*4,107*4,119*4,118*4,106*4,-1
		DC.L 107*4,108*4,120*4,119*4,107*4,-1
		DC.L 108*4,97*4,109*4,120*4,108*4,-1
		DC.L 109*4,110*4,122*4,121*4,109*4,-1
		DC.L 110*4,111*4,123*4,122*4,110*4,-1
		DC.L 111*4,112*4,124*4,123*4,111*4,-1
		DC.L 112*4,113*4,125*4,124*4,112*4,-1
		DC.L 113*4,114*4,126*4,125*4,113*4,-1
		DC.L 114*4,115*4,127*4,126*4,114*4,-1
		DC.L 115*4,116*4,128*4,127*4,115*4,-1
		DC.L 116*4,117*4,129*4,128*4,116*4,-1
		DC.L 117*4,118*4,130*4,129*4,117*4,-1
		DC.L 118*4,119*4,131*4,130*4,118*4,-1
		DC.L 119*4,120*4,132*4,131*4,119*4,-1
		DC.L 120*4,109*4,121*4,132*4,120*4,-1
		DC.L 121*4,122*4,133*4,121*4,-1
		DC.L 122*4,123*4,133*4,122*4,-1
		DC.L 123*4,124*4,133*4,123*4,-1
		DC.L 124*4,125*4,133*4,124*4,-1
		DC.L 125*4,126*4,133*4,125*4,-1
		DC.L 126*4,127*4,133*4,126*4,-1
		DC.L 127*4,128*4,133*4,127*4,-1
		DC.L 128*4,129*4,133*4,128*4,-1
		DC.L 129*4,130*4,133*4,129*4,-1
		DC.L 130*4,131*4,133*4,130*4,-1
		DC.L 131*4,132*4,133*4,131*4,-1
		DC.L 132*4,121*4,133*4,132*4,-1
		DC.L -1
******************
		.phrase
		dc.l 0
******************
* CUBE
vertices_cube:	DC.L 8
		DC.W 0,-50,-50,-50
		DC.W 0,50,-50,-50
		DC.W 0,50,-50,50
		DC.W 0,-50,-50,50
		DC.W 0,-50,50,-50
		DC.W 0,50,50,-50
		DC.W 0,50,50,50
		DC.W 0,-50,50,50

faces_cube:
		DC.L 0*4,1*4,5*4,4*4,0*4,-1
		DC.L 1*4,2*4,6*4,5*4,1*4,-1
		DC.L 2*4,3*4,7*4,6*4,2*4,-1
		DC.L 3*4,0*4,4*4,7*4,3*4,-1
		DC.L 3*4,2*4,1*4,0*4,3*4,-1
		DC.L 4*4,5*4,6*4,7*4,4*4,-1
		DC.L -1

		DC.L 0*4,1*4,5*4,4*4,-1	 ;0*4,-1
		DC.L 1*4,2*4,6*4,5*4,-1	 ;1*4,-1
		DC.L 2*4,3*4,7*4,6*4,-1	 ;2*4,-1
		DC.L 3*4,0*4,4*4,7*4,-1	 ;3*4,-1
		DC.L 3*4,2*4,1*4,0*4,-1	 ;3*4,-1
		DC.L 4*4,5*4,6*4,7*4,-1	 ;4*4,-1
		DC.L -1
******************
		.phrase
		DC.L 0
******************
* robot
vertices_robot:	DC.L 84
		DC.W 0,$FFFF,$0002,$0006,0,$0001,$0002,$0006,0,$FFFF,$FFFD,$0006,0,$0001,$FFFD,$0006
		DC.W 0,$FFFF,$FFFF,$0006,0,$0001,$FFFF,$0006,0,$FFFC,$FFFD,$0005,0,$0004,$FFFD,$0005
		DC.W 0,$FFFF,$FFFD,$0005,0,$0001,$FFFD,$0005,0,$FFFC,$FFFF,$0005,0,$0004,$FFFF,$0005
		DC.W 0,$FFFF,$FFFF,$0005,0,$0001,$FFFF,$0005,0,$FFFC,$0000,$0005,0,$0004,$0000,$0005
		DC.W 0,$FFFF,$0000,$0005,0,$0001,$0000,$0005,0,$FFFF,$0002,$0005,0,$0001,$0002,$0005
		DC.W 0,$FFFC,$0007,$0005,0,$0004,$0007,$0005,0,$FFFB,$FFFF,$0004,0,$0005,$FFFF,$0004
		DC.W 0,$FFFF,$FFFF,$0004,0,$0001,$FFFF,$0004,0,$FFFB,$0000,$0004,0,$0005,$0000,$0004
		DC.W 0,$FFFF,$0000,$0004,0,$0001,$0000,$0004,0,$FFFF,$FFF9,$0003,0,$0001,$FFF9,$0003
		DC.W 0,$FFFC,$FFFA,$0003,0,$0004,$FFFA,$0003,0,$FFFF,$FFFA,$0003,0,$0001,$FFFA,$0003
		DC.W 0,$FFFA,$FFFD,$0003,0,$0006,$FFFD,$0003,0,$FFFA,$0004,$0003,0,$0006,$0004,$0003
		DC.W 0,$FFFF,$FFF9,$FFFD,0,$0001,$FFF9,$FFFD,0,$FFFC,$FFFA,$FFFD,0,$0004,$FFFA,$FFFD
		DC.W 0,$FFFF,$FFFA,$FFFD,0,$0001,$FFFA,$FFFD,0,$FFFA,$FFFD,$FFFD,0,$0006,$FFFD,$FFFD
		DC.W 0,$FFFA,$0004,$FFFD,0,$0006,$0004,$FFFD,0,$FFFC,$0007,$FFFD,0,$0004,$0007,$FFFD
		DC.W 0,$FFFC,$FFFD,$FFFA,0,$0004,$FFFD,$FFFA,0,$FFFF,$FFFD,$FFFA,0,$0001,$FFFD,$FFFA
		DC.W 0,$FFFC,$0004,$FFFA,0,$0004,$0004,$FFFA,0,$FFFF,$0004,$FFFA,0,$0001,$0004,$FFFA
		DC.W 0,$FFFF,$FFFD,$FFFA,0,$0001,$FFFD,$FFFA,0,$FFFF,$0003,$FFFA,0,$0001,$0003,$FFFA
		DC.W 0,$FFFD,$0004,$0005,0,$0003,$0004,$0005,0,$FFFF,$0005,$0005,0,$0001,$0005,$0005
		DC.W 0,$FFFA,$FFFF,$0001,0,$0006,$FFFF,$0001,0,$FFFA,$0001,$0001,0,$0006,$0001,$0001
		DC.W 0,$FFFA,$FFFF,$0000,0,$0006,$FFFF,$0000,0,$FFFA,$0001,$0000,0,$0006,$0001,$0000
		DC.W 0,$FFFA,$FFFF,$FFFF,0,$0006,$FFFF,$FFFF,0,$FFFA,$0001,$FFFF,0,$0006,$0001,$FFFF
		DC.W 0,$FFFA,$FFFF,$FFFE,0,$0006,$FFFF,$FFFE,0,$FFFA,$0001,$FFFE,0,$0006,$0001,$FFFE
faces_robot:	DC.L 59*4,63*4,62*4,58*4,59*4,-1
		DC.L 55*4,59*4,57*4,53*4,55*4,-1
		DC.L 56*4,58*4,54*4,52*4,56*4,-1
		DC.L 63*4,59*4,55*4,61*4,63*4,-1
		DC.L 54*4,58*4,62*4,60*4,54*4,-1
		DC.L 62*4,63*4,61*4,60*4,62*4,-1
		DC.L 51*4,57*4,56*4,50*4,51*4,-1
		DC.L 57*4,51*4,49*4,57*4,-1
		DC.L 50*4,56*4,48*4,50*4,-1
		DC.L 53*4,57*4,49*4,47*4,53*4,-1
		DC.L 48*4,56*4,52*4,46*4,48*4,-1
		DC.L 53*4,47*4,43*4,53*4,-1
		DC.L 46*4,52*4,42*4,46*4,-1
		DC.L 45*4,55*4,53*4,43*4,45*4,-1
		DC.L 52*4,54*4,44*4,42*4,52*4,-1
		DC.L 61*4,55*4,45*4,41*4,61*4,-1
		DC.L 44*4,54*4,60*4,40*4,44*4,-1
		DC.L 60*4,61*4,41*4,40*4,60*4,-1
		DC.L 21*4,51*4,50*4,20*4,21*4,-1
		DC.L 39*4,49*4,51*4,21*4,39*4,-1
		DC.L 50*4,48*4,38*4,20*4,50*4,-1
		DC.L 47*4,49*4,39*4,37*4,47*4,-1
		DC.L 38*4,48*4,46*4,36*4,38*4,-1
		DC.L 43*4,47*4,37*4,33*4,43*4,-1
		DC.L 36*4,46*4,42*4,32*4,36*4,-1
		DC.L 35*4,45*4,43*4,33*4,35*4,-1
		DC.L 42*4,44*4,34*4,32*4,42*4,-1
		DC.L 41*4,45*4,35*4,31*4,41*4,-1
		DC.L 34*4,44*4,40*4,30*4,34*4,-1
		DC.L 40*4,41*4,31*4,30*4,40*4,-1
		DC.L 27*4,39*4,21*4,15*4,27*4,-1
		DC.L 20*4,38*4,26*4,14*4,20*4,-1
		DC.L 37*4,39*4,27*4,23*4,37*4,-1
		DC.L 26*4,38*4,36*4,22*4,26*4,-1
		DC.L 37*4,23*4,11*4,7*4,37*4,-1
		DC.L 10*4,22*4,36*4,6*4,10*4,-1
		DC.L 33*4,37*4,7*4,33*4,-1
		DC.L 36*4,32*4,6*4,36*4,-1
		DC.L 9*4,35*4,33*4,7*4,9*4,-1
		DC.L 32*4,34*4,8*4,6*4,32*4,-1
		DC.L 31*4,35*4,9*4,3*4,31*4,-1
		DC.L 4*4,12*4,8*4,2*4,4*4,-1
		DC.L 30*4,31*4,3*4,2*4,30*4,-1
		DC.L 18*4,21*4,20*4,14*4,18*4,-1
		DC.L 19*4,17*4,15*4,19*4,-1
		DC.L 16*4,18*4,14*4,16*4,-1
		DC.L 17*4,29*4,27*4,15*4,17*4,-1
		DC.L 26*4,28*4,16*4,14*4,26*4,-1
		DC.L 27*4,29*4,25*4,23*4,27*4,-1
		DC.L 24*4,28*4,26*4,22*4,24*4,-1
		DC.L 25*4,29*4,17*4,13*4,25*4,-1
		DC.L 16*4,28*4,24*4,12*4,16*4,-1
		DC.L 23*4,25*4,13*4,11*4,23*4,-1
		DC.L 12*4,24*4,22*4,10*4,12*4,-1
		DC.L 11*4,13*4,9*4,7*4,11*4,-1
		DC.L 8*4,12*4,10*4,6*4,8*4,-1
		DC.L 1*4,19*4,18*4,0*4,1*4,-1
		DC.L 5*4,13*4,19*4,1*4,5*4,-1
		DC.L 18*4,12*4,4*4,0*4,18*4,-1
		DC.L 3*4,5*4,4*4,2*4,3*4,-1
		DC.L 4*4,5*4,1*4,0*4,4*4,-1
		DC.L 19*4,15*4,21*4,19*4,-1
		DC.L 18*4,19*4,21*4,18*4,-1
		DC.L 8*4,34*4,30*4,2*4,8*4,-1
		DC.L 9*4,13*4,5*4,3*4,9*4,-1
		DC.L -1
******************
		.phrase
		DC.L 0
******************
* TRON-Tank
vertices_tron:
;		inline 'TRONTANK.PTS'
faces_tron:
;		inline 'TRONTANK.FAC'
******************
		.long
		IF ^^defined MOD
PLAYER:		.incin 'REPLAYER.PRG'
		.long
mod:		.incbin 'BUBSY2.MOD'
		ENDIF
jag_end:
		BSS

		END
