const json = (value,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const bytes = new TextEncoder();
async function key(secret) {
 return crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
async function authenticate(raw,token) {
 const params = new URLSearchParams(raw);
 const hash = params.get('hash');
 const age = Date.now()/1000 - Number(params.get('auth_date'));
 if (!hash || !/^[0-9a-f]{64}$/.test(hash) || !Number.isFinite(age) || age < -60 || age > 86400) return null;
 params.delete('hash');
 const data = [...params].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+'='+v).join('\n');
 const secret = await crypto.subtle.sign('HMAC',await key(bytes.encode('WebAppData')),bytes.encode(token));
 const valid = await crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(hash.match(/../g),h=>parseInt(h,16)),bytes.encode(data));
 if (!valid) return null;
 const user = JSON.parse(params.get('user') || 'null');
 return Number.isSafeInteger(user?.id) ? user : null;
}
export class ReaderProfile {
 constructor(ctx){this.store=ctx.storage}
 async fetch(request) {
  if(new URL(request.url).pathname==='/credit'){
   const payment=await request.json();
   return this.store.transaction(async tx=>{
    const charge='charge:'+payment.telegram_payment_charge_id;
    if(!await tx.get(charge)){
     await tx.put(charge,{amount:payment.total_amount,at:Date.now()});
     await tx.put('stars',(await tx.get('stars')||0)+payment.total_amount);
    }
    return json({ok:true});
   });
  }
  if(request.method==='GET')return json({...await this.store.get('profile')||{version:0,state:null},stars:await this.store.get('stars')||0});
  const body=await request.json();
  return this.store.transaction(async tx=>{
   const old=await tx.get('profile');
   if((old?.version||0)!==body.version)return json({error:'conflict'},409);
   const profile={version:body.version+1,state:body.state};
   await tx.put('profile',profile);
   return json({version:profile.version});
  });
 }
}
async function telegram(env,method,data){
 const r=await fetch('https://api.telegram.org/bot'+env.BOT_TOKEN+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const result=await r.json();
 if(!result.ok)throw Error('Telegram '+method+' '+r.status);
 return result.result;
}
const welcome='Добро пожаловать в «Между строк»! На итальянском побережье Веру ждёт квартира с видом на море. И сосед, у которого ключ от той же двери. Открывай библиотеку и выбирай, как начнётся их знакомство.';
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/telegram/setup'&&request.method==='POST'){
  if(!env.WEBHOOK_SECRET||request.headers.get('Authorization')!=='Bearer '+env.WEBHOOK_SECRET)return json({},403);
  const home=url.origin+'/';
  const bot=await telegram(env,'getMe',{});
  await telegram(env,'setChatMenuButton',{menu_button:{type:'web_app',text:'Читать',web_app:{url:home}}});
  await telegram(env,'setMyDescription',{description:welcome});
  await telegram(env,'setWebhook',{url:home+'telegram/update',secret_token:env.WEBHOOK_SECRET,allowed_updates:['message','pre_checkout_query']});
  return json({bot:bot.username,webhook:(await telegram(env,'getWebhookInfo',{})).url});
 }
 if(url.pathname==='/telegram/update'&&request.method==='POST'){
  if(!env.WEBHOOK_SECRET||request.headers.get('X-Telegram-Bot-Api-Secret-Token')!==env.WEBHOOK_SECRET)return json({},403);
  const u=await request.json();
  if(u.pre_checkout_query){
   const q=u.pre_checkout_query;
   const ok=env.ENABLE_STARS==='true'&&q.currency==='XTR'&&q.total_amount===25&&q.invoice_payload==='support:'+q.from.id;
   await telegram(env,'answerPreCheckoutQuery',{pre_checkout_query_id:q.id,ok,...(ok?{}:{error_message:'Этот счёт сейчас недоступен.'})});
  }
  const m=u.message;
  if(m?.successful_payment){
   const payment=m.successful_payment;
   if(payment.currency==='XTR'&&payment.total_amount===25&&payment.invoice_payload==='support:'+m.from.id){
    const profile=env.READERS.get(env.READERS.idFromName(String(m.from.id)));
    const credited=await profile.fetch('https://profile/credit',{method:'POST',body:JSON.stringify(payment)});
    if(!credited.ok)throw Error('Payment storage unavailable');
   }
  }
  if(m?.chat.type==='private'&&/^\/start(?:@\w+)?(?:\s|$)/.test(m.text||''))await telegram(env,'sendMessage',{chat_id:m.chat.id,text:welcome,reply_markup:{inline_keyboard:[[{text:'Открыть «Между строк»',web_app:{url:url.origin+'/'}}]]}});
  return json({ok:true});
 }
 if(url.pathname==='/api/stars'&&request.method==='POST'){
  if(env.ENABLE_STARS!=='true')return json({},404);
  const user=await authenticate(request.headers.get('X-Telegram-Init-Data')||'',env.BOT_TOKEN);
  if(!user)return json({},401);
  return json({url:await telegram(env,'createInvoiceLink',{title:'Поддержать «Между строк»',description:'Добровольная поддержка новых историй',payload:'support:'+user.id,provider_token:'',currency:'XTR',prices:[{label:'Поддержка',amount:25}]})});
 }
 if(url.pathname==='/api/profile'){
  if(!['GET','PUT'].includes(request.method))return json({},405);
  const user=await authenticate(request.headers.get('X-Telegram-Init-Data')||'',env.BOT_TOKEN);
  if(!user)return json({},401);
  const stub=env.READERS.get(env.READERS.idFromName(String(user.id)));
  if(request.method==='GET')return stub.fetch(request);
  const raw=await request.text();if(raw.length>65536)return json({},413);
  let b;try{b=JSON.parse(raw)}catch{return json({},400)}
  if(!Number.isSafeInteger(b?.version)||!Array.isArray(b.state?.saved)||!b.state.runs||typeof b.state.runs!=='object')return json({},400);
  return stub.fetch(new Request(request.url,{method:'PUT',body:raw}));
 }
 return env.ASSETS.fetch(request);
}};
