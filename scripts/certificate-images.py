"""Turn a certificate PDF into the images the site shows.

A visitor should see the proof at once, so the page shows a picture rather than
asking for a download that opens somewhere else, and keeps the PDF beside it
for anyone who wants the file itself.

Each PDF yields two sizes, each in three formats: a thumbnail for the list and
a larger one for the panel that opens over the page.

    pip install pymupdf pillow
    python scripts/certificate-images.py public/certificates/<name>.pdf

The sizes printed at the end go straight into the course entry in
src/data/resume.ts.
"""

import sys
from pathlib import Path

import pymupdf
from PIL import Image

PREVIEW_WIDTH = 1600
THUMB_WIDTH = 480


def render(pdf: Path, width: int) -> Image.Image:
    """Page one at the width asked for, drawn at that size rather than scaled up."""
    with pymupdf.open(pdf) as document:
        page = document[0]
        zoom = width / page.rect.width
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        return Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)


def write(image: Image.Image, stem: Path) -> None:
    image.save(stem.with_suffix(".avif"), quality=55)
    image.save(stem.with_suffix(".webp"), quality=82, method=6)
    image.save(stem.with_suffix(".jpg"), quality=82, optimize=True, progressive=True)


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 1

    pdf = Path(argv[1])
    if not pdf.exists():
        print(f"no such file: {pdf}")
        return 1

    preview = render(pdf, PREVIEW_WIDTH)
    write(preview, pdf.with_suffix(""))

    thumb = render(pdf, THUMB_WIDTH)
    write(thumb, pdf.with_name(f"{pdf.stem}-thumb"))

    for name, image in (("preview", preview), ("thumbnail", thumb)):
        print(f"{name}: {image.width}x{image.height}")
    for made in sorted(pdf.parent.glob(f"{pdf.stem}*")):
        print(f"  {made.name}  {made.stat().st_size:,} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
