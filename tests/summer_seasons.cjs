const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={render(){},save(){},showScene(){},active:1,state:{runs:{1:{step:0,beat:0,truth:0,trust:0,boundary:0}}}};vm.createContext(ctx);
for(const file of ['app.js','episodes.js','dialogue-data.js','summer-content.js','visual-assets.js','reader.js','summer-branches.js','summer-sequels.js']){let s=fs.readFileSync('dist/'+file,'utf8');if(file==='app.js')s=s.split('\nlet state;')[0];if(file==='reader.js')s=s.split('const reader=document')[0];vm.runInContext(s,ctx);}
vm.runInContext(`
if(stories[1].scenes.length!==33)throw Error('scene count');
for(let ep=0;ep<3;ep++){
 const r=state.runs[1],start=currentSummerEpisode().start,end=readingEnd();
 for(let step=start;step<end;step++){
  r.step=step;r.pendingChoice=false;
  const frames=summerSceneFrames(r);if(!frames.length)throw Error('empty scene');
  for(let choice=0;choice<2;choice++)if(!summerConsequences[step][choice].length)throw Error('empty consequence');
  chooseSummer(step%2);const before=r.truth+r.trust+r.boundary;chooseSummer(step%2);if(before!==r.truth+r.trust+r.boundary)throw Error('double award');
  if(!summerBranchFrames(r).length)throw Error('empty response');r.pendingChoice=false;r.step++;
 }
 const total=r.truth+r.trust+r.boundary;if(total!==end)throw Error('cumulative scores');
 if(ep<2)nextSummerEpisode();
}
const r=state.runs[1];replaySummerEpisode();if(r.step!==23||r.truth+r.trust+r.boundary!==23)throw Error('replay baseline');
if(Object.keys(r.decisions).some(k=>Number(k)>=23))throw Error('replay decisions');
this.counts=summerEpisodes.map(e=>({title:e.title,words:readingFrames[1].slice(e.start,e.end).flat().map(f=>f.text).join(' ').split(/\\s+/).length}));
`,ctx);console.log(ctx.counts);console.log('PASS: 33 scenes, all responses, cumulative stats, duplicate guard, next episode, replay baseline and choices');
vm.runInContext(`
for(const route of [0,1]){
 state.runs[1]={step:13,episode:0,truth:9,trust:3,boundary:1};nextSummerEpisode();
 for(let ep=1;ep<3;ep++){
  let r=state.runs[1];const end=readingEnd();
  while(r.step<end){
   const scene=r.step;chooseSummer(route);
   const expected=JSON.stringify(summerBranchFrames(r));
   state.runs[1]=JSON.parse(JSON.stringify(r));r=state.runs[1];
   if(JSON.stringify(summerBranchFrames(r))!==expected)throw Error('reload consequence');
   const direction=visualAssets.scenes.find(s=>s.story===1&&s.scene===scene);
   if(!direction||!visualAssets.backgrounds.some(b=>b.id===direction.background))throw Error('missing scenery');
   for(const f of [...summerSceneFrames(r),...summerBranchFrames(r)])if(f.speaker&&!visualAssets.characters.some(c=>c.id===f.speaker))throw Error('missing portrait');
   r.pendingChoice=false;r.step++;r.beat=0;
  }
  if(r.truth+r.trust+r.boundary!==end)throw Error('legacy total');
  if(ep===1)nextSummerEpisode();
 }
}
`,ctx);console.log('PASS: both sequel routes, saved response resume, old completed saves, backgrounds and portraits');
