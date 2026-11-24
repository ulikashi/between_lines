// The wardrobe stores one decision per occasion alongside the episode's other choices.
const fittings = {
 6: {title:'Ужин на балконе', outfits:[
  ['linen','Льняная рубашка','Мягкий лён и широкие брюки цвета песка.'],
  ['rose','Чайная роза','Розовый шёлк и лёгкая юбка цвета сливок.'],
  ['coral','Бугенвиллея','Коралловый комбинезон с цветочной вышивкой и золотым поясом.']
 ]},
 11: {title:'Вечер премьеры', outfits:[
  ['ivory','Белое платье','То самое светлое платье, которое ты купила в первый день.'],
  ['silk','Морское стекло','Шёлк цвета зелёной воды и тонкая цепочка на талии.'],
  ['couture','Полночный прибой','Сапфировый шёлк и серебряная вышивка, рассыпанная по подолу.']
 ]}
};
visualAssets.characters.push({
 id:'summer-marta',name:'Марта',story:1,variants:[{id:'home',file:'assets/full-length/marta.webp',width:640,height:1280}]
});
const wardrobePrices = [0,15,35];
const figureFile = id => 'assets/full-length/'+id+'.webp';
function selectedLook(run, step) {
 return fittings[step].outfits[run.outfits?.[step] ?? 0];
}
function summerFigure(character,run) {
 if(character !== 'summer-heroine') return character.slice(7);
 if(state.summerOwnedLooks.includes(run.equippedLook))return run.equippedLook;
 if(run.step===6) return selectedLook(run,6)[0];
 if(run.step>=11 && run.step<=19 && run.outfits?.[11]!=null) return selectedLook(run,11)[0];
 return 'linen';
}

const allLooks=Object.values(fittings).flatMap(entry=>entry.outfits);
// Earlier saves record confirmed fittings, but allowed equipping any preview.
const ownedIds=new Set(['linen',...(Array.isArray(state.summerOwnedLooks)?state.summerOwnedLooks:[])]);
for(const [step,index] of Object.entries(state.runs[1]?.outfits||{})){
 const look=fittings[step]?.outfits[index];
 if(look)ownedIds.add(look[0]);
}
state.summerOwnedLooks=allLooks.map(look=>look[0]).filter(id=>ownedIds.has(id));
if(state.runs[1] && !ownedIds.has(state.runs[1].equippedLook))delete state.runs[1].equippedLook;
save();
const wardrobeButton=document.createElement('button');
wardrobeButton.id='vn-wardrobe';
wardrobeButton.type='button';
wardrobeButton.title='Гардероб';
wardrobeButton.setAttribute('aria-label','Гардероб');
wardrobeButton.setAttribute('aria-haspopup','dialog');
wardrobeButton.innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 7a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.8v.5l9 6a1 1 0 0 1-.6 1.8H3.6A1 1 0 0 1 3 17l9-6"/></svg>';
$('#vn-menu-toggle').before(wardrobeButton);
const fittingRoom = document.createElement('dialog');
fittingRoom.id='fitting-room';
fittingRoom.setAttribute('aria-labelledby','fitting-title');
fittingRoom.innerHTML=`<section><button type="button" id="close-wardrobe" aria-label="Закрыть гардероб" hidden>×</button><h2 id="fitting-title"></h2><div class="fitting-mirror">
 <button type="button" data-turn="-1" aria-label="Предыдущий наряд">‹</button>
 <img id="fitting-figure" draggable="false" alt="">
 <button type="button" data-turn="1" aria-label="Следующий наряд">›</button>
 </div><div class="fitting-details" aria-live="polite"><small id="fitting-tier"></small>
 <h3 id="look-name"></h3><p id="look-description"></p><p id="look-terms"></p></div>
 <button id="wear-look">Надеть</button></section>`;
document.body.append(fittingRoom);
let fittingIndex = 0;
let browsingWardrobe=false;
function fittingEntry(){
 return browsingWardrobe ? {title:'Гардероб',outfits:allLooks.filter(look=>state.summerOwnedLooks.includes(look[0]))} : fittings[state.runs[1].step];
}
wardrobeButton.onclick=()=>{
 browsingWardrobe=true;
 fittingIndex=fittingEntry().outfits.findIndex(look=>look[0]===summerFigure('summer-heroine',state.runs[1]));
 displayFitting();
 fittingRoom.showModal();
};
$('#close-wardrobe').onclick=()=>fittingRoom.close();
function displayFitting(){
 const entry=fittingEntry();
 $('#close-wardrobe').hidden=!browsingWardrobe;
 const [id,name,description]=entry.outfits[fittingIndex];
 $('#fitting-title').textContent=entry.title;
 $('#fitting-figure').src=figureFile(id);
 $('#fitting-figure').alt=name+' в полный рост';
 $('#fitting-tier').textContent=['Повседневный','Особенный','Изысканный'][allLooks.indexOf(entry.outfits[fittingIndex])%3]+' · '+(fittingIndex+1)+' / '+entry.outfits.length;
 fittingRoom.querySelectorAll('[data-turn]').forEach(button=>button.disabled=entry.outfits.length===1);
 $('#look-name').textContent=name;
 $('#look-description').textContent=description;
 $('#look-terms').textContent=browsingWardrobe ? (id===summerFigure('summer-heroine',state.runs[1])?'Сейчас на героине':'Доступно') : fittingIndex ? 'Будущая цена · '+wardrobePrices[fittingIndex]+' монет' : 'Бесплатно';
}
function turnLook(delta){const count=fittingEntry().outfits.length;fittingIndex=(fittingIndex+delta+count)%count;displayFitting()}
fittingRoom.querySelectorAll('[data-turn]').forEach(button=>button.onclick=()=>turnLook(Number(button.dataset.turn)));
fittingRoom.addEventListener('keydown',event=>{
 if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();turnLook(event.key==='ArrowLeft'?-1:1)}
});
let swipeStart;
const mirror=fittingRoom.querySelector('.fitting-mirror');
mirror.addEventListener('pointerdown',event=>{
 if(event.target.closest('button'))return;
 swipeStart=event.clientX;
 mirror.setPointerCapture(event.pointerId);
});
mirror.addEventListener('pointerup',event=>{
 if(swipeStart!=null && Math.abs(event.clientX-swipeStart)>40)
  turnLook(event.clientX<swipeStart?1:-1);
 swipeStart=null;
});
mirror.addEventListener('pointercancel',()=>{swipeStart=null});
function wearLook(){
 const run=state.runs[1];
 if(!fittingRoom.open)return;
 if(browsingWardrobe){
  run.equippedLook=fittingEntry().outfits[fittingIndex][0];
  save();fittingRoom.close();renderReadingScene();return;
 }
 if( run.outfits?.[run.step] != null)return;
 run.outfits??={};
 run.outfits[run.step]=fittingIndex;
 run.equippedLook=selectedLook(run,run.step)[0];
 if(!state.summerOwnedLooks.includes(run.equippedLook))state.summerOwnedLooks.push(run.equippedLook);
 save();fittingRoom.close();showScene();
}
$('#wear-look').onclick=wearLook;
fittingRoom.addEventListener('cancel',event=>{event.preventDefault();fittingRoom.close();if(!browsingWardrobe)closeReader()});
function needsFitting(run,frame){
 return !run.pendingChoice && run.outfits?.[run.step]==null &&
 ((run.step===6 && run.beat===0)||(run.step===11 && frame.text.startsWith('Ты надеваешь простое светлое платье')));
}
function offerFitting(run,frame){
 if(!needsFitting(run,frame))return;
 queueMicrotask(()=>{
  if(!reader.open || active!==1 || state.runs[1]!==run || fittingRoom.open || !needsFitting(run,frame))return;
  browsingWardrobe=false;fittingIndex=0;displayFitting();fittingRoom.showModal();
 });
}

const scenesBeforeWardrobe=summerSceneFrames;
summerSceneFrames=function(run){
 const frames=scenesBeforeWardrobe(run);
 if(run.step===25)return frames.map(f=>f.text.startsWith('Марта отвечает с кухни.')||f.text.startsWith('«Ты тогда уже ушла')?{...f,figure:'summer-marta'}:f);
 if(run.step===11 && run.outfits?.[11]!=null){
  const dressing=['Ты надеваешь простое светлое платье.','Ты надеваешь шёлковое платье.','Ты расправляешь сапфировый подол.'];
  return frames.map(frame=>{
   if(frame.text.startsWith('Ты надеваешь простое светлое платье'))
    return {...frame,figure:'summer-heroine',text:dressing[run.outfits[11]]+frame.text.slice(frame.text.indexOf('.')+1)};
   return frame.text==='Хорошо выглядишь.' ? outfitReaction(run) : frame;
  });
 }
 if(run.step===6 && run.outfits?.[6]!=null){
  return frames.map((frame,index)=>index===0?{...frame,figure:'summer-heroine'}:frame).concat(outfitReaction(run));
 }
 if(run.step===14){
  const confident=(run.boundary||0)>=5;
  return [...frames,...(confident?[H('Мне нужен прямой номер. Если копия не придёт, кому я смогу позвонить?'),P('Мне. Запишите мой мобильный.'),N('Елена ждёт, пока ты сохранишь номер. Теперь следующий разговор можешь начать ты сама.')]:[N('Ты хочешь попросить прямой номер, но Елену уже зовут из зала. На листке остаётся общий адрес фестиваля. Придётся ждать её письма.')])];
 }
 return frames;
};

const outfitCompliments={
 linen:'Тебе идёт эта рубашка. Цвет такой тёплый.',
 ivory:'Тебе очень идёт белое.',
 rose:'Тебе идёт этот розовый. Можно я скажу это просто так, без камеры?',
 silk:'Этот цвет — как вода под нашим балконом. Я её раз десять пытался снять.',
 coral:'Цветы на поясе совсем как те, что у нас под окном. А тебе этот цвет идёт даже больше. Я засмотрелся.',
 couture:'Ты повернулась, и я наконец увидел вышивку. Как пена на волнах. Ты сегодня удивительно красивая.'
};
function outfitReaction(run){
 const look=run.seenLooks?.[run.step] || summerFigure('summer-heroine',run);
 return {...S(outfitCompliments[look]),seenLook:look};
}
