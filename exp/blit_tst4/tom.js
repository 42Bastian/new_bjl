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

	MACRO	BRK
.\x	jr	.\x
	nop
	ENDM

x		reg 99
dst		reg 99
src		reg 99
LOOP		reg 99
LOOPX		reg 99
size		reg 99
m_size		reg 99
size0		reg 99
stretch		reg 99
gpu_flags	reg 99

blitter		reg 14
tmp2		reg 2
tmp1		reg 1
tmp0		reg 0

ORG_HEIGHT	equ 102

SIZE_START	equ 20
SIZE_END	equ 80

Y_POS		equ 0

	regmap

GPUstart::
	movei	#BLIT_A1_BASE,blitter

	movei	#Flag,r15
	load	(r15+8),src
	movei	#$f02114,gpu_flags
	movei	#SIZE_START,size

	move	pc,LOOP
loop:

	movei	#200,tmp0
	cmp	size,tmp0
	jr	pl,.ok
	moveq	#3,tmp1
	move	tmp0,size
.ok

	store	tmp1,(r15)
	store	tmp1,(gpu_flags)		; wakeup 68k

waitStart:
	cmpq	#0,r0
	jr	ne,waitStart
	load	(r15),r0	; flag

	load	(r15+4),dst

	movei	#SIZE_END,m_size
	move	m_size,size0	; start value
	sub	size,m_size
	shlq	#16,m_size
	movei	#160,tmp0
	abs	m_size
	div	tmp0,m_size
	jr	cc,.pos
	shlq	#16,size0
	neg	m_size
.pos

	movei	#160-1,x
	move	pc,LOOPX
	addq	#4,LOOPX
.loopx
	move	size0,tmp1
	shrq	#16,tmp1
	movei	#ORG_HEIGHT<<16,stretch
	div	tmp1,stretch

	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID160|BLIT_XADDPIX,tmp0
	store	src,(blitter)
	store	tmp0,(blitter+_BLIT_A1_FLAGS)

	move	stretch,tmp1
	movei	#((-1) & 0xffff),tmp0
	shrq	#16,tmp1
	shlq	#16,tmp1
	or	tmp1,tmp0
	store	tmp0,(blitter+_BLIT_A1_STEP)

	shlq	#16,stretch
	store	stretch,(blitter+_BLIT_A1_FSTEP)
	moveq	#0,tmp0
	store	x,(blitter+_BLIT_A1_PIXEL)
	store	tmp0,(blitter+_BLIT_A1_FPIXEL)

	store	dst,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_PITCH1|BLIT_PIXEL8|BLIT_WID320|BLIT_XADDPIX,tmp0
	movei	#0<<16|((320-1) & 0xffff),tmp1
	store	tmp0,(blitter+_BLIT_A2_FLAGS)
	store	tmp1,(blitter+_BLIT_A2_STEP)

	move	size0,tmp1
	movei	#220,tmp0
	shrq	#16,tmp1
	sub	tmp1,tmp0
	shlq	#16,tmp1
	shrq	#1,tmp0

 IF Y_POS > 0
	addq	#Y_POS,tmp0
 ENDIF
	shlq	#16,tmp0
	addq	#1,tmp1
	or	x,tmp0
	addq	#32,tmp0
	store	tmp0,(blitter+_BLIT_A2_PIXEL)
	store	tmp1,(blitter+_BLIT_COUNT)
	movei	#BLIT_LFU_REPLACE|BLIT_SRCEN|BLIT_UPDA1|BLIT_UPDA2|BLIT_DSTA2|BLIT_UPDA1F,tmp0
	store	tmp0,(blitter+_BLIT_CMD)

	WAITBLITTER

	subq	#1,x
	jump	pl,(LOOPX)
	sub	m_size,size0

	jump	(LOOP)
	addq	#4,size

align	8
