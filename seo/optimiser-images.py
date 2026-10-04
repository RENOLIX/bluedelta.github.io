"""Encode existing hero photos as WebP without changing size or composition."""
from pathlib import Path
from PIL import Image

for name in ("hero-day", "hero-trucks-day", "hero-btp-day"):
    source = Path("dist/assets") / (name + ".png")
    target = source.with_suffix(".webp")
    with Image.open(source) as photo:
        photo.save(target, "WEBP", quality=90, method=6)
    print(f"{name}: {source.stat().st_size} -> {target.stat().st_size} bytes")
