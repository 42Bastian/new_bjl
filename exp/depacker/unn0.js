;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r13,r20,r21
;;;
;;; pack with classic (V1) format.

DST		REG 21
SRC		REG 20

LR_save		REG 7
BC		REG 6
STOR		REG 5
GETBIT		REG 4
LITERALS	REG 3
tmp2		reg 2
tmp1		REG 1
tmp0		REG 0

unn0::
	move	LR,LR_save
	movei	#.getbit,GETBIT
	move	SRC,r25

	moveq	#0,BC
	loadb	(SRC),r0
.literals
	addqt	#1,SRC
	storeb	r0,(DST)
	addqt	#1,DST
	move	pc,LITERALS
	addq	#4,LITERALS
	BL	(GETBIT)
	jr	cc,.literals
	loadb	(SRC),r0
	addq	#1,SRC

	BL	(GETBIT)
	jr	cs,._16bit
	nop
	bset	#8,r0
	shlq	#23,r0
	jr	.getlen
	sharq	#23,r0
._16bit
	cmpq	#0,r0
	loadb	(SRC),r1
	jump	eq,(LR_save)
	addq	#1,SRC
	move	r0,r24
	not	r0
	shlq	#8,r0
	or	r1,r0
	bset	#17,r0
	shlq	#15,r0
	sharq	#15,r0
.getlen
	moveq	#1,r1
.getlen_loop
	BL	(GETBIT)
	addc	r1,r1
	BL	(GETBIT)
	jr	cs,.getlen_loop
	nop
	addq	#1,r1
	add	DST,r0
	btst	#0,r0
	jr	ne,.copy_match
	btst	#0,DST
	jr	ne,.copy_match
	nop
	loadw	(r0),r2
.copy_match2

	addqt	#2,r0
	subq	#2,r1
	storew	r2,(DST)
	jump	eq,(LITERALS)
	addqt	#2,DST
	jr	pl,.copy_match2
	loadw	(r0),r2

	jump	(LITERALS)
	subq	#1,DST

.copy_match
	loadb	(r0),r2
	addqt	#1,r0
	subq	#1,r1
	storeb	r2,(DST)
	jr	ne,.copy_match
	addqt	#1,DST

	jump	(LITERALS)
	nop

.getbit
	subq	#1,BC
	jump	pl,(LR)
	add	STOR,STOR
	loadb	(SRC),STOR
	moveq	#8,BC
	addqt	#1,SRC
	jump	(GETBIT)
	shlq	#24,STOR
