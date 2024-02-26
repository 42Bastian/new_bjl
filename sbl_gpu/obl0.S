	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"

	include "canvas.h"

max_x_txt	= 320
max_y_txt	= 4*6

max_x		= rez_x
max_y_gr	= 200

txt_screen	= $000c0000
logo_screen	= txt_screen+(max_x_txt/8)*max_y_txt

 IF ^^defined _PAL
vde		equ (PAL_VMID+PAL_HEIGHT)/2+1
y_start		equ 29
 ELSE
vde		equ (NTSC_VMID+NTSC_HEIGHT)/2+1
y_start		equ 7
 ENDIF

bpp		= 4
gr_phrase	= max_x/4

	.phrase
obl0:

	.objproc
	.org	$10000
 branch VC < y_start+1,_stop0
 branch VC > vde,_stop0
 branch	VC = vde-1, _gpu01
 nop
 IF max_x < 320
 scbitmap screen0,9,y_start+max_y_txt,gr_phrase,gr_phrase,max_y_gr,320.0/max_x,1.0,0.5,bpp,0,NOTRANS RELEASE,0,1c
 ELSE
 bitmap screen0,9,y_start+max_y_txt,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 ENDIF
 IF ^^defined DEBUG
 bitmap	txt_screen, 9,y_start,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
 ENDIF
;;-> bitmap	logo_screen, 10,y_start+max_y_txt+max_y_gr-9,1,1,9, 0,127,TRANS  RELEASE,0,1
 jump	_stop0
_gpu01:
 gpuobj 1
_stop0:
 stop
	.68000
