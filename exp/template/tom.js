;-*-asm-*-
	GPU

	include <js/macro/help.mac>

	;; para meters 68k<->GPU

stacktop	equ $f03fe0
Flag		equ $f03fe0
screen0		equ $f03fe4
screen1		equ $f03fe8
obl0		equ $f03fec
obl1		equ $f03ff0

rez_x	equ 320
rez_y	equ 200
bpp	equ 8

;; Global registers
IRQ_SP.a	REG 31!
IRQ_RTS.a	REG 30!
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28
obl1.a		reg 27
obl0.a		reg 26
screen0.a	reg 25
screen1.a	reg 24

IRQ_RTS		reg 30!		; VJ only

	regtop 29

VBLFlag		REG 99

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0



	run $f03000

	include "irq.inc"

GPUstart::
	movei	#$f02100,IRQ_FLAGADDR.a
	moveta	IRQ_FLAGADDR.a,IRQ_FLAGADDR.a
	movei	#(1<<14)|(%11111<<9),r0	; clear all ints, REGPAGE = 1
	store	r0,(IRQ_FLAGADDR.a)
	nop
	nop

	movei	#IRQ_STACK,IRQ_SP.a
	moveta	IRQ_SP.a,IRQ_SP.a
	movei	#stacktop,SP

	moveq	#0,r20
	movei	#loop,r19
	movei	#Flag,r15
	load	(r15+4),r0
	load	(r15+8),r1
	moveta	r0,screen0.a
	moveta	r1,screen1.a
	load	(r15+12),r0
	load	(r15+16),r1
	moveta	r0,obl0.a
	moveta	r1,obl1.a

	movefa	IRQ_FLAGADDR.a,r0
	movei	#1<<14|%11111<<9|%01000<<4,r1
	store	r1,(r0)
	nop
	nop

	move	pc,r19

loop:
	movei	#$f02114,r0
	moveq	#3,r1
	store	r1,(r0)		; signal 68k

	xor	VBLFlag,VBLFlag
waitVBL:
	jr	eq,waitVBL
	cmpq	#0,VBLFlag

;;; Wait for start signal from 68k
	store	r1,(r15)
waitStart:
	cmpq	#0,r1
	jr	ne,waitStart
	load	(r15),r1

	movefa	screen1.a,r2	; background buffer
	movei	#rez_x*rez_y,r5
 IF 1
	subq	#1,r2
	;; 14.2 cycles per byte
.fill
	move	r5,r1
	move	r5,r0
	shrq	#8,r1
	add	r20,r0
	nop			; stall
	xor	r1,r0
	subq	#1,r5
	addqt	#1,r2
	jr	ne,.fill
	storeb	r0,(r2)
 ELSE
	;; 14.0 cycles per byte
	move	pc,r7
	addq	#4,r7
.fill32
A	reg 99
A1	reg 99
B	reg 99
B1	reg 99

	move	r5,A
	move	r5,B
	shrq	#8,A
	add	r20,B
	subq	#1,r5
	xor	A,B
	  move	r5,A1
	shlq	#24,B
	  move	r5,B1
	move	B,r6		; 0
	  shrq	#8,A1
	rorq	#24,r6

	add	r20,B1
	subq	#1,r5
	xor	A1,B1
	  move	r5,A
	shlq	#24,B1
	  move	r5,B
	or	B1,r6		; 1
	  subq	#1,r5
	  shrq	#8,A

	rorq	#24,r6

	  move	r5,A1
	add	r20,B
	  move	r5,B1
	xor	A,B
	  shrq	#8,A1
	shlq	#24,B
	  add	r20,B1
	or	B,r6		; 2
	  xor	A1,B1
	rorq	#24,r6

	shlq	#24,B1
	or	B1,r6		; 3
	rorq	#24,r6

	subq	#1,r5
	store	r6,(r2)
	jump	ne,(r7)
	addq	#4,r2
 ENDIF
	jump	(r19)
	addq	#1,r20

	align 4
