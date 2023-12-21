	.68000
wait:
	stop	#$2000
	move.l	$10.w,d0
	beq.s	wait
	move.l	d0,a0
	jmp	(a0)
	nop
