* -*-asm-*-
;
;       JAGUAR REGISTERS
;

REGSTART	EQU $00F00000	; TOM Internal Register Base
RST		EQU REGSTART

;       TOM REGISTERS

MEMCON1		EQU REGSTART+0	; Memory Configuration Register One
MEMCON2		EQU REGSTART+2	; Memory Configuration Register Two
HC		EQU REGSTART+4	; Horizontal Count
VC		EQU REGSTART+6	; Vertical Count
LPH		EQU REGSTART+8	; Horizontal Lightpen
LPV		EQU REGSTART+$000A	; Vertical Lightpen
OB0		EQU REGSTART+$0010	; Current Object Phrase
OB1		EQU REGSTART+$0012
OB2		EQU REGSTART+$0014
OB3		EQU REGSTART+$0016

OLP		EQU REGSTART+$0020	; Object List Pointer
OLPLO		EQU REGSTART+$0020
OLPHI		EQU REGSTART+$0022
ODP		EQU REGSTART+$0024	; Object Data Pointer
OBF		EQU REGSTART+$0026	; Object Processor Flag

VMODE		EQU REGSTART+$0028	; Video Mode
BORD1		EQU REGSTART+$002A	; Border Color (Red & Green)
BORD2		EQU REGSTART+$002C	; Border Color (Blue)
VID_HP		EQU REGSTART+$002E	; Horizontal Period
VID_HBB		EQU REGSTART+$0030	; Horizontal Blanking Begin
VID_HBE		EQU REGSTART+$0032	; Horizontal Blanking End
VID_HS		EQU REGSTART+$0034	; Horizontal Sync
VID_HVS		EQU REGSTART+$0036	; Horizontal Vertical Sync
VID_HDB1	EQU REGSTART+$0038	; Horizontal Display Begin One
VID_HDB2	EQU REGSTART+$003A	; Horizontal Display Begin Two
VID_HDE		EQU REGSTART+$003C	; Horizontal Display End
VID_VP		EQU REGSTART+$003E	; Vertical Period
VID_VBB		EQU REGSTART+$0040	; Vertical Blanking Begin
VID_VBE		EQU REGSTART+$0042	; Vertical Blanking End
VID_VS		EQU REGSTART+$0044	; Vertical Sync
VID_VDB		EQU REGSTART+$0046	; Vertical Display Begin
VID_VDE		EQU REGSTART+$0048	; Vertical Display End
VID_VEB		EQU REGSTART+$004A	; Vertical EQUalization Begin
VID_VEE		EQU REGSTART+$004C	; Vertical EQUalization End
VID_VI		EQU REGSTART+$004E	; Vertical Interrupt
VID_PIT0	EQU REGSTART+$0050	; Programmable Interrupt Timer (Lo)
VID_PIT1	EQU REGSTART+$0052	; Programmable Interrupt Timer (Hi)
VID_HEQ		EQU REGSTART+$0054	; Horizontal EQUalization End
VID_TEST1	EQU REGSTART+$0056	; Undocumented Register - DO NOT USE
VID_BG		EQU REGSTART+$0058	; Background Color

INT1		EQU REGSTART+$00E0	; CPU Interrupt Control Register
INT2		EQU REGSTART+$00E2	; CPU Interrupt Resume Register

CLUT		EQU REGSTART+$0400	; Color Lookup Table

LBUFA		EQU REGSTART+$0800	; Line Buffer A
LBUFB		EQU REGSTART+$1000	; Line Buffer B
LBUFC		EQU REGSTART+$1800	; Line Buffer Current

;;; The following are Video Mode register flags

VIDEN	EQU     $0001	        ; Enable video-time base generator

CRY16	EQU     $0000	        ; Enable 16-bit CRY mode
RGB24	EQU     $0002	        ; Enable 24-bit RGB mode
DIRECT16	EQU     $0004	        ; Enable 16-bit DIRECT mode
RGB16	EQU     $0006	        ; Enable 16-bit RGB mode

GENLOCK	EQU     $0008	        ; Not Supported in Jaguar Console
INCEN	EQU     $0010	        ; Enable encrustation
BINC	EQU     $0020	        ; Select local border color
CSYNC	EQU     $0040	        ; Enable composite sync
BGEN	EQU     $0080	        ; Clear line buffer to BG
VARMOD	EQU     $0100	        ; Enable variable-color resolution mode

PWIDTH1	EQU     $0000	        ; Select pixels 1 clock wide
PWIDTH2	EQU     $0200	        ; Select pixels 2 clocks wide
PWIDTH3	EQU     $0400	        ; Select pixels 3 clocks wide
PWIDTH4	EQU     $0600	        ; Select pixels 4 clocks wide
PWIDTH5	EQU     $0800	        ; Select pixels 5 clocks wide
PWIDTH6	EQU     $0A00	        ; Select pixels 6 clocks wide
PWIDTH7	EQU     $0C00	        ; Select pixels 7 clocks wide
PWIDTH8	EQU     $0E00	        ; Select pixels 8 clocks wide

;
;       GPU REGISTERS
;
GPU_FLAGS	EQU REGSTART+$2100	; GPU Flags
GPU_MTXC	EQU REGSTART+$2104	; GPU Matrix Control
GPU_MTXA	EQU REGSTART+$2108	; GPU Matrix Address
GPU_END		EQU REGSTART+$210C	; GPU Data Organization
GPU_PC		EQU REGSTART+$2110	; GPU Program Counter
GPU_CTRL	EQU REGSTART+$2114	; GPU Operation Control/Status
GPU_HIDATA	EQU REGSTART+$2118	; GPU Bus Interface high data
GPU_REMAIN	EQU REGSTART+$211C	; GPU Division Remainder
GPU_DIVCTRL	EQU REGSTART+$211C	; DSP Divider control
GPU_RAM		EQU REGSTART+$3000	; GPU Internal RAM
GPU_ENDRAM	EQU GPU_RAM+(4*1024)	; 4K bytes
;
;       BLITTER REGISTERS
;
BLIT_A1_BASE	EQU REGSTART+$2200	; A1 Base Address
BLIT_A1_FLAGS	EQU REGSTART+$2204	; A1 Control Flags
BLIT_A1_CLIP	EQU REGSTART+$2208	; A1 Clipping Size
BLIT_A1_PIXEL	EQU REGSTART+$220C	; A1 Pixel Pointer
BLIT_A1_STEP	EQU REGSTART+$2210	; A1 Step (Integer Part)
BLIT_A1_FSTEP	EQU REGSTART+$2214	; A1 Step (Fractional Part)
BLIT_A1_FPIXEL	EQU REGSTART+$2218	; A1 Pixel Pointer (Fractional)
BLIT_A1_INC	EQU REGSTART+$221C	; A1 Increment (Integer Part)
BLIT_A1_FINC	EQU REGSTART+$2220	; A1 Increment (Fractional Part)
BLIT_A2_BASE	EQU REGSTART+$2224	; A2 Base Address
BLIT_A2_FLAGS	EQU REGSTART+$2228	; A2 Control Flags
BLIT_A2_MASK	EQU REGSTART+$222C	; A2 Address Mask
BLIT_A2_PIXEL	EQU REGSTART+$2230	; A2 PIXEL
BLIT_A2_STEP	EQU REGSTART+$2234	; A2 Step (Integer)

BLIT_CMD	EQU REGSTART+$2238	; Command
BLIT_COUNT	EQU REGSTART+$223C	; Counters
BLIT_SRCD	EQU REGSTART+$2240	; Source Data
BLIT_DSTD	EQU REGSTART+$2248	; Destination Data
BLIT_DSTZ	EQU REGSTART+$2250	; Destination Z
BLIT_SRCZ1	EQU REGSTART+$2258	; Source Z (Integer)
BLIT_SRCZ2	EQU REGSTART+$2260	; Source Z (Fractional)
BLIT_PATD	EQU REGSTART+$2268	; Pattern Data

BLIT_IINC	EQU REGSTART+$2270	; Intensity Increment
BLIT_ZINC	EQU REGSTART+$2274	; Z Increment
BLIT_STOP	EQU REGSTART+$2278	; Collision stop control

BLIT_I3		EQU REGSTART+$227C	; Blitter Intensity 3
BLIT_I2		EQU REGSTART+$2280	; Blitter Intensity 2
BLIT_I1		EQU REGSTART+$2284	; Blitter Intensity 1
BLIT_I0		EQU REGSTART+$2288	; Blitter Intensity 0

BLIT_Z3		EQU REGSTART+$228C	; Blitter Z 3
BLIT_Z2		EQU REGSTART+$2290	; Blitter Z 2
BLIT_Z1		EQU REGSTART+$2294	; Blitter Z 1
BLIT_Z0		EQU REGSTART+$2298	; Blitter Z 0

* BLITTER REGISTER (rel. to BLIT_A1_BASE
* Bastian Schick : 18.11.94

_BLIT_A1_BASE	EQU $00	; A1 Base Address
_BLIT_A1_FLAGS	EQU $04	; A1 Control Flags
_BLIT_A1_CLIP	EQU $08	; A1 Clipping Size
_BLIT_A1_PIXEL	EQU $0C	; A1 Pixel Pointer
_BLIT_A1_STEP	EQU $10	; A1 Step (Integer Part)
_BLIT_A1_FSTEP	EQU $14	; A1 Step (Fractional Part)
_BLIT_A1_FPIXEL	EQU $18	; A1 Pixel Pointer (Fractional)
_BLIT_A1_INC	EQU $1C	; A1 Increment (Integer Part)
_BLIT_A1_FINC	EQU $20	; A1 Increment (Fractional Part)
_BLIT_A2_BASE	EQU $24	; A2 Base Address
_BLIT_A2_FLAGS	EQU $28	; A2 Control Flags
_BLIT_A2_MASK	EQU $2C	; A2 Address Mask
_BLIT_A2_PIXEL	EQU $30	; A2 PIXEL
_BLIT_A2_STEP	EQU $34	; A2 Step (Integer)

_BLIT_CMD	EQU $38	; Command
_BLIT_COUNT	EQU $3C	; Counters
_BLIT_SRCD	EQU $40	; Source Data
_BLIT_DSTD	EQU $48	; Destination Data
_BLIT_DSTZ	EQU $50	; Destination Z
_BLIT_SRCZ1	EQU $58	; Source Z (Integer)
_BLIT_SRCZ2	EQU $60	; Source Z (Fractional)
_BLIT_PATD	EQU $68	; Pattern Data

_BLIT_IINC	EQU $70	; Intensity Increment
_BLIT_ZINC	EQU $74	; Z Increment
_BLIT_STOP	EQU $78	; Collision stop control

_BLIT_I3	EQU $7C	; Blitter Intensity 3
_BLIT_I2	EQU $80	; Blitter Intensity 2
_BLIT_I1	EQU $84	; Blitter Intensity 1
_BLIT_I0	EQU $88	; Blitter Intensity 0

_BLIT_Z3	EQU $8C	; Blitter Z 3
_BLIT_Z2	EQU $90	; Blitter Z 2
_BLIT_Z1	EQU $94	; Blitter Z 1
_BLIT_Z0	EQU $98	; Blitter Z 0

;       JERRY REGISTERS

JPIT1		EQU REGSTART+$00010000

CLK1		EQU REGSTART+$00010010	; Processor Clock Frequency
CLK2		EQU REGSTART+$00010012	; Video Clock Frequency
CHRO_CLK	EQU REGSTART+$00010014	; Chroma clock control

JOYSTICK	EQU REGSTART+$00014000	; Joystick register
JOYBUTS		EQU REGSTART+$00014002	; Joystick register
CONFIG		EQU REGSTART+$00014002	; Also has NTSC/PAL

MOD_MASK	EQU REGSTART+$0001A118	; Mask for ADDQ(SUBQ)MOD

SCLK		EQU REGSTART+$0001A150	; SSI Clock Frequency
SMODE		EQU REGSTART+$0001A154	; SSI Control

R_DAC		EQU REGSTART+$0001A148
L_DAC		EQU REGSTART+$0001A14C

L_I2S		EQU REGSTART+$0001A148
R_I2S		EQU REGSTART+$0001A14C

;       ROM Tables built into Jerry 128 samples
;       16 bit samples sign extended to 32

ROM_TABLE	EQU REGSTART+$0001D000	; Base of tables

; These are NEW CHANGED DIFFERENT Equates they should cause less confusion

ROM_TRI		EQU REGSTART+$0001D000	; A triangle wave
ROM_SINE	EQU REGSTART+$0001D200	; Full amplitude SINE
ROM_AMSINE	EQU REGSTART+$0001D400	; Linear (?) ramp SINE
ROM_12W		EQU REGSTART+$0001D600	; SINE(X)+SINE(2*X)
ROM_CHIRP16	EQU REGSTART+$0001D800	; SHORT SWEEP
ROM_NTRI	EQU REGSTART+$0001DA00	; Triangle w/NOISE

ROM_DELTA	EQU REGSTART+$0001DC00	; Positive spike
ROM_NOISE	EQU REGSTART+$0001DE00	; Guess

;       JERRY Registers (DSP)

DSP_FLAGS	EQU REGSTART+$0001A100	; DSP Flags
DSP_MTXC	EQU REGSTART+$0001A104	; DSP Matrix Control
DSP_MTXA	EQU REGSTART+$0001A108	; DSP Matrix Address
DSP_END		EQU REGSTART+$0001A10C	; DSP Data Organization
DSP_PC		EQU REGSTART+$0001A110	; DSP Program Counter
DSP_CTRL	EQU REGSTART+$0001A114	; DSP Operation Control/Status
DSP_HIDATA	EQU REGSTART+$0001A118	; DSP Bus Interface high data
DSP_REMAIN	EQU REGSTART+$0001A11C	; DSP Division Remainder
DSP_DIVCTRL	EQU REGSTART+$0001A11C	; DSP Divider control
DSP_RAM	EQU 	REGSTART+$0001B000	; DSP Internal RAM
DSP_ENDRAM	EQU DSP_RAM+(8*1024)	; 8K bytes


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;      VIDEO INITIALIZATION CONSTANTS
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

NTSC_WIDTH	EQU	1409		; Width of screen in pixel clocks
NTSC_HMID	EQU	823		; Middle of screen in pixel clocks
NTSC_HEIGHT	EQU	241		; Height of screen in scanlines
NTSC_VMID	EQU	266		; Middle of screen in halflines

PAL_WIDTH	EQU	1381		; Same as above for PAL...
PAL_HMID	EQU	843
PAL_HEIGHT	EQU	287
PAL_VMID	EQU	322
