# Depacker

A growing collection of depacker in RISC.

The example picture courtesy of Daniel Korican:
https://brainbox78.artstation.com/

The number shown is the time to depack the picture.

## unlz4

Based on Ericde45's unlz4 for the YM player.

https://github.com/ericde45/YM2149_JAG/blob/main/ym1.s

Packer:

https://github.com/lz4/lz4

Pack with: `lz4.exe -9 -l --no-frame-crc [input file] [output file] `

Unpacker size: 116 bytes

## untp

TurboPacker

https://github.com/42Bastian/tp

Unpacker size: 78 bytes
