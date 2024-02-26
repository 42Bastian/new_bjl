DEMO=bootIRQ

MODEL_M?=1
TIMING ?= 0
PAL?=1
V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

all: $(DEMO).j64

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w


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

$(DEMO).o: obl0.img

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

%.bin : %.js
	$Q$(TJASS) $(TJFLAGS) -d -o $@ $<

%.o : %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	$Q$(RMAC) $(_68KFLAGS) $< -o $@

%.img: %.o
	$Q$(RLN) -rw -z -n -a $$10000 x x -o $@ $<

$(DEMO).XXX: sbl.bin
	$Qjagcrypt -q -u -tursi $<

.ONESHELL:
$(DEMO).j64: sbl.XXX $(DEMO).o
	$Qcp $< $@
	cat $(DEMO).o >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >>$@
	truncate -s 32K $@

.PHONY: clean
clean:
	$Qrm -f *.bin *.j64 *.equ *~ *.img *.bak *.cof *.o

include Rules.launch
