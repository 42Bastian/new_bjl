all: minihex16.bin minihex8.bin

minihex16.bin: minihex.js ../js/inc/minihex.inc
	lyxass -d  -o $@ minihex.js

minihex8.bin: minihex.js ../js/inc/minihex.inc
	lyxass -d -D _8BIT -o $@ minihex.js

clean:
	rm -f *~
