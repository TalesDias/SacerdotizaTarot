# Tarot card art

`Major_Arcana_webp/` holds the 22 Rider-Waite-Smith Major Arcana. One peeks above
each reading on hover. `Spreads.astro` globs this folder and assigns cards in deck
order, so adding or removing files needs no code change.

Filenames carry the deck number (`00-fool` … `21-world`) so sorting by name walks
the Major Arcana in order rather than alphabetically.

## Cards held back

`Spreads.astro` excludes four cards **at the glob**, so they are never bundled:

    12-hanged-man   13-death   15-devil   16-tower

Beside a price and a booking button this imagery reads as ominous, whatever it
means in a reading. They are kept in the folder so the deck stays complete — to
bring one back, delete its `!` line from the glob in `Spreads.astro`.

That leaves 18 cards for 14 readings, so every reading gets a distinct one.

## Regenerating

The full deck scan is the master: `reference/Rider-Waite-Smith Tarot Deck small.pdf`.

This set came from 1817×3260 PNGs with transparency (~1.9 MB each) via:

    sharp(png).resize({ width: 400 }).webp({ quality: 82, alphaQuality: 100, effort: 6 })

400px is roughly 6× the 62px display size; Astro derives the 62/124/186 variants it
actually ships. That took the set from 42.1 MB to 1.93 MB, so the source PNGs were
dropped rather than committed.

The art is decorative — rendered at 62px with `alt=""` — so the site builds and
reads correctly with this folder empty.
