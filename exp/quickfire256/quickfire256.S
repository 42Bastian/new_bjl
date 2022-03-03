;;*****************
;;; GPUFire256 - Fire algo based on minfire from xeleh
;;; Size: 244 bytes

	.68000

	.include "68k_mac/help.mac"
	.include "68k_inc/jaguar.inc"	; get equates

ScreenMode	EQU RGB16|VIDEN|PWIDTH4|BGEN|CSYNC

PAL		EQU 1
NTSC		EQU 2

VID_MODE	EQU PAL

	.macro VideoData
 IF VID_MODE = PAL
vidinit:
	dc.w	PAL_HMID-(PAL_WIDTH>>1)+4	; HDB1/2
	dc.w	((PAL_WIDTH>>1)-1)|$0400	; HDE
	dc.w	PAL_VMID-PAL_HEIGHT		; VDB
	dc.w	(PAL_VMID+PAL_HEIGHT)|1		; VDE
 ELSE
vidinit:
	dc.w	NTSC_HMID-(NTSC_WIDTH>>1)+4	; HDB1/2
	dc.w	((NTSC_WIDTH>>1)-1)|$0400	; HDE
	dc.w	NTSC_VMID-NTSC_HEIGHT		; VDB
	dc.w	(NTSC_VMID+NTSC_HEIGHT)|1	; VDE
 ENDIF
	.endm

	.macro VideoInit
	lea	vidinit(pc),a0
	lea	$38(a5),a1
	move.w	(a0),(a1)+	; HDB1
	move.l	(a0)+,(a1)+	; HDB2/HDE
	lea	$46-$3e(a1),a1
	move.w	(a0)+,(a1)+	; VDB
	move.w	(a0),(a1)	; VDE
	move.w	(a0),$4e-$48(a1)
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
 IF ^^defined SKUNK
	; SKUNK does not setup video!
	VideoInit
 ENDIF
	move.w	#ScreenMode,$28(a5)
;;; --------------------
;;; CLUT init
;;; --------------------
	lea	$400(a5),a0
//->	move.w	#$800,d0
//->	moveq	#0,d2
//->ci0:
//->	move.w	d2,(a0)+
//->	add.w	#$40,d2
//->	cmp.w	#$40*4,d2
//->	bne.s	ci0
//->	moveq	#8,d2
	moveq	#0,d2
	moveq	#0,d0
ci:	move.w	d0,(a0)+
	cmp.w	#$F800,d0
	bhs.s	ci1
	add.w	#(1<<11)-4,d0
ci1:
	addq.w	#4,d0
	addq.b	#1,d2
	bpl.s	ci
;;; --------------------
;;; Init Interrupts
;;; --------------------
	lea	my_irq(pc),a0
	move.l	a0,$0100.w
	move.l	#$1f01<<16,d6
	move.l	d6,$E0(a5)
;;; --------------------
;;; Start GPU (max. 1k)
;;; --------------------
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
	bsr.s	CopyOBL
 IF ^^defined DEBUG
	moveq	#1,d0
	move.l	d0,$20(a5)
 ELSE
	clr.l	$20(a5)	 ; OPL = $0
 ENDIF

wait:
	stop	#$2000		; release bus until interrupt
	bra.s	wait

;;****************
;;      IRQ      *
my_irq:
	move.l	d6,$E0(a5)
	move.w	(sp)+,sr	; restore SR (saved by interrupt)
	;; fall thru
CopyOBL:
	moveq	#(OBL0_end-OBL0)/4-1,d7
	lea	OBL0(pc),a2
 IF ^^defined DEBUG
	move.l	#$10000,a3
 ELSE
	suba.l	a3,a3
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
 IF ^^defined SKUNK
xpos	equ 9
 ELSE
xpos	equ 0
 ENDIF
	scbitmap screen, xpos, 41, 160/8, 160/8, 120, 2,2, 0,3, 0, NOTRANS, 0 ,1

	.68000
OBL0_end:

 IF ^^defined SKUNK
	VideoData
 ENDIF
gpu:
	.incbin	"fire.o"
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
