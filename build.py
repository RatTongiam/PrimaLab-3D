"""Build PrimaLab.
  python build.py        -> mocap-viewer.html  (fragment, for embedding as an artifact)
                            dist/index.html    (standalone page for static hosting)
"""
import os
t = open('template.html', encoding='utf-8').read()
e = open('engine.js', encoding='utf-8').read()
a = open('i18n.js', encoding='utf-8').read() + open('app.js', encoding='utf-8').read()
assert '</script' not in e and '</script' not in a
out = t.replace('/*__ENGINE__*/', e).replace('/*__APP__*/', a)
open('mocap-viewer.html', 'w', encoding='utf-8').write(out)

head = ('<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n')
d = head + out.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
i = d.index('</style>') + len('</style>')
d = d[:i] + '\n</head>\n<body>' + d[i:] + '\n</body>\n</html>\n'
os.makedirs('dist', exist_ok=True)
open('dist/index.html', 'w', encoding='utf-8').write(d)
print('mocap-viewer.html', len(out), 'bytes; dist/index.html', len(d.encode('utf-8')), 'bytes')
