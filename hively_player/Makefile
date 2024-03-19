hively_player.bin: hively_player.S
	rmac -4 -fb -u -i$(BJL_ROOT)/68k_inc $< -o $@.o
	rln -z -n -a f1b000 x x -o $@ $@.o

.PHONY: clean
clean:
	rm -f *.o *~
