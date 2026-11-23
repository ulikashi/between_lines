const availablePlay=play;
play=function(id){if(id!==1)return;reader.classList.add('summer-story');readingMenu.classList.add('summer-menu');naming.classList.add('summer-menu');availablePlay(id)};
stories[1].description='Ты приехала к морю, чтобы снова услышать себя. Но на чужой премьере узнаёшь собственную историю.';
const preview = document.createElement('dialog');
preview.id = 'story-preview';
preview.setAttribute('aria-labelledby', 'preview-title');
document.body.append(preview);
document.addEventListener('click', event => {
 const trigger = event.target.closest('[data-preview]');
 if (!trigger) return;
 const story = stories[Number(trigger.dataset.preview)];
 const available = story.id === 1;
 preview.innerHTML = `<button class="preview-close" aria-label="Закрыть">×</button><div class="preview-stage theatre-stage"><img src="${imageUrl(story)}" alt=""></div><section><h2 id="preview-title">${story.title}</h2><p>${story.tags.join(' · ')}</p><p>${story.description}</p>${available ? '<p>4 серии</p><button class="primary preview-start"></button>' : '<p>В разработке</p>'}</section>`;
 preview.querySelector('.preview-close').onclick = () => preview.close();
 if (available) {
  const start = preview.querySelector('.preview-start');
  start.textContent = state.runs[story.id] ? 'Продолжить чтение' : 'Начать читать';
  start.onclick = () => { preview.close(); play(story.id); };
 }
 const cover = trigger.closest('.card').querySelector('.cover');
 cover.classList.add('curtains-open');
 preview.addEventListener('close', () => cover.classList.remove('curtains-open'), { once: true });
 preview.showModal();
});
const finale=document.createElement('dialog');finale.id='summer-finale';finale.setAttribute('aria-labelledby','finale-title');document.body.append(finale);
function showSummerFinale(){const r=state.runs[1],ep=currentSummerEpisode(),baseline=r.episodeBaseline||{};finale.innerHTML=`<div class="finale-postcard"><div class="finale-view"><div class="finale-caption"><p>Не случайные</p><span>Лето, которое останется с тобой</span></div></div><section class="finale-letter"><div class="finale-lemon" aria-hidden="true"></div><p class="finale-kicker">Серия ${(r.episode||0)+1} завершена</p><h2 id="finale-title">${ep.title}</h2><div class="finale-stats" aria-label="Итоги серии">${[['trust','Близость'],['truth','Честность'],['boundary','Опора на себя']].map(([key,label])=>`<div class="finale-stat"><img class="stat-icon" src="assets/ornaments/stat-${key}.svg" alt=""><span class="stat-label">${label}</span><span class="stat-value" aria-label="Всего ${r[key]||0}">${r[key]||0}</span><span class="stat-gain" aria-label="За серию плюс ${(r[key]||0)-(baseline[key]||0)}">(+${(r[key]||0)-(baseline[key]||0)})</span></div>`).join('')}</div><div class="finale-actions">${(r.episode||0)<summerEpisodes.length-1?'<button id="episode-next">Следующая серия</button>':''}<button id="episode-replay">Пройти серию заново</button><button id="episode-home">На главный экран</button></div><div class="finale-flourish" aria-hidden="true"></div></section></div>`;finale.showModal();const next=document.querySelector('#episode-next');if(next)next.onclick=()=>{finale.close();nextSummerEpisode()};document.querySelector('#episode-replay').onclick=()=>{finale.close();replaySummerEpisode()};document.querySelector('#episode-home').onclick=()=>{finale.close();closeReader()};}
const standardAdvance=advanceReading;
advanceReading=function(){if(active===1&&reader.open&&!readingMenu.open&&state.runs[1].step>=readingEnd()){if(!finale.open)showSummerFinale();return}standardAdvance()};
render();

finale.addEventListener('cancel',event=>{event.preventDefault();finale.close();closeReader()});
reader.addEventListener('close',()=>{if(finale.open)finale.close()});
