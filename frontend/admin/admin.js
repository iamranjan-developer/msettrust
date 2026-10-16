/* MSET admin — Vanilla JS. Login + R2 upload + D1 CRUD. Logo upload nei (logo local). */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  async function api(path, opts) {
    const r = await fetch(path, opts);
    const d = await r.json().catch(function () { return { ok: false, error: 'Bad response' }; });
    if (!r.ok && !d.error) d.error = 'HTTP ' + r.status;
    return d;
  }

  function preview(fileInput, imgEl) {
    var f = $(fileInput);
    var img = $(imgEl);
    if (!f || !img) return;
    f.addEventListener('change', function () {
      var file = f.files && f.files[0];
      if (!file) { img.hidden = true; return; }
      img.src = URL.createObjectURL(file);
      img.hidden = false;
    });
  }

  async function uploadFile(file) {
    var fd = new FormData();
    fd.append('file', file);
    return api('/api/admin/upload', { method: 'POST', body: fd });
  }

  // ---- tabs ----
  function initTabs() {
    var btns = document.querySelectorAll('[data-tab]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('on'); });
        var p = $('panel-' + b.dataset.tab);
        if (p) p.classList.add('on');
      });
    });
  }

  // ---- auth ----
  var myRole = 'staff';

  async function checkMe() {
    var msg = $('login-msg');
    var lp = $('login-panel');
    var fp = $('forgot-panel');
    var dash = $('dash');
    var d = await api('/api/admin/session');
    if (d.ok) {
      myRole = d.role || 'staff';
      if (msg) msg.textContent = '';
      if (lp) lp.hidden = true;
      if (fp) fp.hidden = true;
      if (dash) dash.hidden = false;
      var nm = $('admin-name');
      if (nm) nm.textContent = (d.name || d.username || 'Admin') + (myRole === 'main_admin' ? ' (Main Admin)' : '');
      var ts = $('tab-staff');
      if (ts) ts.hidden = (myRole !== 'main_admin');
      refreshAll();
    } else {
      myRole = 'staff';
      if (lp) lp.hidden = false;
      if (dash) dash.hidden = true;
    }
  }

  function initAuth() {
    var form = $('login-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = $('login-msg');
      var userEl = $('login-user');
      var passEl = $('login-pass');
      if (msg) msg.textContent = 'Logging in...';
      var d = await api('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userEl ? userEl.value.trim() : '', password: passEl ? passEl.value : '' }),
      });
      if (d.ok) {
        if (msg) msg.textContent = '';
        if (passEl) passEl.value = '';
        checkMe();
      } else {
        if (msg) msg.textContent = d.error || 'Login failed';
      }
    });
    var out = $('logout-btn');
    if (out) out.addEventListener('click', async function () {
      await api('/api/admin/session', { method: 'POST' });
      location.reload();
    });
  }

  // ---- gallery ----
  async function loadGallery() {
    var box = $('gallery-list');
    if (!box) return;
    var d = await api('/api/admin/gallery?limit=30');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    box.innerHTML = d.items.map(function (g) {
      var img = g.url || ('/api/files/' + encodeURIComponent(g.object_key || ''));
      return '<div class="thumb"><img loading="lazy" src="' + esc(img) + '" alt=""><div class="tb"><b>' +
        esc(g.title_en || 'Untitled') + '</b>' + esc(g.category || '') + ' • ' + esc(g.status || '') +
        '<br><button data-del="' + g.id + '" data-kind="gallery">Delete</button></div></div>';
    }).join('') || '<p class="meta">No photos yet.</p>';
  }

  function initGallery() {
    $('gallery-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var file = $('g-file').files[0];
      if (!file) { $('g-msg').textContent = 'Choose a photo'; return; }
      $('g-msg').textContent = 'Uploading to R2...';
      var u = await uploadFile(file);
      if (!u.ok) { $('g-msg').textContent = u.error || 'Upload failed'; return; }
      var d = await api('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: $('g-title').value.trim(), category: $('g-cat').value, status: $('g-status').value, object_key: u.object_key }),
      });
  // ---- faculty ----
  async function loadFaculty() {
    var box = $('faculty-list');
    if (!box) return;
    var d = await api('/api/admin/faculty?limit=30');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    box.innerHTML = d.items.map(function (f) {
      var img = f.photo_url || ('/api/files/' + encodeURIComponent(f.photo_key || ''));
      return '<div class="thumb"><img loading="lazy" src="' + esc(img) + '" alt=""><div class="tb"><b>' +
        esc(f.name_en || '') + '</b>' + esc(f.role_en || '') +
        '<br><button data-del="' + f.id + '" data-kind="faculty">Delete</button></div></div>';
    }).join('') || '<p class="meta">No faculty yet.</p>';
  }

  function initFaculty() {
    $('faculty-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var file = $('f-file').files[0];
      if (!file) { $('f-msg').textContent = 'Choose a photo'; return; }
      if (!$('f-name').value.trim()) { $('f-msg').textContent = 'Name required'; return; }
      $('f-msg').textContent = 'Uploading to R2...';
      var u = await uploadFile(file);
      if (!u.ok) { $('f-msg').textContent = u.error || 'Upload failed'; return; }
      var d = await api('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: $('f-name').value.trim(), role: $('f-role').value.trim(), bio: $('f-bio').value.trim(), position: $('f-pos').value, status: $('f-status').value, photo_key: u.object_key }),
      });
      $('f-msg').textContent = d.ok ? 'Saved!' : (d.error || 'Error');
      if (d.ok) { e.target.reset(); $('f-preview').hidden = true; loadFaculty(); }
    });
  }

  // ---- hero ----
  async function loadHero() {
    var box = $('hero-list');
    if (!box) return;
    var d = await api('/api/admin/hero?limit=20');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    box.innerHTML = d.items.map(function (h) {
      var img = h.image_url || ('/api/files/' + encodeURIComponent(h.image_key || ''));
      return '<div class="thumb"><img loading="lazy" src="' + esc(img) + '" alt=""><div class="tb"><b>' +
        esc(h.heading_en || '') + '</b>' + esc(h.status || '') +
        '<br><button data-del="' + h.id + '" data-kind="hero">Delete</button></div></div>';
    }).join('') || '<p class="meta">No slides yet.</p>';
  }

  function initHero() {
    $('hero-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var file = $('h-file').files[0];
      if (!file) { $('h-msg').textContent = 'Choose an image'; return; }
      $('h-msg').textContent = 'Uploading to R2...';
      var u = await uploadFile(file);
      if (!u.ok) { $('h-msg').textContent = u.error || 'Upload failed'; return; }
      var d = await api('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading: $('h-head').value.trim(), sub: $('h-sub').value.trim(), link: $('h-link').value.trim(), status: $('h-status').value, image_key: u.object_key }),
      });
      $('h-msg').textContent = d.ok ? 'Saved!' : (d.error || 'Error');
      if (d.ok) { e.target.reset(); $('h-preview').hidden = true; loadHero(); }
    });
  }

      $('g-msg').textContent = d.ok ? 'Saved!' : (d.error || 'Error');
      if (d.ok) { e.target.reset(); $('g-preview').hidden = true; loadGallery(); }
    });
  }

  // ---- notices / posts ----
  async function loadNotices() {
    var box = $('notice-list');
    if (!box) return;
    var d = await api('/api/admin/content/notices?limit=20');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    box.innerHTML = d.items.map(function (n) {
      return '<article class="list-item"><div class="list-meta">' + esc(n.published_at || '') + ' • ' + esc(n.status || '') +
        '</div><h3>' + esc(n.title_en || '') + '</h3><button data-del="' + n.id + '" data-kind="notices">Delete</button></article>';
    }).join('') || '<p class="meta">No notices yet.</p>';
  }

  function initNotice() {
    $('notice-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      $('n-msg').textContent = 'Saving...';
      var d = await api('/api/admin/content/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: $('n-title').value.trim(), body: $('n-body').value.trim(), published_at: $('n-date').value, status: $('n-status').value }),
      });
      $('n-msg').textContent = d.ok ? 'Published!' : (d.error || 'Error');
      if (d.ok) { e.target.reset(); loadNotices(); }
    });
  }

  var postEditId = 0;
  var postAllCache = [];

  async function loadPosts() {
    var box = $('post-list');
    if (!box) return;
    var d = await api('/api/admin/content/posts?limit=30');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    postAllCache = d.items || [];
    box.innerHTML = d.items.map(function (x) {
      return '<article class="list-item"><h3>' + esc(x.title_en || '') + '</h3><p class="meta">' + esc(x.tag || '') + ' - ' + esc(x.status || '') + '</p>' +
        '<button data-edit-post="' + x.id + '">Edit</button> <button data-del="' + x.id + '" data-kind="posts">Delete</button></article>';
    }).join('') || '<p class="meta">No posts yet.</p>';
  }

  function initPost() {
    $('post-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var coverKey = null;
      var file = $('p-file').files[0];
      if (file) {
        var u = await uploadFile(file);
        if (!u.ok) { $('p-msg').textContent = u.error || 'Upload failed'; return; }
        coverKey = u.object_key;
      }
      var payload = { title: $('p-title').value.trim(), tag: $('p-tag').value, body: $('p-body').value.trim(), status: $('p-status').value, cover_key: coverKey };
      var wasEdit = !!postEditId;
      if (wasEdit) payload.id = postEditId;
      var d = await api('/api/admin/content/posts', {
        method: wasEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      $('p-msg').textContent = d.ok ? (wasEdit ? 'Saved!' : 'Published!') : (d.error || 'Error');
      if (d.ok) {
        if (wasEdit) { postEditId = 0; $('p-editing').hidden = true; $('post-form').querySelector('h3').textContent = 'New Blog Post'; }
        e.target.reset(); loadPosts();
      }
    });
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-edit-post]') : null;
      if (!btn) return;
      var id = parseInt(btn.dataset.editPost, 10);
      var p = null;
      for (var i = 0; i < postAllCache.length; i++) { if (postAllCache[i].id === id) { p = postAllCache[i]; break; } }
      if (!p) return;
      postEditId = id;
      $('p-title').value = p.title_en || '';
      $('p-tag').value = p.tag || 'Story';
      $('p-body').value = p.body_en || '';
      $('p-status').value = p.status || 'published';
      $('p-editing').hidden = false;
      $('post-form').querySelector('h3').textContent = 'Edit Blog Post';
      $('p-msg').textContent = '';
      $('post-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $('p-cancel').addEventListener('click', function (e) {
      e.preventDefault();
      postEditId = 0;
      $('post-form').reset();
      $('p-editing').hidden = true;
      $('post-form').querySelector('h3').textContent = 'New Blog Post';
      $('p-msg').textContent = '';
    });
  }  async function loadDocs() {
    var box = $('doc-list');
    if (!box) return;
    var d = await api('/api/admin/content/documents?limit=30');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    box.innerHTML = d.items.map(function (x) {
      return '<article class="list-item"><h3>' + esc(x.title_en || '') + '</h3><button data-del="' + x.id + '" data-kind="docs">Delete</button></article>';
    }).join('') || '<p class="meta">No PDFs yet.</p>';
  }

  function initDoc() {
    $('doc-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var file = $('d-file').files[0];
      if (!file) { $('d-msg').textContent = 'Choose a PDF'; return; }
      $('d-msg').textContent = 'Uploading to R2...';
      var u = await uploadFile(file);
      if (!u.ok) { $('d-msg').textContent = u.error || 'Upload failed'; return; }
      var d = await api('/api/admin/content/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: $('d-title').value.trim(), status: $('d-status').value, object_key: u.object_key, file_size: u.file_size }),
      });
      $('d-msg').textContent = d.ok ? 'Saved!' : (d.error || 'Error');
      if (d.ok) { e.target.reset(); loadDocs(); }
    });
  }

  async function loadInbox() {
    var box = $('msg-list');
    if (!box) return;
    var d = await api('/api/admin/content/messages?limit=30');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    box.innerHTML = d.items.map(function (m) {
      return '<article class="list-item"><h3>' + esc(m.name || '') + '</h3><p>' + esc(m.message || '') +
        '</p><button data-del="' + m.id + '" data-kind="inbox">Delete</button></article>';
    }).join('') || '<p class="meta">Inbox empty.</p>';
  }

  function initDelete() {
    document.addEventListener('click', async function (e) {
      var btn = e.target.closest ? e.target.closest('[data-del]') : null;
      if (!btn) return;
      if (!confirm('Delete this item?')) return;
      var kind = btn.dataset.kind;
      var id = parseInt(btn.dataset.del, 10);
      var path = kind === 'gallery' ? '/api/admin/gallery'
        : kind === 'faculty' ? '/api/admin/faculty'
        : kind === 'hero' ? '/api/admin/hero'
        : kind === 'notices' ? '/api/admin/content/notices'
        : kind === 'posts' ? '/api/admin/content/posts'
        : kind === 'docs' ? '/api/admin/content/documents'
        : '/api/admin/content/messages';
      await api(path, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id }) });
      refreshAll();
    });
  }

  function refreshAll() {
    loadGallery(); loadFaculty(); loadHero(); loadNotices(); loadPosts(); loadDocs(); loadInbox();
    loadStaff(); activateTab();
  }

  // ---- forgot (same design, email charai) ----
  function initForgot() {
    var link = $('forgot-link');
    var back = $('forgot-back');
    var lp = $('login-panel');
    var fp = $('forgot-panel');
    if (link) link.addEventListener('click', function (e) {
      e.preventDefault();
      if (lp) lp.hidden = true;
      if (fp) fp.hidden = false;
    });
    if (back) back.addEventListener('click', function (e) {
      e.preventDefault();
      if (fp) fp.hidden = true;
      if (lp) lp.hidden = false;
    });
  }

  // ---- staff (sudhu main_admin dekhbe) ----
  async function loadStaff() {
    var box = $('staff-list');
    if (!box) return;
    if (myRole !== 'main_admin') { box.innerHTML = ''; return; }
    var d = await api('/api/admin/staff');
    if (!d.ok) { box.innerHTML = '<p class="meta">' + esc(d.error || 'Error') + '</p>'; return; }
    box.innerHTML = (d.items || []).map(function (x) {
      var role = x.role || 'staff';
      var btns = '';
      if (role !== 'main_admin') {
        btns = '<button data-sreset="' + x.id + '">Reset password</button>' +
          '<button data-sdel="' + x.id + '">Delete</button>';
      } else {
        btns = '<span class="meta">Main Admin (sobar upore)</span>';
      }
      return '<article class="list-item"><h3>' + esc(x.username || '') + '</h3><p>' +
        esc(x.name_en || '') + ' — ' + esc(role) + '</p>' + btns + '</article>';
    }).join('') || '<p class="meta">No staff yet.</p>';
  }

  function initStaff() {
    try {
      var f = $('staff-form');
      if (f) f.addEventListener('submit', async function (e) {
        e.preventDefault();
        var msg = $('s-msg');
        if (msg) msg.textContent = 'Saving...';
        var d = await api('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: $('s-user').value.trim(), name: $('s-name').value.trim(), password: $('s-pass').value }),
        });
        if (msg) msg.textContent = d.ok ? 'Staff added!' : (d.error || 'Error');
        if (d.ok) { e.target.reset(); loadStaff(); }
      });
      document.addEventListener('click', async function (e) {
        var rs = e.target.closest ? e.target.closest('[data-sreset]') : null;
        if (rs) {
          var np = prompt('Notun password din (min 6 character):');
          if (!np) return;
          var r = await api('/api/admin/staff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: rs.dataset.sreset, password: np }) });
          alert(r.ok ? 'Password reset hoyeche!' : (r.error || 'Error'));
          loadStaff();
          return;
        }
        var del = e.target.closest ? e.target.closest('[data-sdel]') : null;
        if (del) {
          if (!confirm('Ei staff-ke delete korben?')) return;
          var x = await api('/api/admin/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: del.dataset.sdel }) });
          if (!x.ok) alert(x.error || 'Error');
          loadStaff();
        }
      });
    } catch (e) { /* staff tab na thakleo login cholbe */ }
  }

  // ---- nijer password ----
  function initMyPass() {
    try {
      var f = $('pass-form');
      if (!f) return;
      f.addEventListener('submit', async function (e) {
        e.preventDefault();
        var msg = $('pw-msg');
        if (msg) msg.textContent = 'Saving...';
        var d = await api('/api/admin/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword: $('pw-old').value, newPassword: $('pw-new').value }),
        });
        if (msg) msg.textContent = d.ok ? 'Password bodle geche!' : (d.error || 'Error');
        if (d.ok) e.target.reset();
      });
    } catch (e) {}
  }

  function activateTab() {
    try {
      var on = document.querySelector('[data-tab].on');
      var id = on ? on.dataset.tab : 'gallery';
      if (id === 'staff' && myRole !== 'main_admin') {
        document.querySelectorAll('[data-tab]').forEach(function (x) { x.classList.remove('on'); });
        var g = document.querySelector('[data-tab="gallery"]');
        if (g) g.classList.add('on');
        id = 'gallery';
      }
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('on'); });
      var p = $('panel-' + id);
      if (p) p.classList.add('on');
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initAuth();
    initForgot();
    try {
      preview('g-file', 'g-preview'); preview('f-file', 'f-preview'); preview('h-file', 'h-preview');
      initGallery(); initFaculty(); initHero(); initNotice(); initPost(); initDoc(); initDelete(); initStaff(); initMyPass();
    } catch (e) { /* panels load na holeo login cholbe */ }
    checkMe();
  });
})();

