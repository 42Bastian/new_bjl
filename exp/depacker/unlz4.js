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

DST		reg 21
SRC		reg 20
EOD		reg 13
_FF		reg 12
TOKENLOOP 	reg 11

depack_lz4::
	move	SRC,EOD
	move	SRC,_FF
	add	R0,EOD		; packed buffer end
	sat8	_FF		; _FF = $ff
.dpklz4_tokenLoop:
	move	pc,TOKENLOOP
	loadb	(SRC),R0
	addqt	#1,SRC
	moveq	#15,r1
	and	r0,r1
	shrq	#4,R0
	jr	eq,.skip1
	cmpq	#15,R0
.dpklz4_readLen1:
	jr	ne,.dpklz4_litcopy
	loadb	(SRC),R2
	addqt	#1,SRC
	add	R2,R0		; final len could be > 64KiB
	jr	.dpklz4_readLen1:
	cmp	_FF,R2		; r2 = $ff ?

.dpklz4_litcopy:
	addqt	#1,SRC
	subq	#1,R0
	storeb	R2,(DST)
	addqt	#1,DST
	jr	ne,.dpklz4_litcopy
.skip1:
	loadb	(SRC),R2

	; end test is always done just after literals
	cmp	SRC,EOD
	addqt	#1,SRC
	jump	eq,(r30)	; done? => return

	loadb	(SRC),R0
	shlq	#8,R0
	add	R2,R0
	neg	r0
	add	DST,r0		; source = dest - offset
	cmpq	#15,r1
	jr	.dpklz4_copy0
	addqt	#4,r1

.dpklz4_readLoop2:
	loadb	(SRC),R2
	add	R2,R1		; final len could be > 64KiB
	cmp	_FF,R2		; r2 = $ff ?
.dpklz4_copy0:
	jr	eq,.dpklz4_readLoop2
	addqt	#1,SRC

.dpklz4_copy:
	loadb	(R0),R2
	subq	#1,R1
	storeb	R2,(DST)
	jump	eq,(TOKENLOOP)
	addqt	#1,DST
	jr	.dpklz4_copy
	addqt	#1,R0
