	;; -*-asm-*-
	gpu
	include <js/macro/help.mac>
	include <js/symbols/jagregeq.js>


WANTED_SIZE	SET 128
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

	RUN $00F035AC
start:
;; ----------------------------------------
	;; wait 2 VBLs of BIOS
	movei	#$3721c,r2
.wait
	load	(r2),r3
	cmpq	#2,r3			; wait for first interrupt of BIOS
	jr	cs,.wait

	moveq	#0,r15
	;; stop 68k and STOP OP
	movei	#$4e722700,r1		; stop #$2700
	store	r1,(r15)
	movei	#$60fa0004,r1		; bra.s .-4 + STOP OBJECT
	store	r1,(r15+4)
	moveq	#$10,r0
	shlq	#4,r0
	store	r15,(r0)		; point INT to our ISR

	moveq	#$f,r14
	shlq	#20,r14
	store	r15,(r14+$20)

	;; disable and ACK 68k interrupts
	movei	#$f000e0,r0
	sat8	r4
	shlq	#16,r4			; => $ffff0000
	store	r4,(r0)

	;; stop DSP
	movei	#DSP_CTRL,r1
	store	r15,(r1)		; stop DSP

	bset	#14,r15			; switch to bank 1
	movei	#GPU_FLAGS,r1
	store	r15,(r1)
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
