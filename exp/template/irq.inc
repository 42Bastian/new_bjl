;;; -*-asm-*-

cpu:
	load	(IRQ_FLAGADDR.a),IRQ_FLAG.a
	movei	#cpu_irq,IRQScratch0.a
	bset	#9+0,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	jump	(IRQScratch0.a)
	bclr	#3,IRQ_FLAG.a

	org	$f03010
	movei	#GPUstart,r0
	jump	(r0)
	nop

	org	$f03020
IRQ_STACK::
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
	bset	#9+3,IRQ_FLAG.a
	load	(IRQ_SP.a),IRQ_RTS.a
	bclr	#3,IRQ_FLAG.a

	movefa	VBLFlag,IRQScratch1.a
	cmpq	#0,IRQScratch1.a
	movei	#$1040,IRQScratch1.a
	jr	ne,.no_swap
	move	obl0.a,IRQScratch0.a

	move	obl1.a,obl0.a
	move	IRQScratch0.a,obl1.a

	moveta	screen0.a,IRQScratch0.a
	move	screen1.a,screen0.a
	movefa	IRQScratch0.a,screen1.a

	moveq	#1,IRQScratch2.a
	move	obl0.a,IRQScratch0.a
	moveta	IRQScratch2.a,VBLFlag
.no_swap

	moveq	#13,IRQScratch3.a
.l	loadp	(IRQScratch0.a),IRQScratch2.a
	addqt	#8,IRQScratch0.a
	subq	#1,IRQScratch3.a
	storep	IRQScratch2.a,(IRQScratch1.a)
	jr	pl,.l
	addq	#8,IRQScratch1.a

	movei	#$f00026,IRQScratch1.a
	jr	irq_return
	storew	IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
	nop
irq_return
	addqt	#2,IRQ_RTS.a
	addqt	#4,IRQ_SP.a
	moveta	IRQ_RTS.a,IRQ_RTS.a ; only for VJ needed
	store	IRQ_FLAG.a,(IRQ_FLAGADDR.a)
	jump	(IRQ_RTS.a)
	nop

cpu_irq:
	moveq	#1,IRQScratch0.a
	moveta	IRQScratch0.a,VBLFlag
	jr	irq_return
	nop
