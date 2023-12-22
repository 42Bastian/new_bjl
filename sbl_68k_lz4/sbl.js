	;; -*-asm-*-
	gpu
	include <js/macro/help.mac>
	include <js/symbols/jagregeq.js>


WANTED_SIZE	SET 256
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
//->	movei	#$4e722000,r4	; Wait for GPU (see stub.S) (stop #$2000)
	movei	#$4e714e71,r4	; or two NOP
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
	load	(r14),r21	; get destination
	move	r21,r10
	load	(r14+4),r0	; get lenght in bytes
	move	r14,r20
	addq	#8,r20
	sat8	r14
	move	pc,r30
	jr	depack_lz4
	addq	#6,r30
.no_copy
	movei	#GPU_CTRL,r0
	moveq	#$10,r1
	moveq	#0,r3
	store	r10,(r1)	; start 68k code
done	jr	done
	store	r3,(r0)		; stop GPU

;;; -*-asm-*-

; input:
;;; R20 : packed buffer
;;; R21 : output buffer
;;; r14 : $ff
;;; R0  : LZ4 packed block size (in bytes)
;;; r30 : return address
;;;
;;; Register usage (destroyed!)
;;; r1,r2,r11,r12,r13
;;;
;;; R1,R2     : temp register
;;; r11       : jump destination
;;; r13       : end of packed data

depack_lz4::
	move	R20,R13
	add	R0,R13		; packed buffer end
.dpklz4_tokenLoop:
	move	pc,r11
	loadb	(R20),R0
	addqt	#1,R20
	moveq	#15,r1
	and	r0,r1
	shrq	#4,R0
	jr	eq,.skip1
	cmpq	#15,R0
.dpklz4_readLen1:
	loadb	(R20),R2
	jr	ne,.dpklz4_litcopy
	addqt	#1,R20
	add	R2,R0
	jr	.dpklz4_readLen1:
	cmp	R14,R2		; r2 = $ff ?

.dpklz4_litcopy1:
	addqt	#1,R20
.dpklz4_litcopy:
	subq	#1,R0
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,.dpklz4_litcopy1
.skip1
	loadb	(R20),R2

	; end test is always done just after literals
	cmp	R20,R13
	jump	eq,(r30)	; done? => return
	addqt	#1,R20
	loadb	(R20),R0
	addqt	#1,R20
	shlq	#8,R0
	add	R2,R0
	neg	r0
	cmpq	#15,r1
	addqt	#4,r1		; minimum match count: 4
	jr	ne,.dpklz4_copy
	add	r21,r0		; source = dest - offset
.dpklz4_readLoop2:
	loadb	(r20),r2
	add	R2,R1
	cmp	R14,R2		; r2 = $ff ?
	jr	eq,.dpklz4_readLoop2
	addqt	#1,R20

.dpklz4_copy:
	move	r0,r2
	xor	r21,r2
	btst	#0,r2
	loadb	(R0),R2
	jr	eq,.copyloop2a
	btst	#0,r0

.copyloop1:
	addq	#1,R0
	subq	#1,R1
	storeb	R2,(R21)
	addqt	#1,R21
	jr	ne,.copyloop1
	loadb	(R0),R2

	jump	(R11)
	nop

.copyloop2a
	jr	eq,.copyloop2
	nop
	addqt	#1,r0
	subq	#1,r1
	storeb	r2,(r21)
	addq	#1,r21
.copyloop2
	loadw	(r0),r2
	subq	#2,r1
	storew	r2,(r21)
	jump	eq,(r11)
	addqt	#2,r21
	jr	pl,.copyloop2
	addqt	#2,r0

	jump	(r11)
	subq	#1,r21		; compensate last write

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
