# 沈炜丹 · 个人网站（四版 · 两族）

一套静态个人站，四个页面、**两种画风族群**。设计目标是：让 UI 从插画里长出来，
而不是"在网页里贴几张插画"。

## 页面

| 文件 | 族 | 画风 | 主视觉 |
| --- | --- | --- | --- |
| `index.html` | 奶油族 cream | 奶油水彩 + 大留白 | `styleB-chimo-v4.png` |
| `gallery.html` | 奶油族 cream | 美术馆展墙（浅色纸面） | `styleB-chimo-v4.png` |
| `styleA.html` | 漫画族 comic | 美式漫画（粗黑边 + 硬阴影） | `styleA-ramonn90-v5.png` |
| `editorial.html` | 漫画族 comic | 美式社论杂志（细边克制版） | `styleA-ramonn90-v5.png` |

配套：`404.html`（小黄把页面叼走了）、`robots.txt`、`sitemap.xml`。

## 统一性怎么做到的

统一感不靠"每个页面长得一样"，靠**一套骨架 + 换皮肤**。

- `assets/unified.css` —— 统一设计系统
  - **令牌**：`--ease / --dur / --ui-radius / --ui-shadow / --ui-stroke / --ui-tilt`
  - **皮肤**：`body[data-style="cream"|"comic"]` 只换颜色与边的粗硬，骨架不动
  - **一张纸**：`#paper-grain`（颗粒）+ `#paper-wash`（淡彩晕染）铺满全站，
    插画和 UI 落在同一张纸上
  - **卡片同语**：`--ui-stroke-w` 描边 + `--ui-shadow` 硬/软阴影 + 轻微歪斜，
    让卡片和插画用的是同一种线条语言
- `assets/delight.js` —— 全站共享的小巧思，按元素存在性自动启用，缺什么都不报错

## 小巧思清单

| # | 巧思 | 说明 |
| --- | --- | --- |
| 1 | 纸张层 | 颗粒 + 三处淡彩晕染，`multiply` 混合，全站同一张纸 |
| 2 | 自定义光标 | 漫画族 🐾 / 奶油族 💛，阻尼跟随，悬停可点区放大 |
| 3 | 进度条小狗 | 🐾 沿着顶部进度条跑，越往下越歪 |
| 4 | 图片渐显 | blur-up，加载完才清晰 |
| 5 | 卡片歪斜 | 用 `rotate` 独立属性（不覆盖 `transform`），hover 归零 |
| 6 | 章节小狗编号 | 每个 `h2` 前一只小狗 + 序号，全站签名元素 |
| 7 | 手绘波浪分隔 | section 之间手绘波浪线，不是 CSS 直线 |
| 8 | 胶带贴纸 | 主视觉图角上贴胶带，像手工拼贴 |
| 9 | NOW 卡 | 右下角"此刻我在做什么"，可收起 |
| 10 | 页脚时钟 / 停留计时 | 你那里几点 · 在这页待了多久 |
| 11 | 快捷键 | `/` 提示、`K` 命令面板、`T` 回顶部、`Esc` 关闭 |
| 12 | 回到顶部 | 滚过 700px 出现 |
| 13 | 图片灯箱 | 点大图放大，`Esc` 或点击关闭 |
| 14 | Toast | 复制反馈等 |
| 15 | 导航智能隐藏 | 向下滚隐藏，向上滚出现 |
| 16 | logo 连点彩蛋 | 点 5 下 → 爪印 + 星星雨 |

## 其他脚本

- `site.js` —— 滚动渐入、进度条、导航高亮、数字滚动、项目弹窗、复制、FAQ
- `mascot.js` —— 左下角 SVG 骨骼小狗跟班（会转头看你，点击会叫）
- `timeline.js` —— 章节点导航 + 成长轨迹时间轴
- `extras.js` —— ⌘K 命令面板、项目深链接、阅读时长、Konami 彩蛋、背景视差
- `usa.js` —— 漫画族专属：放射速度线 + 拟声词贴纸

## 想微调

| 想改什么 | 改哪里 |
| --- | --- |
| 边的粗细 / 阴影硬软 | `unified.css` 里 `body[data-style=...]` 的 `--ui-stroke-w` / `--ui-shadow` |
| 背景颗粒浓淡 | `--ui-grain` |
| 卡片歪斜幅度 | `--ui-tilt` |
| 小狗跟班动作幅度 | `mascot.js` 顶部 `MAX_HEAD / MAX_PUPIL / DAMP` |
| 小狗大小 | 各页 `#dogMascot{width:104px}` |
| 背景插画浓淡 | 各页 `.bgart` 的 `opacity` |

## 校验

```bash
python check.py      # CSS 花括号配平 / HTML 标签配平 / 图片存在 / 小狗版本
node --check assets/delight.js
```

## 发布

静态站，直接推到 GitHub Pages（`swdscsc.github.io`）即可，无需构建。
