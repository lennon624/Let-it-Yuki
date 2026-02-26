<div align="center">

<!-- <img src="./assets/hero.gif" alt="letityuki Demo" width="100%" style="border-radius: 8px; border: 1px solid #eaeaea; margin-bottom: 24px;"> -->

# ❄️ letityuki.

*Bring a gentle snowfall to your screen.*

<br>
</div>

> Google AI Studio used to have this beautiful, hidden snow easter egg. That quiet, unobtrusive vibe was the absolute perfect "visual white noise" for late-night coding (until they quietly killed it off 😭).
> 
> Since the official one is gone, I decided to hand-roll my own—and make it work on **any webpage**. By heavily relying on parallax scrolling and opacity mapping, I managed to fake some decent 3D depth on a flat 2D screen. It doesn't get in your way; it's just here to keep you company.

<br>

### Under the Hood

- **Faking 3D (Parallax Depth)**: Large flakes fall fast in the foreground, while tiny, semi-transparent ones drift slowly in the back. Brute-forcing real depth with physics.
- **Silky Smooth**: Pure vanilla Canvas rendering. **Absolutely zero DOM pollution (no screen full of `div` trash).** Uses an object pool to recycle 200 snowflakes. Even at max density, it runs at a rock-solid 60fps without sweating your RAM.
- **Sine Wave Wind**: Ditched the boring straight-down logic. Slapped a `Math.sin()` on it so the flakes sway naturally in an "S" shape. Every flake has its own unique swing frequency.
- **Goodbye Pixelation**: Combined radial gradients with `shadowBlur` to make the snowflakes look soft and fluffy.
- **Smart Dark/Light Mode**: If your page is in **Dark Mode**, flakes use the `lighter` blend mode to emit a soft glow. In **Light Mode**, it switches to `source-over` with a faint blueish semi-transparent drop shadow, ensuring the snow looks elegant everywhere.
- **Minimalist UI**: One click to toggle. No bloated menus.
- **Speaks Your Language**: Auto-adapts to English, Simplified Chinese, and Japanese.

<br>

### Installation

Too lazy to publish it to the Chrome Web Store yet, so you'll have to load it the "hardcore" way for now:

1. **Download & Extract**: Grab the latest `letityuki-v1.x.x.zip` from the [Releases page](https://github.com/lennon624/Let-it-Yuki/releases) and unzip it.
2. **Open Extensions**: Type `chrome://extensions/` (or `edge://extensions/`) in your browser.
3. **The Hardcore Part**:
   - Toggle **"Developer mode"** on the top right.
   - Click **"Load unpacked"** and select the folder you just extracted.

*Done. Pro tip: pin the puzzle icon to your toolbar so you can make it snow whenever.*

<br>

### Usage

Click the ❄️ icon to pop open the panel:

<!-- <img src="./assets/popupEN.jpg" alt="Popup UI" width="280" style="border-radius: 6px; border: 1px solid #eaeaea; margin: 16px 0;"> -->

- **Snow**: The master switch. Let it snow.
- **Mode**:
  - `Powder`: Barely there. Perfect for deep-focus coding or reading.
  - `Steady`: The default. Just the right amount of chill.
  - `Blizzard`: Screen full of snow. Great for zoning out.
- **Density**: Not enough snow? Drag the slider and make your own storm.

<br>

### License

Open-sourced under the [MIT License](./LICENSE). Take it and play with it.

<br>

<div align="center">
  <sub>💗 Come feel the heat, forever and forever. 💗</sub>
</div>