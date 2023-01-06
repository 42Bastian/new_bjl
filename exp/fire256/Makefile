# Demo makefile
#
DEMO=fire256

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

ifdef DEBUG
_68KFLAGS=-4 -i$(BJL_ROOT) -DDEBUG
else
_68KFLAGS=-4 -i$(BJL_ROOT)
endif
TJFLAG= -sh -w

vj: _68KFLAGS+= -DDEBUG

ALL: $(DEMO).cof $(DEMO).rom $(DEMO).j64
#
$(DEMO).o : $(DEMO).S
	$(RMAC) $(_68KFLAGS) $(DEMO).S

$(DEMO).cof: $(DEMO).o
	$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).abs: $(DEMO).o
	$(RLN) -z -b -a 4000 x x -o $@ $<

$(DEMO).rom: $(DEMO).o
	$(RLN) -z -n -a 802000 x x -o $@ $<

$(DEMO).j64: $(DEMO).rom
	@cat $(BJL_ROOT)/bin/Univ.bin $< >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 32K $@

include ../Rules.launch

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.j64 *.rom *.abs
