;-*-asm-*-
	GPU

max_x_txt	equ 320
max_y_txt	equ 25*8

	include <js/macro/help.mac>

	RSSET $f03f80

	include <js/var/txtscr.var>

Flag	equ $f03ff0

	run $f03000

GPUstart::
	movei	#Flag-4,r15
	move	r15,SP
	addq	#4,r15
;;; r0 - CLUT index
	movei	#254,r0
;;; r1 - foreground:background color
	movei	#$ffff70ff,r1
;;; r2 - framebuffer
	load	(r15+8),r2
;;; r3 - font data
	load	(r15+4),r3
	movei	#InitTxtScreen,r4
	BL	(r4)

	moveq	#0,r20
	movei	#loop,r19
loop:
	movei	#$f00058,r10
	moveq	#1,r0

	storew	r0,(r10)
	store	r0,(r15)
waitStart:
	cmpq	#0,r1
	jr	ne,waitStart
	load	(r15),r1
	store	r15,(r10)

	movei	#0<<16,r0
	movei	#TextScreen+8,r1
	store	r0,(r1)
	movei	#25*40,r4
	moveq	#0,r5
.pr
	move	r5,r0
	movei	#PrintChar,r1
	BL	(r1)
	subq	#1,r4
	jr	nz,.pr
	addq	#1,r5

	movei	#loop,r0
	jump	(r0)
	addq	#1,r20


	include <js/inc/txtscr.inc>
eof_text:
sizeof_text equ eof_text-InitTxtScreen
	echo "txscr: %D sizeof_text"

//->	align	4
