;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; Register usage: r0..r13
;;;
;;; pack with : exomizer raw -c -P7

 IFND exo_base
exo_base	EQU $200
exo_bits	EQU exo_base+52*2
 ENDIF

dst		reg 21
src		reg 20

	REGTOP	13
LR_save		REG 99
bitbuf		REG 99
value		REG 99
base		REG 99
bits		REG 99
index		REG 99
LOOP		REG 99
READBITS	REG 99
READ1BIT	REG 99
preload		REG 99
tmp1		REG 1
tmp0		REG 0

decrunch::
	move LR,LR_save

	loadb	(src),bitbuf
	addqt	#1,src
	loadb	(src),preload
	addqt	#1,src
	movei	#exo_read_bits,READBITS
	movei	#exo_read1bit,READ1BIT
	shlq	#24,bitbuf
	movei	#exo_base,base
	movei	#exo_bits,bits

tmp2	REG 99
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
	move	PC,LR
	jump	(READBITS)
	addqt	#6,LR
	jump	(READ1BIT)
	addqt	#4,LR
	jr	cc,.init2
	moveq	#1,r1
	bset	#3,value
.init2
	storeb	value,(bits)
	neg	value
	subq	#1,index
	jr	eq,.init9
	sh	value,r1
	add	r1,b2
	subq	#1,tmp2
	jump	ne,(LOOP)
	addqt	#1,bits

	moveq	#1,b2
	jump	(LOOP)
	moveq	#16,tmp2
.init9
	UNREG tmp2,b2

	;; main loop
offset		REG 99
length		REG 99

	moveq	#26,r0
	subq	#26-1,bits
	shlq	#2,r0
	subq	#26,bits
	sub	r0,base
	move	PC,LOOP
	addq	#16,LOOP	; = .loop

	;; literal
.literal
	storeb	preload,(dst)
	loadb	(src),preload
	addqt	#1,src
	addqt	#1,dst
	jump	(READ1BIT)
	move	LOOP,LR
.loop
	jr	cs,.literal
	moveq	#0,index
	addqt	#10,LR
.getindex
	jump	(READ1BIT)
	nop
	jr	cc,.getindex
	addq	#1,index

	subq	#16+1,index
	jump	eq,(LR_save)
	addq	#16,index

	move	index,r1
	add	bits,index
	shlq	#1,r1
	loadb	(index),r0
	add	base,r1
	loadw	(r1),length

	cmpq	#0,r0
	moveq	#0,value
	BL	ne,(READBITS)
	add	value,length	; <= LR
	addq	#28,LR		; LR => .default_cont

	cmpq	#2,length
	moveq	#16,index
	jr	eq,.case2
	moveq	#4,r0		; number of bits

	cmpq	#1,length
	jump	ne,(READBITS)	; length < 1 || length > 2
	nop
.case1
	moveq	#2,r0		; length == 1 => 2 bits only
	jump	(READBITS)
	addq	#32,index	; index = 48
.case2
	jump	(READBITS)
	addq	#16,index

.default_cont
	add	value,index
	move	index,r0
	shlq	#1,index
	add	bits,r0
	add	base,index
	loadb	(r0),r0
	moveq	#0,value
	cmpq	#0,r0
	loadw	(index),offset
	jump	ne,(READBITS)
	addqt	#22,LR
	add	value,offset

	neg	offset
	add	dst,offset
.match1
	loadb	(offset),r0
	addqt	#1,offset
	subq	#1,length
	storeb	r0,(dst)
	jr	ne,.match1
	addq	#1,dst

	jump	(READ1BIT)
	move	LOOP,LR

exo_read1bit
	shlq	#1,bitbuf
	jump	ne,(LR)
	nop
	move	preload,bitbuf
	loadb	(src),preload
	shlq	#24,bitbuf
	addqt	#1,src
	bset	#23,bitbuf
	jump	(LR)
	shlq	#1,bitbuf

.rbnew
	move	preload,bitbuf
	loadb	(src),preload
	shlq	#24,bitbuf
	addqt	#1,src
	bset	#23,bitbuf
	jr	.rbloop
	shrq	#1,value

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
	jump	eq,(LR)
	nop
	shlq	#8,value
.byte
	or	preload,value
	loadb	(src),preload
	jump	(LR)
	addqt	#1,src

	regmap
