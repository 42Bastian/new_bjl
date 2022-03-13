;;*****************
;;; mini.S
;;; minimal 68k Jaguar program

	.68000

	.include "68k_mac/help.mac"
	.include "68k_inc/jaguar.inc"	; get equates
	.include "68k_mac/video.mac"

VID_MODE	EQU NTSC
ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

screen		EQU $100000

stacktop	equ $4000	; ROM sets SP to this address
vars		equ $1000
;---------------
; Variablen
	RSRESET
	RSW dummy

;---------------

start:
;;*****************
;;      Mini    *
mini0:
	move.w	#vars,a6
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
	move.w	#$800,d2
ci:	move.w	d2,(a0)+
	addq.b	#1,d2
	bne.s	ci

	clr.w	$58(a5)		; background black
	clr.l	$2a(a5)		; border black
;;; --------------------
;;; Init Interrupts
;;; --------------------
	bsr.s	init_irq
;;; --------------------
;;; Init OP
;;; --------------------
 IF ^^defined DEBUG
	moveq	#1,d0
	move.l	d0,$20(a5)
 ELSE
	clr.l	$20(a5)	 ; OPL = $0
 ENDIF

	lea	$f10000,a4
	move.l	#(26591*2-1)<<16|$ffff,(a4)	; 500Hz Timer

mini:
	lea	screen,a0
	move.l	#320*240/2,d0
loop:
	;; Use vertical counter for border color
	move.w	$6(a5),d1
	and.w	#$7ff,d1	; mask "interlace" bit
	move.w	d1,$58(a5)

	move.w	$38(a4),(a0)+	; write timer value to screen

	subq.l	#1,d0
	bne.s	loop

	stop	#$2000		; wait for next VI

	bra.s	mini

;;****************
;;      IRQ      *
init_irq:
	lea	my_irq(pc),a0
	move.l	a0,$0100.w
	move.l	#$1f01<<16,$e0(a5)
	;; fall thru
CopyOBL:
 IF ^^defined DEBUG
	move.l	#$10000,a1
 ELSE
	suba.l	a1,a1
 ENDIF
	moveq	#(OBL0_end-OBL0)/4-1,d1
	lea	OBL0(pc),a0
.co0:	move.l	(a0)+,(a1)+
	dbra	d1,.co0
	move.w	#4,6(a1)	;add STOP object
	rts

my_irq:
	movem.l	d0-d1/a0-a1,-(sp)
	bsr.s	CopyOBL
	move.l	#$1f01<<16,$e0(a5)
	movem.l	(sp)+,d0-d1/a0-a1
	rte

//->bitmap data addr, xloc, yloc, dwidth, iwidth, iheight, bpp, pallete idx, flags, firstpix, pitch
OBL0:
	.objproc
 IF ^^defined DEBUG
	.org	$10000
 ELSE
	.org	$0
 ENDIF
	bitmap screen, 13, 39, 320/8, 320/8, 240, 3, 0, NOTRANS, 0 ,0
	.68000
OBL0_end:

;;****************
 IF ^^defined SKUNK
	; SKUNK does not setup video!
	VideoData
 ENDIF

jag_end:
;;; ----------------------------------------
size	= (jag_end - start)
	print "Total Size:",/u size

 IF ^^defined DEBUG = 0 & ^^defined SKUNK = 0 & size < 256
	rept 256-(jag_end-start)
	dc.b $42
	endr
 ENDIF


	END
