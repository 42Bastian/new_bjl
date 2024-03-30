;;; -*-asm-*-

; input:
;;; R20 : packed buffer (skipped Magic)
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r4,r20,r21
;;;
;;; R1-r3     : temp register
;;; r4        : jump destination
;;; r5        : end of packed data

untp::
	load	(r20),r0	; resulting size
	move	r21,r5
	addq	#4,r20
	add	r0,r5
.loop
	loadb	(r20),r0	;flags: bit = 0 => literal
	cmp	r21,r5
	addqt	#1,r20
	jump	mi,(r30)
	shlq	#24,r0
	bset	#23,r0
.normal
	add	r0,r0
	move	pc,r4
	jr	eq,.loop	; r0 == 0 => new byte
	loadb	(r20),r2
	moveq	#1,r3
	jr	cc,.literal
	addqt	#1,r20
	;; match
	moveq	#15,r3
.copy
	loadb	(r20),r1
	addqt	#1,r20
	and	r2,r3
	shrq	#4,r2
	addq	#3,r3
	shlq	#8,r2
	or	r2,r1
	neg	r1
	add	r21,r1		;src = dst - offset
.copyloop
	loadb	(r1),r2
	addqt	#1,r1
.literal
	subq	#1,r3
	storeb	r2,(r21)
	jr	ne,.copyloop
	addqt	#1,r21

	jump	(r4)
	add	r0,r0
