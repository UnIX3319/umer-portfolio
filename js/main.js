/* ==========================================================================
   Umer Shoaib — Portfolio
   Vanilla JS, no dependencies. Each feature is an isolated init function.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Theme ---------- */
    function initTheme() {
      var btn = $('#theme-toggle');
      var meta = $('meta[name="theme-color"]');
      if (!btn) return;

      function apply(theme) {
        root.setAttribute('data-theme', theme);
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#080D18' : '#F6F8FC');
      }

      apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

        function change() {
          root.classList.add('theme-switching');
          apply(next);
          try { localStorage.setItem('us-theme', next); } catch (e) { /* storage unavailable */ }
        }
        function done() { root.classList.remove('theme-switching'); }

        if (document.startViewTransition && !reduceMotion) {
          document.startViewTransition(change).finished.then(done, done);
        } else {
          change();
          window.setTimeout(done, 50);
        }
      });
    }
      

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var nav = $('.nav');
    var burger = $('#nav-burger');
    var panel = $('#primary-nav');
    if (!nav || !burger || !panel) return;

    var desktop = window.matchMedia('(min-width: 900px)');

    function setOpen(open, returnFocus) {
      panel.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (!open && returnFocus) burger.focus();
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });

    doc.addEventListener('click', function (e) {
      if (burger.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target)) setOpen(false);
    });

    function onBreakpoint(e) { if (e.matches) setOpen(false); }
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* ---------- Active section highlighting ---------- */
  function initActiveLinks() {
    var links = $$('[data-nav]');
    var sections = links
      .map(function (a) { return $(a.getAttribute('href')); })
      .filter(Boolean);
    var alias = { learning: 'projects' };

    function setActive(id) {
      id = alias[id] || id;
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }

    if (!('IntersectionObserver' in window)) return;
    var watch = sections.concat($('#learning') ? [$('#learning')] : []);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    watch.forEach(function (s) { io.observe(s); });
    setActive('home');
  }

  /* ---------- Scroll: progress bar, nav shadow, back-to-top, timeline ---------- */
  function initScroll() {
    var bar = $('.scroll-progress span');
    var nav = $('.nav');
    var toTop = $('#to-top');
    var timeline = $('#timeline');
    var ticking = false;

    function update() {
      var y = window.pageYOffset || root.scrollTop;
      var max = root.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      if (nav) nav.classList.toggle('is-scrolled', y > 8);

      if (toTop) {
        var show = y > 600;
        if (show && toTop.hidden) {
          toTop.hidden = false;
          requestAnimationFrame(function () { toTop.classList.add('is-shown'); });
        } else if (!show && !toTop.hidden) {
          toTop.classList.remove('is-shown');
          window.setTimeout(function () { if (!toTop.classList.contains('is-shown')) toTop.hidden = true; }, 350);
        }
      }

      if (timeline) {
        var r = timeline.getBoundingClientRect();
        var p = clamp((window.innerHeight * 0.65 - r.top) / r.height, 0, 1);
        timeline.style.setProperty('--progress', p.toFixed(3));
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        var home = $('#home');
        if (home) { home.setAttribute('tabindex', '-1'); home.focus({ preventScroll: true }); }
      });
    }
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero rotating role ---------- */
  function initRotator() {
    var el = $('#rotator');
    if (!el || reduceMotion) return;
    var words = ['responsive websites', 'WordPress themes', 'PHP & Laravel apps', 'ideas in Agentic AI'];
    var w = 0, c = words[0].length, deleting = true;

    function tick() {
      var word = words[w];
      if (deleting) {
        c--;
        el.textContent = word.slice(0, c);
        if (c === 0) { deleting = false; w = (w + 1) % words.length; }
        return window.setTimeout(tick, 38);
      }
      c++;
      el.textContent = words[w].slice(0, c);
      if (c === words[w].length) { deleting = true; return window.setTimeout(tick, 2000); }
      window.setTimeout(tick, 68);
    }
    window.setTimeout(tick, 2200);
  }

  /* ---------- Card cursor spotlight ---------- */
  function initSpotlight() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    doc.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('[data-spotlight]') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- Project filters ---------- */
  function initFilters() {
    var buttons = $$('.filter');
    var cards = $$('.project');
    var count = $('#filter-count');
    if (!buttons.length || !cards.length) return;
    var token = 0;

    function label(n, filter) {
      var names = { all: '', wordpress: ' WordPress', frontend: ' Frontend', php: ' PHP', laravel: ' Laravel' };
      return 'Showing ' + n + (filter === 'all' ? '' : names[filter]) + ' project' + (n === 1 ? '' : 's');
    }

    function apply(filter) {
      var my = ++token;
      var show = cards.filter(function (c) { return filter === 'all' || c.dataset.category === filter; });
      var hide = cards.filter(function (c) { return show.indexOf(c) === -1; });
      var toHide = hide.filter(function (c) { return !c.hidden; });
      var toShow = show.filter(function (c) { return c.hidden; });

      toHide.forEach(function (c) { c.classList.add('is-leaving'); });

      window.setTimeout(function () {
        if (my !== token) return;
        toHide.forEach(function (c) { c.hidden = true; c.classList.remove('is-leaving'); });
        cards.forEach(function (c) { c.classList.remove('is-leaving'); });
        toShow.forEach(function (c, i) {
          c.hidden = false;
          c.style.animationDelay = (reduceMotion ? 0 : i * 50) + 'ms';
          c.classList.add('is-entering');
          window.setTimeout(function () { c.classList.remove('is-entering'); c.style.animationDelay = ''; }, 700 + i * 50);
        });
        if (count) count.textContent = label(show.length, filter);
      }, toHide.length && !reduceMotion ? 260 : 0);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-active')) return;
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        apply(btn.dataset.filter);
      });
    });
  }

  /* ---------- Hero portrait fallback ---------- */
  function initPortrait() {
    var frame = $('#portrait');
    var img = frame && $('img', frame);
    if (!img) return;
    function missing() { frame.classList.add('is-missing'); }
    img.addEventListener('error', missing);
    if (img.complete && img.naturalWidth === 0) missing();
  }

  /* ---------- Resume availability ---------- */
  function initResume() {
    var btn = $('#resume-btn');
    var note = $('#resume-note');
    if (!btn || !note) return;
    var missing = false;

    if (/^https?:$/.test(location.protocol) && window.fetch) {
      fetch(btn.getAttribute('href'), { method: 'HEAD' })
        .then(function (res) { if (!res.ok) missing = true; })
        .catch(function () { /* offline or blocked — leave the link as is */ });
    }

    btn.addEventListener('click', function (e) {
      if (!missing) return;
      e.preventDefault();
      note.hidden = false;
    });
  }

  /* ---------- Copy to clipboard ---------- */
  function initCopy() {
    var status = $('#copy-status');
    var timer;

    function done(msg) {
      if (!status) return;
      status.textContent = msg;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { status.textContent = ''; }, 2400);
    }

    function fallback(text) {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      doc.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(ta);
      return ok;
    }

    $$('.copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.dataset.copy;
        var kind = text.indexOf('@') > -1 ? 'Email address' : 'Phone number';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { done(kind + ' copied.'); },
            function () { done(fallback(text) ? kind + ' copied.' : 'Copy failed — please select it manually.'); }
          );
        } else {
          done(fallback(text) ? kind + ' copied.' : 'Copy failed — please select it manually.');
        }
      });
    });
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = $('#contact-form');
    if (!form) return;

    var submit = $('#form-submit');
    var statusEl = $('#form-status');
    var label = $('.btn__label', submit);
    var fields = {
      name: form.elements.name,
      email: form.elements.email,
      subject: form.elements.subject,
      message: form.elements.message
    };
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate(key) {
      var v = fields[key].value.trim();
      switch (key) {
        case 'name':
          if (!v) return 'Please enter your full name.';
          if (v.length < 2) return 'Your name looks too short.';
          return '';
        case 'email':
          if (!v) return 'Please enter your email address.';
          if (!emailRe.test(v)) return 'Please enter a valid email address, like name@example.com.';
          return '';
        case 'subject':
          if (!v) return 'Please add a subject.';
          return '';
        case 'message':
          if (!v) return 'Please write a message.';
          if (v.length < 10) return 'Your message is a little short — add a few more details (10+ characters).';
          return '';
      }
      return '';
    }

    function show(key, msg) {
      var field = fields[key];
      var wrap = field.closest('.field');
      var out = $('#' + key + '-error');
      wrap.classList.toggle('has-error', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (out) out.textContent = msg;
    }

    function setStatus(type, html) {
      if (!html) { statusEl.hidden = true; statusEl.innerHTML = ''; return; }
      statusEl.hidden = false;
      statusEl.dataset.type = type;
      statusEl.innerHTML = html;
    }

    function loading(on) {
      submit.classList.toggle('is-loading', on);
      submit.disabled = on;
      label.textContent = on ? 'Sending…' : 'Send Message';
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener('blur', function () { show(key, validate(key)); });
      fields[key].addEventListener('input', function () {
        if (fields[key].closest('.field').classList.contains('has-error')) show(key, validate(key));
      });
    });

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }

    function mailtoHref(data) {
      var body = 'Name: ' + data.name + '\r\nEmail: ' + data.email + '\r\n\r\n' + data.message;
      return 'mailto:' + form.dataset.email +
        '?subject=' + encodeURIComponent(data.subject) +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus(null, '');

      var firstInvalid = null;
      Object.keys(fields).forEach(function (key) {
        var msg = validate(key);
        show(key, msg);
        if (msg && !firstInvalid) firstInvalid = fields[key];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var data = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        subject: fields.subject.value.trim(),
        message: fields.message.value.trim()
      };
      var endpoint = form.dataset.endpoint;

      if (endpoint) {
        loading(true);
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          setStatus('success', 'Thanks, ' + escapeHtml(data.name) + '! Your message was sent.');
          form.reset();
        }).catch(function () {
          setStatus('error', 'The message could not be sent. Please <a href="' + mailtoHref(data) + '">send it by email instead</a>.');
        }).then(function () { loading(false); });
        return;
      }

      /* No backend configured: hand off to the visitor's email app. Nothing is sent from the site itself. */
      var href = mailtoHref(data);
      setStatus('info',
        'Your email app should open with this message ready to send — nothing is sent until you press Send there. ' +
        'If nothing opened, <a href="' + href + '">click here</a> or email <strong>' + escapeHtml(form.dataset.email) + '</strong> directly.');
      window.location.href = href;
    });
  }

  /* ---------- Init ---------- */
  initYear();
  initTheme();
  initNav();
  initActiveLinks();
  initScroll();
  initReveal();
  initRotator();
  initSpotlight();
  initFilters();
  initPortrait();
  initResume();
  initCopy();
  initForm();
})();
