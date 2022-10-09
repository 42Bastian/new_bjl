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

	loadb	(R20),R0
.dpklz4_tokenLoop:
	move	pc,r11
	addqt	#1,R20
	move	R0,R1
	shrq	#4,R1
	jr	eq,.skip1
	shlq	#28,r0		; remove high nibble
	cmpq	#15,R1
.dpklz4_readLen1:
	jr	ne,.dpklz4_litcopy
	loadb	(R20),R2
	addqt	#1,R20
	add	R2,R1		; final len could be > 64KiB
	jr	.dpklz4_readLen1:
	cmp	R12,R2		; r2 = $ff ?

.dpklz4_litcopy:
	addqt	#1,R20
	subq	#1,R1
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,.dpklz4_litcopy
.skip1
	loadb	(R20),R2

	; end test is always done just after literals
	cmp	R20,R13
	jump	eq,(r30)	; done? => return

.dpklz4_lenOffset:
	addqt	#1,R20
	shrq	#28,r0
	loadb	(R20),R1
	addqt	#1,R20
	shlq	#8,R1
	add	R2,R1
	neg	r1
	cmpq	#15,r0
	addqt	#4,r0
	jr	ne,.dpklz4_copy
	add	r21,r1		; source = dest - offset

.dpklz4_readLoop2:
	loadb	(R20),R2
	add	R2,R0		; final len could be > 64KiB
	cmp	R12,R2		; r2 = $ff ?
	jr	eq,.dpklz4_readLoop2
	addqt	#1,R20

.dpklz4_copy:
	loadb	(R1),R2
	addq	#1,R1
	subq	#1,R0
	storeb	R2,(R21)
	jr	ne,.dpklz4_copy
	addqt	#1,R21

	jump	(R11)
	loadb	(R20),R0
