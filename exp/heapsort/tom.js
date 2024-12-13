;-*-asm-*-
	GPU

	include <js/macro/help.mac>

txt_ptr	reg 28
LOOP	reg 9
tmp2	reg 2
tmp1	reg 1
tmp0	reg 0

Flag	equ $f03ff0
screen	equ $f03ff4

rez_x	equ 320
rez_y	equ 200
bpp	equ 8

data	equ $100000

minihex_pixel_size equ 2
minihex_screen_width equ 320

	run $f03000

GPUstart::
	;; switch to 8 bit ROM for the Jaguar picture
	moveq	#15,r0
	shlq	#20,r0
	movei	#$1861,r1
	storew	r1,(r0)

	movei	#Flag,r15
	move	pc,r9
loop:
	moveq	#1,r0
	store	r0,(r15)
waitStart:
	cmpq	#0,r1
	jr	ne,waitStart
	load	(r15),r1

;;; Copy BootROM to RAM
	movei	#$e00000,r0
	movei	#data,r1
	movei	#128*1024/8,r2
.cpy	loadp	(r0),r3
	addq	#8,r0
	subq	#1,r2
	storep	r3,(r1)
	jr	ne,.cpy
	addq	#8,r1
//->
//->	movei	#$40000000,r0
//->	movei	#data,r1
//->	movei	#128*1024/4-32,r2
//->	movei	#$100030,r3
//->.fill	store	r0,(r1)
//->	sub	r3,r0
//->	subq	#1,r2
//->	jr	nz,.fill
//->	addqt	#4,r1

;;; short delay so the unsorted stuff can be seen
	movei	#3000000,r0
	subq	#1,r0
.wait	jr	ne,.wait
	subq	#1,r0

;;; now sort it
	movei	#compareFunc,r2
	movei	#128*1024/4,r1
	movei	#data,r0
	movei	#heapSort,r3
	BL	(r3)
//->.x	jr	.x
//->	nop
//->
	jump	(r9)
	addq	#1,r10

	align 4

r_start		reg 99
r_end		reg 99
root		reg 99
save_r14 	reg 99
child		reg 99
save_lr		reg 99
INNER		reg 99
OUTER		reg 99

	;; parameters
table		reg 0!
count		reg 1!
compare		reg 2!

	;; re-use
left		reg 0!
right		reg 1!

exit_hs:
	jump	(save_lr)
	move	save_r14,r14
heapSort::
	move	LR,save_lr
	move	r14,save_r14
	move	table,r14
	move	count,r_end
	move	count,r_start
	subq	#1,r_end
	shlq	#1,r_start
	shlq	#2,r_end

	move	pc,OUTER
	addqt	#4,OUTER
.outer
	jr	eq,exit_hs
	subq	#4,r_start	; once r_start is < 0 we don't care about
	jr	pl,.no_swap
	move	r_start,root

	load	(r14+r_end),tmp0
	load	(r14),tmp1
	moveq	#0,root
	store	tmp1,(r14+r_end)
	subq	#4,r_end
	store	tmp0,(r14)
.no_swap
	move	pc,INNER
	move	root,child
	addqt	#6,INNER
.inner
	shlq	#1,child
	addq	#4,child
	cmp	child,r_end
	jr	eq,.no_check
	load	(r14+child),left

	jump	mi,(OUTER)
	cmpq	#0,r_end	; fill delay slot

	addqt	#4,r14		; we want child+1
	load	(r14+child),right
//->	CMPS	left,right
	BL	(compare)
	jr	cc,.no_check
	subqt	#4,r14		; restore table pointer

	addq	#4,child
	move	right,left
.no_check:
	load	(r14+root),right
//->	CMPS	left,right
	BL	(compare)	; reverse compare!
	jump	cs,(OUTER)
	cmpq	#0,r_end	; fill delay slot

	store	right,(r14+child)
	store	left,(r14+root)
	jump	(INNER)
	move	child,root

	regmap

	align	4
compareFunc::
 IF 1
;;; -----------------------
;;; signed compare: C = 1 => r1 >= r0
	xor	r0,r1
	jr	pl,.equal_sign	; equal sign =>
	xor	r0,r1

	jump	(LR)
	cmp	r0,r1
	align	4
.equal_sign
	jump	(LR)
	cmp	r1,r0

;;; -----------------------
 ELSE
;;; -----------------------
;;; unsigned compare: C = 1 => r1 >= r0

	or	right,right	; make sure load indexed has finished
	jump	(LR)
	cmp	left,right
 ENDIF
	unreg child,root,left,right,table,save_lr,save_r14
	unreg INNER,compare,count,r_end,r_start,OUTER
