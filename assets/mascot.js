/* ============================================================
   mascot.js · 中华田园犬跟班引擎 v1
   做法取自 GitHub 上两个开源方案的组合：
   - oil-motion（oil-oil/oil-motion）：「锁定关键帧 → 中间由程序插值
     → 清理异常帧 → 把输入映射到动画进度」，并明确要求位移/缩放/
     跟随阻尼/最大转动速度由程序控制，而不是逐帧生成。
   - nilbuild/page-mascot：用「指针相对角色的角度」决定朝向，
     带死区（dead zone）让头部在指针贴近时回正，点击给一次反应，
     触屏与 prefers-reduced-motion 下自动降级。
   这里没有 AI 视频资产，改用同一套参数控制 SVG 骨骼：
   角度 → 目标值 → 限速 → 阻尼 → 输出 CSS 变量。
   ============================================================ */
(function () {
  'use strict';
  var dog = document.getElementById('dogMascot');
  if (!dog) return;

  var head = document.getElementById('md-head');
  var pupilL = document.getElementById('md-pupil-l');
  var pupilR = document.getElementById('md-pupil-r');
  var earL = document.getElementById('md-ear-l');
  var earR = document.getElementById('md-ear-r');
  var tail = document.getElementById('md-tail');
  var body = document.getElementById('md-body');
  var mouth = document.getElementById('md-mouth');
  var bubble = document.getElementById('dogTalk');

  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 可调参数（oil-motion 强调的"程序控制"部分） ---------- */
  var MAX_HEAD = 16;      // 头部最大转角(deg)
  var MAX_PUPIL = 4.2;    // 瞳孔最大位移(px, viewBox 单位)
  var DEAD_ZONE = 34;     // 死区半径(px)：指针贴脸时回正看你
  var DAMP = 0.12;        // 跟随阻尼（越小越慢）
  var MAX_SPEED = 0.85;   // 每帧最大角速度(deg)：快速反向时不闪跳
  var MAX_TILT = 5;       // 身体最大侧倾(deg)
  var IDLE_AFTER = 2200;  // 静止多久进入待机微动(ms)

  /* ---------- 状态 ---------- */
  var cur = { h: 0, p: 0, t: 0, b: 0 };          // 当前值
  var tgt = { h: 0, p: 0, t: 0, b: 0 };          // 目标值
  var lastMove = Date.now();
  var idle = false;
  var t0 = Date.now();
  var blinkAt = t0 + 2600;
  var wag = 0;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ---------- 输入：指针角度 -> 目标 ---------- */
  function onMove(e) {
    if (dog.dataset.sleep === '1') return;
    var r = dog.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < DEAD_ZONE * (r.width / 110)) {   // 死区：回正，看向你
      tgt.h = 0; tgt.p = 0; tgt.t = 0; tgt.b = 0;
    } else {
      // 水平分量决定转头，垂直分量决定俯仰（压缩幅度，避免夸张）
      var kx = clamp(dx / (window.innerWidth / 2), -1, 1);
      var ky = clamp(dy / (window.innerHeight / 2), -1, 1);
      tgt.h = kx * MAX_HEAD;
      tgt.p = ky * MAX_PUPIL;
      tgt.t = kx * MAX_TILT;
      tgt.b = ky * 2.2;
    }
    lastMove = Date.now();
    idle = false;
  }

  if (finePointer && !reduced) {
    window.addEventListener('pointermove', onMove, { passive: true });
  }

  /* ---------- 点击反应（page-mascot 的 reactions） ---------- */
  var LINES = [
    '又在调 bug 呀？我陪你。',
    '这个函数我看不懂，但我觉得你很厉害。',
    '饭点到了，先吃饭。',
    '要不要先睡一觉再来想？',
    '汪！——翻译一下：加油。',
    '你已经比昨天的自己强了。',
    '这个 bug 明天再看一定会更简单的。',
    '别忘了喝水。'
  ];
  function say(txt, ms) {
    if (!bubble) return;
    bubble.textContent = txt;
    bubble.classList.add('show');
    clearTimeout(say._t);
    say._t = setTimeout(function () { bubble.classList.remove('show'); }, ms || 2400);
  }
  dog.addEventListener('click', function () {
    if (dog.dataset.sleep === '1') {
      dog.dataset.sleep = '0';
      say('好啦，我醒了。', 1800);
      return;
    }
    dog.classList.remove('poke');
    void dog.offsetWidth;
    dog.classList.add('poke');
    if (mouth) mouth.classList.add('bark');
    setTimeout(function () { if (mouth) mouth.classList.remove('bark'); }, 420);
    say(LINES[Math.floor(Math.random() * LINES.length)]);
  });

  /* ---------- 主循环：限速 + 阻尼 -> CSS 变量 ---------- */
  function loop(now) {
    idle = (now - lastMove) > IDLE_AFTER;

    if (idle) {
      // 待机：呼吸微动 + 尾巴自然摆动，用户一动就交出控制权
      var w = Math.sin((now - t0) / 900) * 0.9;
      tgt.h = w; tgt.p = 0; tgt.t = w * 0.4; tgt.b = Math.sin((now - t0) / 1400) * 0.4;
    }

    // 限速：每帧最多移动 MAX_SPEED 度，急速反向也不会闪跳
    ['h', 'p', 't', 'b'].forEach(function (k) {
      var d = tgt[k] - cur[k];
      var step = (k === 'h' || k === 't') ? MAX_SPEED : MAX_SPEED * 0.55;
      if (Math.abs(d) > step) d = d > 0 ? step : -step;
      cur[k] += d * DAMP * 8;
    });

    if (head) {
      head.style.transform = 'rotate(' + cur.h.toFixed(2) + 'deg) translate(0,' + cur.b.toFixed(2) + 'px)';
    }
    if (pupilL) pupilL.style.transform = 'translate(' + cur.p.toFixed(2) + 'px,' + (cur.b * 0.5).toFixed(2) + 'px)';
    if (pupilR) pupilR.style.transform = 'translate(' + cur.p.toFixed(2) + 'px,' + (cur.b * 0.5).toFixed(2) + 'px)';
    if (earL) earL.style.transform = 'rotate(' + (-cur.h * 0.45).toFixed(2) + 'deg)';
    if (earR) earR.style.transform = 'rotate(' + (-cur.h * 0.3).toFixed(2) + 'deg)';
    if (body) body.style.transform = 'rotate(' + cur.t.toFixed(2) + 'deg)';

    // 尾巴：跟随兴奋度摆动
    wag += 0.12 + Math.abs(cur.h) / 260;
    if (tail) tail.style.transform = 'rotate(' + (Math.sin(wag) * (7 + Math.abs(cur.h) * 0.9)).toFixed(2) + 'deg)';

    // 眨眼
    if (now > blinkAt) {
      dog.classList.add('blink');
      setTimeout(function () { dog.classList.remove('blink'); }, 150);
      blinkAt = now + 3200 + Math.random() * 3200;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- 低头利用率：右下角出现时的入场打招呼 ---------- */
  setTimeout(function () {
    say('嗨，我是她家那只中华田园犬。点我一下试试。', 3600);
  }, 1800);

  /* ---------- 深夜模式提示（可选，靠 data 属性控制） ---------- */
  window.mascotDock = {
    say: say,
    sleep: function () { dog.dataset.sleep = '1'; }
  };
})();
