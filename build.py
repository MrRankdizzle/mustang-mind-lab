#!/usr/bin/env python3
"""Bundle src/ into the single deployable index.html at the repo root.
Usage: python3 build.py          -> writes ./index.html
Load order: styles.css, core.js, data/*.js, widgets/*.js, games/*.js (each file in its own <script> so one error can't break the rest)."""
import glob, os
ROOT = os.path.dirname(os.path.abspath(__file__))
S = lambda p: os.path.join(ROOT, 'src', p)

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

css = read(S('styles.css'))
scripts = [S('core.js')]
scripts += sorted(glob.glob(S('data/*.js')))
scripts += sorted(glob.glob(S('widgets/*.js')))
scripts += sorted(glob.glob(S('games/*.js')))
js = '\n</script>\n<script>\n'.join(f'/* ---- {os.path.relpath(p, ROOT)} ---- */\n' + read(p).replace('</script', '<\\/script') for p in scripts)

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Mustang Mind Lab</title>
<meta name="description" content="Relearn and practice AP Psychology Unit 1: Biological Bases of Behavior with interactive lessons, checks for understanding, and games.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bungee&family=JetBrains+Mono:wght@500;700&display=swap">
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
<style>
{css}
</style>
</head>
<body>
<div id="app"></div>
<script>
{js}
</script>
<script>
(function start() {{ try {{ ML.boot(); }} catch (e) {{ console.error(e); document.getElementById('app').textContent = 'Mustang Mind Lab could not start: ' + e.message; }} }})();
</script>
</body>
</html>
'''
out = os.path.join(ROOT, 'index.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'wrote index.html ({len(html)//1024} KB, {len(scripts)} scripts)')
