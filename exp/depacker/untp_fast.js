;;; -*-asm-*-

; input:
;;; R20 : packed buffer (skipped Magic)
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r5,r10,r11,r20,r21
;;;
;;; R1-r4     : temp register
;;; R5        : preload
;;; r10       : jump destination
;;; r11       : end of packed data

PRELOAD		reg 5
FLAGS		reg 0

untp::
	load	(r20),r0	; resulting size
	move	r21,r11
	addq	#4,r20
	add	r0,r11
	loadb	(r20),PRELOAD	;flags: bit = 0 => literal
	addqt	#1,r20
.loop
	move	PRELOAD,FLAGS
	loadb	(r20),PRELOAD	;flags: bit = 0 => literal
	addqt	#1,r20
	cmp	r21,r11
	moveq	#8,r1
	jump	mi,(r30)
	shlq	#24,FLAGS
	move	pc,r10
	addq	#4,r10
.token_loop:
	subq	#1,r1
	jr	mi,.loop	; r1 < 0 => next token
	move	PRELOAD,r2

	loadb	(r20),PRELOAD
	add	FLAGS,FLAGS
	moveq	#15,r3
	jr	cs,.match
	addqt	#1,r20
	storeb	r2,(r21)	; literal byte
	jr	.token_loop
	addqt	#1,r21

	;; match
.match
	and	r2,r3
	move	PRELOAD,r4
	addq	#3,r3
	shrq	#4,r2
	loadb	(r20),PRELOAD
	shlq	#8,r2
	addqt	#1,r20
	or	r2,r4
	move	r4,r2
	neg	r4
	xor	r21,r2
	add	r21,r4		; src = dst - offset
	btst	#0,r2		; src || dst odd?
	loadb	(r4),r2
	jr	ne,.copyloop1
	btst	#0,r4		; src && dst even
	jr	eq,.copyloop20
	nop
	addqt	#1,r4
	subq	#1,r3
	storeb	r2,(r21)
	loadw	(r4),r2
	jr	.copyloop2
	addqt	#1,r21

.copyloop0
	loadb	(r4),r2
.copyloop1
	addqt	#1,r4
	subq	#1,r3
	storeb	r2,(r21)
	jr	ne,.copyloop0
	addqt	#1,r21

	jump	(r10)
	nop

.copyloop20
	loadw	(r4),r2
.copyloop2
	addqt	#2,r4
	subq	#2,r3
	storew	r2,(r21)
	jump	eq,(r10)
	addqt	#2,r21
	jr	pl,.copyloop20
	nop

	jump	(r10)
	subq	#1,r21		; compensate last write
