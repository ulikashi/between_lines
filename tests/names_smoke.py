import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('READER_URL','http://127.0.0.1:4176/'))
 page.locator('.card-open[data-play="0"]').click();assert page.locator('#name-dialog').is_visible()
 page.locator('#hero-name').fill('Анна');page.locator('.name-start').click();assert page.locator('#reader').is_visible()
 page.evaluate('state.runs[0].step=1;state.runs[0].beat=1;showScene()');assert 'Анна' in page.locator('#story-text').inner_text()
 page.evaluate('state.runs[0].step=2;state.runs[0].beat=6;showScene()')
 page.evaluate('restart()');assert page.evaluate('state.names[0]')=='Анна'
 page.reload();page.locator('.card-open[data-play="0"]').click();assert page.locator('#name-dialog').is_hidden();assert page.evaluate('state.names[0]')=='Анна'
 page.locator('#vn-menu-toggle').click();page.locator('#vn-home').click();page.locator('.card-open[data-play="1"]').click();page.locator('.name-skip').click();assert page.evaluate('state.names[1]')=='Вера'
 page.locator('#vn-menu-toggle').click();page.locator('#vn-home').click();page.locator('.card-open[data-play="2"]').click();page.locator('.name-start').click();assert page.evaluate('state.names[2]')=='Лера'
 assert page.locator('#reader').inner_text().count('↗')==0
 assert not errors,errors
 print('PASS: custom names in dialogue, restart/reload persistence, separate defaults, blank and skip, mobile dialog, no JS errors')
 b.close()
