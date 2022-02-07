;; -*-asm-*-
;;********************
;; Keyboard-routines *
;; created : 22.09.96 by 42Bastian Schick
;; last modified: 18.6.97
;;
;; variables :
;;  RS.w KeyPtrIn
;;  RS.w KeyPtrOut
;;  RS.l KeyBuffer,8
;;  RS.l KeyLast
;;  RS.l KeyLastRep
;;  RS.l KeyCurrent
;;  RS.l KeyMask
;;  RS.w KeyCounter

;;-> .ifdef KeyDelay
;;->KeyDelay        EQU 20
;;-> endif

;;***************
;; ReadJoyPad1  *
;; left joypad  *

JoyA_1          EQU $810E
JoyA_2          EQU $810D
JoyA_3          EQU $810B
JoyA_4          EQU $8107

ReadJoyPad1:
	movem.l d0-d2/a0,-(sp)
        move.l  #$F0FFFFFC,d1
        moveq   #$FF,d2
        lea     $F14000,a0
        move.w  #JoyA_1,(a0)
        move.l  (a0),d0
        or.l    d1,d0
        ror.l   #4,d0
        and.l   d0,d2   ; A,Pause,Cursor

        move.w  #JoyA_2,(a0)
        move.l  (a0),d0
        or.l    d1,d0
        ror.l   #8,d0
        and.l   d0,d2   ; B,1,4,7,*

        move.w  #JoyA_3,(a0)
        move.l  (a0),d0
        or.l    d1,d0
        rol.l   #6,d0
        rol.l   #6,d0
        and.l   d0,d2   ; C,2,5,8,0

        move.w  #JoyA_4,(a0)
        move.l  (a0),d0
        or.l    d1,d0
        rol.l   #8,d0
        and.l   d0,d2   ; Option,3,6,9,#

        not.l   d2
        move.l d2,KeyCurrent(a6)
        movem.l (sp)+,d0-d2/a0
        rts
;;***************
;; Keyboard     *

Keyboard:
	movem.l d0-d2/a0,-(sp)

        bsr ReadJoyPad1
        move.l KeyCurrent(a6),d0
        move.l d0,d1
        beq.s .l100

        move.l KeyMask(a6),d2
        and.l d2,d0
        not.l d2
        and.l d2,d1
        beq.s .l3                       ; nor repeatable key

        cmp.l KeyLastRep(a6),d1         ; same as before
        beq.s .l1
        move.l d1,KeyLastRep(a6)      ; and save current key
        move.w #KeyDelay,KeyCounter(a6)     ; delay
        bra.s .l3

.l1:
        subq.w #1,KeyCounter(a6)        ; delay finished ?
        bpl.s .l2                       ; no =>
        clr.w KeyCounter(a6)          ; but first delay again
        bra.s .l3                       ; =0 => was repeat
.l2:
        moveq #0,d1                     ; we're still in delay

.l3:
        tst.l d0
        beq.s .l4                       ; =0 => there're non
        cmp.l KeyLast(a6),d0            ; same as last time
        bne.s .l4
        moveq #0,d0
        bra.s .l5

.l4:
        move.l d0,KeyLast(a6)
.l5:
        or.l d1,d0                      ; merge
        beq.s .l99                      ; zero => no key

        lea KeyBuffer(a6),a0
        move.w KeyPtrIn(a6),d1
        move.l d0,(a0,d1.w)             ; insert in buffer
        addq.w #4,d1                    ; increase ptr
        and.w #7*4,d1                   ; wrap ptr
        move.w d1,KeyPtrIn(a6)
        cmp.w KeyPtrOut(a6),d1          ; overrun ?
        bne.s .l99
        addq.w #4,d1                  ; yes => increas out-ptr
        and.w #7*4,d1
        move.w d1,KeyPtrOut(a6)
.l99:
        movem.l (sp)+,d0-d2/a0
        rts

.l100:
	clr.l KeyLast(a6)               ; realy no key =>
        clr.l KeyLastRep(a6)            ; clear last ones
        movem.l (sp)+,d0-d2/a0
        rts
;;***************
;; GetKey       *

GetKey:
        move.w KeyPtrOut(a6),d0
        cmp.w KeyPtrIn(a6),d0
        beq.s .l99
        movem.l d1/a0,-(sp)
        move.w d0,d1
        lea KeyBuffer(a6),a0
        move.l 0(a0,d1.w),d0
        addq.w #4,d1
        and.w #7*4,d1
        move.w d1,KeyPtrOut(a6)
        movem.l (sp)+,d1/a0
        tst.l d0
        rts

.l99:
        moveq #0,d0
        rts
;;********************
