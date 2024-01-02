# makefile for tj_mandl.prg
#
DEMO=gpufire256

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

DEBUG?=0

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -sh -w -d

ifeq ($(DEBUG),1)
_68KFLAGS+= -DDEBUG
endif

ifdef SKUNK
_68KFLAGS+= -DSKUNK
endif

jaggd upload: _68KFLAGS+= -DSKUNK

vj: _68KFLAGS+= -DDEBUG

%.o	: %.js
	@$(TJASS) $(TJFLAGS) $<

ALL: $(DEMO).cof $(DEMO).rom $(DEMO).j64
#
$(DEMO).o : $(DEMO).S fire.o
	@$(RMAC) $(_68KFLAGS) $(DEMO).S

$(DEMO).cof: $(DEMO).o
	@echo $@
	@$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).abs: $(DEMO).o
	@echo $@
	$(RLN) -z -b -a 4000 x x -o $@ $<

$(DEMO).rom: $(DEMO).o
	@$(RLN) -z -n -a 6000 x x -o $@ $<

$(DEMO).j64: $(DEMO).rom
	@echo $@
	@cat $(BJL_ROOT)/sbl_68k/sbl.XXX >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 128K $@

include ../Rules.launch

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.abs
