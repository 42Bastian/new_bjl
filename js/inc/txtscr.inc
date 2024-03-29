;-*-asm-*-
;;; Text routines using 8x8 font
;;; (c) 2023 42Bastian
;;;

;;; ----------------------------------------
;;; Init local variables
;;;
;;; r0 - CLUT index
;;; r1 - foreground:background color
;;; r2 - framebuffer
;;; r3 - font data

InitTxtScreen::
	PUSHLR	r4
	shlq	#1,r0
	movei	#$f00400,r4
	add	r0,r4
	store	r1,(r4)
	movei	#TextScreen,r4
	store	r2,(r4)
	addq	#4,r4
	addq	#8,r3		; skip header
	store	r3,(r4)
	addq	#4,r4

	movei	#((max_x_txt>>3)*max_y_txt)>>2,r1
	moveq	#0,r0
.clr
	subq	#1,r1
	store	r0,(r2)
	jr	nz,.clr
	addqt	#4,r2
	store	r0,(r4)
	POPLR	r4

;;; ----------------------------------------
;;; Print  a zero terminated string
;;; r0 - ptr to zero terminated string

PrintString:
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print a zero terminated string
;;; r0 - ptr
;;; r1 - y,x pos

PrintString_YX:
	PUSHLR	r4,r5,r6,r14
	movei	#TextScreen,r14
	store	r1,(r14+8)
	move	r0,r5
	movei	#__PrintChar,r6
	move	PC,LR
	addq	#4,LR
.ps:
	loadb	(r5),r0
	cmpq	#0,r0
	jump	ne,(r6)
	addq	#1,r5

	POPLR	r4,r5,r6,r14
;;; ----------------------------------------
;;; Print 6 digit decimal value
;;; r0 - value

PrintDEC::
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print 6 digit decimal value
;;; r0 - value
;;; r1 - y:x position

PrintDEC_YX::
	PUSHLR	r4,r5,r6,r7,r14
	movei	#TextScreen,r14
	abs	r0
	moveq	#0,r5
	jr	cc,.pl
	store	r1,(r14+8)
	subq	#1,r5
.pl
	movei	#10000,r1
	move	r0,r6
	div	r1,r0
	movei	#__PrintDEC2,r7
	move	r0,r2
	mult	r1,r2
	sub	r2,r6
	BL	(r7)
	move	r6,r0
	movei	#100,r1
	div	r1,r0
	move	r0,r2
	mult	r1,r2
	sub	r2,r6
	BL	(r7)
	move	r6,r0
	BL	(r7)

	POPLR	r4,r5,r6,r7,r14

;;; ----------------------------------------
;;; Print 2 digit decimal value
;;; r0 - value
PrintDEC2::
	movei	#TextScreen+8,r1
	load	(r1),r1

;;; ----------------------------------------
;;; r0 - value
;;; r1 - y:x position

PrintDEC2_YX::
	PUSHLR	r4,r14
	movei	#TextScreen,r14
	abs	r0
	jr	cc,.pl
	store	r1,(r14+8)
	movei	#__PrintChar,r1
	PUSH	r0
	movei	#'-',r0
	BL	(r1)
	POP	r0
.pl
	movei	#__PrintDEC2,r1
	BL	(r1)
	POPLR	r4,r14

;;; ----------------------------------------
;;; Print 8 digit hex value
;;; r0 - value

PrintHEX::
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print 8 digit hex value
;;; r0 - value
;;; r1 - y:x cursor
PrintHEX_YX::
	PUSHLR	r4,r5,r6,r7,r14
	movei	#TextScreen,r14
	movei	#__PrintDigit,r5
	store	r1,(r14+8)
	moveq	#7,r6
	move	r0,r7
.pc	move	pc,LR
	addq	#.ret-.pc,LR
.lh
	shrq	#28,r0
	cmpq	#10,r0
	jump	mi,(r5)
	shlq	#4,r7
	jump	(r5)
	addq	#7,r0
.ret
	subq	#1,r6
	jr	pl,.lh
	move	r7,r0

	POPLR	r4,r5,r6,r7,r14
;;; ----------------------------------------
;;; Print single character
;;; r0 - chararcter
PrintChar::
	movei	#TextScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print single character at y:x
;;; r0 - value
;;; r1 - y:x cursor
PrintChar_YX::
	PUSHLR	r4,r14
	movei	#TextScreen,r14
	movei	#__PrintChar,r4
	store	r1,(r14+8)
	BL	(r4)
	POPLR	r4,r14
;;; ----------------------------------------
;;; internal function
__PrintDEC2::
	shlq	#24,r0
	movei	#(65536+5)/10,r1
	shrq	#24,r0
	mult	r1,r0
	moveq	#9,r2
	add	r0,r2
	shrq	#16,r0
	PUSH	LR,r2
	movei	#__PrintDigit,r1
	BL	(r1)
	POP	LR,r0
	moveq	#10,r1
	mult	r1,r0
	shrq	#16,r0
	;; fall thru
;;; ----------------------------------------
;;; internal function
;;; Print R0
__PrintDigit::
	moveq	#'0'>>1,r1
	add	r1,r0
	add	r1,r0

;;; ----------------------------------------
;;; internal function
;;; Print R0, if bit 8 is set, space
;;;
;;; r0-r4 destroyed
__PrintChar
	load	(r14+8),r3		; y:x
	load	(r14),r2
	move	r3,r1
	shrq	#16,r3
	shlq	#16,r1
	shrq	#16,r1
	add	r1,r2
	addq	#1,r1
	shlq	#16,r1
	movei	#((max_x_txt>>3)-1)<<16,r4
	cmp	r1,r4
	jr	pl,.no_nl
	or	r3,r1
	moveq	#1,r1
	add	r3,r1
.no_nl
	rorq	#16,r1
	shrq	#16,r4
	store	r1,(r14+8)
	addq	#1,r4
	load	(r14+4),r1
	mult	r4,r3
	shlq	#24,r0
	shlq	#3,r3
	shrq	#24-3,r0
	add	r3,r2
	add	r0,r1
	moveq	#7,r3
.char
	loadb	(r1),r0
	addqt	#1,r1
	subq	#1,r3
	storeb	r0,(r2)
	jr	ne,.char
	add	r4,r2

	loadb	(r1),r0
	jump	(LR)
	storeb	r0,(r2)
