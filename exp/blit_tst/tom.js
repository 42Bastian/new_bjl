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

u		reg 23
v		reg 22
dst		reg 21
src		reg 20
blitter		reg 14
tmp1		reg 1
tmp0		reg 0

WIDTH	equ 60
HEIGHT	equ 88

GPUstart::
	movei	#BLIT_A1_BASE,blitter

	movei	#Flag,r15
	load	(r15+8),src

	moveq	#0,u
	moveq	#0,v

	move	pc,r19
	addq	#4,r19
loop:
	moveq	#3,r0
	movei	#$f02114,r1
	store	r0,(r1)		; wakeup 68k
	store	r0,(r15)
waitStart:
	cmpq	#0,r0
	jr	ne,waitStart
	load	(r15),r0	; flag

	load	(r15+4),dst

	store	dst,(blitter)
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	movei	#20<<16|40,tmp0
	store	tmp0,(blitter+_BLIT_A1_PIXEL)
	movei	#0<<16|((320-WIDTH) & 0xffff),tmp0
	store	tmp0,(blitter+_BLIT_A1_STEP)

	store	src,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_PITCH1|BLIT_PIXEL16|BLIT_WID320|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A2_FLAGS)
	move	v,tmp0
	shlq	#16,tmp0
	or	u,tmp0
	store	tmp0,(blitter+_BLIT_A2_PIXEL)
	movei	#0|((320-WIDTH) & 0xffff),tmp0
	store	tmp0,(blitter+_BLIT_A2_STEP)

	movei	#HEIGHT<<16|(WIDTH),tmp0
	store	tmp0,(blitter+_BLIT_COUNT)
	movei	#BLIT_LFU_REPLACE|BLIT_SRCEN|BLIT_UPDA2|BLIT_UPDA1,tmp0
	store	tmp0,(blitter+_BLIT_CMD)
	WAITBLITTER

	movei	#320-WIDTH,tmp0
	addqt	#2,u
	movei	#loop,r19
	cmp	u,tmp0
	movei	#200-HEIGHT,tmp0
	jump	ne,(r19)
	nop
	moveq	#0,u
	addqt	#8,v
	cmp	v,tmp0
	jump	ne,(r19)
	nop
	jump	(r19)
	moveq	#0,v

align	8
