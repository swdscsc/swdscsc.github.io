/* ============================================================
   site.js · 通用交互（四个站点共用，按元素存在性自动启用）
   ============================================================ */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 滚动渐入 */
  var revs = document.querySelectorAll('.reveal');
  if (revs.length && 'IntersectionObserver' in window && !REDUCED) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revs.forEach(function (el) { ro.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add('in'); });
  }

  /* 进度条 */
  var bar = document.getElementById('progress');
  if (bar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      bar.style.width = (p * 100).toFixed(2) + '%';
    }, { passive: true });
  }

  /* 导航高亮 */
  var links = document.querySelectorAll('nav a[href^="#"]');
  var secs = [];
  links.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) secs.push([s, a]);
  });
  if (secs.length && 'IntersectionObserver' in window) {
    var no = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          for (var i = 0; i < secs.length; i++)
            if (secs[i][0] === e.target) secs[i][1].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(function (p) { no.observe(p[0]); });
  }

  /* 数字滚动 */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, target = parseFloat(el.getAttribute('data-count'));
        var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
        var t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          p = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * p).toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        }
        if (REDUCED) el.textContent = target.toFixed(dec);
        else requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { co.observe(el); });
  }

  /* 项目弹窗 */
  var modal = document.getElementById('modal');
  if (modal) {
    var mT = document.getElementById('modalTitle'),
        mS = document.getElementById('modalSub'),
        mB = document.getElementById('modalBody');
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.p-more');
      if (btn) {
        var card = btn.closest('.proj');
        var h3 = card.querySelector('h3');
        mT.textContent = h3 ? h3.textContent.trim() : '详情';
        var st = card.querySelector('.star');
        mS.textContent = st ? st.textContent : '';
        var det = card.querySelector('.p-detail');
        mB.innerHTML = det ? det.innerHTML : '';
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
    function close() { modal.classList.remove('open'); document.body.style.overflow = ''; }
    modal.addEventListener('click', function (ev) { if (ev.target === modal) close(); });
    var mc = document.getElementById('modalClose');
    if (mc) mc.addEventListener('click', close);
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') close(); });
  }

  /* 一键复制 */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('.copy-btn');
    if (!b) return;
    var txt = b.getAttribute('data-copy');
    function done() { b.textContent = '已复制'; setTimeout(function () { b.textContent = '复制'; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(txt).then(done, done);
    else {
      var ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  });

  /* 返回顶部 */
  var top = document.getElementById('topBtn');
  if (top) {
    window.addEventListener('scroll', function () {
      top.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* 打字机 */
  var typed = document.getElementById('typed');
  if (typed) {
    var lines;
    try { lines = JSON.parse(typed.getAttribute('data-lines')); } catch (e) { lines = []; }
    if (REDUCED) { typed.textContent = lines[0] || ''; }
    else {
      var li = 0, ci = 0, del = false;
      (function tick() {
        var s = lines[li] || '';
        typed.textContent = s.slice(0, ci);
        if (!del) {
          ci++;
          if (ci > s.length) { del = true; return setTimeout(tick, 1600); }
        } else {
          ci--;
          if (ci < 0) { del = false; li = (li + 1) % lines.length; ci = 0; return setTimeout(tick, 300); }
        }
        setTimeout(tick, del ? 28 : 72);
      })();
    }
  }

  /* 技能条 */
  var bars = document.querySelectorAll('.bar i[data-w]');
  if (bars.length && 'IntersectionObserver' in window) {
    var bo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.width = e.target.getAttribute('data-w'); bo.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (el) { bo.observe(el); });
  } else {
    bars.forEach(function (el) { el.style.width = el.getAttribute('data-w'); });
  }

  /* FAQ 折叠 */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      q.parentElement.classList.toggle('open');
    });
  });

  /* 项目筛选 */
  var fbtns = document.querySelectorAll('.filter-bar button');
  if (fbtns.length) {
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        fbtns.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var cat = b.getAttribute('data-cat');
        document.querySelectorAll('.proj').forEach(function (p) {
          p.style.display = (cat === 'all' || p.getAttribute('data-cat') === cat) ? '' : 'none';
        });
      });
    });
  }
  /* 形象微倾斜（替代原来的动态瞳孔：人不动，只有极轻微的跟随）
     用独立的 rotate / translate 属性，不覆盖 reveal 入场动画的 transform */
  (function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = document.querySelectorAll('[data-tilt]');
    if (!els.length) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, on = true;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') { on = false; return; }
      on = true;
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      var rot = ((on ? cx : 0) * 1.1).toFixed(2);
      var px = ((on ? cx : 0) * 7).toFixed(1);
      var py = ((on ? cy : 0) * 5).toFixed(1);
      els.forEach(function (el) {
        el.style.rotate = rot + 'deg';
        el.style.translate = px + 'px ' + py + 'px';
      });
      requestAnimationFrame(loop);
    })();
  })();
})();
