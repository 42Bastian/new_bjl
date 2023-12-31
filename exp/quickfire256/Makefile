DEMO=quickfire256

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

#Default for BPE
DEBUG?=1

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -sh -w -d

ifdef DEBUG
_68KFLAGS+= -DDEBUG
endif

ifdef SKUNK
_68KFLAGS+= -DSKUNK
endif

jaggd vj upload: _68KFLAGS+= -DSKUNK

vj: _68KFLAGS+= -DDEBUG

%.o	: %.js
	$(TJASS) $(TJFLAGS) $<

ALL: $(DEMO).cof $(DEMO).rom $(DEMO).j64
#
$(DEMO).o : $(DEMO).S fire.o
	$(RMAC) $(_68KFLAGS) $(DEMO).S

$(DEMO).cof: $(DEMO).o
	@$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).abs: $(DEMO).o
	$(RLN) -z -b -a 4000 x x -o $@ $<

$(DEMO).rom: $(DEMO).o
	@$(RLN) -z -n -a 802000 x x -o $@ $<

.ONESHELL:
$(DEMO).j64: $(DEMO).rom
	@cat $(BJL_ROOT)/bin/fastbt2.bin $< >$@
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
	rm -f *.j64 *.rom *.abs
