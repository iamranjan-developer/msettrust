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

  var IN_ADMIN = window.location.pathname.indexOf('/admin') !== -1;
  var PARTIAL_HEADER = IN_ADMIN ? '../partials/header.html' : 'partials/header.html';
  var PARTIAL_FOOTER = IN_ADMIN ? '../partials/footer.html' : 'partials/footer.html';
  var LINK_PREFIX = IN_ADMIN ? '../' : '';

  /* ---------- inline fallback (only when fetch fails: file:// or missing partial) ---------- */
  function fallbackHeader() {
    return '<div class="topbar"><div class="container topbar-inner">' +
      '<div class="tb-contact">' +
      '<a class="tb-link" href="mailto:info@msettrust.org"><svg class="tb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20v16H2z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 5.5 12 13l9.5-7.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span>info@msettrust.org</span></a>' +
      '<a class="tb-link" href="tel:+919339266366"><svg class="tb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3z" fill="currentColor"/></svg><span>+91 9339266366</span></a>' +
      '<a class="tb-link" href="tel:+918001923229"><svg class="tb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3z" fill="currentColor"/></svg><span>+91 8001923229</span></a>' +
      '</div>' +
      '<div class="tb-socials">' +
        '<a class="tb-social" href="#" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" fill="currentColor"/></svg></a>' +
        '<a class="tb-social" href="#" aria-label="WhatsApp" title="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-1-.3-2.6-1-4-2.6s-1.8-2.6-2-3.3c-.2-.7 0-1.3.3-1.7l.6-.6c.2-.2.5-.2.7.1l.9 1.5c.1.3.1.5-.1.7l-.4.5c-.2.2-.2.4-.1.6.3.6.8 1.3 1.5 1.9s1.5 1 2 1.2c.3.1.5 0 .7-.2l.5-.6c.2-.2.4-.2.6-.1l1.6.8c.4.2.5.5.4.9z" fill="currentColor"/></svg></a>' +
        '<a class="tb-social" href="#" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.5.4A3 3 0 0 0 2.4 7.2C2 8.9 2 12 2 12s0 3.1.4 4.8a3 3 0 0 0 2.1 2.1c1.7.4 7.5.4 7.5.4s5.8 0 7.5-.4a3 3 0 0 0 2.1-2.1c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8zM10 15V9l5 3z" fill="currentColor"/></svg></a>' +
        '<a class="tb-social" href="#" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.3.4.6.3 1.1.6 1.6 1.1s.8 1 1.1 1.6c.2.6.4 1.3.4 2.3 0 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.4 2.3-.3.6-.6 1.1-1.1 1.6s-1 .8-1.6 1.1c-.6.2-1.3.4-2.3.4-1.1 0-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.3-.4-.6-.3-1.1-.6-1.6-1.1s-.8-1-1.1-1.6c-.2-.6-.4-1.3-.4-2.3 0-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c0-1 .2-1.7.4-2.3.3-.6.6-1.1 1.1-1.6s1-.8 1.6-1.1c.6-.2 1.3-.4 2.3-.4C9 2 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5.5-3.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" fill="currentColor"/></svg></a>' +
        '<a class="tb-social" href="#" aria-label="Twitter" title="Twitter"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2c-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 3.6A11.3 11.3 0 0 1 3.5 4.6a4 4 0 0 0 1.2 5.4c-.6 0-1.3-.2-1.8-.5a4 4 0 0 0 3.2 4c-.6.1-1.2.1-1.7-.1a4 4 0 0 0 3.7 2.8A11.2 11.2 0 0 1 2 18.6a15.9 15.9 0 0 0 8.6 2.5c5.2 0 9.6-4.3 9.6-9.6v-.4c.8-.6 1.4-1.3 1.8-2.2z" fill="currentColor"/></svg></a>' +
        '<a class="tb-social" href="#" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1A4.2 4.2 0 0 1 16.5 8.7c3 0 4.5 2 4.5 5.3V21h-4v-6c0-1.5-.5-2.5-1.9-2.5-1.1 0-1.8.8-2 1.5-.1.3-.1.7-.1 1V21H9z" fill="currentColor"/></svg></a>' +
      '</div></div></div>' +
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
      '<div><h3>Quick Links</h3><p><a href="about.html">About Us</a><br><a href="why-us.html">Why Us?</a><br><a href="projects-running.html">Our Projects</a><br><a href="gallery.html">Photo Gallery</a><br><a href="video-gallery.html">Video Gallery</a><br><a href="downloads.html">Downloads</a><br><a href="admin/">Admin Login</a></p></div>' +
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
  function adminFixLinks(root) {
    if (!IN_ADMIN || !root || !root.querySelectorAll) return;
    var els = root.querySelectorAll('a[href]');
    for (var i = 0; i < els.length; i++) {
      var href = els[i].getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf(':') !== -1 ||
          href.charAt(0) === '/' || href.indexOf('../') === 0) continue;
      if (href === 'admin/' || href === 'admin') { els[i].setAttribute('href', './'); continue; }
      els[i].setAttribute('href', LINK_PREFIX + href);
    }
  }

  function mount() {
    var cur = currentFile();
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    var jobs = [];
    if (h) jobs.push(loadPartial(PARTIAL_HEADER, fallbackHeader).then(function (html) { h.innerHTML = html; adminFixLinks(h); }));
    if (f) jobs.push(loadPartial(PARTIAL_FOOTER, fallbackFooter).then(function (html) { f.innerHTML = html; adminFixLinks(f); }));
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