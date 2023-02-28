# Fastboot

In order to use it, place this in front of your main program:

```
	org $3ff0
	;; ROM width
	dc.l $04040404
	;; start/load address
	dc.l init
	;; fastboot flag
	dc.l 1
	;; size
	dc.l jag_end-init
```

`init` = start address of the data to be copied, must be phrase aligned!
`jag_end` = first byte begin after data to be copied

To build a ROM, just place `fastboot.XXX` in front of the binary:

```
.ONESHELL:
$(DEMO).j64: $(DEMO).bin
	@cat fastboot.XXX >$@
	cat $< >> $@
	bzcat $(BJL_ROOT)/bin/allff.bin.bz2 >> $@
	truncate -s 1M $@
```

For (open_)jagdg, be sure to use `$(DEMO).j64,a:0x800000`.
