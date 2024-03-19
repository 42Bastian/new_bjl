# Hively Player V2.1

This is an optimized standalone version of the hively player be Ericde45.

This is still WIP !!!

Usage demo will follow.

# Setup

Include `hively_player.inc` into your source to get the parameter addresses.
Include `hively_player.bin` and copy it to the start of the DSP RAM.
Include `AHX_panning.bin` and store its address to `DSP_panning_table`.
Include `AHX_FilterPrecalc.bin` and store its address to `DSP_filterPreCalcTable`.

Set the master volume (`DSP_master_volume`) for example to $100 ( which is normal).
Store the song address to `DSP_song` and last be sure to clear `DSP_flag_replay_ON_OFF`

During the song is played you can retrieve (if enabled) the current stream position at `DSP_stream_pos`.

If enabled, the DSP code read the two pads and stores the raw data to `DSP_pad1` and `DSP_pad2`.

In order to stop the DSP, write `1` to `DSP_flag_replay_ON_OFF` and wait until it becomes `4`.

Writing `5` will pause the current song.

Writing `6` will restart the current song / start a new song.

16kHz/8bit signed samples can be played. Mixed right/left.
Store the sample address * 2 at `DSP_sample_ptr` and the size*2 at `DSP_sample_size`.
