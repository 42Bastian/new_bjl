;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r0-r17,r20,r21
;;;

;;; pack with: upkr --invert-is-match-bit

DST		REG 21
SRC		REG 20

	REGTOP 16
LR1		REG 99
LR2		REG 99
GETBIT		REG 99
LOOP		REG 99
index		REG 99
bit_pos		REG 99
state		REG 99
prev_was_match	REG 99
offset		REG 99
prob		reg 99
byte		REG 99
PROBS		reg 99
tmp2		reg 2
tmp1		REG 1
tmp0		REG 0

	REGMAP

upkr_probs	equ $200

SIZEOF_PROBS	EQU 1+255+1+2*32+2*32

unupkr::
	moveq	#0,tmp0
	movei	#upkr_probs,PROBS
	bset	#7,tmp0
	movei	#SIZEOF_PROBS,tmp2
	move	PROBS,tmp1
.init
	storeb	tmp0,(tmp1)
	subq	#1,tmp2
	jr	pl,.init
	addq	#1,tmp1

//->	moveq	#0,offset		; not sure if needed, oldoff could be 0

	movei	#getbit,GETBIT
	jr	.start
	moveq	#0,state

.literal
	shrq	#1,byte		; prepare 1st "addc"
	move	pc,LR1
.getbit
	addc	byte,byte
	btst	#8,byte
	jump	eq,(GETBIT)
	move	byte,index

	storeb	byte,(DST)
	addq	#1,DST
.start
	moveq	#0,prev_was_match
	move	pc,LOOP
.loop
	moveq	#0,index
	move	pc,LR1
	jump	(GETBIT)
	addq	#6,LR1
	jr	cc,.literal
	moveq	#1,byte
	cmpq	#1,prev_was_match
	addqt	#16,LR1		; => .checkmatch
	jr	eq,.newoff
	shlq	#8,r0
	jump	(GETBIT)
.checkmatch
	move	r0,index
	jr	cc,.oldoff
	shlq	#8,r0
.newoff
	move	pc,LR2
	jr	.getlength_trampoline
	addq	#1,r0		; r0 = 257

	subq	#1,r0
	jump	eq,(LR)
	move	r0,offset

.oldoff
	movei	#257+64,r0
	move	PC,LR2
.getlength_trampoline:
	jr	getlength
	addq	#6,LR2

	move	DST,r1
	sub	offset,r1
.cpymatch1
	loadb	(r1),r2
	subq	#1,r0
	addqt	#1,r1
	storeb	r2,(DST)
	jr	ne,.cpymatch1
	addq	#1,DST

	jump	(LOOP)
	moveq	#1,prev_was_match

getlength:
	moveq	#0,byte
	move	r0,index

	move	pc,LR1
	jr	getbit1		; call getbit, return to .gl
	moveq	#0,bit_pos
.gl
	jr	cc,.exit
getbit1
	addq	#6,LR1		; => return to "sh ..."
	jr	getbit
	sh	bit_pos,r0
	subq	#1,bit_pos	; sh < 0 => shift left!
	or	r0,byte
	jr	getbit
	subq	#6,LR1		; => return to ".gl"
.exit
	moveq	#1,r0
	sh	bit_pos,r0
	jump	(LR2)
	or	byte,r0

.newbyte:
	loadb	(SRC),r2
	shlq	#8,state
	addq	#1,SRC
	or	r2,state
getbit
	move	PROBS,r1
	move	state,r2
	add	index,r1		; r1 = &probs[index]
	shrq	#12,r2
	loadb	(r1),prob
	jr	eq,.newbyte
	move	state,r2
	move	state,r0
	shlq	#24,r2
	shrq	#8,r0
	shrq	#24,r2
	cmp	prob,r2
	addqt	#1,index
	jr	cs,.one
	mult	prob,r0

	;; state -= ((state >> 8) + 1)*prob
	;; prob -= (prob+8)>>4
	move	prob,r2
	add	prob,r0
	addq	#8,r2
	sub	r0,state
	shrq	#4,r2
	moveq	#0,r0		; C = 0, r0 = 0
	jr	.ret
	sub	r2,prob

.one
	;; state = (state >> 8)*prob+(state & 0xff)
	;; prob += (256 + 8 - prob) >> 4
	move	r2,state
	movei	#256+8,r2
	add	r0,state
	sub	prob,r2		; 256-prob+8
	shrq	#4,r2
	add	r2,prob

	moveq	#3,r0		; => C = 1, R = 1
.ret
	storeb	prob,(r1)
	jump	(LR1)
	shrq	#1,r0
