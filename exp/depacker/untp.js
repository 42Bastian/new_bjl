;;; -*-asm-*-

; input:
;;; R20 : packed buffer (skipped Magic)
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r4,r10,r11,r20,r21
;;;
;;; R1-r4     : temp register
;;; r10       : jump destination
;;; r11       : end of packed data

untp::
	load	(r20),r0	; resulting size
	move	r21,r11
	addq	#4,r20
	add	r0,r11
.loop
	loadb	(r20),r0	;flags: bit = 0 => literal
	addqt	#1,r20
	cmp	r21,r11
	moveq	#8,r1
	jump	mi,(r30)
	shlq	#24,r0
.normal
	subq	#1,r1
	move	pc,r10
	loadb	(r20),r2
	jr	mi,.loop
	add	r0,r0
	jr	cs,.copy
	addqt	#1,r20		; literal byte

	storeb	r2,(r21)
	jr	.normal
	addqt	#1,r21
.copy
	moveq	#15,r3
	loadb	(r20),r4
	addqt	#1,r20
	and	r2,r3
	shrq	#4,r2
	addq	#3,r3
	shlq	#8,r2
	or	r2,r4
	neg	r4
	add	r21,r4		;src = dst - offset
.copyloop
	loadb	(r4),r2
	addqt	#1,r4
	subq	#1,r3
	storeb	r2,(r21)
	jr	ne,.copyloop
	addqt	#1,r21

	jump	(r10)
	subq	#1,r1
