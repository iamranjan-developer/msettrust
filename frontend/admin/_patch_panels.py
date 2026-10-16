# -*- coding: utf-8 -*-
p = 'e:/msetproject/msettrust/frontend/admin/panels.js'
data = open(p, encoding='utf-8').read()

# ---------- 1. gallery form field collisions (g-url used twice) ----------
# drop the hidden duplicate g-url input inside url-wrap
old_dupe = """    '<div id="g-url-wrap" style="display:none"><label>Video / Photo link</label><input id="g-url" type="text" placeholder="https://www.youtube.com/watch?v=..."></div>' +"""
new_dupe = """    '<div id="g-url-wrap" style="display:none"><label>Video / Photo link</label><input id="g-url" type="text" placeholder="https://www.youtube.com/watch?v=..." disabled></div>' +"""
assert data.count(old_dupe) == 1, 'dup input'
data = data.replace(old_dupe, new_dupe)

open(p, 'w', encoding='utf-8').write(data)
print('patched form class names')
