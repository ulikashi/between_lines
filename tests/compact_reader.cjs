const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=process.cwd();const source=fs.readFileSync('dist/app.js','utf8').split('\nlet state;')[0]+fs.readFileSync('dist/episodes.js','utf8')+fs.readFileSync('dist/dialogue-data.js','utf8');
const code=fs.readFileSync('dist/reader.js','utf8').split('const reader=document')[0];
const ctx={render(){},state:{runs:{0:{step:1,beat:2,trust:3},1:{step:0,beat:0}}}};vm.createContext(ctx);vm.runInContext(source+code+';this.result={stories,readingFrames,legacyReadingFrames}',ctx);const {stories,readingFrames,legacyReadingFrames}=ctx.result;
const norm=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();let count=0,max=0;
for(let i=0;i<3;i++)for(let j=0;j<13;j++){const frames=readingFrames[i][j];assert.equal(norm(stories[i].scenes[j][1]),norm(frames.map(f=>f.text).join(' ')));for(const f of frames){max=Math.max(max,f.text.length);assert.equal(f.speaker,legacyReadingFrames[i][j][f.legacyBeat].speaker);count++;}}
assert.equal(readingFrames[0][1][ctx.state.runs[0].beat].legacyBeat,2);assert.equal(ctx.state.runs[0].trust,3);assert.equal(ctx.state.runs[0].readerVersion,3);assert(max<=210);console.log({scenes:39,frames:count,maxCharacters:max,textAndSpeakerPreserved:true,oldSaveMigration:true});
