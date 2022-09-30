;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; R0  : LZ4 packed block size (in bytes)
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r1,r2,r10,r11,r12,r13
;;;
;;; R1,R2     : temp register
;;; r10       : jump destination
;;; r11       : jump destination
;;; r12       : $ff
;;; r13       : end of packed data

depack_lz4::
	move	R20,R13
	add	R0,R13		; packed buffer end
	movei	#.dpklz4_lenOffset,R10
	movei	#$FF,R12

	loadb	(R20),R0
.dpklz4_tokenLoop:
	move	pc,r11
	addqt	#1,R20
	move	R0,R1
	shrq	#4,R1
	jump	eq,(R10)
	shlq	#28,r0		; remove high nibble

.dpklz4_readLen1:
	cmpq	#15,R1
	loadb	(R20),R2
	jr	ne,.dpklz4_readEnd1a ; skip first addq in copy loop!
	addqt	#1,R20
.dpklz4_readLoop1:
	add	R2,R1		; final len could be > 64KiB
	cmp	R12,R2		; r2 = $ff ?
.dpklz4_litcopy:
	loadb	(R20),R2
	jr	eq,.dpklz4_readLoop1

	addqt	#1,R20
.dpklz4_readEnd1a:
	subq	#1,R1
	storeb	R2,(R21)
	jr	ne,.dpklz4_litcopy
	addqt	#1,R21
	; end test is always done just after literals
	cmp	R20,R13
	jump	eq,(r30)	; done? => return

.dpklz4_lenOffset:
	loadb	(R20),R1	; read 16bits offset, little endian, unaligned
	shrq	#28,r0
	addqt	#1,R20
	loadb	(R20),R2
	shlq	#8,R2
	add	R2,R1
	addqt	#1,R20
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
