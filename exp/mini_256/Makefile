# mini_256 - template for 256b sized intros
#
DEMO=mini_256

OS:=$(shell uname -s)

TJASS= lyxass
RMAC= rmac
RLN= rln


_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -d

ifdef DEBUG
_68KFLAGS+= -DDEBUG
endif

ifdef SKUNK
_68KFLAGS+= -DSKUNK
endif

jaggd vj upload: _68KFLAGS+= -DSKUNK

vjd_rom vj_rom vj: _68KFLAGS+= -DDEBUG

%.o	: %.js
	$(TJASS) $(TJFLAGS) $<

ALL: $(DEMO).cof $(DEMO).rom $(DEMO).j64
#
$(DEMO).o : $(DEMO).S
	$(RMAC) $(_68KFLAGS) $(DEMO).S

$(DEMO).cof: $(DEMO).o
	@$(RLN) -z -e -a 4000 x x -o $@ $<

$(DEMO).abs: $(DEMO).o
	$(RLN) -z -b -a 4000 x x -o $@ $<

$(DEMO).rom: $(DEMO).o
	@$(RLN) -rw -z -n -a 802000 x x -o $@ $<

.ONESHELL:
$(DEMO).j64: $(DEMO).rom
	@cat $(BJL_ROOT)/bin/Univ.bin $< >$(DEMO).xj64
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $(DEMO).xj64
	dd if=$(DEMO).xj64 of=$(DEMO).j64 bs=1M count=1
	rm $(DEMO).xj64

.PHONY: vjd
vjd: $(DEMO).cof
	virtualjaguar -D $<

.PHONY: vj
vj: $(DEMO).cof
	virtualjaguar $<

.PHONY: vj_rom
vjd_rom: $(DEMO).j64
ifdef BIOS
	virtualjaguar -b -D $<
else
	virtualjaguar -D $<
endif


.PHONY: vj_rom
vj_rom: $(DEMO).j64
ifdef BIOS
	virtualjaguar -b $<
else
	virtualjaguar $<
endif

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

.PHONY: jaggd
jaggd: $(DEMO).cof
	jaggd.exe -rd -stub -ux $<,a:\$$4000,x:\$$4000

.PHONY: jaggd_rom
jaggd_rom: $(DEMO).rom
	jaggd.exe -rd -stub -ux $<,a:\$$802000,x:\$$802000

.ONESHELL:
.PHONY: clean
clean:
	rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.cof *.j64 *.rom *.abs
