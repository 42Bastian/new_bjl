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

BYTE_PRELOAD	REG 13
LR3		REG 12
LR2		REG 11
BC		REG 10
STOR		REG 9
GETBIT		REG 8
ELIAS		REG 7
LITERALS	REG 6
OFFSET		REG 5
NEW_OFF		reg 4
COPY_MATCH	reg 3
VALUE		REG 2
tmp1		REG 1
tmp0		REG 0

unzx0::
	movei	#.getbyte1,GETBIT
	movei	#.elias,ELIAS
	movei	#.copy_match,COPY_MATCH
	movei	#.new_off,NEW_OFF
	moveq	#0,STOR
	moveq	#1,OFFSET
	loadb	(SRC),BYTE_PRELOAD
	addq	#1,SRC
	moveq	#1,VALUE
.literals
	move	pc,LITERALS

	move	pc,LR2
	jump	(ELIAS)
	addq	#6,LR2
.copylit
	move	BYTE_PRELOAD,r0
	loadb	(SRC),BYTE_PRELOAD
	addqt	#1,SRC
	subq	#1,VALUE
	storeb	r0,(DST)
	jump	ne,(LR2)
	addqt	#1,DST

	add	STOR,STOR
	move	PC,LR3
	jump	ne_cs,(NEW_OFF)
	addqt	#4,LR3
	jump	eq,(GETBIT)
	moveq	#1,VALUE
	;; last offset
	jump	(ELIAS)
	move	COPY_MATCH,LR2

	addqt	#1,VALUE
.copy_match
	move	DST,r1
	sub	OFFSET,r1
	btst	#0,DST
	jr	ne,.copy_match_loop
	btst	#0,r1
	jr	ne,.copy_match_loop
.copy_match_loop2
	loadw	(r1),r0
	subq	#2,VALUE
	storew	r0,(DST)
	jr	eq,.done
	addqt	#2,DST
	jr	pl,.copy_match_loop2
	addqt	#2,r1

	jr	.done
	subq	#1,DST

.copy_match_loop
	loadb	(r1),r0
	addqt	#1,r1
	subq	#1,VALUE
	storeb	r0,(DST)
	jr	ne,.copy_match_loop
	addq	#1,DST
.done
	add	STOR,STOR
	move	PC,LR3
	jump	eq,(GETBIT)
	addqt	#6,LR3

	jump	cc,(LITERALS)
.new_off:
	moveq	#1,VALUE
	move	pc,LR2
	jump	(ELIAS)
	addq	#6,LR2

	move	VALUE,OFFSET
	shlq	#24,VALUE
	move	BYTE_PRELOAD,r1
	jump	eq,(LR)
	loadb	(SRC),BYTE_PRELOAD
	shlq	#7,OFFSET
	addqt	#1,SRC
	shrq	#1,r1
	move	COPY_MATCH,LR2
	moveq	#1,VALUE
	subqt	#2,LR2
	jump	cs,(LR2)
	sub	r1,OFFSET
	jr	.elias_pre
.elias
	add	STOR,STOR
	jump	cs_ne,(LR2)
	nop
	jr	eq,.getbyte0
	add	STOR,STOR
.elias_pre
	jr	ne,.elias
	addc	VALUE,VALUE
.getbyte0
	move	ELIAS,LR3
.getbyte1
	move	BYTE_PRELOAD,STOR
	addqt	#2,LR3
.getbyte
	loadb	(SRC),BYTE_PRELOAD
	shlq	#24,STOR
	addqt	#1,SRC
	bset	#23,STOR
	jump	(LR3)
.getbit
	add	STOR,STOR
	jump	ne,(LR3)
	nop
	jr	.getbyte
	move	BYTE_PRELOAD,STOR
