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

LR3		REG 10
LR2		REG 9
STOR		REG 8
GETBIT		REG 7
ELIAS		REG 6
LITERALS	REG 5

OFFSET		REG 4
COPY_MATCH	reg 3

VALUE		REG 2
tmp1		REG 1
tmp0		REG 0

unzx0::
	movei	#.getbit,GETBIT
	move	GETBIT,ELIAS
	subq	#.getbit-.elias,ELIAS
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

__xx	move	pc,COPY_MATCH
	move	pc,LR3
	jump	(GETBIT)
	addq	#6,LR3
	addqt	#.copy_match-__xx,COPY_MATCH
	jr	cs,.new_off
	;; last offset
	move	COPY_MATCH,LR2
	jump	(ELIAS)
	moveq	#1,VALUE

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
.new_off:
	moveq	#1,VALUE
	move	pc,LR2
	jump	(ELIAS)
	addq	#6,LR2
__x0
	move	VALUE,OFFSET
	shrq	#8,VALUE
	loadb	(SRC),r1
	jump	ne,(LR)
	shlq	#7,OFFSET
	addqt	#1,SRC
	moveq	#1,VALUE
	shrq	#1,r1
	addqt	#__x1-__x0,LR2
	jr	cc,.elias_pre
	sub	r1,OFFSET
__x1	jump	(COPY_MATCH)
	addq	#1,VALUE

.elias0
	addc	VALUE,VALUE
.elias
	move	pc,LR3
	jump	(GETBIT)
	addqt	#6,LR3

	jump	cs,(LR2)
.elias_pre
	move	ELIAS,LR3
	subqt	#2,LR3

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
