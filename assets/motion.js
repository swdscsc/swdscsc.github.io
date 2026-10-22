/* ============================================================
   motion.js · 作品集动效（让图"活"起来，且互不打架）
   用 CSS 独立属性分工，避免互相覆盖：
     scale     → Ken Burns 极缓推拉
     rotate    → 手绘歪斜
     translate → 滚动视差
     transform → hover 抬起 + 鼠标 3D 倾斜
   1 漂浮符号  2 缓推拉  3 错峰入场  4 鼠标倾斜
   5 滚动视差  6 邻卡变暗  7 灯箱推拉
   ============================================================ */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var SYM = {
    circuit: ['\u26A1', '\u2726', '\u25CB', '\u2317', '\u2733'],
    dog: ['\u{1F43E}', '\u2605', '\u2661', '\u2726', '\u2734'],
    all: ['\u26A1', '\u2726', '\u25CB', '\u{1F43E}', '\u2605', '\u2733']
  };
  /* 故事页每章的主题符号：跟着那一章在讲什么走 */
  var STORY_SYM = [
    ['\u2708', '\u2601'],   /* 01 深圳：纸飞机、云 */
    ['\u2601', '\u2726'],   /* 02 那年夏天：云、星 */
    ['\u2699', '\u2726'],   /* 03 打工：齿轮、星 */
    ['\u270E', '\u2733'],   /* 04 家教：铅笔、火花 */
    ['\u2740', '\u2601'],   /* 05 湛江：花、云 */
    ['\u266A', '\u2726'],   /* 06 社团：音符、星 */
    ['\u2764', '\u2B06'],   /* 07 健身：心、上升 */
    ['\u26A1', '\u2699'],   /* 08 实验：电、齿轮 */
    ['\u2727', '\u2708'],   /* 09 分岔：星、纸飞机 */
    ['\u2605', '\u2708']    /* 10 回深圳：星、纸飞机 */
  ];

  /* ---------- 注入样式 ---------- */
  (function css() {
    if (document.getElementById('motion-css')) return;
    var s = document.createElement('style'); s.id = 'motion-css';
    s.textContent = [
      /* 1·漂浮符号 */
      '.card{position:relative}',
      '.fx{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2}',
      '.fx i{position:absolute;font-style:normal;font-size:19px;line-height:1;opacity:0;',
      '  will-change:transform,opacity;animation:fxFloat 9s linear infinite}',
      '@keyframes fxFloat{',
      '  0%{transform:translate(0,0) rotate(0deg) scale(.7);opacity:0}',
      '  12%{opacity:var(--opa,.85)}',
      '  80%{opacity:calc(var(--opa,.85) * .7)}',
      '  100%{transform:translate(var(--dx),var(--dy)) rotate(var(--dr)) scale(1.15);opacity:0}}',
      '.card:hover .fx i,.beat .fig:hover .fx i{animation-duration:5.5s}',
      '.beat .fig .fx i{color:#3a2c1c}',

      /* 2a·呼吸：scale 独立属性（不碰 transform）
         2b·游走：object-position（画面在框里缓缓移动，也不占 transform 类属性）
         两者叠加 = 图真的在动；故事页幅度故意加大，不然看不出来 */
      '@keyframes kb{0%{scale:1.03}100%{scale:1.12}}',
      '@keyframes kbDrift{0%{object-position:50% 38%}100%{object-position:50% 64%}}',
      '.card .ph img{animation:kb 13s ease-in-out infinite alternate;animation-play-state:paused}',
      '.card:nth-child(2n) .ph img{animation-duration:16s;animation-direction:alternate-reverse}',
      '.card:nth-child(3n) .ph img{animation-duration:20s}',
      '.beat .fig img{',
      '  animation:kb 11s ease-in-out infinite alternate,kbDrift 18s ease-in-out infinite alternate;',
      '  animation-play-state:paused}',
      '.beat:nth-child(2n) .fig img{',
      '  animation:kb 14s ease-in-out infinite alternate-reverse,kbDrift 22s ease-in-out infinite alternate-reverse}',
      '.beat:nth-child(3n) .fig img{animation-duration:17s,26s}',
      /* 只在进入视口后才跑，省电 */
      '.card.inview .ph img,.beat .fig.inview img{animation-play-state:running}',
      '.card.inview .fx i,.beat .fig.inview .fx i{animation-play-state:running}',
      '.fx i{animation-play-state:paused}',
      '.beat .fig{position:relative}',

      /* 3·错峰入场（延迟只给入场态 .pre，不拖慢 hover） */
      '.card{transition:opacity .45s var(--ease, cubic-bezier(.2,.75,.25,1)),',
      '  filter .45s var(--ease, cubic-bezier(.2,.75,.25,1)),',
      '  transform .45s var(--ease, cubic-bezier(.2,.75,.25,1)),',
      '  box-shadow .45s var(--ease, cubic-bezier(.2,.75,.25,1))}',
      '.card.pre{opacity:0;transform:translateY(26px) scale(.985);',
      '  transition-duration:.7s;transition-delay:calc(var(--i,0) * 70ms)}',

      /* 6·邻卡变暗（hover 某张时其余让位） */
      '.grid:has(.card:hover) .card:not(:hover){opacity:.52;filter:saturate(.55) grayscale(.3)}',

      /* 8·SplitText 式逐字入场 */
      '.ch{display:inline-block;opacity:0;transform:translateY(.55em) rotate(6deg);',
      '  animation:chIn .55s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--ci,0) * 38ms)}',
      '@keyframes chIn{to{opacity:1;transform:none}}',
      '[data-split] .ch{will-change:transform,opacity}',

      /* 9·页面切换过渡（Barba 思路） */
      'body{transition:opacity .32s var(--ease, ease),transform .32s var(--ease, ease)}',
      'body.page-out{opacity:0;transform:translateY(10px)}',
      'body.page-in{opacity:0;transform:translateY(-8px)}',

      /* 10·故事页中轴线随滚动画出（DrawSVG 思路） */
      '#scroll .axis{position:absolute;left:50%;top:0;height:100%;width:2px;',
      '  transform:translateX(-50%);overflow:visible;pointer-events:none}',
      '#scroll .axis path{stroke:var(--accent,#c8102e);stroke-width:2.2;fill:none;',
      '  stroke-linecap:round;opacity:.75}',
      '#scroll .axis .runner{position:absolute;left:50%;translate:-50% 0;top:0;',
      '  font-size:19px;transition:top .1s linear}',
      '@media(max-width:820px){#scroll .axis{left:14px;transform:none}}',

      /* 7·灯箱 */
      '@keyframes lbIn{from{scale:1.1}to{scale:1}}',
      '#lb.on img{animation:lbIn 14s ease-in-out infinite alternate}',

      '@media (prefers-reduced-motion: reduce){',
      '  .fx{display:none}',
      '  .card .ph img, #lb.on img{animation:none}',
      '  .card.pre{opacity:1;transform:none}',
      '  .ch{opacity:1;transform:none;animation:none}}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  /* 同时支持作品集卡片 .card 与故事页图片 .beat .fig */
  var cards = document.querySelectorAll('.card, .beat .fig');
  if (!cards.length) return;

  function sprinkle(c, pool, n, sizeMin, opaMax) {
    var box = document.createElement('div'); box.className = 'fx';
    for (var i = 0; i < n; i++) {
      var e = document.createElement('i');
      e.textContent = pool[i % pool.length];
      e.style.setProperty('--dx', (Math.random() * 90 - 30).toFixed(0) + 'px');
      e.style.setProperty('--dy', (-40 - Math.random() * 70).toFixed(0) + 'px');
      e.style.setProperty('--dr', (Math.random() * 200 - 100).toFixed(0) + 'deg');
      e.style.setProperty('--opa', opaMax);
      e.style.left = (8 + Math.random() * 78) + '%';
      e.style.top = (55 + Math.random() * 35) + '%';
      e.style.animationDelay = (-Math.random() * 9).toFixed(1) + 's';
      e.style.fontSize = (sizeMin + Math.random() * 10).toFixed(0) + 'px';
      box.appendChild(e);
    }
    c.appendChild(box);
  }

  var beats = [].slice.call(document.querySelectorAll('.beat'));

  /* 1·撒漂浮符号：作品集随机，故事页按章节主题（少而准，2 个） */
  Array.prototype.forEach.call(cards, function (c, idx) {
    if (c.classList.contains('card')) {
      var key = c.getAttribute('data-fx') || 'all';
      sprinkle(c, SYM[key] || SYM.all, 3 + (idx % 2), 14, .85);
      c.style.setProperty('--i', idx % 6);
    } else {
      var b = c.closest ? c.closest('.beat') : null;
      var bi = b ? beats.indexOf(b) : -1;
      sprinkle(c, STORY_SYM[bi >= 0 ? bi : 0], 2, 16, .55);
    }
  });

  /* 3·错峰入场（故事页 .fig 自带渐显，交给它自己，这里只接管作品集卡片） */
  if (!REDUCED) {
    Array.prototype.forEach.call(cards, function (c) {
      if (c.classList.contains('card')) c.classList.add('pre');
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var c = e.target;
          if (e.isIntersecting) {
            c.classList.add('inview');
            setTimeout(function () { c.classList.remove('pre'); }, (c.style.getPropertyValue('--i') | 0) * 70);
          } else {
            c.classList.remove('inview');
          }
        });
      }, { threshold: 0.05 });
      Array.prototype.forEach.call(cards, function (c) { io.observe(c); });
    } else {
      Array.prototype.forEach.call(cards, function (c) { c.classList.remove('pre'); });
    }
  }

  /* 4·鼠标 3D 倾斜 + 5·滚动视差 */
  if (!REDUCED && FINE) {
    Array.prototype.forEach.call(cards, function (c) {
      if (!c.classList.contains('card')) return;   /* 倾斜只给作品集卡片，免得破坏故事页渐显 */
      var img = c.querySelector('.ph img');
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(760px) rotateY(' + (px * 7).toFixed(2) +
          'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg) translateY(-6px) scale(1.012)';
        if (img) img.style.translate = (px * -14).toFixed(1) + 'px ' + (py * -14).toFixed(1) + 'px';
      });
      c.addEventListener('mouseleave', function () {
        c.style.transform = '';
        if (img) img.style.translate = '';
      });
    });

    /* 滚动视差：整页滚动时图片轻微反向位移（用 translate 独立属性） */
    var raf = null;
    var onScroll = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var vh = innerHeight;
        Array.prototype.forEach.call(cards, function (c) {
          var img = c.querySelector('img');
          if (!img || img.style.translate) return;
          var r = c.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          var p = (r.top + r.height / 2 - vh / 2) / vh;
          img.style.translate = '0 ' + (-p * 16).toFixed(1) + 'px';
        });
        raf = null;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 8·SplitText：标题逐字入场 ---------- */
  (function splitText() {
    if (REDUCED) return;
    var els = document.querySelectorAll('[data-split]');
    if (!els.length) return;
    Array.prototype.forEach.call(els, function (root) {
      var ci = 0;
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split('').forEach(function (ch) {
              var s = document.createElement('span');
              s.className = 'ch';
              s.textContent = ch === ' ' ? '\u00A0' : ch;
              s.style.setProperty('--ci', ci++);
              frag.appendChild(s);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') {
            walk(n);
          }
        });
      })(root);
    });
  })();

  /* ---------- 9·页面切换过渡（Barba 思路，零依赖） ---------- */
  (function pageTransition() {
    if (REDUCED) return;
    document.body.classList.add('page-in');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { document.body.classList.remove('page-in'); });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href');
      if (!/^[a-z0-9-]+\.html$/.test(href)) return;           /* 只接管站内页 */
      if (e.metaKey || e.ctrlKey || a.target === '_blank') return;
      e.preventDefault();
      document.body.classList.add('page-out');
      setTimeout(function () { location.href = href; }, 300);
    });
  })();

  /* ---------- 10·故事页：中轴线随滚动画出 + 小狗沿路走（DrawSVG 思路） ---------- */
  (function axisDraw() {
    var box = document.getElementById('scroll');
    if (!box) return;
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'axis');
    svg.setAttribute('viewBox', '0 0 2 1000');
    svg.setAttribute('preserveAspectRatio', 'none');
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M1 0 V1000');
    svg.appendChild(path);
    var runner = document.createElement('span');
    runner.className = 'runner';
    runner.textContent = '\u{1F43E}';
    box.appendChild(svg);
    box.appendChild(runner);

    var total = 1000;
    path.style.strokeDasharray = total;
    path.style.strokeDashoffset = total;

    var raf = null;
    function update() {
      var r = box.getBoundingClientRect();
      var vh = innerHeight;
      var p = Math.max(0, Math.min(1, (vh - r.top) / (r.height + vh * 0.4)));
      path.style.strokeDashoffset = (total * (1 - p)).toFixed(1);
      runner.style.top = (p * r.height).toFixed(0) + 'px';
      raf = null;
    }
    addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(update); });
    update();
  })();
})();
