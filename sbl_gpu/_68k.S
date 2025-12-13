	.text
	lea	$f000e0,a0
loop:
	move.w	2(a0),d0
	lsl.w	#8,d0
	swap	d0
	move.l	d0,(a0)
	stop	#$2000
	bra.s	loop
