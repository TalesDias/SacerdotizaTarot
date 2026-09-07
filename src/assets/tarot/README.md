# Card-back art

Drop the eight tarot card backs from the Claude Design project here
(`split_0_0.png` … `split_1_3.png`, or any equivalent images).

`Spreads.astro` globs this folder, so no code change is needed — they are picked up
on the next build and assigned round-robin to the readings. Any filenames work;
they are sorted alphabetically. The site builds and renders correctly while this
folder is empty, since the art is purely decorative: a card peeks above each
reading on hover.

They could not be pulled from the design project automatically — each is 571×938 px
and over 192 KiB, above the 256 KiB per-file cap of the read API, so they come back
truncated.
