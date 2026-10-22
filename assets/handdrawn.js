/* ============================================================
   handdrawn.js · 让 UI 真的"手绘"起来
   技法：SVG feTurbulence 生成噪声 + feDisplacementMap 推动像素
   —— 这比"不对称圆角假装手绘"真实得多（学自 Rough.js 的底层思路）

   关键实现：抖动只作用在**伪元素**（独立的绘制层）上，
   所以边框会抖，图片和文字不会跟着抖，可读性不受影响。

   1 三级手绘抖动滤镜
   2 卡片/面板的手绘边框
   3 分隔线、编号徽章、按钮的手绘化
   4 原生滚动驱动入场（animation-timeline: view()，零 JS）
   ============================================================ */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1·注入滤镜定义 ---------- */
  (function defs() {
    if (document.getElementById('hd-defs')) return;
    var d = document.createElement('div');
    d.id = 'hd-defs';
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg">' +
      /* 轻：卡片边框，微妙的手压感 */
      '<filter id="hdRough" x="-8%" y="-8%" width="116%" height="116%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.018 0.038" numOctaves="2" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      /* 中：编号徽章、贴纸 */
      '<filter id="hdRough2" x="-14%" y="-14%" width="128%" height="128%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" seed="19" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      /* 重：手绘分隔线 */
      '<filter id="hdRough3" x="-10%" y="-60%" width="120%" height="220%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="31" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '</svg>';
    document.body.appendChild(d);
  })();

  /* ---------- 2~3·把边框交给伪元素去抖 ---------- */
  var st = document.createElement('style');
  st.id = 'hd-css';
  st.textContent = [
    /* 卡片 / 面板：外框交给伪元素（只抖框，不抖内容） */
    '.card,.proj,.gcard,.panel,.exhibit,.sn,.note-card,.way,.mat,.tl-card,' +
    '.honor-item,.ai-item,.rm-item,.skill-tags,.stat-strip{position:relative}',
    '.card::after,.proj::after,.gcard::after,.panel::after,.exhibit::after,.sn::after,' +
    '.note-card::after,.way::after,.mat::after,.tl-card::after,.honor-item::after,' +
    '.ai-item::after,.rm-item::after,.skill-tags::after,.stat-strip::after{' +
    'content:"";position:absolute;inset:0;pointer-events:none;z-index:4;',
    '  border:2px solid currentColor;border-radius:inherit;opacity:.42;',
    '  filter:url(#hdRough)}',

    /* 编号徽章 / 贴纸 / 小标签：抖得更明显一点 */
    '.no,.stars,.cat,.plaque-s,.ai-chip,.u-tape{filter:url(#hdRough2)}',

    /* 手绘分隔线 */
    '.u-wave,.series-note .sn h3 i{filter:url(#hdRough3)}',

    /* 按钮悬停时才抖，平时保持干净 */
    '.btn-o:hover,.hero-cta:hover,.btn-print:hover,.copy-btn:hover,.p-more:hover,' +
    '.filters button:hover{filter:url(#hdRough2)}',

    /* 4·原生滚动驱动入场：零 JS，跑在合成线程 */
    '@keyframes hdRise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}',
    '.reveal{animation:hdRise .7s cubic-bezier(.16,1,.3,1) both}',
    '@supports (animation-timeline: view()){',
    '  .reveal{animation-timeline:view();animation-range:entry 5% entry 42%}',
    '}',

    /* 尊重"减少动效"：关掉抖动，边框回归干净 */
    '@media (prefers-reduced-motion: reduce){',
    '  .card::after,.proj::after,.gcard::after,.panel::after,.exhibit::after,' +
    '.sn::after,.note-card::after,.way::after,.mat::after,.tl-card::after,' +
    '.honor-item::after,.ai-item::after,.rm-item::after,.skill-tags::after,' +
    '.stat-strip::after,.no,.stars,.cat,.u-wave{filter:none}',
    '  .reveal{animation:none;opacity:1;transform:none}}'
  ].join('\n');
  document.head.appendChild(st);

  /* ---------- 4·给不支持原生滚动动画的浏览器兜底（IntersectionObserver） ---------- */
  (function fallbackReveal() {
    if (REDUCED || !('IntersectionObserver' in window)) return;
    if (CSS && CSS.supports && CSS.supports('animation-timeline', 'view()')) return;
    /* 已有 site.js 的 reveal 逻辑时会跳过，这里只做兜底 */
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  })();
})();
