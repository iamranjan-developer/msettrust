/* MSET admin panels HTML — same design classes (card-form, list, thumbs). */
(function () {
  'use strict';
  var HTML =
    '<section class="panel on" id="panel-gallery">' +
    '<form class="card-form" id="gallery-form"><h3>Upload Gallery Photo</h3>' +
    '<div class="row-flex"><div><label>Photo (max 8MB)</label><input type="file" id="g-file" accept="image/*" required></div>' +
    '<div><label>Title</label><input id="g-title" placeholder="e.g. Computer class"></div></div>' +
    '<div class="row-flex"><div><label>Category</label><select id="g-cat"><option value="edu">Education</option><option value="skill">Skill</option><option value="event">Events</option></select></div>' +
    '<div><label>Status</label><select id="g-status"><option value="published">Published</option><option value="draft">Draft</option></select></div></div>' +
    '<img class="preview" id="g-preview" hidden alt="preview">' +
    '<button class="btn btn-primary" style="margin-top:1rem" type="submit">Upload to R2</button><p class="meta" id="g-msg"></p></form>' +
    '<div class="thumbs" id="gallery-list"></div></section>' +
    '<section class="panel" id="panel-faculty">' +
    '<form class="card-form" id="faculty-form"><h3>Add Faculty / Team</h3>' +
    '<div class="row-flex"><div><label>Photo</label><input type="file" id="f-file" accept="image/*" required></div>' +
    '<div><label>Name *</label><input id="f-name" required placeholder="Full name"></div></div>' +
    '<div class="row-flex"><div><label>Role</label><input id="f-role" placeholder="e.g. Computer Trainer"></div>' +
    '<div><label>Position</label><input id="f-pos" type="number" value="0"></div></div>' +
    '<label>Bio</label><textarea id="f-bio" rows="2"></textarea>' +
    '<label>Status</label><select id="f-status"><option value="published">Published</option><option value="draft">Draft</option></select>' +
    '<img class="preview" id="f-preview" hidden alt="preview">' +
    '<button class="btn btn-primary" style="margin-top:1rem" type="submit">Save Faculty</button><p class="meta" id="f-msg"></p></form>' +
    '<div class="thumbs" id="faculty-list"></div></section>' +
    '<section class="panel" id="panel-hero">' +
    '<form class="card-form" id="hero-form"><h3>Add Hero Slide (Home)</h3>' +
    '<div class="row-flex"><div><label>Image</label><input type="file" id="h-file" accept="image/*" required></div>' +
    '<div><label>Heading *</label><input id="h-head" required placeholder="Slide heading"></div></div>' +
    '<label>Sub text</label><input id="h-sub" placeholder="Short line">' +
    '<div class="row-flex"><div><label>Link</label><input id="h-link" placeholder="courses.html"></div>' +
    '<div><label>Status</label><select id="h-status"><option value="published">Published</option><option value="draft">Draft</option></select></div></div>' +
    '<img class="preview" id="h-preview" hidden alt="preview">' +
    '<button class="btn btn-primary" style="margin-top:1rem" type="submit">Save Slide</button><p class="meta" id="h-msg"></p></form>' +
    '<div class="thumbs" id="hero-list"></div></section>' +
    '<section class="panel" id="panel-notices">' +
    '<form class="card-form" id="notice-form"><h3>New Notice</h3>' +
    '<label>Title *</label><input id="n-title" required>' +
    '<label>Details</label><textarea id="n-body" rows="3"></textarea>' +
    '<div class="row-flex"><div><label>Date</label><input id="n-date" type="date"></div>' +
    '<div><label>Status</label><select id="n-status"><option value="published">Published</option><option value="draft">Draft</option></select></div></div>' +
    '<button class="btn btn-primary" style="margin-top:1rem" type="submit">Publish Notice</button><p class="meta" id="n-msg"></p></form>' +
    '<div class="list" id="notice-list"></div></section>' +
    '<section class="panel" id="panel-posts">' +
    '<form class="card-form" id="post-form"><h3>New Blog Post</h3>' +
    '<div class="row-flex"><div><label>Title *</label><input id="p-title" required></div>' +
    '<div><label>Tag</label><select id="p-tag"><option>Success</option><option>Centre</option><option>Volunteer</option><option>Story</option></select></div></div>' +
    '<label>Cover photo (optional)</label><input type="file" id="p-file" accept="image/*">' +
    '<label>Story</label><textarea id="p-body" rows="4"></textarea>' +
    '<label>Status</label><select id="p-status"><option value="published">Published</option><option value="draft">Draft</option></select>' +
    '<button class="btn btn-primary" style="margin-top:1rem" type="submit">Publish Post</button><p class="meta" id="p-msg"></p>' +
    '<p class="meta" id="p-editing" hidden>Editing post — <a href="#" id="p-cancel">cancel edit</a></p></form>' +
    '<div class="list" id="post-list"></div></section>' +
    '<section class="panel" id="panel-docs">' +
    '<form class="card-form" id="doc-form"><h3>Upload PDF</h3>' +
    '<div class="row-flex"><div><label>PDF file (max 8MB)</label><input type="file" id="d-file" accept="application/pdf" required></div>' +
    '<div><label>Title *</label><input id="d-title" required></div></div>' +
    '<label>Status</label><select id="d-status"><option value="published">Published</option><option value="draft">Draft</option></select>' +
    '<button class="btn btn-primary" style="margin-top:1rem" type="submit">Upload PDF</button><p class="meta" id="d-msg"></p></form>' +
    '<div class="list" id="doc-list"></div></section>' +
    '<section class="panel" id="panel-inbox"><div class="list" id="msg-list"></div></section>';
  document.addEventListener('DOMContentLoaded', function () {
    var box = document.getElementById('panels');
    if (box) box.innerHTML = HTML;
  });
})();
