;-*-Asm-*-
	GPU

	include <js/macro/help.mac>
	include <js/symbols/blit_eq.js>
	include <js/symbols/jagregeq.js>

	UNREG	SP,SP.a,LR,LR.a

	;; return values
_MS_PER_FRAME	equ 0
_VBLS_PER_FRAME	equ 4

screen0::	equ $00080000
screen1::	equ $000a0000
parameter	equ $f03ff0

FP_BITS		equ 8

	;; canvas
rez_x::		equ 320	; 160/192/256/320
rez_y		equ 200

 IF rez_x = 320
BLIT_WID	EQU BLIT_WID320
 ENDIF

 IF rez_x = 256
BLIT_WID	EQU BLIT_WID256
 ENDIF

 IF rez_x = 192
BLIT_WID	EQU BLIT_WID192
 ENDIF

 IF rez_x = 160
BLIT_WID	EQU BLIT_WID160
 ENDIF

	;; global registers
IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
obl_size.a	reg 25
LR.a		reg 24

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
IRQ_RTS		REG 30
IRQ_FLAGADDR	REG 29
LR		REG 28
VBLFlag		REG 27

tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

IRQ_STACK	EQU $f03020

MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
	nop
ENDM

	run $f03000
GPUstart::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#cpu_irq,IRQScratch0.a
	bset	#9+0,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03010

	movei	#init,r0
	jump	(r0)
	nop

	org	$f03020
timer::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#timer_irq,IRQScratch0.a
	bset	#9+2,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03030
op::
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#op_irq,IRQScratch0.a
	bset	#9+3,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03050
op_irq::
	move	obl0.a,IRQScratch0.a
	movei	#$1000,IRQScratch1.a
	move	obl_size.a,IRQScratch3.a
.l	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	ne,.l
	addq	#8,IRQScratch1.a

	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag

	moveq	#_VBLS_PER_FRAME,IRQScratch0.a
	load	(IRQScratch0.a),IRQScratch1.a
	addq	#1,IRQScratch1.a
	store	IRQScratch1.a,(IRQScratch0.a)

	movei	#$f00026,IRQScratch1.a
	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
	nop
irq_return
	addqt	#2,IRQ_RTS.a
	moveta	IRQ_RTS.a,IRQ_RTS
	movefa	IRQ_SP,IRQ_SP.a
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
	nop

cpu_irq:
	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag

	jr	irq_return
	nop

;;; ------------------------------------------------------------
init::
	movei	#$f02100,IRQ_FLAGADDR
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a

	movei	#1<<14|%11111<<9,r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	movei	#IRQ_STACK,IRQ_SP
	moveta	IRQ_SP,IRQ_SP.a

	;; get OP lists from 68k
	movei	#parameter,r15
	load	(r15),r0
	moveta	r0,obl0.a
	load	(r15+4),r0
	moveta	r0,obl1.a
	load	(r15+8),r0
	moveta	r0,obl_size.a

	movei	#1<<14|%11111<<9|%01000<<4,r0
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

;;; -----------------------------------------------------------------------
blitter		reg 14
sinptr		reg 15

currScreen.a	REG 99
BG.a		REG 99
LOOP.a		REG 99
pit.a		reg 99
time.a		reg 99

main::
	movei	#$f02200,blitter
//->	movei	#200<<16|320,tmp0
	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A1_CLIP)
	store	tmp0,(blitter+_BLIT_A1_STEP)
	store	tmp0,(blitter+_BLIT_A1_FSTEP)

	movei	#$f00058,r0
	moveta	r0,BG.a
	movei	#$88ff,r1
	storew	r1,(r0)
	movei	#screen1,r0
	moveta	r0,currScreen.a
	;--------------------
	;- Init ms-Timer
	movei	#$f00050,r0
	movei	#(26591-1)<<16|($ffff),r1
	store	r1,(r0)			; Start timer
	addq	#2,r0
	moveta	r0,pit.a

	move	PC,r0
	addq	#6,r0
	moveta	r0,LOOP.a
loop:
	moveq	#3,tmp0
	movei	#$f02114,tmp1
	store	tmp0,(tmp1)	; wakeup 68k

	xor	VBLFlag,VBLFlag
waitStart:
	jr	eq,waitStart	; wait for VBL
	cmpq	#0,VBLFlag

	movefa	pit.a,r0
	loadw	(r0),r0
	moveta	r0,time.a

;;; ------------------------------
;;; CLS
;;; ------------------------------
//->	moveq	#0,tmp0
//->	store	tmp0,(blitter+_BLIT_PATD)
//->	store	tmp0,(blitter+_BLIT_PATD+4)
//->	store	tmp0,(blitter+$40)
//->	store	tmp0,(blitter+$44)
//->	bset	#10,tmp0	   ; == $400
//->	store	tmp0,(blitter+$70)	; int inc
//->	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID|BLIT_XADDPHR,tmp0
//->	movefa	currScreen.a,tmp1
//->	store	tmp0,(blitter+_BLIT_A1_FLAGS)
//->	store	tmp1,(blitter)	;_BLIT_A1_BASE
//->	moveq	#0,tmp1
//->	movei	#(1<<16)|(rez_y*rez_x),tmp0
//->	store	tmp1,(blitter+_BLIT_A1_PIXEL)
//->	movei	#B_PATDSEL|B_GOURD,tmp1
//->	store	tmp0,(blitter+_BLIT_COUNT)
//->	store	tmp1,(blitter+_BLIT_CMD)
//->	WAITBLITTER 		; wait for CLS to finish

cnt	REG 26
DRAW	reg 25
LOOP	reg 24


y0	reg 4
x0	reg 3
color	reg 2!			; re-use tmp2
y1	reg 1!
x1	reg 0!

	movei	#draw,DRAW
	movei	#rez_x-1,cnt
	move	pc,LOOP
.loop
	IF 0
	movei	#100,x0
	movei	#100,x1
	movei	#0,y0
	movei	#100,y1
	movei	#$fff0,color
	BL	(DRAW)

	movei	#100,x0
	movei	#100,x1
	movei	#101,y1
	movei	#199,y0
	movei	#$fff0,color
	BL	(DRAW)

	movei	#0,x0
	movei	#199,x1
	movei	#0,y1
	movei	#199,y0
	movei	#$08f0,color
	BL	(DRAW)

	movei	#0,x1
	movei	#199,x0
	movei	#0,y1
	movei	#199,y0
	movei	#$08f0,color
	BL	(DRAW)

	movei	#0,x1
	movei	#110,y1
	movei	#199,x0
	movei	#100,y0
	movei	#$48f0,color
	BL	(DRAW)

	movei	#0,x1
	movei	#0,y1
	movei	#199,x0
	movei	#100,y0
	movei	#$70f0,color
	BL	(DRAW)
 ELSE
	movei	#rez_x-1,x0
	move	cnt,x1
	sub	cnt,x0
	moveq	#0,y0
	movei	#199,y1
	move	cnt,color
	shrq	#1,color
	BL	(DRAW)

	subq	#1,cnt
	jump	pl,(LOOP)
	nop

	movei	#199,cnt
	move	pc,LOOP
.loop1
	movei	#199,y1
	move	cnt,y0
	sub	cnt,y1
	moveq	#0,x0
	movei	#rez_x-1,x1
	move	cnt,color
	bset	#15,color
	BL	(DRAW)

	subq	#1,cnt
	jump	pl,(LOOP)
	nop
 ENDIF
	WAITBLITTER

	UNREG	LOOP,DRAW,cnt,color
	UNREG	x0,y0,x1,y1
;;; ------------------------------
;;; time

	movefa	pit.a,tmp0
	movefa	time.a,r1
	loadw	(tmp0),tmp0
	sub	tmp0,r1
	moveq	#_MS_PER_FRAME,tmp0
	store	r1,(tmp0)

;;; ------------------------------
;;; swap

	movefa	obl0.a,tmp0
	movefa	obl1.a,r1
	moveta	tmp0,obl1.a
	moveta	r1,obl0.a
	movei	#screen0^screen1,r1
	movefa	currScreen.a,r2
	movefa	LOOP.a,tmp0
	xor	r1,r2
	jump	(tmp0)
	moveta	r2,currScreen.a

	include <js/inc/linedraw.inc>

	align 4
