// A sparse eight-bar score for each story. Null beats leave room for the text.
function createReadingAudio(onStateChange) {
 const scores = [
  [[50,46,48,45],[69,null,65,64,null,62,65,null]],
  [[50,55,47,45],[66,69,null,73,71,null,69,64]],
  [[45,41,48,43],[64,null,null,67,62,null,59,null]]
 ];
 let context, bus, noise, timer, position = 0, scene, heard, story;
 function prepare() {
  const Engine = window.AudioContext || window.webkitAudioContext;
  if (!Engine) return;
  if (!context) {
   context = new Engine();
   context.onstatechange = onStateChange;
   noise = context.createBuffer(1,context.sampleRate,context.sampleRate);
   const samples = noise.getChannelData(0);
   for (let i=0;i<samples.length;i++) samples[i]=Math.random()*2-1;
  }
  if (context.state !== 'running') context.resume().catch(()=>{});
 }
 function voice(source, output, at, duration, level, attack) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.00001,at);
  gain.gain.exponentialRampToValueAtTime(level,at+attack);
  gain.gain.exponentialRampToValueAtTime(0.00001,at+duration);
  output.connect(gain).connect(bus);
  source.onended=()=>{source.disconnect();output.disconnect();gain.disconnect()};
  source.start(at); source.stop(at+duration);
 }
 function note(pitch, at, duration, level, type='sine') {
  const osc=context.createOscillator();
  osc.type=type;
  osc.frequency.value=440*Math.pow(2,(pitch-69)/12);
  voice(osc,osc,at,duration,level,type==='triangle'?0.025:0.12);
 }
 function rustle(hz, at, duration, level, attack) {
  const source=context.createBufferSource(), filter=context.createBiquadFilter();
  source.buffer=noise; source.loop=true;
  filter.type='bandpass'; filter.frequency.value=hz; filter.Q.value=0.65;
  source.connect(filter); voice(source,filter,at,duration,level,attack);
 }
 function tick() {
  const [roots,melody]=scores[scene.story], now=context.currentTime;
  const bar=Math.floor(position/4), beat=position%4;
  if (!beat) {
   const root=roots[bar%4];
   note(root,now,3.4,0.055); note(root+7,now+0.35,2.8,0.025);
   if (['summer-03','summer-06','summer-08'].includes(scene.bg))
    rustle(870,now,3.1,0.065,1.2);
   if (['summer-04','summer-07','city-01','city-02','city-07'].includes(scene.bg)) {
    rustle(240,now,3.6,0.095,0.8);
    rustle(1150,now+0.7,1.9,0.024,0.5);
   }
  }
  const pitch=melody[(position+Math.floor(bar/4)*2)%8];
  if (pitch!=null) note(pitch,now,scene.story===1?1.45:2.1,0.047,scene.story===1?'triangle':'sine');
  position=(position+1)%32;
 }
 function stop() {
  clearInterval(timer); timer=null;
  if (!bus) return;
  const old=bus; bus=null;
  old.gain.setTargetAtTime(0,context.currentTime,0.025);
  setTimeout(()=>old.disconnect(),160);
 }
 function play(next) {
  scene=next;
  if (!context || !scene || context.state!=='running') return;
  if (!timer || story!==scene.story) {
   stop(); story=scene.story; position=0;
   bus=context.createGain(); bus.connect(context.destination);
   tick(); timer=setInterval(tick,story===1?900:1150);
  }
  if (heard===scene.key) return;
  heard=scene.key;
  const now=context.currentTime;
  if (scene.text.includes('катятся аплодисменты')) {
   for(let i=0;i<66;i++) rustle(900+Math.random()*1700,now+i*0.034+Math.random()*0.03,0.085,(1-i/80)*0.17,0.004);
  }
  if (scene.text.includes('звонит колокол')) {
   note(76,now,2.6,0.085); note(88,now,1.55,0.03);
  }
 }
 return {prepare,play,stop};
}
