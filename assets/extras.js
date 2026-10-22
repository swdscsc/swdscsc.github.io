/* ============================================================
   extras.js · 增强交互（四站共用）
   1) 背景插画视差  2) ⌘K 命令面板  3) 项目深链接
   4) 阅读时长自动校准  5) Konami 彩蛋（狗跳 + 爪印雨）
   依赖：按元素存在性自动启用，缺什么都不报错
   ============================================================ */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 注入本模块所需样式（一次） */
  (function injectCSS() {
    if (document.getElementById('extras-css')) return;
    var s = document.createElement('style');
    s.id = 'extras-css';
    s.textContent = [
      '/* ⌘K 面板 */',
      '.kmask{position:fixed;inset:0;background:rgba(10,15,25,.45);backdrop-filter:blur(4px);z-index:900;opacity:0;pointer-events:none;transition:opacity .18s}',
      '.kmask.on{opacity:1;pointer-events:auto}',
      '.kpanel{position:fixed;left:50%;top:14vh;transform:translateX(-50%) scale(.97);width:min(560px,92vw);',
      '  background:#fff;border-radius:16px;box-shadow:0 24px 80px rgba(8,12,24,.35);z-index:901;overflow:hidden;',
      '  opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;font-family:inherit}',
      '.kpanel.on{opacity:1;pointer-events:auto;transform:translateX(-50%) scale(1)}',
      '.kpanel input{width:100%;border:none;outline:none;padding:18px 20px;font-size:16px;background:transparent;color:#1d1d1f;border-bottom:1px solid #eee;font-family:inherit}',
      '.klist{max-height:46vh;overflow:auto;padding:8px}',
      '.kitem{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;cursor:pointer;color:#1d1d1f}',
      '.kitem .kico{width:30px;height:30px;border-radius:8px;background:#f2f2f4;display:flex;align-items:center;justify-content:center;font-size:15px;flex:none}',
      '.kitem b{font-size:14.5px;font-weight:600}',
      '.kitem small{color:#86868b;font-size:12px;margin-left:auto;flex:none}',
      '.kitem.sel{background:#f0f4ff}',
      '.kitem.sel .kico{background:#e3eaff}',
      '.kfoot{padding:9px 16px;border-top:1px solid #eee;color:#a1a1a6;font-size:11.5px;display:flex;gap:14px}',
      '.kempty{padding:26px;text-align:center;color:#a1a1a6;font-size:13.5px;display:none}',
      '/* 深链接高亮 */',
      '@keyframes deepFlash{0%,100%{box-shadow:0 0 0 0 rgba(80,140,255,0)}30%{box-shadow:0 0 0 5px rgba(80,140,255,.45)}}',
      '.deep-flash{animation:deepFlash 1.6s ease 2}',
      '/* 复制链接按钮 */',
      '.p-link{font-size:13px;color:#86868b;background:none;border:1px solid transparent;border-radius:999px;cursor:pointer;padding:3px 10px;font-family:inherit;transition:.2s;vertical-align:middle}',
      '.p-link:hover{color:#1d1d1f;border-color:#d2d2d7}',
      '.p-link.ok{color:#1d7d3f;border-color:#bfe3cc;background:#f0faf3}',
      '/* 爪印雨 */',
      '.paw-rain{position:fixed;inset:0;pointer-events:none;z-index:880;overflow:hidden}',
      '.paw-drop{position:absolute;top:-8vh;animation:pawFall linear forwards}',
      '@keyframes pawFall{to{transform:translateY(115vh) rotate(var(--spin,40deg));opacity:.9}}',
      '@keyframes dogJump{0%{transform:translateY(0) scale(1,1)}28%{transform:translateY(-46px) scale(.94,1.08)}55%{transform:translateY(0) scale(1.06,.92)}72%{transform:translateY(-16px) scale(1,1)}100%{transform:translateY(0) scale(1,1)}}',
      '.dog-jump{animation:dogJump .9s cubic-bezier(.3,1.4,.5,1) 2}',
      '/* 阅读时长徽标 */',
      '.rt-badge{font-size:11.5px;color:#86868b;background:rgba(120,120,128,.09);border-radius:999px;padding:2px 9px;margin-left:8px;white-space:nowrap}',
      '@media (prefers-reduced-motion: reduce){.deep-flash,.paw-drop,.dog-jump{animation:none!important}}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  /* ---------- 1. 背景插画视差 ---------- */
  (function bgParallax() {
    var bg = document.querySelector('.bgart');
    if (!bg || REDUCED) return;
    bg.style.willChange = 'transform';
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        bg.style.transform = 'translateY(' + (window.scrollY * 0.12).toFixed(1) + 'px) scale(1.06)';
        tick = false;
      });
    }, { passive: true });
  })();

  /* ---------- 2. ⌘K 命令面板 ---------- */
  (function palette() {
    var items = [];
    document.querySelectorAll('section[data-nav]').forEach(function (sec) {
      items.push({ ico: '§', t: sec.getAttribute('data-nav'), sub: '章节', href: '#' + sec.id });
    });
    document.querySelectorAll('.proj').forEach(function (card, i) {
      var h = card.querySelector('h3');
      if (!h) return;
      var cat = card.querySelector('.cat');
      items.push({ ico: '◆', t: h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim(),
        sub: cat ? cat.textContent.trim() : '项目', href: '#p' + (i + 1) });
    });
    var links = document.querySelectorAll('.swap-links a, a[href^="http"]');
    if (items.length < 2) return;

    var mask = document.createElement('div');
    mask.className = 'kmask';
    var panel = document.createElement('div');
    panel.className = 'kpanel';
    panel.innerHTML =
      '<input type="text" placeholder="搜索章节、项目…（↑↓ 选择 · Enter 跳转 · Esc 关闭）" aria-label="搜索">' +
      '<div class="klist"></div><div class="kempty">没找到，换个词试试</div>' +
      '<div class="kfoot"><span>↵ 跳转</span><span>↑↓ 选择</span><span>esc 关闭</span></div>';
    document.body.appendChild(mask);
    document.body.appendChild(panel);
    var input = panel.querySelector('input'),
        list = panel.querySelector('.klist'),
        empty = panel.querySelector('.kempty'),
        filtered = [], sel = 0, open = false;

    function render() {
      list.innerHTML = '';
      filtered.forEach(function (it, i) {
        var d = document.createElement('div');
        d.className = 'kitem' + (i === sel ? ' sel' : '');
        d.innerHTML = '<span class="kico">' + it.ico + '</span><b></b><small></small>';
        d.querySelector('b').textContent = it.t;
        d.querySelector('small').textContent = it.sub;
        d.addEventListener('click', function () { go(it); });
        list.appendChild(d);
      });
      empty.style.display = filtered.length ? 'none' : 'block';
    }
    function filter() {
      var q = input.value.trim().toLowerCase();
      filtered = !q ? items.slice(0, 9) :
        items.filter(function (it) { return (it.t + it.sub).toLowerCase().indexOf(q) > -1; }).slice(0, 9);
      sel = 0; render();
    }
    function show() {
      open = true; mask.classList.add('on'); panel.classList.add('on');
      input.value = ''; filter();
      setTimeout(function () { input.focus(); }, 30);
    }
    function hide() {
      open = false; mask.classList.remove('on'); panel.classList.remove('on');
      input.blur();
    }
    function go(it) {
      hide();
      var el = document.querySelector(it.href);
      if (el) {
        el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
        if (/^#p\d+$/.test(it.href)) flash(el);
        history.replaceState(null, '', it.href);
      }
    }
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); open ? hide() : show(); return; }
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); hide(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === 'Enter' && filtered[sel]) { e.preventDefault(); go(filtered[sel]); }
    });
    mask.addEventListener('click', hide);
  })();

  /* ---------- 3. 项目深链接 ---------- */
  (function deepLinks() {
    var cards = document.querySelectorAll('.proj');
    if (!cards.length) return;
    cards.forEach(function (card, i) {
      if (!card.id) card.id = 'p' + (i + 1);
      var foot = card.querySelector('.p-foot, .plaque-foot, .e-foot');
      if (!foot || foot.querySelector('.p-link')) return;
      var b = document.createElement('button');
      b.className = 'p-link';
      b.type = 'button';
      b.title = '复制本项目直达链接';
      b.textContent = '⧉ 链接';
      b.addEventListener('click', function () {
        var url = location.origin + location.pathname + '#' + card.id;
        function done() {
          b.textContent = '✓ 已复制';
          b.classList.add('ok');
          setTimeout(function () { b.textContent = '⧉ 链接'; b.classList.remove('ok'); }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { fallback(url); done(); });
        } else { fallback(url); done(); }
      });
      foot.appendChild(b);
    });
    function fallback(t) {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
    function flash(el) {
      if (REDUCED) return;
      el.classList.remove('deep-flash');
      void el.offsetWidth;
      el.classList.add('deep-flash');
      setTimeout(function () { el.classList.remove('deep-flash'); }, 3400);
    }
    if (/^#p\d+$/.test(location.hash)) {
      var el = document.querySelector(location.hash);
      if (el) setTimeout(function () { flash(el); }, 500);
    }
  })();

  /* ---------- 4. 阅读时长自动校准 ---------- */
  (function readTime() {
    document.querySelectorAll('.note-card').forEach(function (card) {
      var meta = card.querySelector('.meta');
      if (!meta || /min/.test(meta.textContent)) return;
      var words = (card.textContent || '').replace(/\s/g, '').length;
      var min = Math.max(1, Math.round(words / 350));
      meta.textContent = meta.textContent.replace(/约\s*\d*\s*min/, '') + ' · 约 ' + min + ' min';
    });
  })();

  /* ---------- 5. Konami 彩蛋 ---------- */
  (function konami() {
    var SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var pos = 0, busy = false;
    var PAW = '<svg viewBox="0 0 24 24" width="__S" height="__S"><g fill="currentColor"><ellipse cx="12" cy="15.5" rx="5.4" ry="4.4"/><circle cx="5.2" cy="9.6" r="2.3"/><circle cx="9.6" cy="6.4" r="2.4"/><circle cx="14.4" cy="6.4" r="2.4"/><circle cx="18.8" cy="9.6" r="2.3"/></g></svg>';
    var COLORS = ['#ff6b81','#ffd43b','#4dabf7','#b197fc','#69db7c','#ffa94d'];

    document.addEventListener('keydown', function (e) {
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = (k === SEQ[pos]) ? pos + 1 : (k === SEQ[0] ? 1 : 0);
      if (pos !== SEQ.length) return;
      pos = 0;
      if (busy) return;
      busy = true;

      /* 狗跳 */
      var dog = document.getElementById('dogMascot');
      if (dog) {
        dog.style.transformOrigin = '50% 100%';
        dog.classList.add('dog-jump');
      }
      /* 爪印雨 */
      var layer = document.createElement('div');
      layer.className = 'paw-rain';
      document.body.appendChild(layer);
      var N = 26;
      for (var i = 0; i < N; i++) {
        (function (i) {
          setTimeout(function () {
            var d = document.createElement('span');
            d.className = 'paw-drop';
            var s = 16 + Math.random() * 26;
            d.innerHTML = PAW.replace(/__S/g, s.toFixed(0));
            d.style.left = (Math.random() * 96) + 'vw';
            d.style.color = COLORS[i % COLORS.length];
            d.style.setProperty('--spin', ((Math.random() * 120 - 60).toFixed(0)) + 'deg');
            d.style.opacity = 0.85;
            d.style.animationDuration = (1.6 + Math.random() * 1.4).toFixed(2) + 's';
            d.style.animationDelay = '0s';
            layer.appendChild(d);
          }, Math.random() * 700);
        })(i);
      }
      setTimeout(function () {
        if (dog) dog.classList.remove('dog-jump');
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        busy = false;
      }, 3600);
    });
  })();
})();
