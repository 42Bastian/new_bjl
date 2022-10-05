;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r3,r10-r14,r20,r21
;;;
;;; R1-r2       : temp register
;;; r10,r11,r13 : jump destination
;;; r12         : constant
;;; r3          : end of packed data

unlzsa1::
	movei	#.nolit,r13
	movei	#.copylit1,r10
	move	pc,r14
	loadb	(r20),r0
	addq	#1,r20
	loadb	(r20),r1
	addq	#2,r20
	shlq	#8,r1
	add	r1,r0
	move	r20,r3
	jump	eq,(r30)
	add	r0,r3
.loop:
	move	pc,r11
	loadb	(r20),r0	; token : O L L L M M M M
	addqt	#1,r20
	move	r0,r1
	shlq	#25,r1
	shrq	#29,r1
	jump	eq,(r13)	; LLL = 0
	loadb	(r20),r2

	cmpq	#7,r1
	jump	ne,(r10)
	addqt	#1,r20

	movei	#249,r12
	add	r2,r1
	cmp	r12,r2
	jr	mi,.copylit
	loadb	(r20),r2

	jr	eq,.directlen
	addqt	#1,r20
	add	r2,r1
	addq	#6,r2		; 256
	jr	.copylit
.directlen:
	loadb	(r20),r2
	addqt	#1,r20
	shlq	#8,r1
	add	r2,r1
	loadb	(r20),r2
.copylit:
	addqt	#1,r20
.copylit1:
	subq	#1,r1
	storeb	r2,(r21)
	addqt	#1,r21
	jr	ne,.copylit
	loadb	(r20),r2
.nolit:
	cmp	r20,r3
	jump	eq,(r14)
	shlq	#23,r2
	addqt	#1,r20
	jr	eq,.nooff
	move	r0,r1
	bset	#31,r2
	sharq	#23,r2
.nooff
	shlq	#28,r0
	shrq	#28,r0
	shlq	#24,r1
	jr	pl,.onebyteoff
	loadb	(r20),r1

	addqt	#1,r20		; and r1,r2?
	shlq	#24,r2
	shrq	#24,r2
	shlq	#8,r1
	or	r1,r2
	loadb	(r20),r1
	bset	#16,r2
	shlq	#15,r2
	sharq	#15,r2
.onebyteoff:
	add	r21,r2
	cmpq	#15,r0
	movei	#238,r12
	jr	ne,.copy_match_loop ; 0..14
	addq	#3,r0
	cmp	r12,r1
	jr	mi,.copy_match_loop1 ; nByte < 238 => matchlen = token+nByte
	addqt	#1,r20
	loadb	(r20),r0
	jr	ne,.copy_match_loop0 ; nByte != 238 => matchlen = 256+nByte
	addq	#256-238,r1
.directlen1:
	addqt	#1,r20
	loadb	(r20),r1
	shlq	#8,r1
.copy_match_loop0:
	addqt	#1,r20
.copy_match_loop1:
	add	r1,r0
.copy_match_loop:
	loadb	(r2),r1
	addq	#1,r2
	subq	#1,r0
	storeb	r1,(r21)
	jr	ne,.copy_match_loop
	addq	#1,r21

	jump	(r11)
	nop
