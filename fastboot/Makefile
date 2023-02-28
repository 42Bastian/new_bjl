DEMO=fastboot

V?=0

ifeq ($(V),0)
Q=@
else
Q=#
endif

all: $(DEMO).XXX

TJASS= lyxass
RMAC= rmac
RLN= rln

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -d


.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

%.bin : %.js
	$Q$(TJASS) $(TJFLAGS) -o $@ $<

%.o : %.S
	$Q$(RMAC) $(_68KFLAGS) $< -o $@

.PHONY: cof
cof: $(DEMO).cof

$(DEMO).XXX: $(DEMO).bin
	$Qjagcrypt -q -u -tursi $<
	truncate -s 1024 $@

.PHONY: clean
clean:
	$Qrm -f *.bin *.j64 *.equ *~ *.img *.bak *.cof *.o
