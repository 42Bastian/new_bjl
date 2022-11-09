;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer

;;; pack with : exomizer raw -c -P7


exo_base	EQU $200
exo_bits	EQU exo_base+52*2

dst		reg 21
src		reg 20

	REGTOP	16
LR_save		REG 99
bitbuf		REG 99
value		REG 99
base		REG 99
bits		REG 99
index		REG 99
LOOP		REG 99
READBITS	REG 99
tmp2		REG 2
tmp1		REG 1
tmp0		REG 0

decrunch::
	move LR,LR_save

	loadb	(src),bitbuf
	addqt	#1,src
	movei	#exo_read_bits,READBITS
	shlq	#24,bitbuf
	movei	#exo_base,base
	movei	#exo_bits,bits

b1	REG 99
b2	REG 99

	;; init tables

	moveq	#16,tmp2
	moveq	#26,index
	shlq	#1,index
	moveq	#1,b2
.init1
	move	PC,LOOP
	storew	b2,(base)
	addqt	#2,base
	moveq	#3,r0
	BL	(READBITS)
	move	value,b1
	moveq	#1,r0
	BL	(READBITS)
	shlq	#3,value
	moveq	#1,r1
	or	value,b1
	storeb	b1,(bits)
	neg	b1
	sh	b1,r1
	subq	#1,index
	jr	eq,.init9
	add	r1,b2
	subq	#1,tmp2
	jump	ne,(LOOP)
	addqt	#1,bits

	moveq	#1,b2
	jump	(LOOP)
	moveq	#16,tmp2
.init9
	UNREG b1,b2
offset		REG 99
length		REG 99

	moveq	#26,r0
	subq	#26-1,bits
	shlq	#2,r0
	subq	#26,bits
	sub	r0,base
	move	PC,LOOP
	addq	#12,LOOP

	;; literal
.literal
	loadb	(src),r0
	addqt	#1,src
	storeb	r0,(dst)
	addqt	#1,dst
.loop
	moveq	#1,r0
	BL	(READBITS)
	jr	cs,.literal
	moveq	#0,index
.getindex
	moveq	#1,r0
	BL	(READBITS)
	jr	cc,.getindex
	addq	#1,index

	subq	#16+1,index
	jump	eq,(LR_save)
	addq	#16,index

	move	index,r1
	add	bits,index
	shlq	#1,r1
	add	base,r1
	loadb	(index),r0
	loadw	(r1),length

	cmpq	#0,r0
	moveq	#0,value
	BL	ne,(READBITS)
	add	value,length


	cmpq	#2,length
	jr	eq,.case2
	moveq	#4,r0

	cmpq	#1,length
	jr	eq,.case1
	moveq	#2,r0		; length == 1

	jr	.default
	moveq	#4,r0
.case1
	BL	(READBITS)
	jr	.default_cont
	addq	#32,value
.case2
	BL	(READBITS)	; length == 2
	jr	.default_cont
	addq	#16,value
.default			; length == 0 || length > 2
	BL	(READBITS)
.default_cont
	addq	#16,value
	move	value,r0
	shlq	#1,value
	add	bits,r0
	add	base,value
	loadb	(r0),r0
	loadw	(value),offset
	cmpq	#0,r0
	moveq	#0,value
	BL	ne,(READBITS)
	add	value,offset

	neg	offset
	add	dst,offset
.match
	loadb	(offset),r0
	addqt	#1,offset
	subq	#1,length
	storeb	r0,(dst)
	jr	ne,.match
	addq	#1,dst

	jump	(LOOP)
	nop

.rbnew
	loadb	(src),bitbuf
	addqt	#1,src
	shrq	#1,value
	shlq	#24,bitbuf
	jr	.rbloop
	bset	#23,bitbuf

exo_read_bits:
	move	r0,r1
	shlq	#29,r0
	moveq	#0,value
	jr	eq,.byte
	shrq	#29,r0

.rbloop
	shlq	#1,bitbuf
	jr	eq,.rbnew
	addc	value,value
	subq	#1,r0
	jr	ne,.rbloop
	btst	#3,r1

	move	value,r0
	jump	eq,(LR)
	shrq	#1,r0
.byte
	loadb	(src),r0
	addqt	#1,src
	shlq	#8,value
	or	r0,value
	jump	(LR)
	shrq	#1,r0

	regmap
