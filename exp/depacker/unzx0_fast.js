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
LR_save		REG 12
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
	move	LR,LR_save
	movei	#.getbit,GETBIT
	movei	#.elias,ELIAS
	movei	#.copy_match,COPY_MATCH
	movei	#.new_off,NEW_OFF
	moveq	#0,BC
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

	BL	(GETBIT)
	jump	cs,(NEW_OFF)
	moveq	#1,VALUE
	;; last offset
	jump	(ELIAS)
	move	COPY_MATCH,LR2
.copy_match
	move	DST,r1
	sub	OFFSET,r1
	btst	#0,DST
	jr	ne,.copy_match_loop
	btst	#0,r1
	jr	ne,.copy_match_loop
	nop
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
	BL	(GETBIT)
	jump	cc,(LITERALS)
	moveq	#1,VALUE
.new_off:
	move	pc,LR2
	jump	(ELIAS)
	addq	#6,LR2

	move	VALUE,OFFSET
	shlq	#24,VALUE
	jump	eq,(LR_save)
	nop
	move	BYTE_PRELOAD,VALUE
	loadb	(SRC),BYTE_PRELOAD

	shlq	#7,OFFSET
	addqt	#1,SRC
	move	VALUE,r1
	shrq	#1,VALUE
	sub	VALUE,OFFSET
	shrq	#1,r1
	moveq	#1,VALUE
	move	PC,LR2
	jr	cc,.elias_pre
	addq	#6,LR2
	jump	(COPY_MATCH)
	addqt	#1,VALUE

.elias0
	addc	VALUE,VALUE
.elias
	subq	#1,BC
	jr	pl,.elias_bit
	add	STOR,STOR

	moveq	#7,BC
	move	BYTE_PRELOAD,STOR
	loadb	(SRC),BYTE_PRELOAD
	shlq	#24,STOR
	addqt	#1,SRC
	add	STOR,STOR
.elias_bit
	jump	cs,(LR2)
	nop
.elias_pre
	subq	#1,BC
	jr	pl,.elias0
	add	STOR,STOR

	move	BYTE_PRELOAD,STOR
	loadb	(SRC),BYTE_PRELOAD
	shlq	#24,STOR
	addqt	#1,SRC
	jr	.elias_pre
	moveq	#8,BC

.getbit
	subq	#1,BC
	jump	pl,(LR)
	add	STOR,STOR

	move	BYTE_PRELOAD,STOR
	loadb	(SRC),BYTE_PRELOAD
	shlq	#24,STOR
	addqt	#1,SRC
	jump	(GETBIT)
	moveq	#8,BC
