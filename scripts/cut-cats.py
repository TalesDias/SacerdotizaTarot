"""Prepare the cat stickers for the site.

Run from the repo root: python3 scripts/cut-cats.py cacau amarula shoyu pacoca
Reads reference/cats/<name>.<png|webp|jpeg|jpg>, writes src/assets/cats/<name>.png.

If the source already carries transparency it is used as-is — trimmed and
scaled, nothing else. Only a flat source needs the backdrop keying out, and for
these that is harder than it sounds: the art was drawn as stickers on black,
and the black cats have no luminance gap against it at all. What separates them
is the closed white outline, so a flood fill from the frame stops at it where a
luminance threshold never could. The 1px border gives that fill a single seed
that reaches every pocket of black touching an edge, however many there are.
"""
from PIL import Image, ImageFilter
import numpy as np
import subprocess, sys, tempfile, os, pathlib

SRC = pathlib.Path('reference/cats')
EXTS = ('.png', '.webp', '.jpeg', '.jpg')

MARGIN = 3      # transparent breathing room kept around the trim box
MAXSIDE = 720   # source is 1280; these render at ~220px at most

def source(name):
    for ext in EXTS:
        p = SRC / (name + ext)
        if p.exists():
            return p
    raise SystemExit(f'no source for {name} in {SRC}/ (tried {", ".join(EXTS)})')


def keyed(path):
    """RGBA with the black backdrop flood-filled away."""
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        cut = tmp.name
    subprocess.run(['magick', str(path), '-alpha', 'set',
                    '-bordercolor', 'black', '-border', '1',
                    '-fuzz', '12%', '-fill', 'none', '-floodfill', '+0+0', 'black',
                    '-shave', '1x1', cut], check=True)
    im = Image.open(cut).convert('RGBA')
    im.load()
    os.unlink(cut)
    return im


for name in sys.argv[1:]:
    src = source(name)
    raw = Image.open(src).convert('RGBA')
    already = np.asarray(raw)[..., 3].min() < 250

    if already:
        img = raw
        how = 'kept its own alpha'
    else:
        im = keyed(src)
        arr = np.asarray(im).astype(np.float32)
        rgb, hard = arr[..., :3], arr[..., 3]

        # Pull the edge in by a pixel, then feather: the outermost ring is JPEG
        # ringing against the black, and hard alpha there leaves a dark hairline.
        soft = (Image.fromarray(hard.astype(np.uint8), 'L')
                .filter(ImageFilter.MinFilter(3))
                .filter(ImageFilter.GaussianBlur(0.8)))
        alpha = np.asarray(soft).astype(np.float32) / 255.0

        # The art is premultiplied against black, so divide the colour back out —
        # otherwise the feathered band composites as a grey halo on the cream.
        out_rgb = np.clip(rgb / np.clip(alpha, 0.02, 1)[..., None], 0, 255)
        img = Image.fromarray(
            np.dstack([out_rgb, alpha * 255]).astype(np.uint8), 'RGBA')
        how = 'keyed off black'

    l, t, r, b = img.getbbox()
    img = img.crop((max(0, l - MARGIN), max(0, t - MARGIN),
                    min(img.width, r + MARGIN), min(img.height, b + MARGIN)))

    if max(img.size) > MAXSIDE:
        s = MAXSIDE / max(img.size)
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)

    img.save(f'src/assets/cats/{name}.png', optimize=True)
    print(f'{name:9s} {src.name:16s} {raw.size} -> {img.size}  {how}')
