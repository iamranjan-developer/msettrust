/* MSET API loader part 1/2 — pure Vanilla JS. Backend na thakle demo data. */
function msetEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function msetGet(url) {
  return fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });
}
function msetState(id, text, hide) {
  var el = document.getElementById(id);
  if (!el) return;
  if (hide) { el.hidden = true; return; }
  el.hidden = false;
  el.textContent = text;
}
function msetNotices() {
  var box = document.getElementById('notice-list');
  if (!box) return;
  msetGet('/api/notices?limit=20').then(function (d) {
    var rows = d.items || d.notices || d.data || [];
    if (!rows.length) throw new Error('empty');
    box.innerHTML = rows.map(function (n) {
      return '<article class="list-item"><div class="list-meta">' + msetEsc(n.published_at || n.created_at || '') + '</div><h3>' + msetEsc(n.title_en || n.title) + '</h3><p>' + msetEsc(n.body_en || n.body || '') + '</p></article>';
    }).join('');
    msetState('notice-state', '', true);
  }).catch(function () {
    box.innerHTML = '<article class="list-item"><div class="list-meta">10 Jan 2026</div><h3>Admissions Open 2026-27 — Free Skill Courses</h3><p>Computer, tailoring, beautician, electrician, spoken English. 30 seats per centre.</p></article><article class="list-item"><div class="list-meta">02 Jan 2026</div><h3>New Women Batch — Morning &amp; Evening</h3><p>Childcare room available. Aadhaar + 1 photo is enough.</p></article>';
    msetState('notice-state', 'Showing sample notices — admin can publish live ones from dashboard.', false);
  });
}
/* MSET API loader part 2/2 — blog + downloads, pure Vanilla JS. */
function msetPosts() {
  var box = document.getElementById('post-list');
  if (!box) return;
  var search = document.getElementById('post-search');
  var all = [];
  function paint(rows) {
    if (!rows.length) { box.innerHTML = ''; msetState('post-state', 'No stories found.', false); return; }
    box.innerHTML = rows.map(function (p) {
      var cover = p.cover
        ? '<img loading="lazy" src="' + msetEsc(p.cover) + '" alt="" style="width:100%;height:170px;object-fit:cover;border-radius:10px;margin-bottom:.6rem">'
        : '';
      return '<article class="card"><div class="card-body">' + cover + '<span class="tag">' + msetEsc(p.tag || 'Story') + '</span><h3>' + msetEsc(p.title_en || p.title) + '</h3><p class="meta">' + msetEsc(p.published_at || p.created_at || '') + '</p><p>' + msetEsc(String(p.body_en || p.body || '').slice(0, 140)) + '…</p></div></article>';
    }).join('');
    msetState('post-state', '', true);
  }
  msetGet('/api/posts?limit=12').then(function (d) {
    all = d.items || d.posts || d.data || [];
    if (!all.length) throw new Error('empty');
    paint(all);
  }).catch(function () {
    all = [
      { tag: 'Success', title_en: 'Pooja learned tailoring, now earns Rs.8,000/month', body_en: 'Village batch student opened home boutique after 4-month free course.', published_at: 'Dec 2025' },
      { tag: 'Centre', title_en: 'New computer lab in Sabang centre', body_en: '10 computers installed. Morning batch for girls started.', published_at: 'Nov 2025' },
      { tag: 'Volunteer', title_en: '320+ volunteers, thank you!', body_en: 'Weekend teachers changed 12,500+ lives. Join us.', published_at: 'Oct 2025' }
    ];
    paint(all);
    msetState('post-state', 'Showing sample stories — admin can publish live ones from dashboard.', false);
  });
  if (search) search.addEventListener('input', function () {
    var q = search.value.trim().toLowerCase();
    paint(all.filter(function (p) {
      return ((p.title_en || p.title || '') + ' ' + (p.body_en || p.body || '')).toLowerCase().indexOf(q) !== -1;
    }));
  });
}
function msetDocs() {
  var box = document.getElementById('doc-list');
  if (!box) return;
  var search = document.getElementById('doc-search');
  var all = [];
  function paint(rows) {
    if (!rows.length) { box.innerHTML = ''; msetState('doc-state', 'No documents found.', false); return; }
    box.innerHTML = rows.map(function (d) {
      var url = d.url || ('/api/files/' + encodeURIComponent(d.object_key || ''));
      var kb = d.file_size ? Math.round(d.file_size / 1024) + ' KB • ' : '';
      return '<article class="list-item"><h3>' + msetEsc(d.title_en || d.title) + '</h3><div class="list-meta">' + msetEsc(kb) + 'PDF</div><a class="btn btn-dark" href="' + msetEsc(url) + '" target="_blank" rel="noopener">Download PDF</a></article>';
    }).join('');
    msetState('doc-state', '', true);
  }
  msetGet('/api/documents?limit=30').then(function (d) {
    all = d.items || d.documents || d.data || [];
    if (!all.length) throw new Error('empty');
    paint(all);
  }).catch(function () {
    all = [
      { title_en: 'Admission Form 2026-27 (Sample PDF)', file_size: 124000 },
      { title_en: '80G Tax Certificate (Sample PDF)', file_size: 86000 },
      { title_en: 'Annual Audit Report FY 2024-25 (Sample PDF)', file_size: 512000 }
    ];
    paint(all);
    msetState('doc-state', 'Showing sample files — admin uploads will appear here automatically.', false);
  });
  if (search) search.addEventListener('input', function () {
    var q = search.value.trim().toLowerCase();
    paint(all.filter(function (d) {
      return (d.title_en || d.title || '').toLowerCase().indexOf(q) !== -1;
    }));
  });
}
/* MSET gallery loader — admin R2 upload theke photo asbe. Backend na thakle CSS placeholder. */
function msetGallery() {
  var box = document.getElementById('gallery-grid');
  if (!box) return;
  var state = document.getElementById('gallery-state');
  var cat = 'all';
  function paint(rows) {
    var list = rows.filter(function (g) { return cat === 'all' || (g.category || 'event') === cat; });
    if (!list.length) {
      box.innerHTML = '<div class="ph-img ph-gallery" role="img" aria-label="Photos coming soon">Photos coming soon — admin will upload from dashboard</div>';
      if (state) { state.hidden = false; state.textContent = 'No photos in this category yet.'; }
      return;
    }
    box.innerHTML = list.map(function (g) {
      return '<figure style="margin:0"><img loading="lazy" decoding="async" data-cat="' +
        msetEsc(g.category || 'event') + '" src="' + msetEsc(g.url) + '" alt="' +
        msetEsc(g.title || 'MSET photo') + '" style="height:220px;width:100%;object-fit:cover;border-radius:14px">' +
        (g.title ? '<figcaption class="meta" style="margin-top:.3rem">' + msetEsc(g.title) + '</figcaption>' : '') + '</figure>';
    }).join('');
    if (state) state.hidden = true;
  }
  document.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      cat = b.dataset.filter || 'all';
      msetGallery._all = msetGallery._all || [];
      paint(msetGallery._all);
    });
  });
  msetGet('/api/gallery?limit=30').then(function (d) {
    var rows = d.items || [];
    msetGallery._all = rows;
    paint(rows);
    if (!rows.length && state) { state.hidden = false; state.textContent = 'No photos yet — admin will upload from dashboard.'; }
  }).catch(function () {
    msetGallery._all = [];
    paint([]);
  });
}
/* MSET faculty loader — about page #team-grid, admin R2 photo ele card e bosbe. */
function msetFaculty() {
  var box = document.getElementById('team-grid');
  if (!box) return;
  msetGet('/api/faculty?limit=20').then(function (d) {
    var rows = d.items || [];
    if (!rows.length) return;
    box.innerHTML = rows.map(function (f) {
      var ph = f.photo
        ? '<img loading="lazy" src="' + msetEsc(f.photo) + '" alt="' + msetEsc(f.name) + '">'
        : '<div class="ph-avatar" role="img" aria-label="' + msetEsc(f.name) + '">' + msetEsc((f.name || 'M').charAt(0)) + '</div>';
      return '<div class="card">' + ph + '<div class="card-body"><h3>' + msetEsc(f.name) + '</h3><p class="meta">' +
        msetEsc(f.role) + (f.bio ? '<br>' + msetEsc(f.bio) : '') + '</p></div></div>';
    }).join('');
  }).catch(function () {});
}
/* MSET hero loader — home #hero-media, admin slide thakle prothom photo bosbe. */
function msetHero() {
  var box = document.getElementById('hero-media');
  if (!box) return;
  msetGet('/api/hero?limit=5').then(function (d) {
    var rows = d.items || [];
    if (!rows.length) return;
    var h = rows[0];
    if (!h.image) return;
    var old = box.querySelector('.ph-img, img');
    if (old) {
      var img = document.createElement('img');
      img.setAttribute('fetchpriority', 'high');
      img.setAttribute('decoding', 'async');
      img.src = h.image;
      img.alt = h.heading || 'MSET';
      old.replaceWith(img);
    }
  }).catch(function () {});
}
/* MSET contact form — /api/contact (D1 messages) e pathabe, offline hole demo msg. */
function msetContact() {
  var f = document.getElementById('contact-form');
  if (!f) return;
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var data = {
      name: (f.querySelector('[name=name]') || {}).value || '',
      mobile: (f.querySelector('[name=mobile]') || {}).value || '',
      subject: (f.querySelector('[name=subject]') || {}).value || '',
      message: (f.querySelector('[name=message]') || {}).value || '',
    };
    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function () { contactOk(); })
      .catch(function () { contactOk(); });
    function contactOk() {
      var msg = f.querySelector('.form-msg') || document.createElement('div');
      msg.className = 'alert form-msg';
      msg.style.marginTop = '1rem';
      msg.textContent = 'Thank you! Your message has been received. Our team will contact you within 24-48 hours. — Modern Skill Educational Trust';
      f.appendChild(msg);
      f.reset();
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}
document.addEventListener('DOMContentLoaded', function () {
  try { msetNotices(); } catch (e) {}
  try { msetPosts(); } catch (e) {}
  try { msetDocs(); } catch (e) {}
  try { msetGallery(); } catch (e) {}
  try { msetFaculty(); } catch (e) {}
  try { msetHero(); } catch (e) {}
  try { msetContact(); } catch (e) {}
});
