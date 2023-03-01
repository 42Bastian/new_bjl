OS:=$(shell uname -s)

V?=0
ifeq ($(V),0)
Q=@
else
Q=#
endif

TJASS= lyxass
RMAC= rmac
RLN= rln

DEBUG?= 1

_68KFLAGS=-4 ~oall -i$(BJL_ROOT)
TJFLAGS= -w -s

ifeq ($(DEBUG),1)
_68KFLAGS+= -DDEBUG
TJFLAGS+= -D DEBUG
endif

.PRECIOUS: %.img %.bin

.SUFFIXES:

.SUFFIXES: .S .o .bin .js .img .XXX .j64

ALL: lsp_v15.lib

lsp_v15.lib: lsp_init.das

%.lib : %.das
	$(RMAC) $(_68KFLAGS) $< -o $@.o
	$(RLN) -z  -n -a 0 x x -o $@ $@.o


.ONESHELL:
.PHONY: clean
clean:
	$(Q)rm -f *.o
	rm -f *.equ
	rm -f *~
	rm -f *.j64 *.cof *.rom *.abs *.img *.bin *.do
