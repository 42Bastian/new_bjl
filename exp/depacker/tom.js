;-*-asm-*-
	GPU

COPY_RAW::	EQU 0
TP::		EQU 0
TP_fast::	EQU 0
LZ4::		EQU 0
LZ4_fast::	EQU 0
LZSA1::		EQU 0
LZSA1_fast::	EQU 0
LZSA1A::	EQU 0
SHR::		EQU 0
ZX0::		EQU 0
ZX0_fast::	EQU 0
N0::		EQU 0
UPKR::		EQU 1

	include <js/macro/help.mac>

Flag	equ $f03ff0
screen	equ $f03ff4

	run $f03000

GPUstart::
	move	pc,r19
	addq	#4,r19
loop:
	movei	#Flag,r15
	moveq	#3,r0
	movei	#$f02114,r1
	store	r0,(r1)		; wakeup 68k
	store	r0,(r15)
waitStart:
	cmpq	#0,r0
	jr	ne,waitStart
	load	(r15),r0

	load	(r15+8),r20
	cmpq	#0,r20
	jump	eq,(r19)
	nop

 IF COPY_RAW = 1
copy_raw::
	load	(r15+4),r21
	load	(r15+12),r0
.copy:
	loadb	(r20),r1
	addqt	#1,r20
	subq	#1,r0
	storeb	r1,(r21)
	jr	ne,.copy
	addqt	#1,r21
 ENDIF

 IF LZ4 + LZ4_fast > 0
	load	(r15+4),r21
	load	(r15+12),r0
	movei	#depack_lz4,r1
 ENDIF

 IF LZSA1 + LZSA1_fast > 0
	load	(r15+4),r21
	movei	#unlzsa1,r1
 ENDIF
 IF LZSA1A = 1
	load	(r15+4),r21
	movei	#unlzsa1a,r1
 ENDIF


 IF TP + TP_fast > 0
	load	(r15+4),r21
	movei	#untp,r1
 ENDIF

 IF ZX0 + ZX0_fast > 0
	load	(r15+4),r21
	movei	#unzx0,r1
 ENDIF

 IF N0 > 0
	load	(r15+4),r21
	movei	#unn0,r1
 ENDIF
 IF UPKR > 0
	load	(r15+4),r21
	movei	#unupkr,r1
 ENDIF

 IF COPY_RAW = 0
	move	pc,r30
	jump	(r1)
	addq	#6,r30
 ENDIF
	movei	#loop,r19
	jump	(r19)
	nop
;;; ----------------------------------------
 IF LZ4 = 1
unlz4:
	include "unlz4.js"
unlz4_e:

unlz4_size	equ unlz4_e - unlz4
	echo "UNLZ4 size %Dunlz4_size"
 ENDIF

 IF LZ4_fast = 1
unlz4:
	include "unlz4_fast.js"
unlz4_e:

unlz4_size	equ unlz4_e - unlz4
	echo "UNLZ4-fast size %Dunlz4_size"
 ENDIF
 IF LZSA1 = 1
_unlzsa1:
	include "unlzsa1.js"
_unlzsa1_e:

unlzsa1_size	equ _unlzsa1_e - _unlzsa1
	echo "UNLZSA1 size %Dunlzsa1_size"
 ENDIF
 IF LZSA1_fast = 1
_unlzsa1:
	include "unlzsa1_fast.js"
_unlzsa1_e:

unlzsa1_size	equ _unlzsa1_e - _unlzsa1
	echo "UNLZSA1-fast size %Dunlzsa1_size"
 ENDIF
 IF LZSA1A = 1
_unlzsa1a:
	include "unlzsa1a.js"
_unlzsa1a_e:

unlzsa1a_size	equ _unlzsa1a_e - _unlzsa1a
	echo "UNLZSA1A size %Dunlzsa1a_size"
 ENDIF
 IF TP = 1
_untp:
	include "untp.js"
_untp_e:
untp_size	equ _untp_e - _untp
	echo "UNTP size %Duntp_size"
 ENDIF
 IF TP_fast = 1
_untp:
	include "untp_fast.js"
_untp_e:
untp_size	equ _untp_e - _untp
	echo "UNTP_fast size %Duntp_size"
 ENDIF

 IF SHR = 1
_unshr:
	include "unshr.js"
_unshr_e:
unshr_size	equ _unshr_e - _unshr
	echo "UNSHR_fast size %Dunshr_size"
 ENDIF
 IF ZX0 = 1
_unzx0:
	include "unzx0.js"
_unzx0_e:
unzx0_size	equ _unzx0_e - _unzx0
	echo "UNZX0 size %Dunzx0_size"
 ENDIF
 IF ZX0_fast = 1
_unzx0:
	include "unzx0_fast.js"
_unzx0_e:
unzx0_size	equ _unzx0_e - _unzx0
	echo "UNZX0_fast size %Dunzx0_size"
 ENDIF
 IF N0 = 1
_unn0:
	include "unn0.js"
_unn0_e:
unn0_size	equ _unn0_e - _unn0
	echo "UNN0 size %Dunn0_size"
 ENDIF
 IF UPKR = 1
_unupkr:
	include "unupkr.js"
_unupkr_e:
unupkr_size	equ _unupkr_e - _unupkr
	echo "UNUPKR size %Dunupkr_size"
 ENDIF
 align	8
