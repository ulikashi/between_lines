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
reader.innerHTML=`<button id="vn-sound-toggle" aria-label="Звук истории"></button><button id="vn-menu-toggle" aria-label="Меню истории" aria-haspopup="dialog"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 8h14M5 16h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button><div class="vn-stage" tabindex="0" aria-label="История. Нажмите для следующей реплики"><div class="vn-background" aria-hidden="true"></div><div class="vn-vignette" aria-hidden="true"></div><div id="vn-character" role="img" hidden></div><section class="vn-dialogue" aria-label="Текст истории"><div class="vn-speaker" hidden><span id="vn-name"></span></div><div class="vn-dialogue-content"><div id="vn-live" aria-live="polite" aria-atomic="true"><p id="story-text"></p></div><div id="choices"></div></div></section></div>`;
const readingMenu=document.createElement('dialog');readingMenu.id='reading-menu';readingMenu.setAttribute('aria-label','Меню истории');
readingMenu.innerHTML = `
 <header class="reading-cover"><span id="menu-story"></span><h2 id="menu-episode"></h2></header>
 <div class="reading-controls">
  <h3>Настройки чтения</h3>
  <label class="reading-option">Звук истории <input type="checkbox" id="reading-sound" role="switch"></label>
  <label class="reading-option">Крупный шрифт <input type="checkbox" id="reading-large" role="switch"></label>
  <button id="vn-resume" autofocus>Продолжить чтение</button>
  <div class="reading-links"><button id="vn-home">На главный экран</button><button id="vn-reset">Начать заново</button></div>
 </div>`;
document.body.append(readingMenu);
const preferences = state.readingPreferences ||= {sound:true, large:false};
const soundtrack = createReadingAudio(syncReadingSound);
let audioScene;
const soundSwitch = $('#reading-sound');
const largeSwitch = $('#reading-large');
const sceneSoundButton = $('#vn-sound-toggle');
function displaySoundSetting(){
 soundSwitch.checked = preferences.sound;
 sceneSoundButton.setAttribute('aria-pressed', String(preferences.sound));
 sceneSoundButton.textContent = preferences.sound ? 'Звук вкл.' : 'Звук выкл.';
}
displaySoundSetting();
largeSwitch.checked = preferences.large;
reader.classList.toggle('large-type', preferences.large);
function syncReadingSound(){
 if (!preferences.sound || !reader.open || document.hidden) { soundtrack.stop(); return; }
 soundtrack.play(audioScene);
}
function unlockReadingSound(){
 if (!preferences.sound || !reader.open) return;
 soundtrack.prepare();
 syncReadingSound();
}
document.addEventListener('click',unlockReadingSound);
document.addEventListener('keyup',unlockReadingSound);
function setStorySound(enabled){
 preferences.sound = enabled;
 displaySoundSetting();
 save();
 if(enabled) unlockReadingSound(); else syncReadingSound();
}
soundSwitch.onchange = () => setStorySound(soundSwitch.checked);
sceneSoundButton.onclick = () => setStorySound(!preferences.sound);
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
 audioScene=finished?null:{story:active,bg:bg.id,text:frame.text,key:[active,run.step,run.pendingChoice,run.beat].join('/')};
 if (finished) soundtrack.stop(); else syncReadingSound();
 const c=visualAssets.characters.find(c=>c.id===frame.speaker),portrait=$('#vn-character');
 const request=++characterRequest;
 $('.vn-stage').classList.toggle('has-speaker',!!c);
 if(!c){portraitKey='';portrait.classList.remove('is-visible');portrait.hidden=true;portrait.dataset.speaker='';}
 if(c){const costume=frame.costume||direction.costumes?.[c.id];const v=c.variants.find(v=>v.id===costume)||c.variants[0];const emotion=visualAssets.emotions.find(e=>e.id===frame.emotion)||visualAssets.emotions[0];
  const nextKey=c.id+':'+v.file+':'+emotion.cell;
  const changed=portraitKey!==nextKey;if(changed)portrait.classList.remove('is-visible');
  const img=new Image();img.onload=()=>{if(request!==characterRequest)return;atlas(portrait,v.file,emotion.cell);portrait.style.aspectRatio=`${v.width}/${v.height}`;portrait.setAttribute('aria-label',`${characterName(c)}: ${emotion.label}`);portrait.dataset.speaker=c.id;portrait.dataset.emotion=emotion.id;portrait.hidden=false;portraitKey=nextKey;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(request===characterRequest)portrait.classList.add('is-visible')}));};img.src=v.file;
 }
 $('.vn-speaker').hidden=!c;$('#vn-name').textContent=c?characterName(c):'';
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
