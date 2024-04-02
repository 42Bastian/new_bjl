;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r7,r20,r21
;;;
;;; pack with classic (V1) format.

DST		REG 21
SRC		REG 20

LR3		REG 7
TMP1		REG 7!
LR2		REG 6
TMP0		REG 6!
STOR		REG 5
GETBIT		REG 4
LITERALS	REG 3
OFFSET		REG 2
COPY_MATCH	reg 1
VALUE		REG 0

unzx0::
	moveq	#0,STOR
	move	pc,LR2
	moveq	#1,OFFSET
.literals
	jr	.to_elias0
	move	LR2,LITERALS

.copylit
	loadb	(SRC),TMP1
	addqt	#1,SRC
	subq	#1,VALUE
	storeb	TMP1,(DST)
	jr	ne,.copylit
	addqt	#1,DST

__xx	move	pc,COPY_MATCH
	jr	.to_getbit
	move	COPY_MATCH,LR3

	move	PC,LR2
	jr	cs,.new_off
	addqt	#.copy_match-__xx,COPY_MATCH
	;; last offset

.to_elias0:
	jr	.to_elias

.copy_match
	move	DST,TMP1
	sub	OFFSET,TMP1
.copy_match_loop
	loadb	(TMP1),TMP0
	addqt	#1,TMP1
	subq	#1,VALUE
	storeb	TMP0,(DST)
	jr	ne,.copy_match_loop
	addq	#1,DST

	move	pc,LR3
.to_getbit:
	jump	(GETBIT)
	addq	#6,LR3
.new_off:
	jr	cc,.to_elias
	move	LITERALS,LR2

	move	pc,LR2
.to_elias
	moveq	#1,VALUE
	jr	.elias
	addq	#8,LR2
__x0
	move	VALUE,OFFSET
	btst	#8,VALUE
	loadb	(SRC),TMP1
	jump	ne,(LR)
	shlq	#7,OFFSET
	addqt	#1,SRC
	moveq	#1,VALUE
	shrq	#1,TMP1
	addqt	#__x1-__x0,LR2
	jr	cc,.elias_pre
	sub	TMP1,OFFSET
__x1	jump	(COPY_MATCH)
	addq	#1,VALUE


.elias0
	addc	VALUE,VALUE
.elias
	add	STOR,STOR
	move	pc,LR3
	jump	ne_cs,(LR2)
	addqt	#2,LR3

	jr	eq,.getbyte
	nop
.elias_pre
	move	PC,LR3
	subqt	#14,LR3

.getbit
	add	STOR,STOR
	move	PC,GETBIT
	jump	ne,(LR3)
	subqt	#2,GETBIT
.getbyte
	loadb	(SRC),STOR
	addqt	#1,SRC
	shlq	#24,STOR
	jr	.getbit
	bset	#23,STOR
