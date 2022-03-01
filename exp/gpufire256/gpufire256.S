;;*****************
;;; GPUFire256 - Fire algo based on minfire from xeleh
;;; Don't expect mind-blasting speed ;-)
;;; Size: 250 bytes

	.68000

	.include "68k_mac/help.mac"

	.include "68k_inc/jaguar.inc"	; get equates

ScreenMode	EQU RGB16|VIDEN|PWIDTH4|BGEN|CSYNC

screen		EQU $100000

stacktop	equ $4000	; ROM sets SP to this address
vars		equ $2000
;---------------
; Variablen
	RSRESET

;---------------

start:
	lea	$f00000,a5
	bra.s	main

	.long
gpu:
	.incbin	"fire.o"
main:
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
	move.l	a0,$0100.w

	move.w	#$1F01,$E0(a5)
;;; --------------------
;;; Start GPU
;;; --------------------
	lea	gpu(pc),a2
	lea	$f02110,a1
	move.l	a2,(a1)+
	move.l	#(1<<11)|1,(a1)

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

wait:
	stop	#$2000		; release bus until interrupt
	bra.s	wait

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
OBL0:
	.objproc
 IF ^^defined DEBUG
	.org	$10000
 ELSE
	.org	$0
 ENDIF
	bitmap screen, 9+80, 41+60, 20, 20, 120, 3, 0, NOTRANS, 0 ,1
	stop

	.68000
OBL0_end:
jag_end:
 IF ^^defined DEBUG = 0
	rept 256-(jag_end-start)
	dc.b $42
	endr
 ENDIF
;;****************


	END
