;;*****************
;;; GPUFire256 - Fire algo based on minfire from xeleh
;;; Don't expect mind-blasting speed ;-)
;;; Size: 250 bytes

	.68000

	.include "68k_mac/help.mac"

	.include "68k_inc/jaguar.inc"	; get equates

ScreenMode	EQU RGB16|VIDEN|PWIDTH4|BGEN|CSYNC

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
;;->	move.w	#$ffff,$0048(a5)			; VDE
	move.w	#(_VDE)|1,$4E(a5)
	move.w	#(_VDE)|1,$48(a5)
	endm

screen		EQU $100000

stacktop	equ $4000	; ROM sets SP to this address
vars		equ $2000
;---------------
; Variablen
	RSRESET

;---------------

start:
	lea	$f00000,a5
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
 IF ^^defined SKUNK
	VideoInit		; SKUNK does not setup video!
 ENDIF
;;; --------------------
;;; Init Interrupts
;;; --------------------
	lea	my_irq(pc),a0
	move.l	a0,$0100.w

	move.w	#$1F01,$E0(a5)
	move	#$2000,sr
;;; --------------------
;;; Start GPU
;;; --------------------
	lea	gpu(pc),a2
	lea	$2110(A5),a1
	lea	$3000-$2110(a1),a0
	move.l	a0,(a1)+
	moveq	#(gpue-gpu)/4-1,d0
copy_gpu:
	move.l	(a2)+,(a0)+
	dbra	d0,copy_gpu
	move.l	#(1<<11)|1,(a1)

;;; --------------------
;;; Init OP
;;; --------------------
//->	move.l	#4,OBL0_end+4
	bsr.s	CopyOBL
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
	bsr.s	CopyOBL
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
	moveq	#4,d7
	move.l	d7,4(a3)	;add STOP object
	rts
OBL0:
	.objproc
 IF ^^defined DEBUG
	.org	$10000
 ELSE
	.org	$0
 ENDIF
	bitmap screen, 9+80, 41+60, 160/8, 160/8, 120, 3, 0, NOTRANS, 0 ,1
	.68000
OBL0_end:
gpu:
	.incbin	"fire.o"
gpue:
jag_end:
//-> IF ^^defined DEBUG = 0
//->	rept 256-(jag_end-start)
//->	dc.b $42
//->	endr
//-> ENDIF
;;****************


	END
