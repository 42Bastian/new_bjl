;; -*-asm-*-
;;;  GPU check
;;; ----------------------------------------
;;; Author: 42Bastian

	gpu

	include <js/symbols/jagregeq.js>
	include <js/macro/help.mac>

	UNREG LR,SP,LR.a,SP.a

minihex_screen_width equ 320
minihex_pixelsize    equ 2

//->TIME_MEASURE	equ 1

 IFD MODEL_M
 echo "Model M"
 ENDIF

WANTED_SIZE	SET 256

BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

OBL		EQU $37000

		regtop 31

LR		reg 31
obl		reg 30
current_scr	reg 29
restart		reg 28
txt_ptr		reg 27
screen_ptr	reg 22		; fix! (ROM data)

tmp1		reg 1
tmp0		reg 0

	RUN $00F035AC		; Start address after decryption. Fix!!!
start:
	shlq	#12,screen_ptr	; is $ff after decoding
 IFD MODEL_M
	movei	#$5076,r0
 ELSE
	movei	#$5064,r0
 ENDIF
	storew	r3,(r0)		; Disable BIOS double buffering (r3 == 0)

	moveq	#$120/16,r14
	shlq	#4,r14
	movei	#OBL,obl
	store	r4,(r14+obl)    ; disable logo object (r4 < 0)

	movei	#$f1a114,r0	; disable DSP -> Roaar
	store	r3,(r0)

;;; ----------------------------------------
;;; setup
;;; ----------------------------------------
	movei	#$3720c,current_scr
	store	screen_ptr,(current_scr)
 IFD TIMING
	moveq	#$f,bg_col
	shlq	#20,bg_col
 ENDIF

	move	pc,restart
superloop:

wvbl:
	load	(obl),r1
	shrq	#8,r1
	cmp	screen_ptr,r1
	jr	ne,wvbl
	nop
 IFD TIME_MEASURE
	movei	#$f00050,r19
	movei	#(26591-1)<<16|($ffff),r0
	store	r0,(r19)			; Start timer
	addq	#2,r19

	movei	#1000000,r18
	move	pc,r17
	addq	#4,r17
tl:
 ENDIF
	moveq	#0,r0
	moveq	#1,r3
	subq	#2,r3

	movei	#$80000000,r1
	movei	#$08000000,r2
	sat8	r1

	addc	r0,r0

//->	imacn	r1,r2
//->	resmac	r0
//->	jr	mi,.xx
//->	nop
//->	moveq	#1,r0
//->	nop
.xx

//->	movei	#$189ab,r0
//->	movei	#$189ab,r1
//->	nop
//->	nop
;;; ----------------------------------------
;;; mul32x32
//->	move	r1,r2
//->	rorq	#16,r1
//->	mult	r0,r2		; r2 = r0.l*r1.l
//->	imultn	r0,r1		; acc = r0.l*r1.h
//->	shrq	#16,r0
//->	rorq	#16,r1
//->	nop
//->	imacn	r0,r1		; acc += r0.h*r1.l
//->	resmac	r0
//->	nop
//->	shlq	#16,r0
//->	nop
//->	add	r2,r0
//->	nop
//->	or	r0,r1


;;; ----------------------------------------
	nop
	nop
	nop
	nop
 IFD TIME_MEASURE
	subq	#1,r18
	jump	ne,(r17)
	nop

	loadw	(r19),r0
	not	r0
	shlq	#16,r0
	shrq	#16,r0
	movei	#$178,r1	; FIXME (empty loop time)
	sub	r1,r0
 ENDIF
;;; ----------------------------------------
	move	screen_ptr,txt_ptr

	jr	drawHex
	move	restart,LR

//->	jump	(restart)
//->	addq	#1,frame

	include <js/inc/minihex.inc>

;;; ----------------------------------------
end:
size	set end-start

free	set WANTED_SIZE-size
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF
	if free > 0
	REPT	WANTED_SIZE-size
	dc.b	$42
	ENDR
	endif

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"

 END
