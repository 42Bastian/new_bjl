;-*-asm-*-
;;; Video init
;;; Register usage: r0..r4
;;;
	movei	#((PAL_HMID-(PAL_WIDTH>>1)+4))<<16|(PAL_HMID-(PAL_WIDTH>>1)+4),r0 ; HDB1/HDB2
	movei	#(PAL_VMID+PAL_HEIGHT+3)<<16|(((PAL_WIDTH>>1)-1)|$0400),r1 ; VI|HDE
	movei	#$ffff0000|(PAL_VMID-PAL_HEIGHT),r2 ;VDE|VDB
	movei	#$00F14003,r3
	loadb	(r3),r3
	movei	#$f00038,r4
	btst	#4,r3
	jr	eq,.pal
	nop
	movei	#(NTSC_HMID-(NTSC_WIDTH>>1)+4)<<16|(NTSC_HMID-(NTSC_WIDTH>>1)+4),r0
	movei	#(NTSC_VMID+NTSC_HEIGHT+3)<<16|(((NTSC_WIDTH>>1)-1)|$0400),r1 ; VI|HDE
	movei	#$ffff0000|(NTSC_VMID-NTSC_HEIGHT),r2 ;VDE|VDB
.pal
	store	r0,(r4)		; HDB1/HDB2
	addq	#4,r4
	storew	r1,(r4)		; HDE
	addq	#$46-$3c,r4
	storew	r2,(r4)		; VDB
	addq	#2,r4
	shrq	#16,r2
	storew	r2,(r4)		; VDE
	shrq	#16,r1
	addq	#$4e-$48,r4
	storew	r1,(r4)
