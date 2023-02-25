# txtscr.inc

Text out put routines.

First parameter in `R0`.

X,Y position in `R1` as : (y<<16)|x

`R0`..`R4` destroyed.

- `InitHexScreen`

Setup internal variables and clear screen buffer

- `PrintDEC`

Print decimal value (6 digits)

- `PrintDEC_YX`

Same, but at x,y.

- `PrintDEC2`

Print decimal value (2 digits)

- `PrintDEC2_YX`

Same, but at x,y.

- `PrintHEX`

Print hex value (8 digits)

- `PrintHEX_YX`

Same, but at x,y.

- `PrintString`

Print a zero terminated string

- `PrintString_YX`

Same, but at x,y.

- `PrintChar`

Print a single character

- `PrintChar_XY`

Same, but at x,y.