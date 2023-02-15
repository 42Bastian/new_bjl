;; -*-asm-*-
;;****************
;;   videoinit   *
VideoInit:
        movem.l d0-d2/a0,-(sp)
	movem.l	pal_init(pc),d0-d2/a0
        btst    #4,$00F14003
        beq.s   VideoInit1              ;; =0 => PAL
	movem.l	ntsc_init(pc),d0-d2
VideoInit1:
        move.l  d2,(a0)+                ; HDB1/2
        move.w  d0,(a0)+                ; HDE
        addq.l  #8,a0

        swap    d0
        move.w  d0,(a0)+                ; VDB
 IF ^^defined a_vdb
        move.w  d0,a_vdb(a6)
 ENDIF
	moveq   #-1,d0
        move.w  d0,(a0)+                ; VDE
        move.w  d1,$4e-$48(a0)          ; VI
 IF ^^defined a_vde
        move.w  d1,a_vde(a6)
 ENDIF
        movem.l (sp)+,d0-d2/a0
        rts

pal_init:
	dc.l	(PAL_VMID-PAL_HEIGHT)<<16|(((PAL_WIDTH>>1)-1)|$0400)
	dc.l	PAL_VMID+PAL_HEIGHT
	dc.l	(PAL_HMID-(PAL_WIDTH>>1)+4)<<16|PAL_HMID-(PAL_WIDTH>>1)+4
	dc.l	$f00038

ntsc_init:
	dc.l	(NTSC_VMID-NTSC_HEIGHT)<<16|(((NTSC_WIDTH>>1)-1)|$0400)
	dc.l	NTSC_VMID+NTSC_HEIGHT
	dc.l	(NTSC_HMID-(NTSC_WIDTH>>1)+4)<<16|NTSC_HMID-(NTSC_WIDTH>>1)+4
