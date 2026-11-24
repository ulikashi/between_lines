/* Scene text stays in episodes.js; only explicitly directed passages get a speaker. */
const legacyReadingFrames= stories.map((story,si)=>story.scenes.map((scene,sc)=>{
 const frames=[];
 function add(text,cue){text=text.trim();if(!text)return;if(cue){text=text.replace(/[,;:]$/u,'.');if(!/[.!?…]$/u.test(text))text+='.';}
  // Narration is split at sentence boundaries into comfortable reading cards.
  if(!cue&&text.length>380){const sentences=text.match(/[^.!?…]+[.!?…]+[»”]?|[^.!?…]+$/g)||[text];let chunk='';for(const sentence of sentences){if(chunk.length+sentence.length>380&&chunk){frames.push({text:chunk.trim()});chunk=''}chunk+=sentence}if(chunk.trim())frames.push({text:chunk.trim()});}
  else frames.push({...cue,text});
 }
 scene[1].split('\n').forEach((text,p)=>{
  const cue=dialogueDirection[si][sc][p];
  if(!cue){add(text);return}
  if(text.startsWith('— ')){
   const parts=text.slice(2).split(' — ');
   add(parts[0],cue);
   if(parts.length>1)add(parts[1].charAt(0).toUpperCase()+parts[1].slice(1));
   if(parts.length>2)add(parts.slice(2).join(' — '),cue);
  }else{const open=text.indexOf('«'),close=text.lastIndexOf('»');
   if(open>=0&&close>open){add(text.slice(0,open));add(text.slice(open+1,close),cue);const tail=text.slice(close+1).replace(/^[,.]?\s*—\s*/,'');if(tail.trim()!=='.')add(tail)}else add(text,cue);
  }
 });return frames;
}));
// Preserve old frame offsets while presenting shorter cards in the new layout.
function compactFrame(frame){
 const parts=frame.text.match(/[^.!?…]+[.!?…]+[»”]?|[^.!?…]+$/g)||[frame.text];
 const chunks=[];let chunk='';
 function push(){if(chunk.trim())chunks.push({...frame,text:chunk.trim()});chunk=''}
 for(const part of parts){
  if(chunk.length+part.length>180)push();
  if(part.trim().length>210){for(const word of part.trim().split(/\s+/)){if(chunk.length+word.length+1>180)push();chunk+=(chunk?' ':'')+word;}push();}
  else chunk+=part;
 }
 push();return chunks;
}
const readingFrames=legacyReadingFrames.map(story=>story.map(frames=>frames.flatMap((frame,legacyBeat)=>compactFrame(frame).map(part=>({...part,legacyBeat})))));
// Retain a reader's position when descriptive openings are added to this edition.
const summerRun=state.runs[1];
if(typeof summerOriginalScenes!=='undefined'&&summerRun&&!summerRun.summerEdition){
 const frames=readingFrames[1]?.[summerRun.step];
 const firstOriginal=summerOriginalScenes[summerRun.step]?.[1].split('\n')[0];
 if(frames&&firstOriginal){const offset=frames.findIndex(frame=>firstOriginal.startsWith(frame.text));if(offset>=0)summerRun.beat=offset+(Number.isInteger(summerRun.beat)?summerRun.beat:0);}
 summerRun.summerEdition=2;summerRun.readerVersion=3;
}
for(const [id,run] of Object.entries(state.runs)){
 if(run.readerVersion===3)continue;
 const frames=readingFrames[id]?.[run.step];
 if(frames)run.beat=Math.max(0,frames.findIndex(frame=>frame.legacyBeat===(run.beat||0)));
 run.readerVersion=3;
}
const reader=document.querySelector('#reader');
reader.classList.add('visual-reader');
reader.innerHTML=`<button id="vn-menu-toggle" aria-label="Меню истории" aria-haspopup="dialog"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 8h14M5 16h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button><div class="vn-stage" tabindex="0" aria-label="История. Нажмите для следующей реплики"><div class="vn-background" aria-hidden="true"></div><div class="vn-vignette" aria-hidden="true"></div><div id="vn-character" role="img" hidden></div><section class="vn-dialogue" aria-label="Текст истории"><div class="vn-speaker" hidden><span id="vn-name"></span></div><div class="vn-dialogue-content"><div id="vn-live" aria-live="polite" aria-atomic="true"><p id="story-text"></p></div><div id="choices"></div></div></section></div>`;
// A cue names the exact reading card, including cards introduced by a choice.
const summerProps = [
 ['portrait', 'Плёночный отпечаток Саши со смеющейся женщиной', ['контактные отпечатки', 'берёшь снимок только после']],
 ['manuscript', 'Первые страницы романа с пометкой подруги', ['Внутри распечатка первых страниц', 'На полях её почерк']],
 ['market', 'Героиня смеётся на рынке', ['На снимке ты не стараешься', 'открываешь фотографию с рынка']],
 ['vendor', 'Продавщица с лишним лимоном', ['показывает снимок продавщицы']],
 ['poster', 'Афиша фильма «Комната для моря»', ['Под фотографией название нового фильма']],
 ['pass', 'Пропуск Саши на показ', ['Он кладёт на стол пропуск']],
 ['ticket', 'Билет на премьеру в первый ряд', ['Билет приходит на почту']],
 ['contract', 'Договор уступки прав с подписью', ['На первой странице договор уступки прав', 'Ты придвигаешь папку к лампе', 'Елена прислала копию документа']],
 ['notebook', 'Страница блокнота Марты с кофейным следом', ['присылает снимок страницы из своего блокнота']]
];
const storyProp = document.createElement('img');
storyProp.className = 'story-prop';
storyProp.hidden = true;
reader.querySelector('.vn-dialogue').before(storyProp);

function showStoryProp(text) {
 const prop = summerProps.find(([, , cues]) => cues.some(cue => text.includes(cue)));
 storyProp.hidden = !prop;
 storyProp.parentElement.classList.toggle('has-prop', Boolean(prop));
 if (!prop) return;
 const [id, description] = prop;
 storyProp.alt = description;
 if (storyProp.dataset.id !== id) {
  storyProp.dataset.id = id;
  storyProp.src = 'assets/story-props/' + id + '.webp';
 }
}
const relationshipNotice=document.createElement('div');
relationshipNotice.className='relationship-notice';
relationshipNotice.setAttribute('role','status');
reader.append(relationshipNotice);
let relationshipTimer;
function clearRelationshipNotice(){
 clearTimeout(relationshipTimer);
 relationshipNotice.textContent='';
}
function showRelationshipNotice(person,delta){
 clearRelationshipNotice();
 const names={sasha:'Сашей',kirill:'Кириллом',marta:'Мартой'};
 relationshipNotice.dataset.change=delta>0?'gain':'loss';
 relationshipNotice.textContent='Ваши отношения с '+names[person]+(delta>0?' улучшились':' ухудшились');
 relationshipTimer=setTimeout(clearRelationshipNotice,3600);
}
reader.addEventListener('close',clearRelationshipNotice);
const readingMenu=document.createElement('dialog');readingMenu.id='reading-menu';readingMenu.setAttribute('aria-label','Меню истории');
readingMenu.innerHTML = `
 <header class="reading-cover"><span id="menu-story"></span><h2 id="menu-episode"></h2></header>
 <div class="reading-controls">
  <h3>Настройки чтения</h3>
  <label class="reading-option"><span>Звуки истории</span><input type="range" id="reading-sound" min="0" max="100" aria-label="Звуки истории"></label>
  <label class="reading-option"><span>Музыка</span><input type="range" id="reading-music" min="0" max="100" aria-label="Музыка"></label>
  <label class="reading-option">Крупный шрифт <input type="checkbox" id="reading-large" role="switch"></label>
  <button id="vn-resume" autofocus>Продолжить чтение</button>
  <div class="reading-links"><button id="vn-home">На главный экран</button><button id="vn-reset">Начать заново</button></div>
 </div>`;
document.body.append(readingMenu);
const preferences = state.readingPreferences ||= {sound:true, large:false};
const soundtrack = createReadingAudio(syncReadingSound);
let audioScene;
const largeSwitch = $('#reading-large');
function bindVolume(id, fallback) {
 const slider = $('#reading-' + id);
 const key = id + 'Volume';
 if (!Number.isFinite(preferences[key])) preferences[key] = fallback;
 slider.value = preferences[key];
 function update() {
  preferences[key] = slider.valueAsNumber;
  slider.setAttribute('aria-valuetext', slider.value + '%');
 }
 update();
 slider.oninput = () => {
  update();
  save();
  if (preferences.musicVolume || preferences.soundVolume) unlockReadingSound();
  else syncReadingSound();
 };
}
bindVolume('sound', preferences.sound === false ? 0 : 30);
bindVolume('music', (preferences.music ?? preferences.sound) === false ? 0 : 20);
largeSwitch.checked = preferences.large;
reader.classList.toggle('large-type', preferences.large);
function syncReadingSound(){
 if ((!preferences.musicVolume && !preferences.soundVolume) || !reader.open || document.hidden) { soundtrack.stop(); return; }
 soundtrack.play(audioScene, preferences.musicVolume / 100, preferences.soundVolume / 100);
}
function unlockReadingSound(){
 if ((!preferences.musicVolume && !preferences.soundVolume) || !reader.open) return;
 soundtrack.prepare();
 syncReadingSound();
}
document.addEventListener('click',unlockReadingSound);
document.addEventListener('keyup',unlockReadingSound);
largeSwitch.onchange = () => {
 preferences.large = largeSwitch.checked;
 reader.classList.toggle('large-type', preferences.large);
 save();
};
new MutationObserver(syncReadingSound).observe(reader,{attributes:true,attributeFilter:['open']});
document.addEventListener('visibilitychange',syncReadingSound);
window.addEventListener('pagehide',()=>soundtrack.stop());
window.addEventListener('pageshow',syncReadingSound);
function openReadingMenu(){
 if(readingMenu.open)return;
 const run=state.runs[active];
 $('#menu-story').textContent=stories[active].title;
 $('#menu-episode').textContent=active===1 ? `Серия ${(run.episode||0)+1} · ${currentSummerEpisode().title}` : 'Меню истории';
 readingMenu.showModal();
}
$('#vn-menu-toggle').onclick=openReadingMenu;
$('#vn-resume').onclick=()=>readingMenu.close();
$('#vn-reset').onclick=()=>{restart();readingMenu.close()};
$('#vn-home').onclick=()=>{readingMenu.close();closeReader()};
readingMenu.addEventListener('close',()=>{if(reader.open)$('.vn-stage').focus({preventScroll:true})});
reader.addEventListener('cancel',event=>{event.preventDefault();openReadingMenu()});
reader.addEventListener('close',()=>{if(readingMenu.open)readingMenu.close()});
// Reserve actual text height so mobile portraits never sit behind the copy.
const dialogueObserver=new ResizeObserver(entries=>{
 const height=entries[0].borderBoxSize?.[0]?.blockSize||entries[0].target.getBoundingClientRect().height;
 reader.style.setProperty('--dialogue-height',`${Math.ceil(height)}px`);
});
dialogueObserver.observe($('.vn-dialogue'));
function atlas(el,file,cell){el.style.backgroundSize=cell==null?'cover':'300% 300%';el.style.backgroundImage=`url("${file}")`;el.style.backgroundPosition=cell==null?'center':`${cell%3*50}% ${Math.floor(cell/3)*50}%`;}
let characterRequest=0;
let portraitKey="";
function renderReadingScene(){
 const story=stories[active],run=state.runs[active],finished=run.step>=(typeof readingEnd==='function'?readingEnd():story.scenes.length);
 const sceneIndex=Math.min(run.step,(typeof readingEnd==='function'?readingEnd():story.scenes.length)-1),direction=visualAssets.scenes.find(s=>s.story===active&&s.scene===sceneIndex);
 const bg=visualAssets.backgrounds.find(b=>b.id===direction.background);
 const backdrop=$('.vn-background');atlas(backdrop,bg.file,bg.cell);backdrop.style.aspectRatio=`${bg.width}/${bg.height}`;
 // A local cover remains underneath if a location has not been cached yet.
 $('.vn-stage').style.backgroundImage=`url("${imageUrl(story)}")`;
 const frames=active===1&&run.pendingChoice?summerBranchFrames(run):active===1&&!finished?summerSceneFrames(run):readingFrames[active][sceneIndex];run.beat=finished?0:Math.max(0,Math.min(Number.isInteger(run.beat)?run.beat:0,frames.length-1));
 const frame=finished?{text:'Продолжение следует.'}:frames[run.beat];
 if(active===1&&!finished)applySceneRelationship(run,frame);
 if(active===1&&!finished)offerFitting(run,frame);
 audioScene=finished?null:{story:active,bg:bg.id,text:frame.text,key:[active,run.step,run.pendingChoice,run.beat].join('/')};
 if (finished) soundtrack.stop(); else syncReadingSound();
 const c=visualAssets.characters.find(c=>c.id===(frame.figure||frame.speaker)),portrait=$('#vn-character');
 const request=++characterRequest;
 $('.vn-stage').classList.toggle('has-speaker',!!c);
 $('.vn-stage').classList.toggle('heroine-on-left',c?.id==='summer-heroine');
 if(!c){portraitKey='';portrait.classList.remove('is-visible');portrait.hidden=true;portrait.dataset.speaker='';}
 if(c){const costume=frame.costume||direction.costumes?.[c.id];const v=c.variants.find(v=>v.id===costume)||c.variants[0];const emotion=visualAssets.emotions.find(e=>e.id===frame.emotion)||visualAssets.emotions[0];
  const full=active===1;
  const file=full?figureFile(summerFigure(c.id,run)):v.file;
  const nextKey=full?file:c.id+':'+v.file+':'+emotion.cell;
  const changed=portraitKey!==nextKey;if(changed)portrait.classList.remove('is-visible');
  const img=new Image();img.onload=()=>{if(request!==characterRequest)return;if(full){
    img.className='reading-figure';img.alt='';portrait.replaceChildren(img);
    portrait.style.backgroundImage='none';portrait.style.aspectRatio='auto';
   }else{
    portrait.replaceChildren();atlas(portrait,file,emotion.cell);portrait.style.aspectRatio=`${v.width}/${v.height}`;
   }portrait.setAttribute('aria-label',`${characterName(c)}: ${emotion.label}`);portrait.dataset.speaker=c.id;portrait.dataset.emotion=emotion.id;portrait.hidden=false;portraitKey=nextKey;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(request===characterRequest)portrait.classList.add('is-visible')}));};img.src=file;
 }
 $('.vn-speaker').hidden=!c||!frame.speaker;$('#vn-name').textContent=c?characterName(c):'';
 showStoryProp(active === 1 && !finished ? frame.text : '');
 $('#story-text').textContent=personalizedText(frame.text);$('#vn-live').scrollTop=0;
 const last=run.beat===frames.length-1;
 $('#choices').replaceChildren();
 if(!finished&&last&&!run.pendingChoice)story.scenes[sceneIndex][2].forEach((choice,i)=>{const button=document.createElement('button');button.dataset.choice=i;button.textContent=personalizedText(choice[0]);$('#choices').append(button)});
 run.readerVersion=3;if(active===1)run.summerEdition=2;save();
 if(reader.open&&!readingMenu.open&&!reader.contains(document.activeElement))$('.vn-stage').focus({preventScroll:true});
}
function advanceReading(){
 if(!reader.open||readingMenu.open)return;
 const run=state.runs[active];
 if(run.step>=(typeof readingEnd==='function'?readingEnd():stories[active].scenes.length))return;
 if(active===1&&run.pendingChoice){if(run.beat<summerBranchFrames(run).length-1){run.beat++;}else{run.pendingChoice=false;run.step++;run.beat=0;}save();showScene();return;}
 if(run.beat<(active===1?summerSceneFrames(run):readingFrames[active][run.step]).length-1){run.beat++;showScene();}
}
const readingStage=$('.vn-stage');
let pressOrigin=null,dragged=false;
readingStage.addEventListener('pointerdown',event=>{pressOrigin={x:event.clientX,y:event.clientY};dragged=false});
readingStage.addEventListener('pointermove',event=>{if(pressOrigin&&Math.hypot(event.clientX-pressOrigin.x,event.clientY-pressOrigin.y)>10)dragged=true});
readingStage.addEventListener('pointercancel',()=>{dragged=true;pressOrigin=null});
readingStage.addEventListener('click',event=>{
 if(event.target.closest('button,a,input,select,textarea')||dragged||window.getSelection()?.toString())return;
 if(event.button!==0)return;
 advanceReading();
});
readingStage.addEventListener('keydown',event=>{
 if(event.target.closest('button,a,input,select,textarea')||event.altKey||event.ctrlKey||event.metaKey||event.repeat)return;
 if([' ','Enter','ArrowRight'].includes(event.key)){event.preventDefault();advanceReading()}
});
