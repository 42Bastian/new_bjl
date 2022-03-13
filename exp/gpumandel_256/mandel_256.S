;;*****************
;;; Mandel_256

	.68000

	.include "68k_mac/help.mac"
	.include "68k_inc/jaguar.inc"	; get equates
	.include "68k_mac/video.mac"

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

VID_MODE	EQU PAL

screen		EQU $100000

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
	move.w	#$f000,d0	; red
ci:	move.w	d0,(a0)+
	addq.b	#1,d0
	bne.s	ci
;;; --------------------
;;; Init Interrupts
;;; --------------------
	bsr.s	init_irq
;;; --------------------
;;; Start GPU (max. 1k)
;;; --------------------
	;; d2 = 0
	lea	gpu(pc),a2
	lea	$2110(A5),a1
	lea	$3000-$2110(a1),a0
	move.l	a0,(a1)+
copy_gpu:
	move.l	(a2)+,(a0)+
	subq.b	#1,d2
	bne.s	copy_gpu
	moveq	#1,d0
	move.l	d0,(a1)

;;; --------------------
;;; Init OP
;;; --------------------
 IF ^^defined DEBUG
//->	moveq	#1,d0
	move.l	d0,$20(a5)
 ELSE
	clr.l	$20(a5)	 ; OPL = $0
 ENDIF
main:
	stop	#$2000		; release bus until interrupt
	bra.s	main

;;****************
;;      IRQ      *
init_irq:
	lea	my_irq(pc),a0
	move.l	a0,$0100.w
	move.w	sr,-(sp)
my_irq:
	move.l	#$1f01<<16,$e0(a5)
CopyOBL:
 IF ^^defined DEBUG
	move.l	#$10000,a1
 ELSE
	suba.l	a1,a1
 ENDIF
	lea	OBL0(pc),a0
	move.l	(a0)+,(a1)+
	move.l	(a0)+,(a1)+
	move.l	(a0)+,(a1)+
	move.l	(a0)+,(a1)+
	move.w	#4,6(a1)	;add STOP object
	rte

OBL0:
	.objproc
 IF ^^defined DEBUG
	.org	$10000
 ELSE
	.org	$0
 ENDIF
 IF ^^defined SKUNK
xpos	equ 9+(320-224)/2
 ELSE
xpos	equ (320-224)/2
 ENDIF
	bitmap screen, xpos, 41, 224/8, 224/8, 224 ,3, 0, NOTRANS, 0 ,1

	.68000
OBL0_end:

 IF ^^defined SKUNK
	VideoData
 ENDIF
gpu:
	.incbin	"tom.o"
gpue:

jag_end:
m68k_size = gpu-start
size	= (jag_end - start)
	print "Total Size:",/u size,"\nm68k Size: ",/u m68k_size

 IF ^^defined DEBUG = 0 & ^^defined SKUNK = 0 & size < 256
	rept 256-(jag_end-start)
	dc.b $42
	endr
 ENDIF
;;****************

	END
