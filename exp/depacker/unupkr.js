;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r13,r20,r21
;;;

DST		REG 21
SRC		REG 20

	REGTOP 17
LR_save		REG 99
LR_save2	REG 99
GETBIT		REG 99
GETLENGTH	REG 99
LITERAL		REG 99
LOOP		REG 99
index		REG 99
bit_pos		REG 99
state		REG 99
prev_was_match	REG 99
offset		REG 99
prob		reg 99
byte		REG 99
ndata		reg 99
PROBS		reg 3
tmp2		reg 2
tmp1		REG 1
tmp0		REG 0

upkr_probs	equ $200

SIZEOF_PROBS	EQU 1+255+1+2*32+2*32

unupkr::
	move	LR,LR_save
	movei	#$80808080,tmp0
	movei	#upkr_probs,tmp1
	movei	#SIZEOF_PROBS,tmp2
.init	store	tmp0,(tmp1)
	subq	#4,tmp2
	jr	pl,.init
	addq	#4,tmp1

	loadb	(SRC),ndata
	addq	#1,SRC
	moveq	#0,offset
	moveq	#0,state
	moveq	#0,prev_was_match
	movei	#.literal,LITERAL
	movei	#getlength,GETLENGTH
	movei	#getbit,GETBIT
	movei	#upkr_probs,PROBS
.loop
	move	pc,LOOP
	moveq	#0,index
	BL	(GETBIT)
	jump	cc,(LITERAL)
	moveq	#0,r0
	cmpq	#1,prev_was_match
	jr	eq,.newoff
	bset	#8,r0
	move	r0,index
	BL	(GETBIT)
	jr	cc,.oldoff
	shlq	#8,r0
.newoff
	addq	#1,r0		; r0 = 257
	BL	(GETLENGTH)
	subq	#1,r0
	jump	eq,(LR_save)
	move	r0,offset
.oldoff
	movei	#257+64,r0
	BL	(GETLENGTH)

	move	DST,r1
	sub	offset,r1

	btst	#0,r1
	jr	ne,.cpymatch1
	btst	#0,DST
	jr	ne,.cpymatch1
	nop
.cpymatch2
	loadw	(r1),r2
	addqt	#2,r1
	storew	r2,(DST)
	subq	#2,r0
	addqt	#2,DST
	jump	eq,(LOOP)
	moveq	#1,prev_was_match
	jr	pl,.cpymatch2
	nop
	subq	#1,DST
	jump	(LOOP)
	moveq	#1,prev_was_match

.cpymatch1
	loadb	(r1),r2
	subq	#1,r0
	addqt	#1,r1
	storeb	r2,(DST)
	jr	ne,.cpymatch1
	addq	#1,DST

	jump	(LOOP)
	moveq	#1,prev_was_match

	regmap

.literal
	moveq	#1,byte
	move	byte,index
.getbit
	BL	(GETBIT)
	addc	byte ,byte

	btst	#8,byte
	jr	eq,.getbit
	move	byte,index

	storeb	byte,(DST)
	addq	#1,DST

	jump	(LOOP)
	moveq	#0,prev_was_match

getlength:
	move	LR,LR_save2
	moveq	#0,byte
	move	r0,index
	moveq	#0,bit_pos
.gl
	BL	(GETBIT)
	jr	cc,.exit
	addq	#1,index
	BL	(GETBIT)
	sh	bit_pos,r0
	subq	#1,bit_pos
	or	r0,byte
	jr	.gl
	addq	#1,index
.exit
	moveq	#1,r0
	sh	bit_pos,r0
	jump	(LR_save2)
	or	byte,r0

.newbyte:
	move	ndata,r2
	shlq	#8,state
	loadb	(SRC),ndata
	or	r2,state
	addq	#1,SRC
	move	state,r2
	shrq	#12,r2
	jr	ne,.done
	moveq	#0,r2
	jr	.newbyte
//->	move	state,r0

getbit
	move	PROBS,r1
	move	state,r2
	add	index,r1		; r1 = &probs[index]
	shrq	#12,r2
	loadb	(r1),prob
	jr	eq,.newbyte
	moveq	#0,r2
.done
	move	state,r0
	bset	#8,r2
	shlq	#24,r0
	shrq	#8,state
	shrq	#24,r0
	cmp	prob,r0

	jr	cs,.one
	nop
	sub	prob,r2		; 256-prob
	mult	state,r2	; (256-prob)*(state>>8)
	add	r0,r2		; (256-prob)*(state>>8)+(state & 0xff)
	sub	prob,r2		; (256-prob)*(state>>8)+(state & 0xff)-prob
	move	r2,state

	moveq	#8,r2
	add	prob,r2
	shrq	#4,r2		; (prob+8)>>4
	sub	r2,prob		; prob - (prob+8)>>4

	moveq	#0,r0
	storeb	prob,(r1)
	jump	(LR)
	shrq	#1,r0		; C = 0, r0 = 0
.one
	mult	prob,state	; prob*(state>>8)
	add	r0,state	; prob*(state>>8)+(state & 0xff)

	sub	prob,r2		; 256-prob
	addq	#8,r2
	shrq	#4,r2
	add	r2,prob

	moveq	#3,r0
	storeb	prob,(r1)
	jump	(LR)
	shrq	#1,r0		; C = 0, r0 = 1
