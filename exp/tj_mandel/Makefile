# makefile for tj_mandl.prg
#
OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 -i$(BJL_ROOT)
TJFLAG= -sh -w

ALL: mandel.cof mandel.rom mandel.j64
#
mandel.o : mandel.S tom.o jerry.o
	$(RMAC) $(_68KFLAGS) mandel.S

tom.o : tom.js
	$(TJASS) $(TJFLAG) $<

jerry.o : jerry.js
	$(TJASS) $(TJFLAG) $<

mandel.cof: mandel.o
	$(RLN) -z -e -a 4000 x x -o $@ $<

mandel.abs: mandel.o
	$(RLN) -z -b -a 4000 x x -o $@ $<

mandel.rom: mandel.o
	$(RLN) -z -n -a 802000 x x -o $@ $<

mandel.j64: mandel.rom
	cat $(BJL_ROOT)/bin/Univ.bin $< >mandel.xj64
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> mandel.xj64
	dd if=mandel.xj64 of=mandel.j64 bs=1M count=1
	rm mandel.xj64

.PHONY: reset
reset:
	jcp -r
	wait

.PHONY: flash
flash: mandel.j64
	jcp -ef $<

.PHONY: upload
.ONESHELL:
upload: mandel.cof
	@jcp -q $< 0x4000
#	tcpuploader $< 192.168.178.222

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.j64 *.rom *.abs
