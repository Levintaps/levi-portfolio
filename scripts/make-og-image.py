from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
GROUND = (247, 246, 243)
INK = (20, 22, 26)
ACCENT = (27, 63, 174)

def load(size: int) -> ImageFont.FreeTypeFont:
    for candidate in ("C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size)

image = Image.new("RGB", (WIDTH, HEIGHT), GROUND)
draw = ImageDraw.Draw(image)
draw.rectangle([(0, 0), (14, HEIGHT)], fill=ACCENT)
draw.text((90, 210), "Jayson Levin Tapia", font=load(76), fill=INK)
draw.text((90, 310), "Software Developer", font=load(40), fill=ACCENT)
draw.text((90, 380), "Antipolo City, Philippines", font=load(30), fill=(91, 96, 105))

Path("public").mkdir(exist_ok=True)
image.save("public/og-image.png", optimize=True)
print("og-image.png written")
