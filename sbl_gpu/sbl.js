	;; -*-asm-*-
	gpu
	include <js/macro/help.mac>
	include <js/symbols/jagregeq.js>


WANTED_SIZE	SET 192
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

	RUN $00F035AC
start:
;; ----------------------------------------
	movei	#$3721c,r10
.wait
	load	(r10),r0
	cmpq	#3,r0		; wait for first interrupt of BIOS
	jr	cs,.wait

	moveq	#$11,r15
	shlq	#4,r15
	move	r15,r14
	movei	#_68k,r0
	moveq	#(_68ke-_68k)/4,r1
.l	load	(r0),r2
	addq	#4,r0
	subq	#1,r1
	store	r2,(r15)
	jr	pl,.l
	addq	#4,r15

	moveq	#4,r0
	store	r0,(r0)			; STOP object

	shlq	#6,r0			; r0 = $100
	store	r14,(r0)		; point INT to our ISR

	moveq	#0,r0
	moveq	#$f,r14
	shlq	#20,r14
	store	r0,(r14+$20)		; stop OP

	;; stop DSP
	movei	#$f1a100,r14
	movei	#($1f<<9)|(0<<14)|(1<<17),r4
	store	r4,(r14)		; clear interrupts
	store	r0,(r14+$14)		; stop DSP

	movei	#$100000,r0
;;->	movei	#$f00058,r1
.wx	subq	#1,r0
	jr	ne,.wx
//->	storew	r0,(r1)

	store	r4,(r14)	; clear DSP interrupts (one more time)

	movei	#1<<14|%11111<<9,r0
	movei	#GPU_FLAGS,r1
	store	r0,(r1)
	nop
	nop
;; ----------------------------------------
	movei	#$f03000,r15
	movei	#$800410,r0	; skip "BS94" header
	load	(r0),r14	; get destination
	addq	#4,r0
	move	r14,r30
	load	(r0),r1		; get lenght in bytes
	movei	#$0880a403,r3	; copy routine (see below)
	movei	#$1881bdc3,r4
	movei	#$d774088e,r5
	movei	#$d3c0e400,r6
	store	r3,(r15)
	store	r4,(r15+4)
	store	r5,(r15+8)
	jump	(r15)
	store	r6,(r15+12)

	long
_68k:	incbin "_68k.bin"
_68ke:

 IF 0
.cpy
	addq	#4,r0
	load	(r0),r3
	subq	#4,r1
	store	r3,(r14)
	jr	nn,.cpy
	addq	#4,r14
	jump	(r30)
	nop
 ENDIF

end:
size	set end-start

free	set WANTED_SIZE-size
free0	set free

	IF free < 0
WANTED_SIZE	SET WANTED_SIZE+64
BLOCKS		SET BLOCKS+1
free		set free+64
	ENDIF
	if free > 0
	REPT	WANTED_SIZE-size
	dc.b	$42
	ENDR
	endif

	echo "GPU Size:%dsize | Free:%dfree0"
	echo "%dWANTED_SIZE"
 END
