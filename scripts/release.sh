#!/bin/sh
set -eu
cd "$(git rev-parse --show-toplevel)"
test "$(git branch --show-current)" = main || { echo 'Switch to main before releasing.'; exit 1; }
test -z "$(git status --porcelain)" || { echo 'Review and commit the intended changes first.'; exit 1; }
python3 scripts/build.py
test -z "$(git status --porcelain)" || { echo 'Commit the generated release files, then rerun.'; exit 1; }
node --check worker/index.mjs
node tests/compact_reader.cjs
node tests/immersive_reader.cjs
node tests/summer_seasons.cjs
git push origin main
wrangler deploy
node --input-type=module - <<'JS'
import {readFileSync} from 'node:fs';
const origin='https://mezhdu-strok-reader.mezhdu-strok.workers.dev';
const expected=readFileSync('dist/index.html','utf8');
for(let i=0;i<8;i++){
 const page=await fetch(origin+'/?verify='+Date.now());
 if(page.ok && (await page.text())===expected &&
    (await fetch(origin+'/api/profile')).status===401 &&
    (await fetch(origin+'/telegram/update',{method:'POST'})).status===403){
  console.log('Cloudflare release verified:',origin);break;
 }
 if(i===7)throw Error('Production verification failed');
 await new Promise(resolve=>setTimeout(resolve,2500));
}
JS
