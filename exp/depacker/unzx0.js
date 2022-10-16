;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r4,r10,r11,r20,r21
;;;
;;; R1-r4     : temp register
;;; r10       : jump destination
;;; r11       : end of packed data



LR_save	REG 29
LR2	REG 28
BC	REG 27
STOR	REG 26
GETBIT	REG 25
ELIAS	REG 24
ELIAS_PRE REG 23
MAIN	REG 22
DST	REG 21
SRC	REG 20
MWO	REG 19
VALUE	REG 18
OFFSET	REG 17
_256	REG 16
NO_OFF	reg 14
MATCH	reg 13

unzx0::
	move	LR,LR_save
	movei	#.getbit,GETBIT
	movei	#.elias,ELIAS
	movei	#.elias_pre,ELIAS_PRE
	movei	#.no_off,NO_OFF
	movei	#.match,MATCH
	moveq	#1,_256
	moveq	#0,BC
	shlq	#8,_256
	moveq	#1,OFFSET
	move	pc,MAIN
	addq	#6,MAIN
	jr	.skip
.main
	moveq	#0,MWO
	BL	(GETBIT)
	addc	MWO,MWO

	cmpq	#0,MWO
	jump	ne,(MATCH)
.skip
	moveq	#1,VALUE
	BL	(ELIAS)
	cmpq	#0,VALUE
	jr	eq,.nolit
.copylit
	loadb	(SRC),r0
	addqt	#1,SRC
	subq	#1,VALUE
	storeb	r0,(DST)
	jr	ne,.copylit
	addqt	#1,DST
.nolit
	BL	(GETBIT)
	addc	MWO,MWO

	moveq	#1,VALUE
.match
	BL	(ELIAS)		; offset high or match length
	cmpq	#0,MWO
	jump	eq,(NO_OFF)
	cmp	_256,VALUE
	move	VALUE,OFFSET
	jump	eq,(LR_save)
	subq	#1,OFFSET
	loadb	(SRC),VALUE
	shlq	#7,OFFSET
	movei	#255,r1
	addqt	#1,SRC
	sub	VALUE,r1
	shrq	#1,r1
	or	r1,OFFSET
	shrq	#1,VALUE
	addqt	#1,OFFSET
	moveq	#1,VALUE
	BL	cc,(ELIAS_PRE)
	addqt	#1,VALUE
.no_off
	move	DST,r1
	sub	OFFSET,r1
	cmpq	#0,VALUE
	jump	eq,(MAIN)
.copy_match
	loadb	(r1),r0
	addqt	#1,r1
	subq	#1,VALUE
	storeb	r0,(DST)
	jr	ne,.copy_match
	addq	#1,DST

	jump	(MAIN)
	nop

.getbit
	subq	#1,BC
	jump	pl,(LR)
	add	STOR,STOR
	loadb	(SRC),STOR
	moveq	#8,BC
	addqt	#1,SRC
	jr	.getbit
	shlq	#24,STOR
.elias
	move	LR,LR2
.eliasloop
	BL	(GETBIT)
	jump	cs,(LR2)
	nop
.elias_pre0
	BL	(GETBIT)
	jr	.eliasloop
	addc	VALUE,VALUE
.elias_pre
	jr	.elias_pre0
	move	LR,LR2
