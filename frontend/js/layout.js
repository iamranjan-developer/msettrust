/* MSET shared layout — alada partial file (partials/header.html + partials/footer.html) load kore.
   Pure Vanilla JS, no framework, no CDN. Prothombar theke ekmatro header/footer uttso:
     frontend/partials/header.html  ->  <div id="site-header">
     frontend/partials/footer.html  ->  <div id="site-footer">
   Each page needs:
     <div id="site-header"></div> ... <div id="site-footer"></div>
     <script src="js/layout.js" defer></script>
   Ei JS shudhu: partial load, active menu marking, dropdown + hamburger wiring, year set.
   fetch bar hole (file:// preview) inline fallback template use kore — design same thake.
   Dropdown: desktop e click toggle + outside-click/Esc close; mobile e submenu always visible.
   Logo: frontend/assets/logo.svg (local core file, R2-te jay na). */
(function () {
  'use strict';

  var PARTIAL_HEADER = 'partials/header.html';
  var PARTIAL_FOOTER = 'partials/footer.html';

  /* ---------- inline fallback (only when fetch fails: file:// or missing partial) ---------- */
  function fallbackHeader() {
    return '<div class="topbar"><div class="container">' +
      '<div>Call: +91 9339266366 / +91 8001923229 | info@msettrust.org</div>' +
      '<div>Regd. NGO | 80G &amp; 12A Certified | <a href="donate.html">Donate Now</a></div></div></div>' +
      '<header class="site"><div class="container nav"><button type="button" class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">&#9776;</button><div class="brand">' +
      '<div class="logo" aria-hidden="true">M</div>' +
      '<div class="brand-text"><strong>Modern Skill Educational Trust</strong><small>Education Skills Empowerment</small></div></div>' +
      '<nav class="nav-links" id="navLinks" aria-label="Main navigation">' +
      '<a href="index.html" data-nav="index.html">Home</a>' +
      '<div class="nav-drop" data-nav-parent="about.html,why-us.html,mission-vision.html,legal.html,trustees.html,faculty.html,presidents-speech.html,audit-report.html,bank-details.html"><button type="button" aria-expanded="false" aria-haspopup="true">About <span class="caret" aria-hidden="true">&#9662;</span></button><div class="nav-drop-menu" role="menu">' +
      '<a href="why-us.html" data-nav="why-us.html">Why Us?</a><a href="mission-vision.html" data-nav="mission-vision.html">Mission &amp; Vision</a><a href="legal.html" data-nav="legal.html">Legal &amp; Affiliation</a><a href="trustees.html" data-nav="trustees.html">Board of Trustees</a><a href="faculty.html" data-nav="faculty.html">Our Faculty</a><a href="presidents-speech.html" data-nav="presidents-speech.html">President\'s Speech</a><a href="audit-report.html" data-nav="audit-report.html">Audit Report</a><a href="bank-details.html" data-nav="bank-details.html">Bank Details</a></div></div>' +
      '<div class="nav-drop" data-nav-parent="projects-running.html,projects-upcoming.html"><button type="button" aria-expanded="false" aria-haspopup="true">Our Project <span class="caret" aria-hidden="true">&#9662;</span></button><div class="nav-drop-menu" role="menu"><a href="projects-running.html" data-nav="projects-running.html">Running Project</a><a href="projects-upcoming.html" data-nav="projects-upcoming.html">Upcoming Project</a></div></div>' +
      '<div class="nav-drop" data-nav-parent="join-associate.html,join-faculty.html,join-affiliation.html"><button type="button" aria-expanded="false" aria-haspopup="true">Join Us <span class="caret" aria-hidden="true">&#9662;</span></button><div class="nav-drop-menu" role="menu"><a href="join-associate.html" data-nav="join-associate.html">Associate Member</a><a href="join-faculty.html" data-nav="join-faculty.html">Faculty Member</a><a href="join-affiliation.html" data-nav="join-affiliation.html">Apply for Affiliation</a></div></div>' +
      '<div class="nav-drop" data-nav-parent="gallery.html,video-gallery.html"><button type="button" aria-expanded="false" aria-haspopup="true">Gallery <span class="caret" aria-hidden="true">&#9662;</span></button><div class="nav-drop-menu" role="menu"><a href="gallery.html" data-nav="gallery.html">Photo Gallery</a><a href="video-gallery.html" data-nav="video-gallery.html">Video Gallery</a></div></div>' +
      '<a href="downloads.html" data-nav="downloads.html">Download</a><a href="blog.html" data-nav="blog.html">Blog</a><a href="contact.html" data-nav="contact.html">Contact</a>' +
      '</nav><div class="nav-cta"><a href="donate.html" class="btn btn-primary">Donate</a></div></div></header>' +
      '<div class="marquee" role="note"><span>Admissions Open 2026-27 for Free Skill Courses — computer — tailoring — beautician — electrician — spoken English — Join 12,500+ learners — 80G Receipt Available —</span></div>';
  }

  function fallbackFooter() {
    return '<footer><div class="container foot-grid">' +
      '<div><div class="brand" style="margin-bottom:.8rem"><div class="logo" aria-hidden="true">M</div>' +
      '<div class="brand-text"><strong style="color:#fff">Modern Skill Educational Trust</strong><small>Education Skills Empowerment</small></div></div>' +
      '<p>Empowering children, youth &amp; women through free education and skill training since 2015.</p>' +
      '<p class="meta">Vill - Khaukhanda, P.O - Kolonda, Sabang, Paschim Medinipur 721467<br>Phone: +91 9339266366 / +91 8001923229<br>Email: info@msettrust.org</p></div>' +
      '<div><h3>Quick Links</h3><p><a href="about.html">About Us</a><br><a href="why-us.html">Why Us?</a><br><a href="projects-running.html">Our Projects</a><br><a href="gallery.html">Photo Gallery</a><br><a href="video-gallery.html">Video Gallery</a><br><a href="downloads.html">Downloads</a></p></div>' +
      '<div><h3>Support</h3><p><a href="donate.html">Donate</a><br><a href="join-associate.html">Associate Member</a><br><a href="join-faculty.html">Faculty Member</a><br><a href="join-affiliation.html">Apply for Affiliation</a><br><a href="contact.html">Contact</a></p></div>' +
      '<div><h3>Legal</h3><p>Reg No: 1234/2015<br>NITI Aayog: DL/2020/025678<br>80G &amp; 12A Certified<br><a href="legal.html">Legal &amp; Affiliation</a><br><a href="audit-report.html">Audit Report</a><br><a href="bank-details.html">Bank Details</a></p></div>' +
      '</div><div class="container foot-bottom"><div>© <span id="year">2026</span> Modern Skill Educational Trust. All rights reserved.</div><div>Made with care for Education in India</div></div></footer>' +
      '<a class="whatsapp" href="https://wa.me/919339266366" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">W</a>';
  }

  /* ---------- helpers ---------- */
  function currentFile() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p.split('?')[0].split('#')[0] || 'index.html';
  }

  function loadPartial(url, fallback) {
    if (window.location.protocol === 'file:') return Promise.resolve(fallback());
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).catch(function () { return fallback(); });
  }

  function markActive(cur) {
    var links = document.querySelectorAll('#navLinks a[data-nav]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-nav') === cur) links[i].classList.add('active');
    }
    var drops = document.querySelectorAll('#navLinks .nav-drop[data-nav-parent]');
    for (var j = 0; j < drops.length; j++) {
      var list = (drops[j].getAttribute('data-nav-parent') || '').split(',');
      if (list.indexOf(cur) !== -1) drops[j].classList.add('active');
    }
  }

  function closeAllDrops(except) {
    var drops = document.querySelectorAll('.nav-drop');
    for (var i = 0; i < drops.length; i++) {
      if (drops[i] === except) continue;
      drops[i].classList.remove('open');
      var b = drops[i].querySelector('button');
      if (b) b.setAttribute('aria-expanded', 'false');
    }
  }

  function wireInteractions() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    var btn = document.getElementById('hamburger');
    var links = document.getElementById('navLinks');
    if (btn && links) {
      btn.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (!open) closeAllDrops(null);
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') links.classList.remove('open');
      });
    }

    var drops = document.querySelectorAll('.nav-drop');
    for (var i = 0; i < drops.length; i++) {
      (function (drop) {
        var trigger = drop.querySelector('button');
        if (!trigger) return;
        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = drop.classList.contains('open');
          closeAllDrops(null);
          if (!open) {
            drop.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      })(drops[i]);
    }
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.nav-drop')) closeAllDrops(null);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllDrops(null);
    });
  }

  /* ---------- mount ---------- */
  function mount() {
    var cur = currentFile();
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    var jobs = [];
    if (h) jobs.push(loadPartial(PARTIAL_HEADER, fallbackHeader).then(function (html) { h.innerHTML = html; }));
    if (f) jobs.push(loadPartial(PARTIAL_FOOTER, fallbackFooter).then(function (html) { f.innerHTML = html; }));
    Promise.all(jobs).then(function () {
      markActive(cur);
      wireInteractions();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();