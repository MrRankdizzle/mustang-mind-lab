"""Smoke test: opens every lesson step, page, and game in index.html and reports console errors,
horizontal overflow, and widgets that failed to load. Silence = pass.
Usage: python3 tools/check.py [width=390] [dark]   (needs: pip install playwright && playwright install chromium)"""
import sys, os
from playwright.sync_api import sync_playwright
html = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
W = int(sys.argv[1]) if len(sys.argv)>1 else 390
dark = len(sys.argv)>2
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': W, 'height': 844}, color_scheme='dark' if dark else 'light', has_touch=W<500)
    pg = ctx.new_page(); errs=[]
    pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'fonts.g' not in m.text and 'ERR_' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR '+str(e)))
    pg.goto('file://'+html); pg.wait_for_timeout(400)
    lessons = pg.evaluate('ML.data.lessons.map(l=>[l.id,l.steps.length])')
    def chk(label):
        pg.wait_for_timeout(350)
        ov = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
        miss = pg.evaluate("[...document.querySelectorAll('.widget .muted')].filter(e=>e.textContent.includes('is loading')||e.textContent.includes('could not load')).map(e=>e.textContent)")
        if ov>0 or errs or miss: print(label, 'overflow' if ov>0 else '', ov, miss, errs[:3])
        errs.clear()
    for lid,n in lessons:
        for s in range(n):
            pg.evaluate(f"ML.go('lesson',{{id:'{lid}',step:{s}}})"); chk(f'{lid}#{s}')
    for v in ['home','learn','arcade','prove','progress','glossary']:
        pg.evaluate(f"ML.go('{v}')"); chk(v)
    for t in ['1.1','1.2','1.3','1.4','1.5','1.6']:
        pg.evaluate(f"ML.go('topic',{{id:'{t}'}})"); chk('topic '+t)
    for g in pg.evaluate('ML.gameOrder'):
        pg.evaluate(f"ML.go('game',{{id:'{g}'}})"); pg.wait_for_timeout(200)
        pg.evaluate("document.querySelector('.game-overlay .btn-primary').click()"); pg.wait_for_timeout(1200); chk('game '+g)
    pg.evaluate("ML.go('home')"); chk('back home')
    b.close()
print('sweep done', W, 'dark' if dark else 'light')
