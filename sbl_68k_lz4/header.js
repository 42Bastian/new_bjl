;-*-asm-*-
	.gpu
	run	$800410

	echo "%XSTART_ADDR"
	dc.l START_ADDR
	dc.l datae-data
data:
	ibytes	"draw_test.bin.lz4",8
datae
