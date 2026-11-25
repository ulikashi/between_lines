"""Build atomic, content-addressed browser assets using Python's standard library."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent.parent
dist=root/'dist'
def bundle(names,kind):
 text=('\n;\n' if kind=='js' else '\n').join((dist/name).read_text() for name in names)+'\n'
 digest=hashlib.sha256(text.encode()).hexdigest()[:16]
 relative=f'build/site-{digest}.{kind}'
 (dist/'build').mkdir(exist_ok=True)
 (dist/relative).write_text(text)
 return relative
script=bundle(['app.js','episodes.js','visual-assets.js','dialogue-data.js','identity.js','summer-content.js','reading-audio.js','reader.js','summer-branches.js','summer-sequels.js','wardrobe.js','summer-focus.js','cloud-profile.js'],'js')
style=bundle(['style.css','salon.css','reader.css','summer.css'],'css')
index=(root/'web/index.template.html').read_text().replace('{{SCRIPT}}',script).replace('{{STYLE}}',style)
(dist/'index.html').write_text(index)
version=hashlib.sha256(index.encode()).hexdigest()[:16]
files=['./','./index.html','./'+script,'./'+style,'./assets/city.png','./assets/moon.png','./assets/summer.png','./assets/salon.png','./assets/audio/riviera.wav','./assets/audio/mercato.wav','./assets/audio/shore.wav']
files.extend('./'+path.relative_to(dist).as_posix() for path in sorted((dist/'assets/story-props').glob('*.webp')))
files.extend('./'+path.relative_to(dist).as_posix() for path in sorted((dist/'assets/full-length').glob('*.webp')))
sw=(root/'web/sw.template.js').read_text().replace('__VERSION__',version).replace('__FILES__',json.dumps(files))
(dist/'sw.js').write_text(sw)
print(f'Built {version}: {script}, {style}')
