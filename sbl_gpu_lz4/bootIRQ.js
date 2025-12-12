	;; -*-asm-*-
	gpu
	include <js/macro/help.mac>
	include <js/macro/joypad1.mac>
	include <js/symbols/blit_eq.js>
	include <js/symbols/jagregeq.js>
	include <js/symbols/joypad.js>

	include "canvas.h"

	UNREG	SP,SP.a,LR,LR.a

TIMING	EQU 1

 IFD TIMING
 echo "Timing enabled"
 endif

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC

	;; global registers
IRQ_SP.a	REG 31
IRQ_RTS.a	REG 30
IRQ_FLAGADDR.a	REG 29
IRQ_FLAG.a	REG 28

LR.a		reg 25
SP.a		reg 24
OP_IRQ.a	reg 23

IRQScratch4.a	REG  4
IRQScratch3.a	REG  3
IRQScratch2.a	REG  2
IRQScratch1.a	REG  1
IRQScratch0.a	REG  0

IRQ_SP		REG 31
VBLFlag		REG 22
IRQ_RTS		REG 30! ; only for VJ needed
IRQ_FLAGADDR	REG 29
LR		REG 24
SP		REG 23


main		reg 21
blit_count	reg 19
screen_ptr	reg 18
bg_col		reg 17
blitter		reg 15
sine_table	reg 14


tmp1		reg 1
tmp0		reg 0

MACRO WAITBLITTER
.\wait@
	load (blitter+$38),tmp0
	shrq #1,tmp0
	jr cc,.\wait@
	nop
ENDM

	RUN $4000
start::
	movei	#$f03030,IRQ_SP
	movei	#irq_code,r1
	move	IRQ_SP,r0
	moveq	#31,r2
.cpy	load	(r1),r3
	addqt	#4,r1
	subq	#1,r2
	store	r3,(r0)
	jr	pl,.cpy
	addqt	#4,r0

	movei	#GPU_FLAGS,IRQ_FLAGADDR
	moveta	IRQ_SP,IRQ_SP.a
	moveta	IRQ_FLAGADDR,IRQ_FLAGADDR.a
	move	IRQ_SP,SP
	subq	#16,SP

	movei	#$f00028,r3
	movei	#ScreenMode,r0
	storew	r0,(r3)
	addq	#$10,r3
 IF 1
videoInit:
 IFD _PAL
	movei	#((PAL_HMID-(PAL_WIDTH>>1)+4)<<16)|(-(PAL_VMID-PAL_HEIGHT) & $ffff),r0 ; HDB1/HDB2/VDB
	movei	#(PAL_VMID+PAL_HEIGHT+3)<<16|(((PAL_WIDTH>>1)-1)|$0400),r1 ; VI|HDE
 ELSE
	echo "NTSC"
	movei	#(NTSC_HMID-(NTSC_WIDTH>>1)+4)<<16|(-(NTSC_VMID-NTSC_HEIGHT) & $ffff),r0
	movei	#(NTSC_VMID+NTSC_HEIGHT+3)<<16|(((NTSC_WIDTH>>1)-1)|$0400),r1 ; VI|HDE
 ENDIF
	movei	#$f00038,r3

	store	r0,(r3)		; HDB1/HDB2
	addq	#4,r3
	storew	r1,(r3)		; HDE
	addq	#$46-$3c,r3
	move	r0,r2
	neg	r0
	storew	r0,(r3)		; VDB
	addq	#2,r3
	storew	r2,(r3)		; VDE = $ffxx
	shrq	#16,r1
	addq	#$4e-$48,r3
	storew	r1,(r3)
videoInit_e:
vi_size	EQU videoInit_e - videoInit
	echo "VI %dvi_size"
 ELSE
	movei	#$f0004e,r0
 IFD _PAL
	movei	#(PAL_VMID+PAL_HEIGHT+3),r1
 ELSE
	movei	#(NTSC_VMID+NTSC_HEIGHT+3),r1
 ENDIF
	storew	r1,(r0)
 ENDIF
;; ----------------------------------------

	;; set OP irq vector and stack pointer

	;; copy OBL and set OPL pointer
	moveq	#15,r14
	shlq	#20,r14
	moveq	#1,r0
	store	r0,(r14+32)		; set OBL ($f00020)
	shlq	#16,r0
	moveq	#(obl0e-obl0)/4,r1
	movei	#obl0,r2
	moveq	#8,r4		; reload copy
.l	load	(r2),r3
	addqt	#4,r2
	subq	#1,r1
	store	r3,(r4)
	addqt	#4,r4
	store	r3,(r0)
	jr	ne,.l
	addq	#4,r0

	;; enable OP IRQ
	movei	#1<<14|%11111<<9|%01000<<4,r0
	store	r0,(IRQ_FLAGADDR)
	nop
	nop

	moveq	#screen0>>16,screen_ptr
	shlq	#16,screen_ptr

 IFD TIMING
	movei	#$f00058,bg_col
 ENDIF

 IF 0
	movei	#BLIT_A1_BASE,blitter
	movei	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPIX,r0
	store	r0,(blitter+_BLIT_A1_FLAGS)
	moveq	#16,r1
	bset	#16+4,r1
;;->	movei	#$800080,r1
	store	screen_ptr,(blitter)	;_BLIT_A1_BASE
	store	r1,(blitter+_BLIT_PATD)
	movei	#(320*239*2/4)|(1<<16),blit_count
 ENDIF
	move	pc,main
	addq	#4,main
loop:
	xor	VBLFlag,VBLFlag
 IFD TIMING
	storew	VBLFlag,(bg_col)
 ENDIF
waitStart:
	or	VBLFlag,VBLFlag
	jr	eq,waitStart	; wait for VBL
	nop

 IFD TIMING
	storew	r6,(bg_col)
 ENDIF
;;->	moveq	#B_PATDSEL>>16,r1
;;->	store	r3,(blitter+_BLIT_A1_PIXEL)
;;->	store	blit_count,(blitter+_BLIT_COUNT)
;;->	shlq	#16,r1
;;->	store	r1,(blitter+_BLIT_CMD)

;; ----------------------------------------
  IF 1
 IFD _PAL
	movei	#141,r4		; jag w/ storew
;;->	movei	#141+9,r4	; BPE w/ storew
;;->	movei	#141+9,r4	; jag w/o storew
;;->	movei	#141+24,r4	; BPE w/o storew
 ELSE
	movei	#116,r4
;;->	addq	#28,r4
 ENDIF
	moveq	#10,r3
	move	screen_ptr,r1
	shlq	#5,r3
iloop:
	move	r4,r7
	add	r6,r7
	nop			; pipeline stall
	xor	r3,r7
	subq	#1,r3
	storew	r7,(r1)
;;->	nop
	jr	nz,iloop
	addqt	#2,r1

	subq	#1,r4
	moveq	#10,r3
	jr	nz,iloop
	shlq	#5,r3
 ENDIF
;; ----------------------------------------
	jump	(main)
	addq	#3,r6

	;; get OBL (must be stored long aligned !)
	long
obl0:	incbin "obl0.img"
obl0e:
	long
irq_code:
	run $f03030
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	bset	#9+3,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	bclr	#3,IRQ_FLAG.a
	moveq	#8,IRQScratch0.a
	moveq	#1,IRQScratch1.a
	shlq	#16,IRQScratch1.a
	moveq	#(obl0e-obl0)/8,IRQScratch3.a
.cpl	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	ne,.cpl
	addq	#8,IRQScratch1.a

	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag

	movei	#$f00026,IRQScratch1.a
;;->	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP
;;->
;;->timer_irq::
;;->	nop
irq_return
	addqt	#2,IRQ_RTS.a
	movefa	IRQ_SP,IRQ_SP.a
	moveta	IRQ_RTS.a,IRQ_RTS ; only for VJ needed
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
	nop
irq_end:
	RUN irq_code+irq_end-$f03030

	;; GPU RAM cleared by ROM,
end:
size	set end-start

	echo "GPU Size:%dsize"
 END
