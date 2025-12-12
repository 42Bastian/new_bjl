;-*-asm-*-
	.gpu
	run	$800410

	include "bootIRQ.equ"

	echo "%Xstart"
	dc.l start
	dc.l datae-data
data:
	ibytes	"bootIRQ.bin.lz4",8
datae
