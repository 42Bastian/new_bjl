	;; canvas
rez_x		equ 320	; 160/192/256/320
rez_y		equ 200

 IF rez_x = 320
BLIT_WID	EQU BLIT_WID320
 ENDIF

 IF rez_x = 256
BLIT_WID	EQU BLIT_WID256
 ENDIF

 IF rez_x = 192
BLIT_WID	EQU BLIT_WID192
 ENDIF

 IF rez_x = 160
BLIT_WID	EQU BLIT_WID160
 ENDIF


screen0		EQU $100000
