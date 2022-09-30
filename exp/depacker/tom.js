;-*-asm-*-
	GPU

TurboPacker	EQU 1
LZ4		EQU 0

	include <js/macro/help.mac>

Flag	equ $f03ff0
screen	equ $f03ff4

	run $f03000

GPUstart::
	move	pc,r19
	addq	#4,r19
loop:
	movei	#Flag,r15
	moveq	#1,r1
	store	r1,(r15)
waitStart:
	cmpq	#0,r1
	jr	ne,waitStart
	load	(r15),r1

	load	(r15+8),r20
	cmpq	#0,r20
	jump	eq,(r19)
	nop

 IF LZ4 = 1
	load	(r15+4),r21
	load	(r15+12),r0
	movei	#depack_lz4,r1
 ENDIF

 IF TurboPacker = 1
	load	(r15+4),r21
	movei	#untp,r1
 ENDIF

	move	pc,r30
	jump	(r1)
	addq	#6,r30


	jump	(r19)
	nop
 IF LZ4 = 1
unlz4:
	include "unlz4.js"
unlz4_e:

unlz4_size	equ unlz4_e - unlz4
	echo "UNLZ4 size %Dunlz4_size"
 ENDIF
 IF TurboPacker = 1
_untp:
	include "untp.js"
_untp_e:
untp_size	equ _untp_e - _untp
	echo "UNTP size %Duntp_size"
 ENDIF
	align	8
