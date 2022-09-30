;;; -*-asm-*-

; input:
;;; R20 : packed buffer (skipped Magic)
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r1,r2,r4,r10,r11,r12,r13
;;;
;;; R1-r4     : temp register
;;; r10       : jump destination
;;; r11       : jump destination
;;; r13       : end of packed data

untp::
	load	(r20),r0	; resulting size
	move	r21,r13
	addq	#4,r20
	add	r0,r13
//->	movei	#.normal,r11
	move	pc,r10
.loop
	cmp	r21,r13
	jump	mi,(r30)
	loadb	(r20),r0
	addqt	#1,r20
	moveq	#8,r1
	shlq	#24,r0
	add	r0,r0
.normal
	move	pc,r11
	loadb	(r20),r2
	jr	cs,.copy
	addqt	#1,r20		; literal bytes
	storeb	r2,(r21)
	subq	#1,r1
	addqt	#1,r21
	jump	ne,(r11)
	add	r0,r0
	jump	(r10)
.copy
	moveq	#15,r3
	loadb	(r20),r4
	and	r2,r3
	shrq	#4,r2
	addqt	#1,r20
	shlq	#8,r2
	addq	#3,r3
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
	subq	#1,r1
	jump	ne,(r11)
	add	r0,r0

	jump	(r10)
	nop
