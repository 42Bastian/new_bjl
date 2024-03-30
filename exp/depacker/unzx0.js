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

LR3		REG 12
LR2		REG 11
STOR		REG 10
GETBIT		REG 9
ELIAS		REG 8
LITERALS	REG 7

OFFSET		REG 6
NEW_OFF		reg 5
COPY_MATCH	reg 4

VALUE		REG 2
tmp1		REG 1
tmp0		REG 0

unzx0::
	movei	#.getbit,GETBIT
	movei	#.copy_match,COPY_MATCH
	move	GETBIT,ELIAS
	move	COPY_MATCH,NEW_OFF
	subq	#.getbit-.elias,ELIAS
	addq	#.new_off-.copy_match,NEW_OFF
	moveq	#0,STOR
	moveq	#1,OFFSET
	moveq	#1,VALUE

.literals
	move	pc,LITERALS

	move	pc,LR2
	jump	(ELIAS)
	addq	#6,LR2
.copylit
	loadb	(SRC),r0
	addqt	#1,SRC
	subq	#1,VALUE
	storeb	r0,(DST)
	jump	ne,(LR2)
	addqt	#1,DST

	move	pc,LR3
	jump	(GETBIT)
	addq	#6,LR3

	jump	cs,(NEW_OFF)
	moveq	#1,VALUE
	;; last offset
	jump	(ELIAS)
	move	COPY_MATCH,LR2

	addqt	#1,VALUE
.copy_match
	move	DST,r1
	sub	OFFSET,r1
.copy_match_loop
	loadb	(r1),r0
	addqt	#1,r1
	subq	#1,VALUE
	storeb	r0,(DST)
	jr	ne,.copy_match_loop
	addq	#1,DST

	move	pc,LR3
	jump	(GETBIT)
	addq	#6,LR3

	jump	cc,(LITERALS)
	moveq	#1,VALUE
.new_off:
	move	pc,LR2
	jump	(ELIAS)
	addq	#6,LR2

	move	VALUE,OFFSET
	shrq	#8,VALUE
	loadb	(SRC),r1
	jump	ne,(LR)
	shlq	#7,OFFSET
	addqt	#1,SRC
	moveq	#1,VALUE
	move	COPY_MATCH,LR2
	shrq	#1,r1
	subqt	#2,LR2
	jr	cc,.elias_pre
	sub	r1,OFFSET
	jump	(LR2)
//->	nop			; ATARI says: NOP needed (next is move pc,lr)

.elias
	move	pc,LR3
	jump	(GETBIT)
	addq	#6,LR3

	jump	cs,(LR2)
//->	nop			; ATARI says: NOP needed (next is move pc,lr)
.elias_pre
	move	pc,LR3
	jump	(GETBIT)
	addq	#6,LR3

//->	move	pc,LR3		; quicker, but 2 bytes longer
//->	add	STOR,STOR
//->	jr	eq,.getbyte
//->	addqt	#8,LR3

	jump	(ELIAS)
	addc	VALUE,VALUE

.getbit
	add	STOR,STOR
	jump	ne,(LR3)
	nop
.getbyte
	loadb	(SRC),STOR
	addqt	#1,SRC
	shlq	#24,STOR
	jump	(GETBIT)
	bset	#23,STOR
