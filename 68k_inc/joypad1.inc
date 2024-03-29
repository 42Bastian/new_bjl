*-*-asm-*-
* left Joypad
* var-base is A6
* predefined vars : long joy_pad[3]
*
***************
*  GetJoyPad1 *
JoyA_1          EQU $810E
JoyA_2          EQU $810D
JoyA_3          EQU $810B
JoyA_4          EQU $8107

GetJoyPad1:     movem.l d0-d2/a0,-(sp)
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
                lea     joy_pad(a6),a0
                move.l  (a0),d0
                move.l  d0,d1
                move.l  d2,(a0)
                and.l   #$FF0FFFFF,d2
                eor.l   d2,d0
                or.l    #$F00000,d2
                and.l   d2,d0
                move.l  d0,4(a0)
                move.l  (a0),d2
                eor.l   d2,d1
                and.l   d2,d1
                move.l  d1,8(a0)
                movem.l (sp)+,d0-d2/a0
                rts
***************
