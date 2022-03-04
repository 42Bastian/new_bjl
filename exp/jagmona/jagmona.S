;;*****************
;;; JagMona - A port of Mona from Ilmenit
;;; Size: 314 bytes

	.68000

	.include "68k_mac/help.mac"
	.include "68k_inc/jaguar.inc"	; get equates
	.include "68k_mac/video.mac"

ScreenMode	EQU RGB16|VIDEN|PWIDTH4|BGEN|CSYNC

VID_MODE	EQU PAL

screen		EQU $400

stacktop	equ $4000	; ROM sets SP to this address

;---------------
start:
	lea	$f00000,a5
 IF ^^defined SKUNK
	; SKUNK does not setup video!
	VideoInit
 ENDIF
	move.w	#ScreenMode,$28(a5)
;;; --------------------
;;; CLUT init
;;; --------------------
	lea	$400(a5),a0
	move.l	#0|($14<<11)|(0<<6)|$16,(a0)+
	move.l	#((($1d<<11)|(8<<6)|$27)<<16)|(($1f<<11)|($11<<6)|$38),(a0)
;;; --------------------
;;; Init Interrupts
;;; --------------------
	lea	my_irq(pc),a0
	move.l	a0,$0100.w
	move.l	#$1f01<<16,a6
	move.l	a6,$e0(a5)
;;; --------------------
;;; Init OP
;;; --------------------
 IF ^^defined SKUNK
	move.w	#$2000,sr	; not needed after BIOS
 ENDIF
	bsr.s	CopyOBL
 IF ^^defined DEBUG
	moveq	#1,d0
	move.l	d0,$20(a5)
 ELSE
	clr.l	$20(a5)	 ; OPL = $0
 ENDIF

main:
	lea	brush(pc),a1
	move.l	#$7ec80000,d7	; seed
	moveq.l	#64,d6
loop0:
	move.b	(a1),d1		; y
	move.w	(a1)+,d7
	move.b	d7,d0		; x
	move.w	d6,d2
	subq.w	#1,d6
finish:
	beq.s	finish
	moveq	#3,d3
	and.w	d6,d3
	lsl.w	#5,d2
loop:
	addx.l	d7,d7
	bcc.s	noc
	eor.l	#$4c11db7,d7
	move.b	d7,d5
noc:
	moveq	#-1,d4
	tst.b	d5
	bmi.s	min
	moveq	#1,d4
min:
	btst	#1,d5
	beq.s	_y
	add.w	d4,d0
	bra.s	cont
_y:
	add.w	d4,d1
cont:
	moveq	#$7f,d4
	and.w	d4,d0
	and.w	d4,d1
	move.w	d1,d4
	lea	screen.w,a0
	lsl.w	#7,d4
	add.w	d0,d4
	move.b	d3,0(a0,d4)
	subq.w	#1,d2
	bne.s	loop
	bra.s	loop0

;;****************
;;      IRQ      *
my_irq:
	move.l	a6,$e0(a5)
	bsr.s	CopyOBL
	rte
	;; fall thru
CopyOBL:
	lea	OBL0(pc),a3
 IF ^^defined DEBUG
	move.l	#$10000,a4
 ELSE
	suba.l	a4,a4
 ENDIF
	move.l	(a3)+,(a4)+
	move.l	(a3)+,(a4)+
	move.l	(a3)+,(a4)+
	move.l	(a3)+,(a4)+
	move.w	#4,6(a4)	;add STOP object
	rts

brush:
	dc.w $030A, $37BE, $2F9B, $072B, $0E3C, $F59B, $8A91, $1B0B
	dc.w $0EBD, $9378, $B83E, $B05A, $70B5, $0280, $D0B1, $9CD2
	dc.w $2093, $209C, $3D11, $26D6, $DF19, $97F5, $90A3, $A347
	dc.w $8AF7, $0859, $29AD, $A32C, $7DFC, $0D7D, $D57A, $3051
	dc.w $D431, $542B, $B242, $B114, $8A96, $2914, $B0F1, $532C
	dc.w $0413, $0A09, $3EBB, $E916, $1877, $B8E2, $AC72, $80C7
	dc.w $5240, $8D3C, $3EAF, $AD63, $1E14, $B23D, $238F, $C07B
	dc.w $AF9D, $312E, $96CE, $25A7, $9E37, $2C44, $2BB9, $2139
OBL0:
	.objproc
 IF ^^defined DEBUG
	.org	$10000
 ELSE
	.org	$0
 ENDIF
 IF ^^defined SKUNK
xpos	equ 9+(320-128)/2
 ELSE
xpos	equ (320-128)/2
 ENDIF
	bitmap screen-10*128, xpos, 41+(200-96)/2, 128/8, 128/8,96+10, 3, 0, NOTRANS, 0 ,1
	.68000
OBL0_end:

 IF ^^defined SKUNK
	VideoData
 ENDIF

jag_end:
m68k_size = jag_end-start

	size	= (jag_end - start)
	print "Total Size:",/u size,"\nm68k Size: ",/u m68k_size

 IF ^^defined DEBUG = 0 & ^^defined SKUNK = 0 & size < 256
	rept 256-(jag_end-start)
	dc.b $42
	endr
 ENDIF
;;****************

	END
