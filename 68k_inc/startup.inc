* -*-asm-*-
*INIT
* created 24.09.95
* (c) Bastian Schick
*
* setup OP,GPU,DSP,CPU to a defined state
* OP = STOP (at $0)
* DSP,GPU : big-endian,stopped,IRQs disabled
* dummy irq
* inits SP to $1000
* stops PIT and JPIT1 & 2
* 68k-SR set to $2000
* CPU-IRQs disabled
* CPU registers are cleared (for debug purposes)
;-----------------
;--    INIT	--
INIT:
	move	#$2700,sr
	lea	$1000.w,sp
	lea	$F00000,a0
	move.l	#$070007,d0		; big endian
	move.l	d0,$210C(a0)
	move.l	d0,$F1A10C
	moveq #0,d0
	move.l d0,$2114(a0)		; stop gpu
	move.l d0,$f1a114		; stop dsp
	move.l d0,$2100(a0)		; disable GPU-IRQs
	; disable DSP-IRQs
	move.l #%10001111100000000,$f1a100
	move.l #%111111<<8,$f10020	; clear and disable IRQs

	move.l	d0,0.w
	moveq	#4,d0
	move.l	d0,4.w
	moveq	#0,d0
	move.l	d0,$20(a0)		; set OP to STOP-OBJECT
	move.w	d0,$26(a0)		; clear OP-Flag
	move.l	d0,$2A(a0)		; border black
	move.w	d0,$56(a0)		; set CRY mode to color/not BW
	move.w	d0,$58(a0)		; background black
	move.l	d0,$50(a0)		; stop PIT
	move.l	d0,$f10000		; stop JPIT1
	move.l	d0,$f10004		; stop JPIT2
	move.l	#$1F00<<16,$E0(a0)	; clear pending irqs
	move.w	#$7fff,$4e(a0)		; no VI
	lea	dummy_irq(pc),a0
	move.l	a0,$0100.w
	bra.s	INIT1
dummy_irq:
	move.l #$1f00<<16,$f000e0
	rte
INIT1:
	moveq #0,d0
	moveq #0,d1
	moveq #0,d2
	moveq #0,d3
	moveq #0,d4
	moveq #0,d5
	moveq #0,d6
	moveq #0,d7
	move.l d0,a0
	move.l d0,a1
	move.l d0,a2
	move.l d0,a3
	move.l d0,a4
	move.l d0,a5
	move.l d0,a6
	move.l a0,usp
;-----------------
