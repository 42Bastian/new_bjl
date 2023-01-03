#
DEMO=mandel

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 -i$(BJL_ROOT)
TJFLAG= -sh -w

ALL: $(DEMO).cof $(DEMO).rom $(DEMO).j64
#
$(DEMO).o : $(DEMO).S tom.o jerry.o
	$(RMAC) $(_68KFLAGS) $(DEMO).S

tom.o : tom.js
	$(TJASS) $(TJFLAG) $<

jerry.o : jerry.js
	$(TJASS) $(TJFLAG) $<

$(DEMO).cof: $(DEMO).o
	$(RLN) -z -e -a 3999 x x -o $@ $<

$(DEMO).abs: $(DEMO).o
	$(RLN) -z -b -a 4000 x x -o $@ $<

$(DEMO).rom: $(DEMO).o
	$(RLN) -z -n -a 802000 x x -o $@ $<

$(DEMO).j64: $(DEMO).rom
	@cat $(BJL_ROOT)/bin/Univ.bin $< >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 1M $@

.PHONY: reset
reset:
	jcp -r
	wait

.PHONY: flash
flash: $(DEMO).j64
	jcp -ef $<

.PHONY: upload
.ONESHELL:
upload: $(DEMO).cof
	@jcp -q $< 0x4000
#	tcpuploader $< 192.168.178.222

bpe: $(DEMO).cof
ifneq ($(findstring $(MACHTYPE),aarch64),aarch64)
	@open ~/bin/BigPEmu.exe.app --args Z:$(PWD)/$<
else
	/fun/jaguar/BigPEmu/BigPEmu.exe $< &
endif
	true

bpe_rom: $(DEMO).j64
ifneq ($(findstring $(MACHTYPE),aarch64),aarch64)
	@open ~/bin/BigPEmu.exe.app --args Z:$(PWD)/$<
else
	/fun/jaguar/BigPEmu/BigPEmu.exe $< &
	true
endif

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.j64 *.rom *.abs
