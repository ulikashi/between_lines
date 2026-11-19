import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get("READER_URL", "http://127.0.0.1:4175/")
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':1000});page=ctx.new_page();errors=[];bad=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:bad.append(r.url) if r.status>=400 else None)
 page.goto(BASE,wait_until='networkidle')
 page.evaluate('state.names={0:"Лера",1:"Вера",2:"Лера"}')
 # Every original word must remain in the exact order, including author asides.
 print(page.evaluate('''()=>{const norm=s=>s.toLowerCase().replace(/[^\\p{L}\\p{N}]+/gu,' ').trim();for(let i=0;i<3;i++)for(let j=0;j<13;j++){if(norm(stories[i].scenes[j][1])!==norm(readingFrames[i][j].map(x=>x.text).join(' ')))throw Error('Lost text '+i+':'+j)}return 'All original scene words retained in order'}'''))
 page.locator('.card-open[data-play="0"]').click()
 assert page.locator('#vn-character').is_hidden()
 page.locator('#vn-next').click();beat=page.evaluate('state.runs[0].beat');page.reload(wait_until='networkidle');page.locator('.card-open[data-play="0"]').click();assert page.evaluate('state.runs[0].beat')==beat
 page.locator('#vn-back').click();assert page.evaluate('state.runs[0].beat')==beat-1
 # Traverse every scene and choice, never skip text to reach choice buttons.
 result=page.evaluate('''()=>{let count=0,speech=0;for(let i=0;i<3;i++){play(i);restart();for(let j=0;j<13;j++){const frames=readingFrames[i][j];for(let k=0;k<frames.length;k++){if(document.querySelector('#story-text').textContent!==frames[k].text)throw Error('wrong frame');if(k<frames.length-1){if(document.querySelector('[data-choice]'))throw Error('early choice');document.querySelector('#vn-next').click()}else{if(document.querySelectorAll('[data-choice]').length!==stories[i].scenes[j][2].length)throw Error('missing choices');document.querySelector('[data-choice="0"]').click()}count++;if(frames[k].speaker)speech++;}if(state.runs[i].step!==j+1)throw Error('wrong scene');}const r=state.runs[i];if(r.trust+r.truth+r.boundary!==13)throw Error('score double counted');if(!document.querySelector('[data-replay]'))throw Error('missing end');closeReader()}return {frames:count,speech}}''')
 print(result)
 # A radio speaker in EVA scene: background from exterior, Ren in normal uniform.
 page.evaluate('play(2);state.runs[2].step=9;state.runs[2].beat=2;showScene()')
 page.wait_for_function("document.querySelector('#vn-character').dataset.speaker==='moon-ren'")
 page.wait_for_timeout(350);page.screenshot(path='/tmp/reader-desktop.png')
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path='/tmp/reader-mobile.png')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert page.locator('#vn-next').is_visible()
 page.locator('#vn-next').click();assert page.locator('#vn-character').is_hidden()
 # Old saves lack beat: start at the first frame without losing scene or stats.
 page.evaluate('state.runs[0]={step:4,trust:2,truth:2,boundary:0};play(0)')
 assert page.evaluate('state.runs[0].beat')==0
 assert page.evaluate('state.runs[0].step')==4
 page.evaluate('navigator.serviceWorker.ready');page.reload(wait_until='networkidle');page.evaluate('navigator.serviceWorker.ready');ctx.set_offline(True);page.reload(wait_until='load');page.locator('.card-open[data-play="0"]').click();assert page.locator('#story-text').inner_text()
 assert not errors,errors
 assert not bad,bad
 print('PASS: all 39 scenes, choices/scoring, position persistence, back, narrator hiding, radio portrait, old saves, mobile, offline text; no JS errors or 404s')
 b.close()
