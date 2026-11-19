"""Exercise a real old service worker and stale unversioned JS on a Pages subpath."""
import json,mimetypes,subprocess,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
release={'old':'7b632e1','updated':False}
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_GET(self):
  path=self.path.split('?')[0].removeprefix('/between_lines/');path=path or 'index.html'
  if '..' in path:self.send_error(404);return
  try:
   # Model the exact regression: old app.js remains in an intermediary cache.
   if not release['updated'] or path=='app.js':body=subprocess.check_output(['git','show',f"{release['old']}:dist/{path}"],cwd=ROOT,stderr=subprocess.DEVNULL)
   else:body=(ROOT/'dist'/path).read_bytes()
  except (OSError,subprocess.CalledProcessError):self.send_error(404);return
  self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(path)[0] or 'application/octet-stream');self.send_header('Cache-Control','no-cache');self.end_headers();self.wfile.write(body)
server=ThreadingHTTPServer(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/between_lines/'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for old in ['7b632e1','ea0a4bf']:
  release.update(old=old,updated=False)
  context=browser.new_context();page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url,wait_until='networkidle');page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller')
  page.evaluate("localStorage.setItem('between-lines-episodes-v2',JSON.stringify({saved:[0],runs:{0:{step:2,trust:1,truth:1,boundary:0}}}))")
  release['updated']=True
  page.goto(url+'?release=atomic',wait_until='networkidle')
  page.locator('.card-open[data-play="0"]').click();assert page.locator('#reader').is_visible()
  assert page.evaluate('state.runs[0].step')==2
  page.locator('#vn-next').click();page.locator('#exit').click()
  page.locator('.card-open[data-play="1"]').click();page.locator('#hero-name').fill('Анна');page.locator('.name-start').click()
  assert page.locator('#reader').is_visible()
  for _ in range(2):page.locator('#vn-next').click()
  page.wait_for_function("document.querySelector('#vn-character').dataset.speaker==='summer-sasha'")
  assert page.locator('#vn-character').is_visible()
  assert page.evaluate('state.names[1]')=='Анна'
  assert not errors,errors
  print('PASS upgrade from',old,': old worker, stale app.js, Pages subpath, resume, name entry, dialogue and portrait')
  context.close()
 browser.close()
server.shutdown()
