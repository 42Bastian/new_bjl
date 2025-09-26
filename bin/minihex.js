;-*-asm-*-
	GPU

LR	reg 30
txt_ptr	reg 7

 IFD _8BIT
minihex_pixel_size EQU 1
 ENDIF
	RUN $f03000
	include <js/inc/minihex.inc>
