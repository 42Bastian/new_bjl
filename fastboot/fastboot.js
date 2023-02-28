	;; -*-asm-*-
	gpu
	include <js/macro/help.mac>
	include <js/symbols/jagregeq.js>

WANTED_SIZE	EQU (64*1)

	RUN $00F035AC
start:

	;; set flag => Boot ok
	movei	#$3d0dead,r1
	shrq	#12,r14		; R14 = $f03xxx
	shlq	#12,r14
	store	r1,(r14) 	; => R14 = $f03000

	;; move OP to 0
	shrq	#20,r14
	shlq	#20,r14		; => R14 = $f00000
	moveq	#4,r1
	store	r1,(r1)
	moveq	#0,r1
	store	r1,(r14+$20)

	;; copy code
	movei	#$800404,r15
	load	(r15),r21	; destination
	load	(r15+8),r22
	subq	#8,r21
	addq	#7,r22
	shrq	#3,r22
	addq	#12,r15
.cpy	loadp	(r15),r1
	addq	#8,r15
	subq	#1,r22
	addqt	#8,r21
	jr	ne,.cpy
	storep	r1,(r21)

	movei	#$f02114,r1
stop:
	jr	stop
	store	r22,(r1)

	;; GPU RAM cleared by ROM,
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
