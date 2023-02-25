# hexscr.inc

Debug output sub-routines using a hex-font

First parameter in `R0`.

X,Y position in `R1` as : (y<<16)|x

`R0`..`R4` destroyed.

- `InitHexScreen`

Setup internal variables and clear screen buffer

- `hx_PrintDEC`

Print decimal value (6 digits)

- `hx_PrintDEC_YX`

Same, but at x,y.

- `hx_PrintDEC2`

Print decimal value (2 digits)

- `hx_PrintDEC2_YX`

Same, but at x,y.

- `hx_PrintHEX`

Print hex value (8 digits)

- `hx_PrintHEX_YX`

Same, but at x,y.
