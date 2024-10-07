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

blitter		reg 14
tmp1		reg 1
tmp0		reg 0

GPUstart::
	movei	#BLIT_A1_BASE,blitter

	movei	#Flag,r15
	load	(r15+8),src

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

LOOPX	reg 99

	store	dst,(blitter)
	movei	#BLIT_PITCH1|BLIT_PIXEL|BLIT_WID320|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A1_FLAGS)
	movei	#0<<16|((320-X_STEP) & 0xffff),tmp0
	store	tmp0,(blitter+_BLIT_A1_STEP)

	movei	#data,tmp0
	store	tmp0,(blitter+_BLIT_A2_BASE)
	movei	#BLIT_PITCH1|BLIT_PIXEL|BLIT_WID8|BLIT_XADDPHR,tmp0
	store	tmp0,(blitter+_BLIT_A2_FLAGS)

	movei	#320-LOOP_STEP,x
	move	pc,LOOPX
.loopx
	store	x,(blitter+_BLIT_A1_PIXEL)

	moveq	#0,tmp0
	store	tmp0,(blitter+_BLIT_A2_PIXEL)

	movei	#200<<16|X_STEP,tmp0
	store	tmp0,(blitter+_BLIT_COUNT)
	movei	#BLIT_LFU_REPLACE|BLIT_SRCEN|BLIT_UPDA1,tmp0
	store	tmp0,(blitter+_BLIT_CMD)
	WAITBLITTER

	subq	#LOOP_STEP,x
	jump	pl,(LOOPX)
	nop
	jump	(LOOP)
	nop

align	8
data:
 IF BPP = 8
	rept 200/2
	dc.b 1,2,3,4,5,6,7,8
	dc.b 8,7,6,5,4,3,2,254
	endr
 ELSE
	rept 200/4
	dc.w $ffff,$80ff,$50ff,$78ff
        dc.w $ffff,$80ff,$50ff,$78ff
        dc.w $f8ff,$87ff,$9fff,$00ff
        dc.w $f8ff,$87ff,$9fff,$00ff
	endr
 ENDIF
