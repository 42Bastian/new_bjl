	.68000

	.include "68k_inc/jaguar.inc"
	.include "68k_inc/blit_eq.inc"
	.include "68k_mac/help.mac"
	.include "tom.equ"

****************
vars		= $0001000

max_x_txt	= 320
max_y_txt	= 3*8

max_x		= 320
max_y_gr	= 200

screen0		= $00100000
screen1		= $00140000
txt_screen	= $001c0000

ScreenMode	EQU CRY16|VIDEN|PWIDTH4|BGEN|CSYNC
******************
* variables

	RSRESET
	RSB obl,256
	RSL obls,2
	RSL screen

	RSW a_vde
	RSW a_vdb
	RSW VI_count
	RSW swap_flag
	RSW gpu_flag
	RSW op_flag

	.include "68k_var/text_scr.var"
	RSL max_time
	RSL StackBottom,200
	RSL stack,1

vars_len	= RSCOUNT
	IF vars_len > (100*1024)
	FAIL
	ENDIF
******************


init:	INCLUDE "68k_inc/startup.inc"
******************
* Main
	lea	vars,a6
	lea	stack(a6),sp

	move.l	a6,a0
	move.l	#vars_len,d0
	bsr	memzero

	lea	$f03000+$8000,a0
	move.l	#4096,d0
	bsr	memzero

	lea	screen0,a0
	move.l	#$20000,d0
	bsr	memzero

//->	lea	piggy,a0
//->	lea	screen0,a1
//->	move.l	#320*200*4,d0
//->	bsr	memcpy
//->
//->	lea	piggy,a0
//->	lea	screen1,a1
//->	move.l	#320*200*4,d0
//->	bsr	memcpy

	;; Setup Text screen
	move.w	#254,d0
	move.l	#$1000F740,d1
	lea	txt_screen,a0
	move.l	a0,TextScreen(a6)
	bsr	InitTxtScreen
;;;********************
;;; Video setup
	bsr	VideoInit
	bsr	InitOP
	move.w #ScreenMode,$f00028

	bsr	InitGPU

	move	#$2000,sr

;;; Initial text out
	clr.l	Cursor(a6)
	lea	Hallo(pc),a0
	bsr	PrintA0

	move.l	#26590<<16|$ffff,PIT0	 ; 1/1000s-Timer
	.globl again
again:
	move.w	#$ffff,PIT1
	bsr	StartGPU
	move.w	PIT1,d0
	not.w	d0

	moveq	#2,d1
	move.l	d1,Cursor(a6)
	bsr	PrintDEZ

//->	addq.w	#2,Cursor(a6)
//->	move.l	0.w,d0
//->	bsr	PrintHEXl

	bsr	swap		; now show last frame and wait for VBL

	bra	again

******************
	.include "68k_inc/text_scr.inc"
******************
* InitGPU
InitGPU:
	lea	$00F02110,a2
	lea	GPUcode+4(pc),a0
	moveq	#0,d0
	move.l	d0,4(a2)	; GPU halt
	movea.l (a0)+,a1	; destination
	move.l	a1,(a2)
	move.l	(a0)+,d0	; Length in Bytes
	adda.l	#$8000,a1
	bsr	memcpy

	move.l	#1,d0
	move.l	d0,$00F02114
	rts
******************
* StartGPU
StartGPU:
	lea	$F03FF0,a0
	move.l	screen(a6),4(a0)
 IF ^^defined depack_lz4
	move.l	#packed+8,8(a0)
	move.l	#packed_e-packed-8,12(a0)
 ENDIF
 IF ^^defined untp
	move.l	#packed+4,8(a0)
 ENDIF
	moveq	#0,d1
	move.l	d1,(a0)
waitGPU:
	move.l	(a0),d1		; GPU done? no =>
	beq.s	waitGPU
	rts

	.phrase
	dc.l	0		; dummy
GPUcode:
	.incbin "tom.o"
*****************
*    CopyOBL	*
CopyOBL:
	move.w	op_flag(a6),d0
	add.w	#obls,d0
	move.l	(a6,d0.w),a1
	lea	obl(a6),a0
	moveq	#(obl1-obl0)/4-1,d0
co:
	move.l	(a1)+,(a0)+
	dbra	d0,co
	rts
*****************
*   videoinit	*
	.include "68k_inc/videoinit.inc"
*****************
*    InitOP	*
InitOP:
	lea	obls_50hz(pc),a0
	btst	#4,$00F14003
	beq.s	io_pal
	lea	obls_60hz(pc),a0
io_pal:
	movem.l	(a0),d0-d1
	movem.l	d0-d1,obls(a6)
	move.l	#screen1,screen(a6)

	bsr	CopyOBL

	lea	$00F00000,a2
	moveq	#0,d0
	move.w	a_vde(a6),d0
	move.w	d0,d1
	bclr	#0,d1
	move.w  d0,$48(a2)            ;; vde
	addq	#4,d0
	move.w d0,$4e(a2)

	lea	obl(a6),a0
	move.l	a0,d0
	swap	d0
	move.l	d0,OLP-_BASE(a2)
	move.l	#$1F01<<16,INT1-_BASE(a2)
	lea	my_irq(pc),a0
	move.l	a0,$00000100.w
	rts
******************
* swap
swap:
	stop	#$2000
	move.w	gpu_flag(a6),d1
	addq.w	#4,d1
	cmp.w	#2*4,d1
	bne.s	sw1
	moveq	#0,d1
sw1:	move.w	d1,gpu_flag(a6)
	move.l	screens(pc,d1.w),screen(a6)
	subq.w	#1,swap_flag(a6)
	rts
******************
* IRQ
my_irq:
	movem.l d0-d2/a0-a1,-(sp)
	move.w	INT1,d2

	btst	#0,d2
	beq.s	no_vi

	addq.w	#1,VI_count(a6)

	tst.w	swap_flag(a6)
	beq.s	no_swap

	move.w	op_flag(a6),d0
	addq.w	#4,d0
	and.w	#4,d0
//->	cmp	#2*4,d0
//->	bne.s	x1
//->	moveq	#0,d0
//->x1:
	move.w	d0,op_flag(a6)
	clr.w	swap_flag(a6)
no_swap:
	bsr	CopyOBL
no_vi:

cont_irq:
	lsl.w	#8,d2
	or.w	#C_VIDENA|C_GPUENA,d2
	swap	d2
	move.l	d2,INT1

	movem.l (sp)+,d0-d2/a0-a1
	rte

screens:	dc.l	screen1,screen0
obls_50hz:	dc.l	obl0, obl1
obls_60hz:	dc.l	obl0_60hz, obl1_60hz


;;; memzero
;;; a0 - destination
;;; d0 - size
memzero:
	move.l	(sp)+,a2
	lea	A1_BASE,a1
	move.l	a0,(a1)
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,_BLIT_A1_FLAGS(a1)
	lsr.l	#2,d0
	bset	#16,d0
	move.l	d0,_BLIT_COUNT(a1)
	moveq	#0,d0
	move.l	d0,_BLIT_A1_PIXEL(a1)
	move.l	d0,_BLIT_CMD(a1)
wbl1:
	move.l	_BLIT_CMD(a1),d0
	btst	#0,d0
	beq.s	wbl1
	pea	(a2)
	rts

;;; memcpy with blitter
;;; A0 -> A1, size D0
memcpy:
	lea	A1_BASE,a2
	move.l	a1,(a2)
	move.l	a0,_BLIT_A2_BASE(a2)
	move.l	#BLIT_PITCH1|BLIT_PIXEL32|BLIT_WID3584|BLIT_XADDPHR,d1
	move.l	d1,_BLIT_A1_FLAGS(a2)
	move.l	d1,_BLIT_A2_FLAGS(a2)
	moveq	#0,d1
	move.l	d1,_BLIT_A1_PIXEL(a2)
	move.l	d1,_BLIT_A2_PIXEL(a2)

	lsr.w	#2,d0
	bset	#16,d0
	move.l	d0,_BLIT_COUNT(a2)
	move.l	#BLIT_SRCEN|BLIT_LFU_REPLACE,d0
	move.l	d0,_BLIT_CMD(a2)
mc_wbl1:
	move.l	_BLIT_CMD(a2),d0
	btst	#0,d0
	beq.s	mc_wbl1
	rts

******************
* text-data
	;;    0123456789012345678901234567890123456789
Hallo:	dc.b "Jaguar Depacker test                    ",0

	long
	;; pack with "lz4 -9 -l --no-frame-crc"
packed:
 IF ^^defined depack_lz4
	incbin	"voyager.cry.lz4"
 ENDIF
 IF ^^defined untp
	incbin	"voyager.pck"
 ENDIF
packed_e:
	.phrase

piggy:
//->	incbin	"voyager.cry"

*****************
* Objekte

vde_pal		equ (PAL_VMID+PAL_HEIGHT)/2+1
vde_ntsc	equ (NTSC_VMID+NTSC_HEIGHT)/2+1

bpp		= 4
gr_phrase	= max_x/4
y_start_pal	= 32
y_start_ntsc	= 24

	.phrase
obl0:
	.objproc
	.org	vars
 branch VC < 25,_stop0
 branch VC > vde_pal,_stop0
 bitmap screen0,9,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 bitmap	txt_screen, 9,y_start_pal,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop0:
 stop
	.68000
obl1:
	.objproc
	.org	vars
 branch VC < 25,_stop1
 branch VC > vde_pal,_stop1
 bitmap screen1,9,y_start_pal+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANSS RELEASE,0,1
 bitmap	txt_screen, 9,y_start_pal,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop1:
 stop
;; ======================================== 60Hz
	.68000
obl0_60hz:
	.objproc
	.org	vars
 branch VC < 25,_stop0_60hz
 branch VC > vde_ntsc,_stop0_60hz
 bitmap screen0,11,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 bitmap	txt_screen, 11,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop0_60hz:
 stop
	.68000
obl1_60hz:
	.objproc
	.org	vars
 branch VC < 25,_stop1_60hz
 branch VC > vde_ntsc,_stop1_60hz
 bitmap screen1,11,y_start_ntsc+max_y_txt+1,gr_phrase,gr_phrase,max_y_gr,bpp,0,NOTRANS RELEASE,0,1
 bitmap	txt_screen, 11,y_start_ntsc,(max_x_txt/64),(max_x_txt/64),max_y_txt, 0,127, TRANS RELEASE,0,1
_stop1_60hz:
 stop
	.68000

jag_end:
	BSS

	END