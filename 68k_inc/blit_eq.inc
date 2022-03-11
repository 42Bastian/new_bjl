;; -*-asm-*-
;; Blitter-= base on an ATARI-File
;;
BLITTER_BASE		= $f02200

BLIT_A1_BASE		= $00
BLIT_A1_FLAGS		= $04
BLIT_A1_CONTROL		= $04
BLIT_A1_CLIP_WIN_SIZE	= $08
BLIT_A1_PIXEL_PTR	= $0C
BLIT_A1_STEP		= $10
BLIT_A1_STEP_FRACT	= $14
BLIT_A1_PIXEL_FRACT	= $18
BLIT_A1_INCR		= $1C
BLIT_A1_INCR_FRACT	= $20
BLIT_A2_BASE		= $24
BLIT_A2_FLAGS		= $28
BLIT_A2_CONTROL		= $28
BLIT_A2_WIN_ADDR_MASK	= $2C
BLIT_A2_PIXEL_PTR	= $30
BLIT_A2_STEP		= $34
BLIT_COMMAND		= $38
BLIT_STATUS		= $38
BLIT_COUNTER		= $3C
BLIT_SRC_DATA		= $40
BLIT_DST_DATA		= $48
BLIT_DST_Z		= $50
BLIT_SRC_Z1		= $58
BLIT_SRC_Z2		= $60
BLIT_PATTERN_DATA	= $68
BLIT_INTENSITY		= $70
BLIT_Z_INCR		= $74
BLIT_COLLISION_CONTROL	= $78
BLIT_INTENSITY_0	= $7c
BLIT_INTENSITY_1	= $80
BLIT_INTENSITY_2	= $84
BLIT_INTENSITY_3	= $88
BLIT_Z_0		= $8C
BLIT_Z_1		= $90
BLIT_Z_2		= $94
BLIT_Z_3		= $98
;;Blitter Command-Register

BLIT_SRCEN		= $00000001   ;; d00:source data read (inner loop)
BLIT_SRCENZ		= $00000002   ;; d01:source Z read (inner loop)
BLIT_SRCENX		= $00000004   ;; d02:source data read (realign)
BLIT_DSTEN		= $00000008   ;; d03:destination data read (inner loop)
BLIT_DSTENZ		= $00000010   ;; d04:destination Z read (inner loop)
BLIT_DSTWRZ		= $00000020   ;; d05:destination Z write (inner loop)
BLIT_CLIP_A1		= $00000040   ;; d06:A1 clipping enable
BLIT_NOGO		= $00000080   ;; d07:diagnostic
BLIT_UPDA1F		= $00000100   ;; d08:A1 update step fraction
BLIT_UPDA1		= $00000200   ;; d09:A1 update step
BLIT_UPDA2		= $00000400   ;; d10:A2 update step
BLIT_DSTA2		= $00000800   ;; d11:reverse usage of A1 and A2
BLIT_GOURD		= $00001000   ;; d12:enable Gouraud shading
BLIT_ZBUFF		= $00002000   ;; d13:polygon Z data updates
BLIT_TOPBEN		= $00004000   ;; d14:intensity carry into byte
BLIT_TOPNEN		= $00008000   ;; d15:intensity carry into nibble
BLIT_PATDSEL		= $00010000   ;; d16:Select pattern data
BLIT_ADDDSEL		= $00020000   ;; d17:diagnostic
;; d18-d20: Z comparator inhibit
BLIT_ZMODELT		= $00040000   ;;		source < destination
BLIT_ZMODEEQ		= $00080000   ;;		source = destination
BLIT_ZMODEGT		= $00100000   ;;		source > destination
;; d21-d24: Logic function control
BLIT_LFU_NAN		= $00200000   ;;		!source & !destination
BLIT_LFU_NA		= $00400000   ;;		!source &  destination
BLIT_LFU_AN		= $00800000   ;;		 source & !destination
BLIT_LFU_A		= $01000000   ;;		 source &  destination

;; The following are ALL 16 possible logical operations of the LFUs

BLIT_LFU_ZERO		= $00000000   ;; All Zeros
BLIT_LFU_NSAND		= $00200000   ;; NOT Source AND NOT Destination
BLIT_LFU_NSAD		= $00400000   ;; NOT Source AND Destination
BLIT_LFU_NOTS		= $00600000   ;; NOT Source
BLIT_LFU_SAND		= $00800000   ;; Source AND NOT Destination
BLIT_LFU_NOTD		= $00A00000   ;; NOT Destination
BLIT_LFU_N_SXORD	= $00C00000	;; NOT (Source XOR Destination)
BLIT_LFU_NSORND		= $00E00000   ;; NOT Source OR NOT Destination
BLIT_LFU_SAD		= $01000000   ;; Source AND Destination
BLIT_LFU_SXORD		= $01200000   ;; Source XOR Destination
BLIT_LFU_D		= $01400000   ;; Destination
BLIT_LFU_NSORD		= $01600000   ;; NOT Source OR Destination
BLIT_LFU_S		= $01800000   ;; Source
BLIT_LFU_SORND		= $01A00000   ;; Source OR NOT Destination
BLIT_LFU_SORD		= $01C00000   ;; Source OR Destination
BLIT_LFU_ONE		= $01E00000   ;; All Ones

;; These are some common combinations with less boolean names

BLIT_LFU_REPLACE	= $01800000	;; Source REPLACEs destination
BLIT_LFU_XOR		= $01200000   ;; Source XOR with destination
BLIT_LFU_CLEAR		= $00000000   ;; CLEAR destination

BLIT_CMPDST		= $02000000   ;; d25: pixel compare pattern & dest
BLIT_BCOMPEN		= $04000000   ;; d26: bit compare write inhibit
BLIT_DCOMPEN		= $08000000   ;; d27: data compare write inhibit
BLIT_BKGWREN		= $10000000   ;; d28: data write back
BLIT_BUSHI		= $20000000   ;; d29: blitter priority
BLIT_SRCSHADE		= $40000000   ;; d30: shade src data w/IINC value
;;*======================================================================*
;;* BLITTER Flags (A1 or A2) register equates
;;*======================================================================*

;; Pitch d00-d01:
;;	 distance between pixel phrases
BLIT_PITCH1		= $00000000   ;; 0 phrase gap
BLIT_PITCH2		= $00000001   ;; 1 phrase gap
BLIT_PITCH4		= $00000002   ;; 3 phrase gap
BLIT_PITCH8		= $00000003   ;; 7 phrase gap
BLIT_PITCH3		= $00000003   ;; 3 phrase gap

;; Pixel d03-d05
;;	 bit depth (2^n)
BLIT_PIXEL1		= $00000000   ;; n = 0 0 color
BLIT_PIXEL2		= $00000008   ;; n = 1 2 colors
BLIT_PIXEL4		= $00000010   ;; n = 2 4 colors
BLIT_PIXEL8		= $00000018   ;; n = 3 8 colors
BLIT_PIXEL16		= $00000020   ;; n = 4 16 colors
BLIT_PIXEL32		= $00000028   ;; n = 5 32 colors

;; Z offset d06-d08
;;	 offset from phrase of pixel data from its corresponding
;;	 Z data phrases
BLIT_ZOFFS0		= $00000000   ;; offset = 0    UNUSED
BLIT_ZOFFS1		= $00000040   ;; offset = 1
BLIT_ZOFFS2		= $00000080   ;; offset = 2
BLIT_ZOFFS3		= $000000C0   ;; offset = 3
BLIT_ZOFFS4		= $00000100   ;; offset = 4
BLIT_ZOFFS5		= $00000140   ;; offset = 5
BLIT_ZOFFS6		= $00000180   ;; offset = 6
BLIT_ZOFFS7		= $000001C0   ;; offset = 7    UNUSED

;; Width d09-d14
;;	 width used for address generation
;;	 This is a 6-bit floating point value in pixels
;;	 4-bit unsigned exponent
;;	 2-bit mantissa with implied 3rd bit of 1
BLIT_WID2		= $00000800   ;; 1.00 X 2^1  ( 4<<9)
BLIT_WID4		= $00001000   ;; 1.00 X 2^2  ( 8<<9)
BLIT_WID6		= $00001400   ;; 1.10 X 2^2  (10<<9)
BLIT_WID8		= $00001800   ;; 1.00 x 2^3  (12<<9)
BLIT_WID10		= $00001A00   ;; 1.01 X 2^3  (13<<9)
BLIT_WID12		= $00001C00   ;; 1.10 X 2^3  (14<<9)
BLIT_WID14		= $00001E00   ;; 1.11 X 2^3  (15<<9)
BLIT_WID16		= $00002000   ;; 1.00 X 2^4  (16<<9)
BLIT_WID20		= $00002200   ;; 1.01 X 2^4  (17<<9)
BLIT_WID24		= $00002400   ;; 1.10 X 2^4  (18<<9)
BLIT_WID28		= $00002600   ;; 1.11 X 2^4  (19<<9)
BLIT_WID32		= $00002800   ;; 1.00 X 2^5  (20<<9)
BLIT_WID40		= $00002A00   ;; 1.01 X 2^5  (21<<9)
BLIT_WID48		= $00002C00   ;; 1.10 X 2^5  (22<<9)
BLIT_WID56		= $00002E00   ;; 1.11 X 2^5  (23<<9)
BLIT_WID64		= $00003000   ;; 1.00 X 2^6  (24<<9)
BLIT_WID80		= $00003200   ;; 1.01 X 2^6  (25<<9)
BLIT_WID96		= $00003400   ;; 1.10 X 2^6  (26<<9)
BLIT_WID112		= $00003600   ;; 1.11 X 2^6  (27<<9)
BLIT_WID128		= $00003800   ;; 1.00 X 2^7  (28<<9)
BLIT_WID160		= $00003A00   ;; 1.01 X 2^7  (29<<9)
BLIT_WID192		= $00003C00   ;; 1.10 X 2^7  (30<<9)
BLIT_WID224		= $00003E00   ;; 1.11 X 2^7  (31<<9)
BLIT_WID256		= $00004000   ;; 1.00 X 2^8  (32<<9)
BLIT_WID320		= $00004200   ;; 1.01 X 2^8  (33<<9)
BLIT_WID384		= $00004400   ;; 1.10 X 2^8  (34<<9)
BLIT_WID448		= $00004600   ;; 1.11 X 2^8  (35<<9)
BLIT_WID512		= $00004800   ;; 1.00 X 2^9  (36<<9)
BLIT_WID640		= $00004A00   ;; 1.01 X 2^9  (37<<9)
BLIT_WID768		= $00004C00   ;; 1.10 X 2^9  (38<<9)
BLIT_WID896		= $00004E00   ;; 1.11 X 2^9  (39<<9)
BLIT_WID1024		= $00005000   ;; 1.00 X 2^10 (40<<9)
BLIT_WID1280		= $00005200   ;; 1.01 X 2^10 (41<<9)
BLIT_WID1536		= $00005400   ;; 1.10 X 2^10 (42<<9)
BLIT_WID1792		= $00005600   ;; 1.11 X 2^10 (43<<9)
BLIT_WID2048		= $00005800   ;; 1.00 X 2^11 (44<<9)
BLIT_WID2560		= $00005A00   ;; 1.01 X 2^11 (45<<9)
BLIT_WID3072		= $00005C00   ;; 1.10 X 2^11 (46<<9)
BLIT_WID3584		= $00005E00   ;; 1.11 X 2^11 (47<<9)

;; X add control d16-d17
;;	 controls the update of the X pointer on each pass
;;	 round the inner loop
BLIT_XADDPHR		= $00000000   ;; 00 - add phrase width and truncate
BLIT_XADDPIX		= $00010000   ;; 01 - add pixel size (add 1)
BLIT_XADD0		= $00020000   ;; 10 - add zero
BLIT_XADDINC		= $00030000   ;; 11 - add the increment

;; Y add control d18
;;	 controls the update of the Y pointer within the inner loop.
;;	 it is overridden by the X add control if they are in add increment
BLIT_YADD0		= $00000000   ;; 00 - add zero
BLIT_YADD1		= $00040000   ;; 01 - add 1

;; X sign d19
;;	 add or subtract pixel size if X add control = 01 (XADDPIX)
BLIT_XSIGNADD		= $00000000   ;; 0 - add pixel size
BLIT_XSIGNSUB		= $00080000   ;; 1 - subtract pixel size

;; X sign d20
;;	 add or subtract pixel size if X add control = 01 (YADD1)
BLIT_YSIGNADD		= $00000000   ;; 0 - add 1
BLIT_YSIGNSUB		= $00100000   ;; 1 - sub 1
;;* added 02/24/95 B.SCHICK
BLIT_MASK		= $00008000

;;****************************************
;;
;; Blitter-= base on an ATARI-File
;;
;;Blitter Command-Register

B_SRCEN		= $00000001   ;; d00:source data read (inner loop)
B_SRCENZ	= $00000002   ;; d01:source Z read (inner loop)
B_SRCENX	= $00000004   ;; d02:source data read (realign)
B_DSTEN		= $00000008   ;; d03:destination data read (inner loop)
B_DSTENZ	= $00000010   ;; d04:destination Z read (inner loop)
B_DSTWRZ	= $00000020   ;; d05:destination Z write (inner loop)
B_CLIP_A1	= $00000040   ;; d06:A1 clipping enable
B_NOGO		= $00000080   ;; d07:diagnostic
B_UPDA1F	= $00000100   ;; d08:A1 update step fraction
B_UPDA1		= $00000200   ;; d09:A1 update step
B_UPDA2		= $00000400   ;; d10:A2 update step
B_DSTA2		= $00000800   ;; d11:reverse usage of A1 and A2
B_GOURD		= $00001000   ;; d12:enable Gouraud shading
B_ZBUFF		= $00002000   ;; d13:polygon Z data updates
B_TOPBEN	= $00004000   ;; d14:intensity carry into byte
B_TOPNEN	= $00008000   ;; d15:intensity carry into nibble
B_PATDSEL	= $00010000   ;; d16:Select pattern data
B_ADDDSEL	= $00020000   ;; d17:diagnostic
;; d18-d20: Z comparator inhibit
B_ZMODELT	= $00040000   ;;		source < destination
B_ZMODEEQ	= $00080000   ;;		source = destination
B_ZMODEGT	= $00100000   ;;		source > destination
;; d21-d24: Logic function control
B_LFU_NAN	= $00200000   ;;		!source & !destination
B_LFU_NA	= $00400000   ;;		!source &  destination
B_LFU_AN	= $00800000   ;;		 source & !destination
B_LFU_A		= $01000000   ;;		 source &  destination

;; The following are ALL 16 possible logical operations of the LFUs

B_LFU_ZERO	= $00000000   ;; All Zeros
B_LFU_NSAND	= $00200000   ;; NOT Source AND NOT Destination
B_LFU_NSAD	= $00400000   ;; NOT Source AND Destination
B_LFU_NOTS	= $00600000   ;; NOT Source
B_LFU_SAND	= $00800000   ;; Source AND NOT Destination
B_LFU_NOTD	= $00A00000   ;; NOT Destination
B_LFU_N_SXORD	= $00C00000	;; NOT (Source XOR Destination)
B_LFU_NSORND	= $00E00000   ;; NOT Source OR NOT Destination
B_LFU_SAD	= $01000000   ;; Source AND Destination
B_LFU_SXORD	= $01200000   ;; Source XOR Destination
B_LFU_D		= $01400000   ;; Destination
B_LFU_NSORD	= $01600000   ;; NOT Source OR Destination
B_LFU_S		= $01800000   ;; Source
B_LFU_SORND	= $01A00000   ;; Source OR NOT Destination
B_LFU_SORD	= $01C00000   ;; Source OR Destination
B_LFU_ONE	= $01E00000   ;; All Ones

;; These are some common combinations with less boolean names

B_LFU_REPLACE	= $01800000	;; Source REPLACEs destination
B_LFU_XOR	= $01200000   ;; Source XOR with destination
B_LFU_CLEAR	= $00000000   ;; CLEAR destination

B_CMPDST	= $02000000   ;; d25: pixel compare pattern & dest
B_BCOMPEN	= $04000000   ;; d26: bit compare write inhibit
B_DCOMPEN	= $08000000   ;; d27: data compare write inhibit
B_BKGWREN	= $10000000   ;; d28: data write back
B_BUSHI		= $20000000   ;; d29: blitter priority
B_SRCSHADE	= $40000000   ;; d30: shade src data w/IINC value
;;*======================================================================*
;;* BLITTER Flags (A1 or A2) register equates
;;*======================================================================*

;; Pitch d00-d01:
;;	 distance between pixel phrases
B_PITCH1	= $00000000   ;; 0 phrase gap
B_PITCH2	= $00000001   ;; 1 phrase gap
B_PITCH4	= $00000002   ;; 3 phrase gap
B_PITCH8	= $00000003   ;; 7 phrase gap
B_PITCH3	= $00000003   ;; 3 phrase gap

;; Pixel d03-d05
;;	 bit depth (2^n)
B_PIXEL1	= $00000000   ;; n = 0 0 color
B_PIXEL2	= $00000008   ;; n = 1 2 colors
B_PIXEL4	= $00000010   ;; n = 2 4 colors
B_PIXEL8	= $00000018   ;; n = 3 8 colors
B_PIXEL16	= $00000020   ;; n = 4 16 colors
B_PIXEL32	= $00000028   ;; n = 5 32 colors

;; Z offset d06-d08
;;	 offset from phrase of pixel data from its corresponding
;;	 Z data phrases
B_ZOFFS0	= $00000000   ;; offset = 0    UNUSED
B_ZOFFS1	= $00000040   ;; offset = 1
B_ZOFFS2	= $00000080   ;; offset = 2
B_ZOFFS3	= $000000C0   ;; offset = 3
B_ZOFFS4	= $00000100   ;; offset = 4
B_ZOFFS5	= $00000140   ;; offset = 5
B_ZOFFS6	= $00000180   ;; offset = 6
B_ZOFFS7	= $000001C0   ;; offset = 7    UNUSED

;; Width d09-d14
;;	 width used for address generation
;;	 This is a 6-bit floating point value in pixels
;;	 4-bit unsigned exponent
;;	 2-bit mantissa with implied 3rd bit of 1
B_WID2		= $00000800   ;; 1.00 X 2^1  ( 4<<9)
B_WID4		= $00001000   ;; 1.00 X 2^2  ( 8<<9)
B_WID6		= $00001400   ;; 1.10 X 2^2  (10<<9)
B_WID8		= $00001800   ;; 1.00 x 2^3  (12<<9)
B_WID10		= $00001A00   ;; 1.01 X 2^3  (13<<9)
B_WID12		= $00001C00   ;; 1.10 X 2^3  (14<<9)
B_WID14		= $00001E00   ;; 1.11 X 2^3  (15<<9)
B_WID16		= $00002000   ;; 1.00 X 2^4  (16<<9)
B_WID20		= $00002200   ;; 1.01 X 2^4  (17<<9)
B_WID24		= $00002400   ;; 1.10 X 2^4  (18<<9)
B_WID28		= $00002600   ;; 1.11 X 2^4  (19<<9)
B_WID32		= $00002800   ;; 1.00 X 2^5  (20<<9)
B_WID40		= $00002A00   ;; 1.01 X 2^5  (21<<9)
B_WID48		= $00002C00   ;; 1.10 X 2^5  (22<<9)
B_WID56		= $00002E00   ;; 1.11 X 2^5  (23<<9)
B_WID64		= $00003000   ;; 1.00 X 2^6  (24<<9)
B_WID80		= $00003200   ;; 1.01 X 2^6  (25<<9)
B_WID96		= $00003400   ;; 1.10 X 2^6  (26<<9)
B_WID112	= $00003600   ;; 1.11 X 2^6  (27<<9)
B_WID128	= $00003800   ;; 1.00 X 2^7  (28<<9)
B_WID160	= $00003A00   ;; 1.01 X 2^7  (29<<9)
B_WID192	= $00003C00   ;; 1.10 X 2^7  (30<<9)
B_WID224	= $00003E00   ;; 1.11 X 2^7  (31<<9)
B_WID256	= $00004000   ;; 1.00 X 2^8  (32<<9)
B_WID320	= $00004200   ;; 1.01 X 2^8  (33<<9)
B_WID384	= $00004400   ;; 1.10 X 2^8  (34<<9)
B_WID448	= $00004600   ;; 1.11 X 2^8  (35<<9)
B_WID512	= $00004800   ;; 1.00 X 2^9  (36<<9)
B_WID640	= $00004A00   ;; 1.01 X 2^9  (37<<9)
B_WID768	= $00004C00   ;; 1.10 X 2^9  (38<<9)
B_WID896	= $00004E00   ;; 1.11 X 2^9  (39<<9)
B_WID1024	= $00005000   ;; 1.00 X 2^10 (40<<9)
B_WID1280	= $00005200   ;; 1.01 X 2^10 (41<<9)
B_WID1536	= $00005400   ;; 1.10 X 2^10 (42<<9)
B_WID1792	= $00005600   ;; 1.11 X 2^10 (43<<9)
B_WID2048	= $00005800   ;; 1.00 X 2^11 (44<<9)
B_WID2560	= $00005A00   ;; 1.01 X 2^11 (45<<9)
B_WID3072	= $00005C00   ;; 1.10 X 2^11 (46<<9)
B_WID3584	= $00005E00   ;; 1.11 X 2^11 (47<<9)

;; X add control d16-d17
;;	 controls the update of the X pointer on each pass
;;	 round the inner loop
B_XADDPHR	= $00000000   ;; 00 - add phrase width and truncate
B_XADDPIX	= $00010000   ;; 01 - add pixel size (add 1)
B_XADD0		= $00020000   ;; 10 - add zero
B_XADDINC	= $00030000   ;; 11 - add the increment

;; Y add control d18
;;	 controls the update of the Y pointer within the inner loop.
;;	 it is overridden by the X add control if they are in add increment
B_YADD0		= $00000000   ;; 00 - add zero
B_YADD1		= $00040000   ;; 01 - add 1

;; X sign d19
;;	 add or subtract pixel size if X add control = 01 (XADDPIX)
B_XSIGNADD	= $00000000   ;; 0 - add pixel size
B_XSIGNSUB	= $00080000   ;; 1 - subtract pixel size

;; X sign d20
;;	 add or subtract pixel size if X add control = 01 (YADD1)
B_YSIGNADD	= $00000000   ;; 0 - add 1
B_YSIGNSUB	= $00100000   ;; 1 - sub 1
;;* added 02/24/95 B.SCHICK
B_MASK		= 1<<15
;;****************************************
