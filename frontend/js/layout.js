/* MSET shared layout — header + footer, pure Vanilla JS, no framework.
   Design same thakbe. Prottek page e <div id="site-header"> + <div id="site-footer">
   thaklei ei file baki kaaj korbe. Active menu auto-highlight hobe.
   Admin pore menu bodlate parbe — ekhon static list, pore /api/menus theke asbe. */
(function () {
  'use strict';

  var NAV = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
    { href: 'mission-vision.html', label: 'Mission & Vision' },
    { href: 'services.html', label: 'Services' },
    { href: 'gallery.html', label: 'Gallery' },
    { href: 'downloads.html', label: 'Downloads' },
    { href: 'blog.html', label: 'Blog' },
    { href: 'notices.html', label: 'Notices' },
    { href: 'contact.html', label: 'Contact' }
  ];

  var MORE = [
    { href: 'courses.html', label: 'Courses' },
    { href: 'admissions.html', label: 'Admissions' },
    { href: 'donate.html', label: 'Donate' },
    { href: 'volunteer.html', label: 'Volunteer' }
  ];

  function currentFile() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p.split('?')[0].split('#')[0] || 'index.html';
  }

  function isActive(href, cur) {
    return href === cur;
  }

  function headerHTML(cur) {
    var links = NAV.map(function (n) {
      var cls = isActive(n.href, cur) ? ' class="active"' : '';
      return '<a href="' + n.href + '"' + cls + '>' + n.label + '</a>';
    }).join('');

    var moreOpts = MORE.map(function (n) {
      var sel = isActive(n.href, cur) ? ' selected' : '';
      return '<option value="' + n.href + '"' + sel + '>' + n.label + '</option>';
    }).join('');

    return (
      '<div class="topbar"><div class="container">' +
      '<div>Call: +91 9339266366 / +91 8001923229 | info@msettrust.org</div>' +
      '<div>Regd. NGO | 80G &amp; 12A Certified | <a href="donate.html">Donate Now</a></div>' +
      '</div></div>' +
      '<header class="site"><div class="container nav">' +
      '<a class="brand" href="index.html" aria-label="MSET Home">' +
      '<span class="logo" aria-hidden="true">M</span>' +
      '<span class="brand-text"><strong>Modern Skill Educational Trust</strong>' +
      '<small>Education Skills Empowerment</small></span></a>' +
      '<nav class="nav-links" id="navLinks" aria-label="Main navigation">' + links +
      '<select class="nav-more" id="navMore" aria-label="More pages">' +
      '<option value="">More…</option>' + moreOpts + '</select></nav>' +
      '<div class="nav-cta">' +
      '<button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">☰</button>' +
      '<a href="donate.html" class="btn btn-primary">Donate</a>' +
      '</div></div></header>' +
      '<div class="marquee" role="note"><span>Admissions Open 2026-27 for Free Skill Courses — computer — tailoring — beautician — electrician — spoken English — Join 12,500+ learners — 80G Receipt Available —</span></div>'
    );
  }

  function footerHTML() {
    return (
      '<footer><div class="container foot-grid">' +
      '<div><div class="brand" style="margin-bottom:.8rem">' +
      '<div class="logo" aria-hidden="true">M</div>' +
      '<div class="brand-text"><strong style="color:#fff">Modern Skill Educational Trust</strong>' +
      '<small>Education Skills Empowerment</small></div></div>' +
      '<p>Empowering children, youth &amp; women through free education and skill training since 2015.</p>' +
      '<p class="meta">Vill - Khaukhanda, P.O - Kolonda, Sabang, Paschim Medinipur 721467<br>Phone: +91 9339266366 / +91 8001923229<br>Email: info@msettrust.org</p></div>' +
      '<div><h3>Quick Links</h3><p>' +
      '<a href="about.html">About Us</a><br><a href="services.html">Services</a><br>' +
      '<a href="admissions.html">Admissions</a><br><a href="gallery.html">Gallery</a><br>' +
      '<a href="blog.html">Blog</a><br><a href="notices.html">Notices</a></p></div>' +
      '<div><h3>Support</h3><p>' +
      '<a href="donate.html">Donate</a><br><a href="volunteer.html">Volunteer</a><br>' +
      '<a href="downloads.html">Downloads</a><br><a href="contact.html">Contact</a><br>' +
      '<a href="downloads.html">80G Receipt</a></p></div>' +
      '<div><h3>Legal</h3><p>Reg No: 1234/2015<br>NITI Aayog: DL/2020/025678<br>80G &amp; 12A Certified<br>' +
      '<a href="privacy.html">Privacy Policy</a><br><a href="terms.html">Terms &amp; Conditions</a></p></div>' +
      '</div><div class="container foot-bottom">' +
      '<div>© <span id="year">2026</span> Modern Skill Educational Trust. All rights reserved.</div>' +
      '<div>Made with care for Education in India</div>' +
      '</div></footer>' +
      '<a class="whatsapp" href="https://wa.me/919339266366" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">W</a>'
    );
  }

  function mount() {
    var cur = currentFile();
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.innerHTML = headerHTML(cur);
    if (f) f.innerHTML = footerHTML();

    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    var btn = document.getElementById('hamburger');
    var links = document.getElementById('navLinks');
    if (btn && links) {
      btn.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') links.classList.remove('open');
      });
    }

    var more = document.getElementById('navMore');
    if (more) {
      more.addEventListener('change', function () {
        if (more.value) window.location.href = more.value;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
