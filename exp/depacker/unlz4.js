;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; R0  : LZ4 packed block size (in bytes)
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r1,r2,r4,r10,r11,r12,r13
;;;
;;; R1,R2     : temp register
;;; r4        : mask $0f
;;; r10       : jump destination
;;; r11       : jump destination
;;; r12       : mask $ff
;;; r13       : end of packed data

depack_lz4::
	move	R20,R13
	add	R0,R13		; packed buffer end
	moveq	#$F,R4
	movei	#.dpklz4_lenOffset,R10
	movei	#.dpklz4_tokenLoop,R11
	movei	#$FF,R12

	loadb	(R20),R0
.dpklz4_tokenLoop:
	addqt	#1,R20
	move	R0,R1
	shrq	#4,R1
	jump	eq,(R10)
	and	r4,r0		; remove high nibble

.dpklz4_readLen1:
	cmp	R1,R4		; r1 == 15 ?
	loadb	(R20),R2
	jr	ne,.dpklz4_readEnd1a ; skip first addq in copy loop!
.dpklz4_readLoop1:
	addqt	#1,R20
	add	R2,R1		; final len could be > 64KiB
	cmp	R12,R2		; r2 = $ff ?
	jr	eq,.dpklz4_readLoop1
	loadb	(R20),R2
.dpklz4_readEnd1:

.dpklz4_litcopy:
	addqt	#1,R20
.dpklz4_readEnd1a:
	subq	#1,R1
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,.dpklz4_litcopy
	loadb	(R20),r2

	; end test is always done just after literals
	cmp	R20,R13
	jump	eq,(r30)	; done? => return
.dpklz4_lenOffset:
	loadb	(R20),R1	; read 16bits offset, little endian, unaligned
	addqt	#1,R20
	loadb	(R20),R2
	addqt	#1,R20
	shlq	#8,R2
	add	R2,R1
	neg	r1
	add	r21,r1	; source = dest - offset

;;;readLen_smallest2_DSP
	cmp	R0,R4		; r0 == 15 ?
	jr	ne,.dpklz4_readEnd2
.dpklz4_readLoop2:
	loadb	(R20),R2
	add	R2,R0		; final len could be > 64KiB
	cmp	R12,R2		; r2 = $ff ?
	jr	eq,.dpklz4_readLoop2
	addq	#1,R20

.dpklz4_readEnd2:

	addq	#4,R0
.dpklz4_copy:
	loadb	(R1),R2
	addq	#1,R1
	subq	#1,R0
	storeb	R2,(R21)
	jr	ne,.dpklz4_copy
	addqt	#1,R21

	jump	(R11)
	loadb	(R20),R0
