DEMO=sbl

MODEL_M?=1
TIMING ?= 0
PAL?=1
V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

.PHONY: demo
demo: draw_test.j64

all: $(DEMO).XXX

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -d

ifeq ($(TIMING),1)
TJFLAGS+= -D TIMING
_68KFLAGS+= -DTIMING
endif

ifeq ($(DEBUG),1)
_68KFLAGS+= -DDEBUG
TJFLAGS+= -D DEBUG
endif

ifeq ($(PAL),1)
TJFLAGS+= -D _PAL
_68KFLAGS+= -D_PAL
else
$(warning NTSC/60Hz does not work well!)
endif

ifeq ($(BPE),1)
TJFLAGS+= -D BPE
endif

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

%.bin : %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	$Q$(RMAC) $(_68KFLAGS) $< -o $@

%.img: %.o
	$Q$(RLN) -rw -z -n -a $$10000 x x -o $@ $<

$(DEMO).XXX: $(DEMO).bin
	$Qjagcrypt -q -u -tursi $<
	mv $(DEMO).XXX $@
	truncate -s 1040 $@

.ONESHELL:
$(DEMO).j64: $(DEMO).XXX  draw_test.j64
	$Qcp  draw_test.j64 $@

.ONESHELL:
vj.j64: draw_test.j64
	$Qcp $< $@

include Rules.launch

.PHONY: clean
clean:
	$Qrm -f *.bin *.j64 *.equ *~ *.img *.bak *.cof *.o

# Start of RAM code must be >= 6000
#_68K_START=6000
# Run in ROM (this address is a fix, do not change!)
_68K_START=800410

draw_test.j64: draw_test_68k.S draw_test.js sbl.XXX
	$(TJASS) -w -s  draw_test.js
	$(RMAC) -4 ~oall -i$(BJL_ROOT) draw_test_68k.S
	$(RLN) -rw -z -n -a $(_68K_START) x x -o draw_test.bin draw_test_68k.o
	cp sbl.XXX  $@
	cat draw_test.bin >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 128K $@

draw_test.cof:  draw_test_68k.S draw_test.js
	$(TJASS) -w -s  draw_test.js
	$(RMAC) -4 ~oall -i$(BJL_ROOT) draw_test_68k.S
	$(RLN) -rw -z -e -a 4000 x x -o draw_test.cof draw_test_68k.o
