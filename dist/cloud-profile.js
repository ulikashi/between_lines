// The Worker verifies initData and selects the account server-side.
window.addEventListener('DOMContentLoaded',async()=>{
 const tg=window.Telegram?.WebApp;
 if(!tg?.initData || location.hostname.endsWith('github.io'))return;
 let version=0,last='',busy=false,ready=false;
 const headers={'X-Telegram-Init-Data':tg.initData,'Content-Type':'application/json'};
 const label=document.createElement('small');
 label.setAttribute('role','status');
 function status(text){label.textContent=text}
 const button=document.querySelector('#profile');
 button.style.display='block';
 button.onclick=()=>{
  info('<h2></h2><p></p>');
  const box=document.querySelector('#info-content');
  box.querySelector('h2').textContent=tg.initDataUnsafe.user?.first_name||'Мой профиль';
  box.querySelector('p').textContent='Начато историй: '+Object.keys(state.runs).length+' · В избранном: '+state.saved.length;
  box.append(label);
 };
 async function sync(){
  if(!ready||busy||JSON.stringify(state)===last)return;
  busy=true;
  try{
   const snapshot=JSON.stringify(state);
   localStorage.setItem(pendingKey,JSON.stringify({version,state:JSON.parse(snapshot)}));
   const r=await fetch('/api/profile',{method:'PUT',headers,body:JSON.stringify({version,state:JSON.parse(snapshot)})});
   if(r.status===409){ready=false;status('Прогресс изменён на другом устройстве. Открой приложение заново.');return}
   if(!r.ok)throw Error();
   version=(await r.json()).version;last=snapshot;localStorage.removeItem(pendingKey);status('Прогресс сохранён');
  }catch{status('Ожидаем подключения')}finally{busy=false}
 }
 const pendingKey=storageKey+'-pending';
 const prev=save;
 save=function(){prev();if(ready && JSON.stringify(state)!==last)localStorage.setItem(pendingKey,JSON.stringify({version,state}));void sync()};
 try{
  document.querySelector('main').inert=true;
  const r=await fetch('/api/profile',{headers,cache:'no-store'});if(!r.ok)throw Error();
  const p=await r.json();version=p.version;
  const pending=JSON.parse(localStorage.getItem(pendingKey)||'null');
  if(pending?.version===version)state=pending.state;
  else if(p.state)state=p.state;
  last=p.state?JSON.stringify(p.state):'';ready=true;render();status('Облачный профиль');
 }catch{status('Облачный профиль недоступен. Открой приложение заново.')}
 finally{document.querySelector('main').inert=false}
 setInterval(sync,3000);
});
