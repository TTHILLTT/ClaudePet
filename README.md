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
| Natural blink — switches between two model files (2.8s open / 0.2s blink) | 自然眨眼 — 两个模型文件轮流播放（2.8s 睁眼 / 0.2s 闭眼） |
| Click / Space to interact — triggers happy / surprised / waving | 点击 / 空格互动 — 触发开心 / 惊讶 / 挥手 |
| Speech bubbles with random cute quotes | 随机台词说话气泡 |
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
> ⚠️  经典 `cmd.exe` 可能无法正确渲染，请使用 **Windows Terminal**。

---

## 🎮 Controls · 操作

| Input · 输入 | Action · 作用 |
|-------------|--------------|
| **Click** on pet · 点击宠物 | Pet it! · 撸它！(开心/惊讶/挥手) |
| **Space** · 空格 | Same as click · 同上 |
| **Arrow keys** · 方向键 | Move the pet · 移动宠物 |
| **q / Esc / Ctrl+C** | Quit · 退出 |

---

## 😊 Moods · 表情

| Mood · 状态 | Trigger · 触发 | Effect · 效果 |
|------------|---------------|--------------|
| **Idle** · 待机 | Default · 默认 | Blink cycle (2.8s open → 0.2s closed) · 眨眼循环 |
| **Happy** · 开心 | Click / random · 点击/随机 | Hearts below · 下方冒爱心 ♥ |
| **Surprised** · 惊讶 | Sudden click / wake · 突然点击/醒来 | Speech bubble · 说话气泡 |
| **Sleeping** · 睡觉 | Ignored too long · 太久不理 | ZZZ below · 下方飘 ZZZ |
| **Waving** · 挥手 | Click · 点击 | ♥ sparkle · ♥ 闪烁 |

---

## 📁 Files · 文件

```text
claude-pet/
├── index.js            # Main application · 主程序 (zero deps · 零依赖)
├── package.json        # Node.js config
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

**EN:** The pet uses **pure ANSI escape codes** — alternate screen buffer, 24-bit colours, cursor positioning, and SGR mouse tracking. All rendering is merged into a single `write()` per frame to avoid flicker. Keyboard and mouse input are parsed directly from raw stdin.

**ZH:** 宠物使用**纯 ANSI 转义序列** — 交替屏幕缓冲区、24 位颜色、光标定位和 SGR 鼠标追踪。每帧所有渲染合并为一次 `write()` 以避免闪烁。键盘和鼠标输入从原始 stdin 直接解析。

```
┌──────────────────────────────────────────┐
│  Terminal · 终端                          │
│  ┌──────────────────────────────────┐    │
│  │  Speech Bubble · 说话气泡          │    │
│  │  ╭──────────────────╮            │    │
│  │  │ Hello! 👋        │            │    │
│  │  ╰──────────────────╯            │    │
│  └──────────────────────────────────┘    │
│         ▐▛███▜▌     ← Claude wave        │
│        ▝▜█████▛▘                          │
│          ▘▘ ▝▝                            │
│                                           │
│  Tick: 500ms · Behaviour: 4.8s            │
│  Single write() per frame · 每帧一次写入    │
└──────────────────────────────────────────┘
```

---

## 🎨 Customisation · 自定义

Edit `ClaudeModel.txt` and `ClaudeModel2.txt` in the parent directory to change the pet's shape. The files use Unicode block characters:

```
▐▛███▜▌     ← ▐▛ = left cap, ▛ = left eye, ▜ = right eye, ▜▌ = right cap
▝▜█████▛▘   ← ▝▜ = left cap, ▛▘ = right cap
▘▘ ▝▝       ← fragments
```

Colours and timing can be adjusted at the top of `index.js`:
- `CLR.orange` / `CLR.gold` — wave colour
- `TICK_MS` — animation rate (default 500ms)
- `BEHAVE_MS` — mood change interval (default 4.8s)
- `SPEECH_MS` — bubble duration (default 3.2s)

---

## ❓ Troubleshooting · 故障排查

| Problem · 问题 | Solution · 解决 |
|---------------|----------------|
| Garbled characters · 乱码 | Use Windows Terminal / iTerm2 / Kitty (not cmd.exe) |
| Terminal too small · 终端太小 | Resize to ≥ 20 cols × 8 rows |
| No colours · 无颜色 | Terminal must support 24-bit true colour |
| Speech bubble misaligned · 气泡错位 | Ensure terminal supports full Unicode (UTF-8) |

---

## 📄 License · 许可

MIT — feel free to modify and share! · 自由修改和分享！
