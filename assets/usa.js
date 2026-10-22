/* ============================================================
   usa.js · 美式漫画装饰层（只有「酷族」站点 styleA / editorial 引入）
   1) hero 放射速度线  2) 每个区块标题旁挂拟声词贴纸
   幂等：重复执行不会重复插入
   ============================================================ */
(function () {
  'use strict';
  if (window.__usa) return;
  window.__usa = 1;

  var SFX = ['POW!', 'BOOM!', 'WHAM!', 'ZAP!', 'BAM!', 'KRAK!', 'YES!', 'WOW!'];
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1) hero 放射速度线 */
  var first = document.querySelector('section');
  if (first && !first.querySelector('.rays')) {
    var rays = document.createElement('div');
    rays.className = 'rays';
    rays.setAttribute('aria-hidden', 'true');
    first.appendChild(rays);
  }

  /* 2) 区块标题旁的拟声词贴纸 */
  var seen = {}, i = 0;
  var heads = document.querySelectorAll('section[data-nav] h2, #hero h2, .hero h2, .hall h2');
  heads.forEach(function (h2) {
    if (h2.querySelector('.sfx')) return;
    if (!h2.textContent.trim()) return;
    var key = h2.textContent.trim().slice(0, 10);
    if (seen[key]) return;
    seen[key] = 1;
    var s = document.createElement('span');
    s.className = 'sfx';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = SFX[i % SFX.length];
    i++;
    h2.appendChild(s);
  });

  /* 3) 减少动效偏好下，静态放射线保留但不做位移 */
  if (REDUCED) {
    var r = document.querySelector('.rays');
    if (r) r.style.animation = 'none';
  }
})();
