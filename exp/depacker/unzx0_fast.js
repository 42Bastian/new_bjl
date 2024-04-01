;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r10,r20,r21
;;;
;;; pack with classic (V1) format.

DST		REG 21
SRC		REG 20

BYTE_PRELOAD	REG 10
LR3		REG 9
COPY_TMP	REG 9!
LR2		REG 8
DATA_TMP	REG 8!
STOR		REG 7
GETBYTE		REG 6
ELIAS		REG 5
LITERALS	REG 4
OFFSET		REG 3
NEW_OFF		reg 2
COPY_MATCH	reg 1
VALUE		REG 0

unzx0::
	movei	#.getbyte,GETBYTE
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
	move	BYTE_PRELOAD,COPY_TMP
	loadb	(SRC),BYTE_PRELOAD
	addqt	#1,SRC
	subq	#1,VALUE
	storeb	COPY_TMP,(DST)
	jump	ne,(LR2)
	addqt	#1,DST

	add	STOR,STOR
	move	PC,LR3
	jump	ne_cs,(NEW_OFF)
	moveq	#0,VALUE
	jump	eq,(GETBYTE)
	move	COPY_MATCH,LR2
	;; last offset
	jump	(ELIAS)

	addqt	#1,VALUE
.copy_match
	move	DST,COPY_TMP
	sub	OFFSET,COPY_TMP
	btst	#0,DST
	jr	ne,.copy_match_loop
	btst	#0,COPY_TMP
	jr	ne,.copy_match_loop
.copy_match_loop2
	loadw	(COPY_TMP),DATA_TMP
	subq	#2,VALUE
	storew	DATA_TMP,(DST)
	jr	eq,.done
	addqt	#2,DST
	jr	pl,.copy_match_loop2
	addqt	#2,COPY_TMP

	jr	.done
	subq	#1,DST

.copy_match_loop
	loadb	(COPY_TMP),DATA_TMP
	addqt	#1,COPY_TMP
	subq	#1,VALUE
	storeb	DATA_TMP,(DST)
	jr	ne,.copy_match_loop
	addq	#1,DST
.done
	add	STOR,STOR
	move	PC,LR3
	jump	eq,(GETBYTE)
	addqt	#6-2,LR3

	jump	cc,(LITERALS)
.new_off:
	moveq	#1,VALUE
	move	pc,LR2
	jump	(ELIAS)
	addq	#6,LR2

	move	VALUE,OFFSET
	shlq	#24,VALUE
	move	BYTE_PRELOAD,LR3
	jump	eq,(LR)
	loadb	(SRC),BYTE_PRELOAD
	shlq	#7,OFFSET
	addqt	#1,SRC
	shrq	#1,LR3
	move	COPY_MATCH,LR2
	moveq	#1,VALUE
	subqt	#2,LR2
	jump	cs,(LR2)
	sub	LR3,OFFSET
	jr	.elias_pre
.elias
	add	STOR,STOR
	jump	cs_ne,(LR2)
	move	ELIAS,LR3
	jr	eq,.getbyte
	add	STOR,STOR
.elias_pre
	jr	ne,.elias
	addc	VALUE,VALUE
	move	ELIAS,LR3
.getbyte
	addqt	#2,LR3
	move	BYTE_PRELOAD,STOR
.getbyte1
	loadb	(SRC),BYTE_PRELOAD
	shlq	#24,STOR
	addqt	#1,SRC
	bset	#23,STOR
	jump	(LR3)
	add	STOR,STOR

	UNREG BYTE_PRELOAD,LR3,COPY_TMP,LR2
	UNREG DATA_TMP,STOR,GETBYTE,ELIAS
	UNREG LITERALS,OFFSET,NEW_OFF,COPY_MATCH,VALUE
