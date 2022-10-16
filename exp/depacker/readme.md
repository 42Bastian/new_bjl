# Depacker

A growing collection of depacker in RISC.

The example picture courtesy of Daniel Korican:
https://brainbox78.artstation.com/

The number shown is the time to depack the picture.

Copying the 128.000bytes byte wise takes 114ms, phrase wise 14ms

## [unlz4](unlz4.js)

Based on Ericde45's unlz4 for the YM player.

https://github.com/ericde45/YM2149_JAG/blob/main/ym1.s

Packer:

https://github.com/lz4/lz4

Pack with: `lz4.exe -9 -l --no-frame-crc [input file] [output file] `

Unpacker size: 98 bytes

Speed: 134ms for a 128.000 bytes picture.

## [unlz4_fast](unlz4_fast.js)

Speed optimized version.

Unpacker size: 124 bytes

Speed: 115ms for a 128.000 bytes picture.

## [untp](untp.js)

TurboPacker

https://github.com/42Bastian/tp

Unpacker size: 72 bytes

Speed: 139ms for a 128.000 bytes picture.

## [untp_fast](untp_fast.js)

TurboPacker (speed optimized)

https://github.com/42Bastian/tp

Unpacker size: 104 bytes

Speed: 122ms for a 128.000 bytes picture.

## [unlzsa1](unlzsa1.js)

LZSA Format 1 depacker (stream format)

### Original packer

https://github.com/emmanuel-marty/lzsa

Unpacker size: 182

Speed: 146ms for a 128.000 bytes picture.

Be sure to set `POS_OFFSET` 0.

### Extended version

Adds option `-p` to write positive offsets.

https://github.com/42Bastian/lzsa_jaguar

Pack with `lzsa -f 1 -p [input] [output]`

Unpacker size: 168

Speed: 137ms for a 128.000 bytes picture.

## [unlzsa1_fast](unlzsa1_fast.js)

Fast version.

Unpacker size: 196

Speed: 118ms for a 128.000 bytes picture.

## [unzx0](unzx0.js) (WIP)

ZX0 depacker, classic format.

Packer: https://github.com/einar-saukas/ZX0

Pack with `zx0 -c [input] [output]`

Unpacker size: 210

Speed: 268ms for a 128.000 bytes picture.
