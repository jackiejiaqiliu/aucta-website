"""Optional image comparison. Requires Pillow; run after capture-comparison.cjs."""
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import json
root=Path(__file__).resolve().parents[1]/'audit'
out=root/'screenshots/differences';out.mkdir(parents=True,exist_ok=True)
results=[]
for original in (root/'screenshots/original').glob('*.png'):
 local=root/'screenshots/local'/original.name
 if not local.exists():continue
 a,b=Image.open(original).convert('RGB'),Image.open(local).convert('RGB')
 size=(max(a.width,b.width),max(a.height,b.height))
 canvases=[]
 for image in [a,b]:
  canvas=Image.new('RGB',size,'white');canvas.paste(image,(0,0));canvases.append(canvas)
 difference=ImageChops.difference(*canvases)
 difference.save(out/original.name)
 Image.blend(*canvases,.5).save(out/('overlay-'+original.name))
 results.append({'file':original.name,'original_size':a.size,'local_size':b.size,'mean_absolute_channel_difference':sum(ImageStat.Stat(difference).mean)/3})
(root/'image-difference-results.json').write_text(json.dumps(results,indent=2))
print(f'Compared {len(results)} pairs. Differences are raw image evidence, not proof of fidelity.')
