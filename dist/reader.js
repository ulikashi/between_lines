/* Scene text stays in episodes.js; only explicitly directed passages get a speaker. */
const deliveryLabels={speech:'',phone:'По телефону',radio:'Радиосвязь',recording:'Аудиозапись',video:'Видеозапись / связь',message:'Сообщение',letter:'Письмо / запись',memory:'Воспоминание',silent:'Беззвучно'};
const readingFrames=stories.map((story,si)=>story.scenes.map((scene,sc)=>{
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
const reader=document.querySelector('#reader');
reader.classList.add('visual-reader');
reader.innerHTML=`<div class="reader-top"><button id="exit" aria-label="Закрыть историю"> Библиотека</button><span id="reader-title"></span><button id="restart">Сначала </button></div><div class="progress"><div id="bar"></div></div><div class="vn-stage"><div class="vn-background" aria-hidden="true"></div><div class="vn-vignette" aria-hidden="true"></div><div class="vn-heading"><span id="chapter-label"></span><h2 id="scene-title"></h2></div><div id="vn-character" role="img" hidden></div><section class="vn-dialogue" aria-label="Чтение истории"><div class="vn-speaker"><span id="vn-name">Между строк</span><span id="vn-delivery"></span><span class="vn-ornament" aria-hidden="true">❧</span></div><div id="vn-live" aria-live="polite" aria-atomic="true"><p id="story-text"></p></div><div id="choices"></div><div class="vn-controls"><button id="vn-back" aria-label="Предыдущая реплика"> Назад</button><span id="vn-position"></span><button id="vn-next">Далее <span aria-hidden="true"></span></button></div><div class="vn-bottom"><span id="stats"></span><span>◦ Сохранено в этом браузере</span></div></section></div>`;
$('#exit').onclick=closeReader;$('#restart').onclick=restart;
function atlas(el,file,cell){el.style.backgroundImage=`url("${file}")`;el.style.backgroundPosition=`${cell%3*50}% ${Math.floor(cell/3)*50}%`;}
let characterRequest=0;
function renderReadingScene(){
 const story=stories[active],run=state.runs[active],finished=run.step>=story.scenes.length;
 const sceneIndex=Math.min(run.step,story.scenes.length-1),direction=visualAssets.scenes.find(s=>s.story===active&&s.scene===sceneIndex);
 const bg=visualAssets.backgrounds.find(b=>b.id===direction.background);
 const backdrop=$('.vn-background');atlas(backdrop,bg.file,bg.cell);backdrop.style.aspectRatio=`${bg.width}/${bg.height}`;
 // A local cover remains underneath if a location has not been cached yet.
 $('.vn-stage').style.backgroundImage=`url("${imageUrl(story)}")`;
 $('#reader-title').textContent=story.title;$('#chapter-label').textContent=`${story.episodeTitle} · ${sceneIndex+1} / ${story.scenes.length}`;
 $('#scene-title').textContent=finished?'Продолжение следует':story.scenes[sceneIndex][0];
 const frames=readingFrames[active][sceneIndex];run.beat=finished?0:Math.max(0,Math.min(Number.isInteger(run.beat)?run.beat:0,frames.length-1));
 const frame=finished?{text:'Первая серия завершена. Ваши решения сохранены. Следующая серия появится в одном из будущих обновлений.'}:frames[run.beat];
 const c=visualAssets.characters.find(c=>c.id===frame.speaker),portrait=$('#vn-character');
 const request=++characterRequest;portrait.hidden=true;portrait.dataset.speaker='';
 if(c){const costume=frame.costume||direction.costumes?.[c.id];const v=c.variants.find(v=>v.id===costume)||c.variants[0];const emotion=visualAssets.emotions.find(e=>e.id===frame.emotion)||visualAssets.emotions[0];
  const img=new Image();img.onload=()=>{if(request!==characterRequest)return;atlas(portrait,v.file,emotion.cell);portrait.style.aspectRatio=`${v.width}/${v.height}`;portrait.setAttribute('aria-label',`${characterName(c)}: ${emotion.label}`);portrait.dataset.speaker=c.id;portrait.dataset.emotion=emotion.id;portrait.hidden=false;};img.src=v.file;
 }
 $('#vn-name').textContent=c?characterName(c):'Между строк';$('#vn-delivery').textContent=(frame.delivery==='video'?(frame.costume==='future'?'Запись из будущего':'Видеосвязь'):deliveryLabels[frame.delivery])||(!c?'За кадром':'');
 $('#story-text').textContent=personalizedText(frame.text);$('#vn-live').scrollTop=0;
 $('#vn-position').textContent=finished?'Конец серии':`${run.beat+1} / ${frames.length}`;
 $('#stats').textContent=`Близость ${run.trust} · Честность ${run.truth} · Опора ${run.boundary}`;
 $('#bar').style.width=`${finished?100:(run.step+run.beat/frames.length)/story.scenes.length*100}%`;
 const last=run.beat===frames.length-1;
 $('#choices').replaceChildren();
 if(finished)$('#choices').innerHTML='<button data-replay>Прожить другую версию </button><button data-library>Вернуться к историям </button>';
 else if(last)story.scenes[sceneIndex][2].forEach((choice,i)=>{const button=document.createElement('button');button.dataset.choice=i;button.textContent=personalizedText(choice[0]);$('#choices').append(button)});
 $('#vn-next').hidden=last||finished;$('#vn-back').disabled=run.beat===0||finished;save();
}
$('#vn-next').onclick=()=>{const r=state.runs[active];if(r.step>=stories[active].scenes.length)return;if(r.beat<readingFrames[active][r.step].length-1){r.beat++;showScene();if($('#vn-next').hidden)$('#choices button')?.focus()}};
$('#vn-back').onclick=()=>{const r=state.runs[active];if(r.beat>0){r.beat--;showScene()}};
reader.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;if(e.key==='ArrowRight'&&!$('#vn-next').hidden){e.preventDefault();$('#vn-next').click()}if(e.key==='ArrowLeft'&&!$('#vn-back').disabled){e.preventDefault();$('#vn-back').click()}});
