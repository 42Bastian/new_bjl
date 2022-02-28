;;*****************
;;; Fire256 - Fire algo based on minfire from xeleh
;;; Don't expect mind-blasting speed ;-)
;;; Size: 250 bytes

	.68000

	.include "68k_mac/help.mac"

	.include "68k_inc/jaguar.inc"	; get equates


PAL		EQU 1
NTSC		EQU 2

VID_MODE	EQU PAL

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

 IF VID_MODE = PAL
_VDE		= pal_vmid+pal_height
 ELSE
_VDE		= ntsc_vmid+ntsc_height
 ENDIF

;;->ScreenMode	EQU $06C1		 ; 16Bit-CRY
ScreenMode	EQU RGB16|VIDEN|PWIDTH4|BGEN|CSYNC

	macro VideoInit
 IF VID_MODE = PAL
	move.w	#pal_vmid-pal_height,$0046(a5)		; VDB
	move.w	#((pal_width>>1)-1)|$0400,$003C(a5)	; HDE
	move.w	#pal_hmid-(pal_width>>1)+4,$0038(a5)	; HDB1
	move.w	#pal_hmid-(pal_width>>1)+4,$003A(a5)	; HDB2
 ELSE
	move.w	#ntsc_vmid-ntsc_height,$0046(a5)	; VDB
	move.w	#((ntsc_width>>1)-1)|$0400,$003C(a5)	; HDE
	move.w	#ntsc_hmid-(ntsc_width>>1)+4,$0038(a5)	; HDB1
	move.w	#ntsc_hmid-(ntsc_width>>1)+4,$003A(a5)	; HDB2
 ENDIF
//->	move.w	#$ffff,$0048(a5)			; VDE
	move.w	#(_VDE)|1,$4E(a5)
	move.w	#(_VDE)|1,$48(a5)
	endm

	.macro VSYNC
	clr.w VI_flag(a6)
	tst.w VI_flag(a6)
	beq.s *-4
	.endm

screen		EQU $100000

stacktop	equ $4000	; ROM sets SP to this address
vars		equ $2000
;---------------
; Variablen
	RSRESET

;---------------

start:
;;*****************
;;      Mini    *
mini0:
//->	move.w #$2700,sr
//->	move.w	#vars,a6
	lea	$f00000,a5

	VideoInit

	clr.w	$58(a5)		; background black
	clr.l	$2a(a5)		; border black
;;; --------------------
;;; Init OP
;;; --------------------
	bsr	CopyOBL
 IF ^^defined DEBUG
	move.l	#1,$20(a5)
 ELSE
	clr.l	$20(a5)	 ; OPL = $0
 ENDIF
	move.w	#ScreenMode,$28(a5)
;;; --------------------
;;; CLUT init
;;; --------------------
	lea	$400(a5),a0
	moveq	#0,d0
	move.w	#255,d2
ci:	move.w	d0,(a0)+
	cmp.w	#$F800,d0
	bhs.s	ci1
	add.w	#1<<11,d0
	bra.s	ci2
ci1:
	addq.w	#1,d0
ci2:
	dbra	d2,ci

;;; --------------------
;;; Init Interrupts
;;; --------------------
	lea	my_irq(pc),a0
	move.l	a0,$00000100.w

	clr.w	$E2(a5)
	move.w	#$1F01,$E0(a5)
	move	#$2000,sr
//->	clr.w	$0026(a5)	; OPF

	lea	$f10000,a4
	move.w	#20-1,(a4)+	; 500Hz Timer
	move.w	#$FFFF,(a4)	; 65536*500Hz => 131.7 s

mini:
	lea	screen,a0
	lea	160(a0),a1
	move.l	#160*121,d1
loop:
	move.b	1(a1),d0	; x+1,y+1
	move.b	(a1)+,d2	; x,y+1
	add.b	d2,d0
	add.b	d2,d0
	eor.b	d2,d0
	move.b	(a0),d2
	add.b	d2,d0
	eor.b	d2,d0
	lsr.b	#2,d0
	move.b	d0,(a0)+
	subq.l	#1,d1
	bne.s	loop

	move.w	#160/2-1,d3
	move.l	$4(a5),d1
loopfill:
	move.w	$36-2(a4),d2
	eor.w	d2,d1
	add.l	d1,d0
	move.w	d0,(a0)+
	dbra	d3,loopfill

	bra.s	mini

//->bitmap data addr, xloc, yloc, dwidth, iwidth, iheight, bpp, pallete idx, flags, firstpix, pitch
;;->scbitmap data addr, xloc, yloc, dwidth, iwidth, iheight, xscale, yscale, remainder, bpp, pallete idx, flags, firstpix, pitch
OBL0:
	.objproc
 IF ^^defined DEBUG
	.org	$10000
 ELSE
	.org	$0
 ENDIF
	bitmap screen, 9+80, 41+60, 20, 20, 120, 3, 0, NOTRANS, 0 ,1
//->	scbitmap screen, 9, 41, 20, 20, 120, 2,2,0, 3, 0, NOTRANS, 0 ,1
	stop

	.68000
OBL0_end:

;;****************
;;      IRQ      *
my_irq:
	bsr	CopyOBL
	move.l	#$0101<<16,$E0(a5)
	rte

CopyOBL:
	moveq	#(OBL0_end-OBL0)/4-1,d7
	lea	OBL0(pc),a2
 IF ^^defined DEBUG
	move.l	#$10000,a3
 ELSE
	clr.l	a3
 ENDIF
.co0:	move.l	(a2)+,(a3)+
	dbra	d7,.co0
	rts
jag_end:
	rept 256-(jag_end-start)
	dc.b $42
	endr

;;****************


	END
