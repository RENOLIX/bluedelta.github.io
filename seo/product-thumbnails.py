from pathlib import Path
import json
from PIL import Image
assets=Path('dist/assets')
variants={}
for product in json.loads(Path('catalog-snapshot.json').read_text(encoding='utf-8')):
    source=assets/product['image']
    if not source.is_file():
        continue
    with Image.open(source) as original:
        photo=original.copy()
        photo.thumbnail((360,10000),Image.Resampling.LANCZOS)
        name='thumb-'+product['id']+'.webp'
        photo.save(assets/name,'WEBP',quality=82,method=6)
        variants[product['id']]={'thumbnail':name,'thumbnailWidth':photo.width,'imageWidth':original.width,'imageHeight':original.height,'thumbnailHash':product['imageHash']}
with Image.open(assets/'cuve-rose.jpg') as photo:
    photo.thumbnail((720,10000),Image.Resampling.LANCZOS)
    photo.save(assets/'cuve-rose-editorial.webp','WEBP',quality=82,method=6)
Path('image-variants.json').write_text(json.dumps(variants,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Optimized thumbnails:',len(variants))
