/* ============================================================
   delight.js · 小巧思合集 v14（四站共用，缺什么自动跳过）
   灵感来源：GitHub 上 Brittany Chiang / Bruno Simon / Jason
   Lengstorf / vCard 等个人站，统一感来自"一个点子贯穿到底"。

   1 纸张层      2 自定义光标    3 进度条小狗   4 图片渐显
   5 卡片歪斜    6 章节小狗编号  7 手绘波浪分隔 8 胶带贴纸
   9 Now 卡     10 页脚时钟/停留 11 快捷键+提示  12 回到顶部
   13 图片灯箱   14 Toast        15 导航智能隐藏 16 logo 彩蛋
   ============================================================ */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COMIC = document.body.getAttribute('data-style') === 'comic';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toast(msg) {
    var t = document.getElementById('u-toast');
    if (!t) { t = el('div'); t.id = 'u-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('on'); }, 1900);
  }
  /* 小狗爪印 SVG · 自定义光标（全站统一，不分族） */
  var PAW = '<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">' +
    '<g fill="#f0a860" stroke="#2a1c10" stroke-width="1.6" stroke-linejoin="round">' +
    '<ellipse cx="16" cy="21.5" rx="7.6" ry="6.3"/>' +
    '<ellipse cx="6.8" cy="12.4" rx="3.1" ry="3.9" transform="rotate(-16 6.8 12.4)"/>' +
    '<ellipse cx="12.6" cy="7.6" rx="3.1" ry="4.1" transform="rotate(-6 12.6 7.6)"/>' +
    '<ellipse cx="19.4" cy="7.6" rx="3.1" ry="4.1" transform="rotate(6 19.4 7.6)"/>' +
    '<ellipse cx="25.2" cy="12.4" rx="3.1" ry="3.9" transform="rotate(16 25.2 12.4)"/>' +
    '</g></svg>';

  /* 小狗 SVG（贯穿全站的签名元素） */
  var DOG = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<ellipse cx="12" cy="14" rx="6.4" ry="6" fill="#f0c274"/>' +
    '<ellipse cx="12" cy="18.4" rx="4.2" ry="3.6" fill="#fff6e2"/>' +
    '<path d="M6.6 8.4 L4.6 3.4 L10 6.2 Z" fill="#d9943f"/>' +
    '<path d="M17.4 8.4 L19.4 3.4 L14 6.2 Z" fill="#d9943f"/>' +
    '<circle cx="9.6" cy="13.6" r="1.05" fill="#241a10"/>' +
    '<circle cx="14.4" cy="13.6" r="1.05" fill="#241a10"/>' +
    '<ellipse cx="12" cy="16.6" rx="1.5" ry="1.15" fill="#241a10"/>' +
    '</svg>';

  /* ---------- 1. 纸张层 ---------- */
  (function paper() {
    var g = el('div'); g.id = 'paper-grain'; document.body.appendChild(g);
    var w = el('div'); w.id = 'paper-wash'; document.body.insertBefore(w, document.body.firstChild);
  })();

  /* ---------- 2. 自定义光标 ---------- */
  (function cursor() {
    if (REDUCED || matchMedia('(hover: none)').matches) return;

    /* 光标样式自包含注入：不再依赖 unified.css，任何页面引了 delight.js 就能用 */
    var st = document.createElement('style');
    st.textContent = [
      '#u-cursor{position:fixed;left:0;top:0;z-index:9997;pointer-events:none;',
      '  width:30px;height:30px;margin:-15px 0 0 -15px;',
      '  translate:-200px -200px;transform:scale(1);',
      '  transition:transform .16s cubic-bezier(.2,.75,.25,1),opacity .16s;',
      '  opacity:0;will-change:translate,transform}',
      '#u-cursor.on{opacity:1}',
      '#u-cursor svg{width:30px;height:30px;display:block;',
      '  filter:drop-shadow(0 2px 3px rgba(0,0,0,.28))}',
      /* 热点：正中心的小点，永远告诉用户"你会点在这里" */
      '#u-cursor .hot{position:absolute;left:50%;top:50%;width:6px;height:6px;',
      '  margin:-3px 0 0 -3px;border-radius:50%;',
      '  background:rgba(46,30,16,.55);box-shadow:0 0 0 1.5px rgba(255,253,246,.75);',
      '  transition:transform .16s,background .16s}',
      '#u-cursor.big .hot{transform:scale(1.5);background:rgba(200,16,46,.85)}',
      '#u-cursor.off{display:none}',
      'html.u-paw,html.u-paw *{cursor:none !important}'
    ].join('\n');
    document.head.appendChild(st);
    document.documentElement.classList.add('u-paw');

    var c = el('div'); c.id = 'u-cursor';
    c.innerHTML = PAW + '<span class="hot"></span>';
    document.body.appendChild(c);

    /* 位置瞬移（translate 独立属性，无过渡）＋ 缩放旋转走 transform（有过渡）
       → 保证指针位置 100% 精准，不会有拖影导致点不准 */
    var x = -200, y = -200, raf = null, big = false;
    document.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY; c.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { c.classList.remove('on'); });

    var pressed = false;
    function loop() {
      c.style.translate = x + 'px ' + y + 'px';
      var sc = pressed ? (big ? 1.22 : 0.86) : (big ? 1.4 : 1);
      c.style.transform = 'scale(' + sc + ')' + (big ? ' rotate(-10deg)' : '');
      raf = null;
    }
    function mark() { if (!raf) raf = requestAnimationFrame(loop); }
    document.addEventListener('mousedown', function () { pressed = true; mark(); });
    document.addEventListener('mouseup', function () { pressed = false; mark(); });
    /* 按 P 可随时换回系统光标（习惯了系统指针的人可以切回来） */
    addEventListener('keydown', function (e) {
      if (e.key !== 'p' && e.key !== 'P') return;
      var on = document.documentElement.classList.toggle('u-paw');
      c.classList.toggle('off', !on);
      if (!on) c.classList.remove('on');
      toast(on ? '\u{1F43E} \u722a\u5370\u5149\u6807\u5df2\u5f00\u542f' : '\u2190 \u5df2\u6362\u56de\u7cfb\u7edf\u5149\u6807\uff08\u6309 P \u5207\u56de\uff09');
    });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('a,button,.proj,.panel,.exhibit,.card,.fig,.btn-o,.tag,.p-more') : null;
      if (big !== !!t) { big = !!t; c.classList.toggle('big', big); if (!raf) raf = requestAnimationFrame(loop); }
    });
    /* 第一次进页面时告诉用户，免得以为光标丢了 */
    setTimeout(function () {
      if (sessionStorage.getItem('pawTip')) return;
      sessionStorage.setItem('pawTip', '1');
      toast('\u{1F43E} \u5149\u6807\u5df2\u6362\u6210\u5c0f\u72d7\u722a\u5370\uff0c\u6309 P \u53ef\u6362\u56de\u7cfb\u7edf\u5149\u6807');
    }, 1100);
  })();

  /* ---------- 3. 进度条小狗 ---------- */
  (function runner() {
    var bar = document.getElementById('progress');
    if (!bar) return;
    var r = el('div'); r.id = 'u-runner'; r.textContent = '\u{1F43E}';
    document.body.appendChild(r);
    function upd() {
      var h = document.documentElement;
      var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      r.style.left = (p * 100) + '%';
      r.classList.toggle('on', p > 0.005);
      r.style.transform = 'translateX(-50%) rotate(' + (6 + p * 14) + 'deg)';
    }
    addEventListener('scroll', upd, { passive: true }); upd();
  })();

  /* ---------- 4. 图片渐显 ---------- */
  (function fadeIn() {
    var imgs = document.querySelectorAll('img');
    Array.prototype.forEach.call(imgs, function (im) {
      if (im.closest('#mascot') || im.getAttribute('src').indexOf('data:') === 0) return;
      im.classList.add('u-fadein');
      function ok() { im.classList.add('ok'); }
      if (im.complete && im.naturalWidth) ok();
      else { im.addEventListener('load', ok); im.addEventListener('error', ok); }
    });
  })();

  /* ---------- 5. 卡片轻微歪斜（手绘拼贴感，rotate 独立属性不与 transform 打架） ---------- */
  (function tilt() {
    var sel = '.proj,.gcard,.panel,.way,.mat,.exhibit,.note-card,.honor-item,.rm-item,.faq-item';
    var cards = document.querySelectorAll(sel);
    Array.prototype.forEach.call(cards, function (c, i) {
      var base = COMIC ? 0.75 : 0.36;
      c.style.rotate = ((i % 2 ? 1 : -1) * (base * (0.55 + Math.random() * 0.75))).toFixed(2) + 'deg';
    });
  })();

  /* ---------- 6. 章节编号 + 小狗标记 ---------- */
  (function secNo() {
    var secs = document.querySelectorAll('section[id]');
    var n = 0;
    Array.prototype.forEach.call(secs, function (s) {
      if (s.querySelector('.u-secno')) return;
      var h = s.querySelector('h2');
      if (!h) return;
      var has = s.querySelector('.sec-no,.room-no,.no,.sec-kicker,.sec-head,.room-head');
      n++;
      var tag = el('span', 'u-secno');
      tag.innerHTML = has ? DOG : (DOG + '<span style="letter-spacing:.14em">' +
        String(n).padStart(2, '0') + '</span>');
      h.parentNode.insertBefore(tag, h);
      h.setAttribute('data-secno', String(n).padStart(2, '0'));
    });
    /* hover 归零 */
    var st = document.createElement('style');
    st.textContent = '.proj:hover,.gcard:hover,.panel:hover,.exhibit:hover,.note-card:hover{rotate:0deg !important}' +
      '.u-secno{rotate:0deg !important}';
    document.head.appendChild(st);
  })();

  /* ---------- 7. 手绘波浪分隔 ---------- */
  (function waves() {
    var secs = document.querySelectorAll('section[id]');
    Array.prototype.forEach.call(secs, function (s, i) {
      if (i === 0) return;
      var w = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      w.setAttribute('class', 'u-wave' + (i % 2 ? ' slim' : ''));
      w.setAttribute('viewBox', '0 0 560 26');
      w.setAttribute('preserveAspectRatio', 'none');
      w.innerHTML = '<path d="M2 14 C 60 2, 110 22, 168 10 S 290 24, 348 9 S 470 23, 558 11" ' +
        'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1 0"/>';
      s.insertBefore(w, s.firstChild);
    });
    var st = document.createElement('style');
    st.textContent = '.u-wave{color:var(--ui-stroke)}';
    document.head.appendChild(st);
  })();

  /* ---------- 8. 胶带贴纸 ---------- */
  (function tape() {
    var targets = document.querySelectorAll('.mascot,.mascot-frame,.art,.mini-frame,.hero-art');
    Array.prototype.forEach.call(targets, function (t, i) {
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      var tp = el('div', 'u-tape' + (i % 2 ? ' r' : ''));
      t.appendChild(tp);
    });
  })();

  /* ---------- 9. Now 卡 ---------- */
  (function now() {
    var n = el('div'); n.id = 'u-now';
    n.innerHTML =
      '<span class="x" title="收起">\u2715</span>' +
      '<div class="t"><span class="dot"></span>NOW \u00b7 \u6b64\u523b</div>' +
      '<div class="b">\u5728\u628a\u5d4c\u5165\u5f0f\u9879\u76ee\u6574\u7406\u6210\u4f5c\u54c1\u96c6\uff0c' +
      '\u987a\u624b\u7ec3\u4e60\u5c0f\u7ea2\u4e66\u526a\u8f91\u3002\u770b\u5230\u8fd9\u91cc\u7684\u4f60\uff0c' +
      '\u6b22\u8fce\u6765\u627e\u6211\u804a\u3002</div>';
    document.body.appendChild(n);
    n.querySelector('.x').addEventListener('click', function (e) {
      e.stopPropagation(); n.remove(); toast('\u5df2\u6536\u8d77 \u00b7 \u5237\u65b0\u53ef\u6062\u590d');
    });
    n.addEventListener('click', function () { location.hash = '#contact'; });
  })();

  /* ---------- 10. 页脚：你那里几点 + 停留时长 ---------- */
  (function foot() {
    var f = document.querySelector('footer') || document.body;
    var m = el('div', 'u-footmeta');
    m.style.cssText = 'display:flex;gap:14px;flex-wrap:wrap;justify-content:center;' +
      'font-size:12.5px;opacity:.6;margin-top:16px';
    m.innerHTML = '<span>\u{1F552} \u4f60\u90a3\u91cc\u73b0\u5728 <b id="u-clock">--:--</b></span>' +
      '<span>\u23F1 \u5728\u8fd9\u9875\u505c\u7559 <b id="u-stay">0 \u79d2</b></span>' +
      '<span>\u{1F43E} \u5c0f\u9ec4\u4e00\u76f4\u8ddf\u7740\u4f60</span>';
    f.appendChild(m);
    var t0 = Date.now();
    function tick() {
      var d = new Date();
      var c = document.getElementById('u-clock');
      if (c) c.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      var s = document.getElementById('u-stay');
      if (s) {
        var sec = Math.floor((Date.now() - t0) / 1000);
        s.textContent = sec < 60 ? sec + ' \u79d2' : Math.floor(sec / 60) + ' \u5206 ' + (sec % 60) + ' \u79d2';
      }
    }
    tick(); setInterval(tick, 1000);
  })();

  /* ---------- 11. 快捷键 + 提示条 ---------- */
  (function keys() {
    var k = el('div'); k.id = 'u-keys';
    k.innerHTML = '<kbd>/</kbd>\u641c\u7d22 <kbd>K</kbd>\u547d\u4ee4 <kbd>T</kbd>\u56de\u9876\u90e8 <kbd>Esc</kbd>\u5173\u95ed';
    document.body.appendChild(k);
    setTimeout(function () { k.classList.add('on'); }, 900);
    setTimeout(function () { k.classList.remove('on'); }, 6500);
    addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === '/') { e.preventDefault(); k.classList.add('on'); toast('\u2191 \u70b9\u9876\u90e8\u5bfc\u822a\u6216\u6309 K \u6253\u5f00\u547d\u4ee4\u9762\u677f'); }
      if (e.key === 't' || e.key === 'T') scrollTo({ top: 0, behavior: 'smooth' });
      if (e.key === 'Escape') {
        var l = document.getElementById('u-light'); if (l) l.classList.remove('on');
        var km = document.querySelector('.kmask'); if (km) km.classList.remove('on');
      }
    });
  })();

  /* ---------- 12. 回到顶部 ---------- */
  (function top() {
    var b = el('div'); b.id = 'u-top'; b.innerHTML = '\u2B06'; b.title = '\u56de\u5230\u9876\u90e8 (T)';
    document.body.appendChild(b);
    b.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
    addEventListener('scroll', function () {
      b.classList.toggle('on', document.documentElement.scrollTop > 700);
    }, { passive: true });
  })();

  /* ---------- 13. 图片灯箱 ---------- */
  (function light() {
    var l = el('div'); l.id = 'u-light'; l.innerHTML = '<img alt="">';
    document.body.appendChild(l);
    var img = l.querySelector('img');
    l.addEventListener('click', function () { l.classList.remove('on'); });
    var imgs = document.querySelectorAll('img');
    Array.prototype.forEach.call(imgs, function (im) {
      if (im.closest('#mascot') || im.getAttribute('src').indexOf('data:') === 0) return;
      if (im.classList.contains('u-nolb')) return;
      im.style.cursor = 'zoom-in';
      im.addEventListener('click', function () {
        if (im.naturalWidth < 200) return;
        img.src = im.currentSrc || im.src; l.classList.add('on');
      });
    });
  })();

  /* ---------- 15. 导航智能隐藏（向下滚隐藏，向上滚出现） ---------- */
  (function navAuto() {
    var nav = document.querySelector('nav,#mastnav');
    if (!nav) return;
    nav.style.transition = 'transform .3s var(--ease)';
    var last = 0;
    addEventListener('scroll', function () {
      var y = document.documentElement.scrollTop;
      if (y > 220 && y > last + 6) nav.style.transform = 'translateY(-110%)';
      else if (y < last - 6) nav.style.transform = 'none';
      last = y;
    }, { passive: true });
  })();

  /* ---------- 16. logo 连点彩蛋 ---------- */
  (function egg() {
    var logo = document.querySelector('.logo,.brand,.paper-name,nav a');
    if (!logo) return;
    var n = 0, t = null;
    logo.addEventListener('click', function (e) {
      n++; clearTimeout(t); t = setTimeout(function () { n = 0; }, 900);
      if (n >= 5) {
        n = 0;
        toast('\u{1F43E} \u6d6a\u53eb\u4e86\uff01\u5c0f\u9ec4\u8dd1\u8fc7\u6765\u4e86');
        if (REDUCED) return;
        for (var i = 0; i < 26; i++) paw();
      }
    });
    function paw() {
      var p = el('div');
      var ch = ['\u{1F43E}', '\u2B50', '\u{1F49B}', '\u{1F4A5}'];
      p.textContent = ch[Math.floor(Math.random() * ch.length)];
      p.style.cssText = 'position:fixed;z-index:9991;pointer-events:none;font-size:' +
        (18 + Math.random() * 20) + 'px;left:' + (Math.random() * 92 + 4) + 'vw;top:-40px;' +
        'transition:transform 1.9s cubic-bezier(.3,.6,.4,1),opacity 1.9s';
      document.body.appendChild(p);
      requestAnimationFrame(function () {
        p.style.transform = 'translateY(112vh) rotate(' + (Math.random() * 720 - 360) + 'deg)';
        p.style.opacity = '.15';
      });
      setTimeout(function () { p.remove(); }, 2000);
    }
  })();

  /* ---------- 复制邮箱反馈（若有 data-copy） ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (!b) return;
    var v = b.getAttribute('data-copy');
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { toast('\u5df2\u590d\u5236\uff1a' + v); });
  });
})();
