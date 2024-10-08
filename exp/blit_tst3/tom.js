;-*-asm-*-
	GPU

	include <js/symbols/jagregeq.js>
	include <js/symbols/blit_eq.js>
	include <js/macro/help.mac>

Flag	equ $f03ff0
screen	equ $f03ff4

	run $f03000

	MACRO WAITBLITTER
.\waitblit	load (blitter+$38),tmp0
	btst	#0,tmp0
	jr	z,.\waitblit
	nop
	ENDM

BPP::	equ 8

 IF BPP = 8
X_STEP		equ 8
BLIT_PIXEL	equ BLIT_PIXEL8
LOOP_STEP	equ 8
 ELSE
X_STEP		equ 4
BLIT_PIXEL	equ BLIT_PIXEL16
LOOP_STEP	equ 4
 ENDIF

x		reg 99
dst		reg 99
src		reg 99
LOOP		reg 99
blt_flag	reg 99
toggle		reg 99
LOOPX		reg 99

blitter		reg 14
tmp1		reg 1
tmp0		reg 0

	regmap

GPUstart::
	movei	#BLIT_A1_BASE,blitter

	movei	#Flag,r15
	load	(r15+8),src

	movei	#BLIT_XADDPIX,blt_flag
	move	blt_flag,toggle
//->	moveq	#0,toggle
	move	pc,LOOP
loop:
	moveq	#3,r0
	movei	#$f02114,r1
	store	r0,(r15)
	store	r0,(r1)		; wakeup 68k

waitStart:
	cmpq	#0,r0
	jr	ne,waitStart
	load	(r15),r0	; flag

	load	(r15+4),dst

	store	dst,(blitter)
	movei	#BLIT_PITCH1|BLIT_PIXEL|BLIT_WID320,tmp0
	movei	#0<<16|((320-X_STEP) & 0xffff),tmp1
	or	blt_flag,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	store	tmp1,(blitter+_BLIT_A1_STEP)

	store	src,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_PITCH1|BLIT_PIXEL|BLIT_WID160,tmp0
	movei	#0<<16|((160-X_STEP) & 0xffff),tmp1
	or	blt_flag,tmp0
	store	tmp1,(blitter+_BLIT_A2_STEP)
	store	tmp0,(blitter+_BLIT_A2_FLAGS)

	movei	#160-LOOP_STEP,x
	move	pc,LOOPX
	addq	#4,LOOPX
.loopx
	store	x,(blitter+_BLIT_A1_PIXEL)
	store	x,(blitter+_BLIT_A2_PIXEL)

	movei	#102<<16|X_STEP,tmp0
	store	tmp0,(blitter+_BLIT_COUNT)
	movei	#BLIT_LFU_REPLACE|BLIT_SRCEN|BLIT_UPDA1|BLIT_UPDA2,tmp0
	store	tmp0,(blitter+_BLIT_CMD)
	WAITBLITTER

	subq	#LOOP_STEP,x
	jump	pl,(LOOPX)
	nop
	jump	(LOOP)
	xor	toggle,blt_flag


align	8
