# Depacker

A growing collection of depacker in RISC.

The example picture courtesy of Daniel Korican:
https://brainbox78.artstation.com/

The number shown is the time to depack the picture.

* File sizes (in bytes)

| Original | lz4 -12 | zx0 -c | Turbopacker | lzsa -f1 -p | n0  | upkr | Exomizer |
| :-:      | :-:     | :-:    | :-:         | :-:         | :-: | :-: | :-: |
| 128000   | 62355   | 53521  | 63920       | 60143       | 57524 | 45248 | 49207 |

* Unpacker size (in bytes)

| lz4 | lz4 fast | zx0 | zx0 fast | TP  | TP fast | lzsa -p | fast lzsa -p | lzsa | n0  | upkr | upkr fast| Exomizer |
| :-: | :-:      | :-: | :-:      | :-: | :-:     | :-:     | :-:          |  :-: | :-: | :-:  | :-:      | :-:      |
| 94  | 138      | 132 | 192      | 70  | 136     | 168     | 195          | 182  | 162 | 240  | 318      | 328 |

* depack time (ms)

| Raw      | lz4 | lz4 fast | zx0 | zx0 fast | TP  | TP fast  | lzsa -p | fast lzsa -p | lzsa | n0  | upkr | upkr fast |Exomizer |
| :-:      | :-: | :-:      | :-: | :-:      | :-: | :-:      | :-:     |  :-:         | :-:  | :-: | :-:  | :-:       |:-:      |
| 114/14(*)| 134 | 103      | 230 | 168      | 135 | 111      | 137     | 118          |146   | 168 | 1287 | 1209      |306 |

(*) Byte/Phrase wise

## LZ4

 - [unlz4](unlz4.js)
 - [unlz4_fast](unlz4_fast.js)

Based on Ericde45's unlz4 for the YM player.

https://github.com/ericde45/YM2149_JAG/blob/main/ym1.s

Packer:

https://github.com/lz4/lz4

Pack with: `lz4.exe -12 -l --no-frame-crc [input file] [output file] `

## TurboPacker

https://github.com/42Bastian/tp

 - [untp](untp.js)
 - [untp_fast](untp_fast.js)


## LZSA Format 1

### Original packer

  https://github.com/emmanuel-marty/lzsa

  Be sure to set `POS_OFFSET` 0.

### Extended version

  https://github.com/42Bastian/lzsa_jaguar

 Adds option `-p` to write positive offsets.

 Pack with `lzsa -f 1 -p [input] [output]`


 - [unlzsa1](unlzsa1.js)
 - [unlzsa1_fast](unlzsa1_fast.js)

## ZX0

ZX0 depacker, classic format.

Packer: https://github.com/einar-saukas/ZX0

Pack with `zx0 -c [input] [output]`


 - [unzx0](unzx0.js)
 - [unzx0_fast](unzx0_fast.js)

## N0

Packer: https://github.com/HansWessels/gup

Packed with `gup a -n0 [archive] [infile]` then header (96 bytes) stripped.

 - [unn0](unn0.js)

## UPKR

Packer: https://github.com/exoticorn/upkr

 - [unupkr.js](unupkr.js)
 - [unupkr.js fast](unupkr_fast.js)

## Exomizer

Packer: https://bitbucket.org/magli143/exomizer/src/master/

Pack with `exomize raw -c -P7`

 - [unexo.js](unexo.js)
