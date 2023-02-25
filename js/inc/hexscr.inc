;-*-asm-*-
;;; HEX font Debug Print
;;; (c) 2023 42Bastian
;;;

;;; ----------------------------------------
;;; Init local variables
;;;
;;; r0 - CLUT index
;;; r1 - foreground:background color
;;; r2 - framebuffer
;;; r3 - font data

InitHexScreen::
	PUSHLR	r4
	shlq	#1,r0
	movei	#$f00400,r4
	add	r0,r4
	store	r1,(r4)
	movei	#HexScreen,r4
	store	r2,(r4)
	addq	#4,r4
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
;;; Print 6 digit decimal value
;;; r0 - value
hx_PrintDEC::
	movei	#HexScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print 6 digit decimal value
;;; r0 - value
;;; r1 - y:x position

hx_PrintDEC_YX::
	PUSHLR	r4,r5,r6,r7,r14
	abs	r0
	moveq	#0,r5
	jr	cc,.pl
	store	r1,(r14+8)
	subq	#1,r5
.pl
	movei	#10000,r1
	move	r0,r6
	div	r1,r0
	movei	#HexScreen,r14
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
hx_PrintDEC2::
	movei	#HexScreen+8,r1
	load	(r1),r1

;;; ----------------------------------------
;;; r0 - value
;;; r1 - y:x position

hx_PrintDEC2_YX::
	PUSHLR	r4,r5,r14
	movei	#HexScreen,r14
	abs	r0
	moveq	#0,r5
	jr	cc,.pl
	store	r1,(r14+8)
	subq	#1,r5
.pl
	movei	#hx__PrintDEC2,r1
	BL	(r1)
	POPLR	r4,r5,r14

;;; ----------------------------------------
;;; Print 8 digit hex value
;;; r0 - value

hx_PrintHEX::
	movei	#HexScreen+8,r1
	load	(r1),r1
;;; ----------------------------------------
;;; Print 8 digit hex value
;;; r0 - value
;;; r1 - y:x cursor
hx_PrintHEX_YX::
	PUSHLR	r4,r5,r6,r7,r8,r14
	movei	#HexScreen,r14
	store	r1,(r14+8)
	movei	#hx__PrintHEX0,r8
	moveq	#3,r6
	move	r0,r7
	move	pc,LR
	addq	#10,LR
.lh
	rorq	#24,r7
	jump	(r8)
	move	r7,r0
	subq	#1,r6
	jr	pl,.lh
	nop

	POPLR	r4,r5,r6,r7,r8,r14

;;; ----------------------------------------
;;; internal function
hx__PrintDEC2::
	shlq	#24,r0
	movei	#(65536+5)/10,r1
	shrq	#24,r0
	moveq	#9,r2
	mult	r1,r0
	add	r0,r2
	shrq	#16,r0
	moveq	#10,r1
	mult	r1,r2
	shlq	#4,r0
	shrq	#16,r2
	jr	hx__PrintHEX1
	or	r2,r0
	;; fall thru
;;; ----------------------------------------
;;; internal function
;;; Print R0
hx__PrintHEX0::
	bclr	#8,r0
	moveq	#0,r5
;;; ----------------------------------------
;;; internal function
;;; Print R0, if bit 8 is set, space
;;; R5 - xor mask
;;; r0-r4 destroyed
hx__PrintHEX1
	load	(r14+8),r3		; y:x
	load	(r14),r2
	move	r3,r1
	shrq	#16,r3
	shlq	#16,r1
	shrq	#16,r1
	add	r1,r2
	addq	#1,r1
	movei	#((max_x_txt>>3)-1)<<16,r4
	shlq	#16,r1
	cmp	r1,r4
	jr	pl,.no_nl
	or	r3,r1
	moveq	#1,r1
	add	r3,r1
.no_nl
	shrq	#16,r4
	rorq	#16,r1
	addq	#1,r4
	store	r1,(r14+8)
	mult	r4,r3
	moveq	#6,r1
	mult	r1,r3
	add	r3,r2

	shlq	#23,r0
	movei	#.space,r3
	shrq	#23,r0
	btst	#8,r0
	jump	ne,(r3)
	moveq	#0,r3

	moveq	#5,r3
	mult	r3,r0
	load	(r14+4),r1
	add	r0,r1
.char
	loadb	(r1),r0
	addqt	#1,r1
	xor	r5,r0
	subq	#1,r3
	storeb	r0,(r2)
	jr	ne,.char
	add	r4,r2

	jump	(LR)
	storeb	r5,(r2)

.space:
	subq	#1,r1
	storeb	r3,(r2)
	jr	ne,.space
	add	r4,r2
	jump	(LR)
	storeb	r1,(r2)
