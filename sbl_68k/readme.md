# sbl_68k

A minimal bootsector which starts 68k code either directly in ROM at $800410
or any RAM address >= $6000.

All needed is to place at the start of the 68k program following "header":
```
start:
	;;----  SBL header ----
	bra.w	start2
	dc.l	start
	dc.l	jag_end-start
	dc.l	0
start2:
	;; --------------------

	/* your code */

jag_end:
```

If `start == 0x800410`, then there will be no copy.

Then compile and link and build a binary.
Now concatenate sbl.XXX and the binary => Ready to launch ROM.
