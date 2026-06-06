# 🐾 Claude Desktop Pet

A terminal-based desktop companion featuring Claude's iconic wave design. The pet wanders around, reacts to clicks and keyboard input, shows emotions, and keeps you company in your terminal.

```
  ╔══════════════╗
  ║              ║
  ║  ●        ●  ║      ← cute blinking eyes
  ║       ◡      ║      ← expressive mouth
  ║   ≈≈≈≈≈≈≈   ║      ← Claude wave motif (golden)
  ╚══════════════╝
   ♥  ♥  ♥  ♥  ♥        ← hearts when happy!
```

## Features

- **Autonomous behaviors** — wanders, sleeps, waves, shows emotions
- **Click / keyboard interaction** — pet the Claude blob, it reacts!
- **Mood system** — idle → happy → surprised → sleeping → waving
- **Speech bubbles** — the pet says random cute things
- **Claude brand design** — warm orange + golden wave pattern
- **Smooth animations** — frame-based with blinking and shimmer effects

## Installation

**Zero dependencies!** Just Node.js 16+ and a modern terminal.

```bash
cd claude-pet
# That's it — no npm install needed!
```

Requires a **modern terminal** with Unicode + ANSI support:
- **Windows:** Windows Terminal (recommended), ConEmu, Cmder
- **macOS:** iTerm2, Kitty, Alacritty, built-in Terminal.app
- **Linux:** GNOME Terminal, Konsole, Kitty, Alacritty

> ⚠️ The classic Windows `cmd.exe` may not render box-drawing characters correctly.
> Use **Windows Terminal** instead — it's free on the Microsoft Store.

## Usage

```bash
# Start the pet
npm start

# Or directly
node index.js
```

### Controls

| Input | Action |
|-------|--------|
| **Click** on pet | Pet it! (triggers happy/surprised/waving reaction) |
| **Space** | Same as click — pet the blob |
| **Arrow keys** | Guide the pet around the screen |
| **q / Esc / Ctrl+C** | Quit |

### Moods

| Mood | Trigger | What it looks like |
|------|---------|-------------------|
| **Idle** | Default state | Gentle shimmer, occasional blinks |
| **Happy** | Clicked, random joy | `^^` eyes, `▽` smile, floating hearts |
| **Surprised** | Sudden interaction, waking up | `OO` wide eyes, `○` round mouth |
| **Sleeping** | Ignored for too long | `‿‿` closed eyes, `zZZ` floating |
| **Waving** | Friendly interaction | `♥` hand wave greeting |

## Project Structure

```text
claude-pet/
├── package.json      # Node.js project config
├── index.js          # Main application (~350 lines, zero deps)
├── start.bat         # Windows launcher
├── start.sh          # Unix launcher (supports --float for xterm)
└── README.md         # This file
```

## How It Works

The pet is rendered using **pure ANSI escape codes** — no libraries, no dependencies. Unicode box-drawing characters (╔╗╚╝║═) form the character, and 24-bit ANSI colour codes apply Claude's brand palette directly to the terminal. Mouse and keyboard input are parsed from raw stdin.

Animation frames cycle at ~350 ms, while a separate behaviour timer triggers autonomous actions every ~4.8 seconds.

The **Claude wave pattern** (═══ / ≈≈≈) on the body is the character's distinctive feature — rendered in golden amber `#F5A623` while the rest of the body uses warm terracotta `#D97757`, matching Claude's brand identity.

## Troubleshooting

**Pet looks like garbled characters (乱码)**

Make sure you're using a modern terminal with Unicode support. On Windows, use **Windows Terminal** (free from the Microsoft Store) instead of the classic `cmd.exe`.

**"Terminal is too small" error**

Resize your terminal to at least 18 columns × 8 rows before starting.

**No colours visible**

Your terminal must support 24-bit true colour. Most modern terminals do — if yours doesn't, try Windows Terminal, iTerm2, or Kitty.

## License

MIT — feel free to modify and share!
