;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; R0  : LZ4 packed block size (in bytes)
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r1,r2,r11,r12,r13
;;;
;;; R1,R2     : temp register
;;; r11       : jump destination
;;; r12       : $ff
;;; r13       : end of packed data

depack_lz4::
	move	R20,R13
	move	r20,r12
	add	R0,R13		; packed buffer end
	sat8	r12		; r12 = $ff
.dpklz4_tokenLoop:
	move	pc,r11
	loadb	(R20),R0
	addqt	#1,R20
	moveq	#15,r1
	and	r0,r1
	shrq	#4,R0
	jr	eq,.skip1
	cmpq	#15,R0
.dpklz4_readLen1:
	loadb	(R20),R2
	jr	ne,.dpklz4_litcopy
	addqt	#1,R20
	add	R2,R0
	jr	.dpklz4_readLen1:
	cmp	R12,R2		; r2 = $ff ?

.dpklz4_litcopy1:
	addqt	#1,R20
.dpklz4_litcopy:
	subq	#1,R0
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,.dpklz4_litcopy1
.skip1
	loadb	(R20),R2

	; end test is always done just after literals
	cmp	R20,R13
	jump	eq,(r30)	; done? => return
	addqt	#1,R20
	loadb	(R20),R0
	addqt	#1,R20
	shlq	#8,R0
	add	R2,R0
	neg	r0
	cmpq	#15,r1
	addqt	#4,r1		; minimum match count: 4
	jr	ne,.dpklz4_copy
	add	r21,r0		; source = dest - offset
.dpklz4_readLoop2:
	loadb	(r20),r2
	add	R2,R1
	cmp	R12,R2		; r2 = $ff ?
	jr	eq,.dpklz4_readLoop2
	addqt	#1,R20

.dpklz4_copy:
	move	r0,r2
	xor	r21,r2
	btst	#0,r2
	loadb	(R0),R2
	jr	eq,.copyloop2a
	btst	#0,r0

.copyloop1:
	addq	#1,R0
	subq	#1,R1
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,.copyloop1
	loadb	(R0),R2

	jump	(R11)
	nop

.copyloop2a
	jr	eq,.copyloop2
	nop
	addqt	#1,r0
	subq	#1,r1
	storeb	r2,(r21)
	addq	#1,r21
.copyloop2
	loadw	(r0),r2
	subq	#2,r1
	storew	r2,(r21)
	jump	eq,(r11)
	addqt	#2,r21
	jr	pl,.copyloop2
	addqt	#2,r0

	jump	(r11)
	subq	#1,r21		; compensate last write
