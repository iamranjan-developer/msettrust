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
      return '<article class="card"><div class="card-body"><span class="tag">' + msetEsc(p.tag || 'Story') + '</span><h3>' + msetEsc(p.title_en || p.title) + '</h3><p class="meta">' + msetEsc(p.published_at || p.created_at || '') + '</p><p>' + msetEsc(String(p.body_en || p.body || '').slice(0, 140)) + '…</p></div></article>';
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
document.addEventListener('DOMContentLoaded', function () {
  try { msetNotices(); } catch (e) {}
  try { msetPosts(); } catch (e) {}
  try { msetDocs(); } catch (e) {}
});
