"""Optimize delivery formats; preserve the supplied artwork and composition."""
from pathlib import Path
from PIL import Image

assets = Path('dist/assets')
for name in ('hero-day', 'hero-trucks-day', 'hero-btp-day', 'category-auto', 'category-industrie', 'logo'):
    with Image.open(assets / (name + '.png')) as original:
        for suffix, width, quality in ([('', 320, 90)] if name == 'logo' else [('', 1600 if name.startswith('hero') else 1200, 82), ('-mobile', 768, 80)]):
            image = original.copy()
            image.thumbnail((width, 10000), Image.Resampling.LANCZOS)
            target = assets / (name + suffix + '.webp')
            image.save(target, 'WEBP', quality=quality, method=6)
            print(target.name, image.size, target.stat().st_size)
