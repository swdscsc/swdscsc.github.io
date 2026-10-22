/* ============================================================
   timeline.js · 点状导航 + 点状时间轴
   参考 Codrops《Dot Navigation Styles》的思路（小圆点 + hover 标签
   + 当前项填充），以及常见的横向 timeline（圆点代表阶段，
   点一下展开对应内容），两者都用原生实现，不引入任何库。
   1) #dotnav    右侧固定的章节点：hover 出标签，点击平滑滚动到区块
   2) [data-dottl] 成长轨迹里的点状时间轴：点圆点展开那一段的叙述
   ============================================================ */
(function () {
  'use strict';

  /* ================= 1. 右侧章节点导航 ================= */
  function buildDotNav() {
    if (document.getElementById('dotnav')) return;
    var items = [];
    document.querySelectorAll('section[data-nav]').forEach(function (s) {
      items.push({ id: s.id, label: s.getAttribute('data-nav') });
    });
    if (items.length < 3) return;

    var nav = document.createElement('nav');
    nav.id = 'dotnav';
    nav.setAttribute('aria-label', '章节导航');
    items.forEach(function (it, i) {
      var a = document.createElement('a');
      a.href = '#' + it.id;
      a.className = 'dn-dot';
      a.setAttribute('data-target', it.id);
      a.setAttribute('aria-label', it.label);
      a.innerHTML = '<i></i><b>' + it.label + '</b>';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById(it.target || it.id);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + it.id);
      });
      nav.appendChild(a);
      void i;
    });
    document.body.appendChild(nav);

    // 滚动联动当前点
    var dots = Array.prototype.slice.call(nav.children);
    function sync() {
      var y = window.scrollY + window.innerHeight * 0.35;
      var active = 0;
      items.forEach(function (it, i) {
        var s = document.getElementById(it.id);
        if (s && s.offsetTop <= y) active = i;
      });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === active); });
    }
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ================= 2. 点状时间轴 ================= */
  var STAGES = [
    {
      y: '2023.09', t: '起点',
      d: '进入岭南师范学院读计算机科学与技术。那年最有成就感的事，是在黑漆漆的命令行里跑出第一个 Hello World。',
      tag: '重新开始'
    },
    {
      y: '2024', t: '第一个完整的东西',
      d: 'Java + JavaFX + SQLite 做了学生成绩文件管理系统：文档、答辩 PPT、运行解说视频全都配齐。第一次知道"能交付"不只是代码能跑。',
      tag: 'Java · SQLite'
    },
    {
      y: '2025', t: '硬件真的动起来了',
      d: 'ESP32 综合实训走通了驱动 → RTOS → LVGL → 联网；STM32 + ESP8266 通过 MQTT 接进华为云。AT 指令的时序把我教做人，也是从这时开始写排障文档。',
      tag: '嵌入式 · IoT'
    },
    {
      y: '2025 – 2026', t: '数据这条线',
      d: '乳腺癌分类、健康数据 Dash 看板、信用卡风控的 Stacking 与 SHAP。最大的收获是：指标口径比模型花哨重要得多。',
      tag: '数据 · AI'
    },
    {
      y: '2026', t: '安全与工程化',
      d: 'AES 加解密演示系统、网络爬虫、网络入侵检测、pytest 自动化框架。开始关心一个问题——别人能不能复现我做过的东西。',
      tag: '安全 · 测试'
    },
    {
      y: '现在', t: '下一步',
      d: '在看嵌入式 / 测试开发 / AI 应用的机会，深圳及湾区可随时到岗。正在补的是 RTOS 深水区和 CI 这一块。',
      tag: 'open to work'
    }
  ];

  function buildTimeAxis() {
    var host = document.querySelector('[data-dottl]');
    if (!host) return;

    var wrap = document.createElement('div');
    wrap.className = 'dottl';

    var track = document.createElement('div');
    track.className = 'dt-track';
    var line = document.createElement('div');
    line.className = 'dt-line';
    track.appendChild(line);

    var panel = document.createElement('div');
    panel.className = 'dt-panel';

    var fill = document.createElement('div');
    fill.className = 'dt-fill';
    track.insertBefore(fill, line);

    var current = STAGES.length - 1;
    STAGES.forEach(function (s, i) {
      var b = document.createElement('button');
      b.className = 'dt-dot' + (i === current ? ' cur' : '');
      b.setAttribute('aria-label', s.y + ' ' + s.t);
      b.innerHTML = '<i></i><span class="dt-y">' + s.y + '</span><span class="dt-t">' + s.t + '</span>';
      b.addEventListener('click', function () { open(i); });
      track.appendChild(b);
    });
    track.appendChild(document.createElement('div'));

    function open(i) {
      current = i;
      Array.prototype.slice.call(track.querySelectorAll('.dt-dot')).forEach(function (d, k) {
        d.classList.toggle('cur', k === i);
      });
      var s = STAGES[i];
      panel.innerHTML =
        '<span class="dt-badge">' + s.tag + '</span>' +
        '<h4>' + s.y + ' · ' + s.t + '</h4>' +
        '<p>' + s.d + '</p>';
      panel.classList.add('in');
      fill.style.width = (i / (STAGES.length - 1) * 100) + '%';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    wrap.appendChild(track);
    wrap.appendChild(panel);
    host.appendChild(wrap);
    open(current);
  }

  function boot() {
    buildDotNav();
    buildTimeAxis();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
