;-*-asm-*-
;;; Video init
;;; Register usage: r0..r3
;;;
	movei	#((PAL_HMID-(PAL_WIDTH>>1)+4)<<16)|(-(PAL_VMID-PAL_HEIGHT) & $ffff),r0 ; HDB1/HDB2/VDB
	movei	#(PAL_VMID+PAL_HEIGHT+3)<<16|(((PAL_WIDTH>>1)-1)|$0400),r1 ; VI|HDE
	movei	#$00F14003,r2
	loadb	(r2),r2
	movei	#$f00038,r3
	btst	#4,r2
	jr	eq,.pal
	nop
	movei	#(NTSC_HMID-(NTSC_WIDTH>>1)+4)<<16|(-(NTSC_VMID-NTSC_HEIGHT) & $ffff),r0
	movei	#(NTSC_VMID+NTSC_HEIGHT+3)<<16|(((NTSC_WIDTH>>1)-1)|$0400),r1 ; VI|HDE
.pal
	store	r0,(r3)		; HDB1/HDB2
	addq	#4,r3
	storew	r1,(r3)		; HDE
	addq	#$46-$3c,r3
	move	r0,r2
	neg	r0
	storew	r0,(r3)		; VDB
	addq	#2,r3
	storew	r2,(r3)		; VDE
	shrq	#16,r1
	addq	#$4e-$48,r3
	storew	r1,(r3)
