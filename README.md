# 🐾 Claude Desktop Pet · Claude 桌面宠物

> EN: A terminal desktop companion featuring the authentic Anthropic Claude wave logo.  
> ZH: 一只跑在终端里的桌面宠物，使用 Anthropic Claude 标志性的波浪 logo。

```
        ▐▛███▜▌            ← EN: ▛ ▜ are the eyes
       ▝▜█████▛▘           ← ZH: ▛ ▜ 就是她的眼睛
         ▘▘ ▝▝             ←     眨眼: ▐▛███▜▌ → ▐█████▌
```

---

## ✨ Features · 功能

| EN | ZH |
|----|----|
| Authentic Claude wave logo from `ClaudeModel.txt` | 真实的 Claude 波浪 logo，由 `ClaudeModel.txt` 定义 |
| Natural blink — two model files alternate (2.8s open / 0.2s blink) | 自然眨眼 — 两个模型文件轮流播放（2.8s 睁眼 / 0.2s 闭眼） |
| **Live HN news** — fetches Hacker News headlines every 10s | **实时 HN 新闻** — 每 10 秒抓取 Hacker News 头条 |
| **Click news bubble → opens article in browser** | **点击新闻气泡 → 浏览器打开原文** |
| Multi-line adaptive bubbles (auto-wrap for long news) | 多行自适应气泡（长新闻自动换行） |
| 30+ random interactive quips on click / idle | 30+ 条随机互动台词（点击/待机） |
| Click / Space → happy / surprised / waving moods | 点击 / 空格 → 开心 / 惊讶 / 挥手 |
| Arrow keys move, q / Esc quits | 方向键移动，q / Esc 退出 |
| Auto-center in terminal, adapts on resize | 自动居中，窗口缩放时自适应 |
| Zero dependencies — pure Node.js + ANSI | 零依赖 — 纯 Node.js + ANSI |

---

## 📦 Installation · 安装

**Zero dependencies! · 零依赖！** Node.js 16+ and a modern terminal / 一个现代终端即可。

```bash
cd claude-pet
node index.js
```

Requires a terminal with **Unicode + 24-bit colour** support · 需要支持 Unicode + 24 位真彩色的终端：

| OS | Recommended · 推荐 |
|----|-------------------|
| Windows | **Windows Terminal** (Microsoft Store) |
| macOS | iTerm2, Kitty, Alacritty |
| Linux | GNOME Terminal, Konsole, Kitty |

> ⚠️  Classic `cmd.exe` may not render correctly. Use **Windows Terminal**.  

---

## 🎮 Controls · 操作

| Input · 输入 | Action · 作用 |
|-------------|--------------|
| **Click** on pet · 点击宠物 | Pet it! · 撸它！(开心/惊讶/挥手/说话) |
| **Click** on `[HN]` bubble · 点击新闻气泡 | Open article in browser · 浏览器打开原文 |
| **Space** · 空格 | Same as clicking pet · 同上 |
| **Arrow keys** · 方向键 | Move the pet · 移动宠物 |
| **q / Esc / Ctrl+C** | Quit · 退出 |

---

## 😊 Moods · 表情

| Mood · 状态 | Trigger · 触发 | Effect · 效果 |
|------------|---------------|--------------|
| **Idle** · 待机 | Default · 默认 | Blink cycle + random quips · 眨眼 + 随机碎碎念 |
| **Happy** · 开心 | Click / random · 点击/随机 | Hearts below · 下方冒爱心 ♥ |
| **Surprised** · 惊讶 | Sudden click / wake · 突然点击/醒来 | Speech bubble · 说话气泡 |
| **Sleeping** · 睡觉 | Ignored too long · 太久不理 | ZZZ below · 下方飘 ZZZ |
| **Waving** · 挥手 | Click · 点击 | ♥ sparkle · ♥ 闪烁 |
| **News** · 新闻 | Auto every 10s · 每 10 秒自动 | `[HN]` multi-line bubble · 多行气泡播报 |

---

## 📰 News · 新闻

The pet fetches headlines from [Hacker News](https://news.ycombinator.com/) every 10 seconds via the official Firebase API (`hacker-news.firebaseio.com`). Stories are randomly picked from the top 200. Long headlines auto-wrap into multi-line speech bubbles.

宠物每 10 秒从 Hacker News 抓取头条，随机抽取前 200 条之一，长标题自动换行为多行气泡。

**Click the `[HN]` bubble** and your default browser opens the full article.  
**点击 `[HN]` 气泡**，默认浏览器会打开对应新闻原文。

| Setting · 设置 | Value · 值 |
|---------------|-----------|
| Interval · 间隔 | `NEWS_INTERVAL` = 10 s |
| Display time · 显示时长 | 8 s |
| Pool · 池 | Top 200 stories · 前 200 条 |
| Bubble width · 气泡宽度 | Multi-line, max 50 cols · 多行，最大 50 列 |
| Click action · 点击行为 | Open URL in browser · 浏览器打开 |

---

## 📁 Files · 文件

```text
claude-pet/
├── index.js            # Main application · 主程序 (zero deps · 零依赖)
├── package.json        # Node.js config
├── LICENSE             # MIT License
├── start.bat           # Windows launcher · Windows 启动脚本
├── start.sh            # Unix launcher · Unix 启动脚本
└── README.md           # This file · 本文件
```

Plus two model files in the parent directory · 上级目录有两个模型文件：

| File · 文件 | Role · 作用 |
|------------|------------|
| `../ClaudeModel.txt` | Eyes open · 睁眼 (2.8 s) |
| `../ClaudeModel2.txt` | Eyes closed · 闭眼 (0.2 s) |

Edit these `.txt` files to customise the pet's appearance · 修改这两个 `.txt` 即可自定义宠物外观。

---

## 🔧 How It Works · 原理

**EN:** The pet uses **pure ANSI escape codes** — alternate screen buffer, 24-bit colours, cursor positioning, and SGR mouse tracking. All rendering (erase + pet + bubble) is merged into a single `write()` per frame to eliminate flicker. Keyboard and mouse input are parsed from raw stdin. News is fetched via Node.js built-in `https` module; bubble clicks use `child_process.exec` to open the browser — all zero extra dependencies.

**ZH:** 宠物使用**纯 ANSI 转义序列** — 交替屏幕缓冲区、24 位颜色、光标定位和 SGR 鼠标追踪。每帧所有渲染（擦除 + 宠物 + 气泡）合并为一次 `write()` 以消除闪烁。键盘和鼠标输入从原始 stdin 直接解析。新闻通过 Node.js 内置 `https` 模块抓取，点击气泡通过 `child_process.exec` 打开浏览器 — 全部零额外依赖。

```
┌──────────────────────────────────────────────┐
│  Terminal · 终端                              │
│  ┌──────────────────────────────────────┐    │
│  │  News Bubble · 新闻气泡 ← click to open│    │
│  │  ╭────────────────────────────────╮  │    │
│  │  │ [HN] OpenAI announces new model │  │    │
│  │  │ that can do both reasoning and │  │    │
│  │  │ creative work simultaneously   │  │    │
│  │  ╰────────────────────────────────╯  │    │
│  └──────────────────────────────────────┘    │
│         ▐▛███▜▌     ← Claude wave            │
│        ▝▜█████▛▘                              │
│          ▘▘ ▝▝                                │
│                                               │
│  Tick: 500ms · Behaviour: 4.8s · News: 10s    │
│  Single write() per frame · 每帧一次写入        │
└──────────────────────────────────────────────┘
```

---

## 🎨 Configuration · 可配置项

Key constants at the top of `index.js` · `index.js` 顶部可调参数：

| Constant · 常量 | Default · 默认 | Meaning · 含义 |
|----------------|---------------|---------------|
| `TICK_MS` | 500 | Frame interval · 帧间隔 |
| `BEHAVE_MS` | 4800 | Mood change interval · 表情切换间隔 |
| `SPEECH_MS` | 3200 | Quip bubble duration · 闲聊气泡时长 |
| `NEWS_INTERVAL` | 10000 | News fetch interval · 新闻抓取间隔 |
| `CLR.gold` | #C15F3C | Pet main colour · 宠物主色 |
| `QUOTES` | 30+ lines | Random idle speech · 随机碎碎念 |
| `GREET_QUOTES` | 7 lines | Click reaction speech · 点击反应台词 |

---

## ❓ Troubleshooting · 故障排查

| Problem · 问题 | Solution · 解决 |
|---------------|----------------|
| Garbled characters · 乱码 | Use Windows Terminal / iTerm2 / Kitty (not cmd.exe) |
| Terminal too small · 终端太小 | Resize to ≥ 20 cols × 8 rows |
| No colours · 无颜色 | Terminal must support 24-bit true colour |
| No news · 无新闻 | Check firewall / proxy allows `hacker-news.firebaseio.com` |
| Bubble click not working · 点击气泡无反应 | Ensure `_lastSpX/Y/W/H` correctly tracks bubble bounds |
| Speech bubble misaligned · 气泡错位 | Ensure terminal supports full Unicode (UTF-8) |

---

## 📄 License · 许可

MIT — see [LICENSE](claude-pet/LICENSE) · 详见 [LICENSE](claude-pet/LICENSE)
