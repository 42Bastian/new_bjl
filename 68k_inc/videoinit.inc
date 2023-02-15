;; -*-asm-*-
;;****************
;;   videoinit   *
VideoInit:
        movem.l d0-d3/a0,-(sp)
	lea     $00F00038,a0
	move.w  #PAL_VMID-PAL_HEIGHT,d0      	;; vdb
	move.w  #PAL_VMID+PAL_HEIGHT,d1      	;; vde
	move.w  #((PAL_WIDTH>>1)-1)|$0400,d2	;; hde
	move.l  #(PAL_HMID-(PAL_WIDTH>>1)+4)<<16|PAL_HMID-(PAL_WIDTH>>1)+4,d3 ; HDB
	btst    #4,$00F14003
	beq.s   VideoInit1       		;; =0 => PAL
	move.w  #NTSC_VMID-NTSC_HEIGHT,d0
	move.w  #NTSC_VMID+NTSC_HEIGHT,d1
	move.w  #((NTSC_WIDTH>>1)-1)|$0400,d2
	move.l  #(NTSC_HMID-(NTSC_WIDTH>>1)+4)<<16|(NTSC_HMID-(NTSC_WIDTH>>1)+4),d3
VideoInit1:
	move.l 	d3,(a0)+		; HDB1/2
	move.w  d2,(a0)			; HDE
	lea	$46-$3c(a0),a0
	move.w  d0,(a0)+		; VDB
	moveq	#-1,d2
	move.w  d2,(a0)+		; VDE
	move.w  d0,a_vdb(a6)
	move.w  d1,a_vde(a6)
;;->	addq.w	#2,d1
	move.w	d1,(a0)

	movem.l (sp)+,d0-d3/a0
	rts
