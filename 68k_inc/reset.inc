; -*-asm-*-
;
; Reset JAGUAR to known state and jump to start of cart (SkunkBoard)
;
	.phrase
reset:
	lea	$F00000,a0
	lea	$F10000,a1
	moveq	#0,d0
	move.l	d0,$2114(a0)	     ;; stop gpu
	move.l	d0,$a114(a1)	     ;; stop dsp
	move.l	d0,$2100(a0)	       ;; disable GPU-IRQs
				      ;; disable DSP-IRQs
	move.l	#%10001111100000000,$a100(a1)
	move.l	#%111111<<8,$0020(a1)	 ;; clear and disable IRQs

	move.l	d0,0.w
	moveq	#4,d0
	move.l	d0,4.w
	moveq	#0,d0
	move.l	d0,$20(a0)	      ;; set OP to STOP-OBJECT
	move.w	d0,$26(a0)	      ;; clear OP-Flag
	move.l	d0,$2A(a0)	      ;; border black
	move.w	d0,$56(a0)	      ;; set CRY mode to color/not BW
	move.w	d0,$58(a0)	      ;; background black
	move.l	d0,$50(a0)	      ;; stop PIT
	move.l	d0,$0000(a1)	      ;; stop JPIT1
	move.l	d0,$0004(a1)	      ;; stop JPIT2
	move.l	#$1F01<<16,$E0(a0)    ;; clear pending irqs
	move.w	#$7fff,$4e(a0)	      ;; no VI
	lea	dummy_irq2(pc),a0
	move.l	a0,$0100.w

	move.l $800404,a0
	jmp (a0)

dummy_irq2:
	move.l	#$1f00<<16,$f000e0
	rte
