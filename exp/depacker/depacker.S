	.68000

ASTEROIDS	= 0

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
	RSW swap_flag
	RSW screen_flag

	.include "68k_var/text_scr.var"

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

	lea	screen1,a0
	move.l	#$20000,d0
	bsr	memzero

	;; Setup Text screen
	move.w	#254,d0
	move.l	#$1000F740,d1
	lea	txt_screen,a0
	move.l	a0,TextScreen(a6)
	bsr	InitTxtScreen

//->	lea	screen0,a0
//->	move.l	#1288,d0
//->x:	move.l	d0,(a0)+
//->	dbra	d0,x
;;;********************
;;; Video setup
	bsr	VideoInit
	bsr	InitOP
	move.w	#ScreenMode,$f00028

	bsr	InitGPU

	move	#$2000,sr

;;->	move.w	#4,screen_flag(a6)
;;; Initial text out
	clr.l	Cursor(a6)
	lea	Hallo(pc),a0
	bsr	PrintA0

	move.l	#26590<<16|0,PIT0	 ; 1/1000s-Timer
	move.l	#($1F00|C_VIDENA|C_GPUENA|C_PITENA)<<16,INT1

	.globl again
again:
	move.l	screen(a6),a0
	move.l	#320*200*2,d0
	bsr	memzero

	moveq	#0,d7
//->	move.w	#$ffff,PIT1
	bsr	StartGPU
	move.l	d7,d0
//->	move.w	PIT1,d0
//->	not.w	d0

	moveq	#2,d1
	move.l	d1,Cursor(a6)
	bsr	PrintDEZ

	addq.w	#2,Cursor(a6)
	move.l	d6,d0
	bsr	PrintHEXl

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

	lea	$F03FF0,a0	; clear parameters
	moveq	#1,d0
	move.l	d0,(a0)+
	move.l	screen(a6),(a0)+
	clr.l	(a0)+
	clr.l	(a0)+

	move.l	#1,d0
	move.l	d0,$00F02114
	rts
******************
* StartGPU
StartGPU:
	lea	$F03FF0,a0
	move.l	screen(a6),4(a0)
 IF COPY_RAW = 1
	move.l	#packed,8(a0)
	move.l	#packed_e-packed,12(a0)
 ENDIF
 IF LZ4 = 1 | LZ4_fast = 1
	move.l	#packed+8,8(a0)
	move.l	#packed_e-packed-8,12(a0)
 ENDIF
 IF LZSA1 = 1 | LZSA1A = 1 | LZSA1_fast = 1
	move.l	#packed+3,8(a0)
 ENDIF
 IF TP = 1 | TP_fast = 1
	move.l	#packed+4,8(a0)
 ENDIF
 IF ZX0 = 1 | ZX0_fast = 1
	move.l	#packed,8(a0)
 ENDIF
 IF N0 = 1
	move.l	#packed,8(a0)
 ENDIF
 IF SHR = 1
	move.l	#packed,8(a0)
 ENDIF
 IF UPKR = 1 | UPKR_fast = 1
	move.l	#packed,8(a0)
 ENDIF
 IF EXO = 1
	move.l	#packed,8(a0)
 ENDIF
	moveq	#0,d0
	move.l	d0,(a0)
waitGPU:
	stop	#$2000
	tst.l	(a0)
	beq.s	waitGPU
	rts

	.phrase
	dc.l	0		; dummy
GPUcode:
	.incbin "tom.o"
*****************
*    CopyOBL	*
CopyOBL:
	move.w	screen_flag(a6),d0
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
	move.l	screens(pc),screen(a6)

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
	move.l	#($1F00|C_VIDENA|C_GPUENA)<<16,INT1-_BASE(a2)
	lea	my_irq(pc),a0
	move.l	a0,$00000100.w
	rts
******************
* swap
swap:
	st	swap_flag(a6)
sw1:
	stop	#$2000
	tst.w	swap_flag(a6)
	bne.s	sw1

	move.w	screen_flag(a6),d0
	move.l	screens(pc,d0.w),screen(a6)
	rts
******************
* IRQ
my_irq:
	movem.l d0-d2/a0-a1,-(sp)
	move.w	INT1,d2
	btst	#0,d2
	beq.s	no_vi

	tst.w	swap_flag(a6)
	beq.s	no_swap

	moveq	#4,d0
	eor.w	d0,screen_flag(a6)
	clr.w	swap_flag(a6)
no_swap:
	bsr	CopyOBL
no_vi:
	btst	#1,d2
	beq.s	no_gpu
	addq.l	#1,d6
no_gpu:
	btst	#3,d2
	beq.s	cont_irq
	;; PIT0/1
	addq.l	#1,d7
cont_irq:
	lsl.w	#8,d2
	or.w	#C_VIDENA|C_GPUENA|C_PITENA,d2
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
Hallo:	dc.b "Jaguar Depacker test:"
 IF LZ4 = 1 | LZ4_fast = 1
	dc.b "LZ4"
 IF LZ4_fast = 1
	dc.b "-fast"
 ENDIF
 ENDIF
 IF LZSA1 = 1 | LZSA1_fast
	dc.b "LZSA1"
 IF LZSA1_fast = 1
	dc.b "-fast"
 ENDIF
 IF POS_OFFSET = 1
	dc.b " POS"
 ENDIF
 ENDIF
 IF LZSA1A = 1
	dc.b "LZSA1A"
 ENDIF
 IF TP = 1 | TP_fast = 1
	dc.b "TP"
 IF TP_fast = 1
	dc.b "-fast"
 ENDIF
 ENDIF
 IF ZX0 = 1 | ZX0_fast = 1
	dc.b "ZX0"
 IF ZX0_fast = 1
	dc.b "-fast"
 ENDIF
 ENDIF
 IF N0 = 1
	dc.b "N0"
 ENDIF
 IF EXO = 1
	dc.b "EXO"
 ENDIF
 IF UPKR = 1 | UPKR_fast = 1
	dc.b "UPKR"
 IF UPKR_fast = 1
	dc.b " fast"
 ENDIF
 ENDIF
 IF COPY_RAW = 1
	dc.b "unpacked"
 ENDIF
	dc.b 0

	.dphrase
	;; pack with "lz4 -9 -l --no-frame-crc"
packed:
 IF LZ4 = 1 | LZ4_fast = 1
	incbin	"packed_data/voyager.cry.lz4"
 ENDIF
 IF LZSA1 = 1 | LZSA1_fast = 1
 IF POS_OFFSET = 1
	incbin	"packed_data/voyager.cry.lzsa1"
 ELSE
	incbin	"packed_data/voyager.cry.lzsa1_org"
 ENDIF
 ENDIF
 IF LZSA1A = 1
	incbin	"packed_data/voyager.cry.lzsa1a"
 ENDIF
 IF TP = 1 | TP_fast = 1
	incbin	"packed_data/voyager.pck"
 ENDIF
 IF SHR = 1
	incbin	"packed_data/voyager.cry.shr"
 ENDIF
 IF ZX0 = 1 | ZX0_fast = 1
 IF ASTEROIDS = 1
	incbin	"packed_data/voyager_asteroids.cry.zx0"
 ELSE
	incbin	"packed_data/voyager.cry.zx0"
 ENDIF
 ENDIF
 IF N0 = 1
	incbin	"packed_data/voyager.cry.n0"
 ENDIF
 IF UPKR = 1 | UPKR_fast = 1
 IF ASTEROIDS = 1
	incbin	"packed_data/voyager_asteroids.cry.upk"
 ELSE
	incbin	"packed_data/voyager.cry.upk"
 ENDIF
 ENDIF
 IF EXO = 1
 IF ASTEROIDS = 1
	incbin	"packed_data/voyager_asteroids.cry.exo"
 ELSE
	incbin	"packed_data/voyager.cry.exo"
 ENDIF
 ENDIF


 IF COPY_RAW = 1
	incbin	"voyager.cry"
 ENDIF
packed_e:

	print "packed ",$4000+packed
	.phrase

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
