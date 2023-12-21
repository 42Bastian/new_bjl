	;; -*-asm-*-
	gpu
	include <js/macro/help.mac>
	include <js/symbols/jagregeq.js>


WANTED_SIZE	SET 128
BLOCKS		SET (WANTED_SIZE/64)		; max. is 10

	RUN $00F035AC
start:
;; ----------------------------------------
	;; stop DSP
	movei	#$3721c,r2
.wait
	cmpq	#1,r0		; wait for first interrupt of BIOS
	jr	nz,.wait
	load	(r2),r0

	movei	#DSP_CTRL,r1
	store	r3,(r1)		; stop DSP

	movei	#$f000e0,r0
	movei	#$e00012,r1
	loadb	(r1),r1		; $32 => K, $70 => M
	shrq	#2,r1
	movei	#$509c,r15
	jr	cs,.k
	store	r14,(r0)	; disable and ACK 68k interrupts
	addq	#$50a4-$509c,r15
.k
	movei	#$4e722000,r4	; Wait for GPU (see stub.S) (stop #$2000)
//->	movei	#$4e714e71,r4	; or two NOP
	movei	#$20380010,r5
	movei	#$67f62040,r6
	movei	#$4ed04e71,r7
	store	r4,(r15)
	store	r5,(r15+4)
	store	r6,(r15+8)
	store	r7,(r15+12)
;;; ----------------------------------------
;;; Copy 68k code to RAM
;;; ----------------------------------------
	movei	#$800410,r14
	load	(r14+4),r0	; get destination
	cmp	r0,r14
	jr	eq,.no_copy
	move	r0,r10
	load	(r14+8),r1	; get lenght in bytes
	addq	#7,r1
.copy
	loadp	(r14),r2
	addq	#8,r14
	subq	#8,r1
	storep	r2,(r0)
	jr	pl,.copy
	addq	#8,r0
.no_copy
	movei	#GPU_CTRL,r0
	moveq	#$10,r1
	moveq	#0,r3
	store	r10,(r1)	; start 68k code
done	jr	done
	store	r3,(r0)		; stop GPU

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
