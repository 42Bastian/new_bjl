;; -*-asm-*-
;;****************
;;   videoinit   *

;; THESE ARE THE NTSC DEFINITIONS
ntsc_width      = 1409
ntsc_hmid       = 823

ntsc_height     = 241
ntsc_vmid       = 266

;; THESE ARE THE PAL DEFINITIONS
pal_width       = 1381
pal_hmid        = 843

pal_height      = 287
pal_vmid        = 322

VideoInit:
        movem.l d0-d3/a0,-(sp)
	lea     $00F00000,a0
	move.w  #pal_vmid-pal_height,d0      	;; vdb
	move.w  #pal_vmid+pal_height,d1      	;; vde
	move.w  #((pal_width>>1)-1)|$0400,d2	;; hde
	move.w  #pal_hmid-(pal_width>>1)+4,d3 	;; hdb
	btst    #4,$00F14003
	beq.s   VideoInit1       		;; =0 => PAL
	move.w  #ntsc_vmid-ntsc_height,d0
	move.w  #ntsc_vmid+ntsc_height,d1
	move.w  #((ntsc_width>>1)-1)|$0400,d2
	move.w  #ntsc_hmid-(ntsc_width>>1)+4,d3
VideoInit1:
	move.w  d0,$0046(a0)		; VDB
	move.w  #$ffff,$0048(a0)	; VDE
	move.w  d2,$003C(a0)		; HDE
	move.w  d3,$0038(a0)		; HDB1
	move.w  d3,$003A(a0)		; HDB2

	move.w  d0,a_vdb(a6)
	move.w  d1,a_vde(a6)

	movem.l (sp)+,d0-d3/a0
	rts
