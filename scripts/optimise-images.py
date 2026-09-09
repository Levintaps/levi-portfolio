import sys
from pathlib import Path
from PIL import Image

def crop_to_ratio(image: Image.Image, target: float) -> Image.Image:
    current = image.width / image.height
    if abs(current - target) < 0.01:
        return image

    if current > target:
        new_width = round(image.height * target)
        left = (image.width - new_width) // 2
        return image.crop((left, 0, left + new_width, image.height))

    new_height = round(image.width / target)
    top = (image.height - new_height) // 2
    return image.crop((0, top, image.width, top + new_height))

def emit(source: Path, stem: Path, width: int, height: int) -> None:
    image = Image.open(source).convert("RGB")
    cropped = crop_to_ratio(image, width / height)
    resized = cropped.resize((width, height), Image.LANCZOS)

    resized.save(f"{stem}.jpg", quality=82, optimize=True, progressive=True)
    resized.save(f"{stem}.webp", quality=80, method=6)
    try:
        resized.save(f"{stem}.avif", quality=55)
    except Exception as error:
        print(f"AVIF skipped for {stem}: {error}")

    for suffix in ("jpg", "webp", "avif"):
        path = Path(f"{stem}.{suffix}")
        if path.exists():
            print(f"{path.name}: {resized.width}x{resized.height}, {path.stat().st_size // 1024} KB")

if __name__ == "__main__":
    source = Path(sys.argv[1])
    stem = Path(sys.argv[2])
    stem.parent.mkdir(parents=True, exist_ok=True)
    emit(source, stem, int(sys.argv[3]), int(sys.argv[4]))
