# PlayFaster

<p align="center">
  <img src="public/icon-128.png" alt="PlayFaster" width="128" height="128">
</p>

**Break free from the 2× limit.** PlayFaster is a browser extension (Chrome, Firefox) that lets you set _any_ playback speed from 0.1× to 64× on YouTube, Vimeo, Loom, corporate training portals, and more.

> 🔗 **Install from the Chrome Web Store:** [chromewebstore.google.com/detail/playfaster/fppcbkhpahkbgijkdcpjgjmhpfbmfiih](https://chromewebstore.google.com/detail/playfaster/fppcbkhpahkbgijkdcpjgjmhpfbmfiih) \
> 🌐 **Landing page & screenshots:** [https://playfaster.app](https://playfaster.app)

## Features

- **Wide Speed Range:** Control playback from 0.1x up to 64x speed (configurable min/max)
- **Fine-Grained Control:** Adjust speed by 0.1x or 0.5x increments with buttons (configurable)
- **Direct Input:** Type in any speed value for precise control
- **Mouse Wheel Support:** Scroll in the popup to adjust speed; Shift+scroll for larger steps
- **Keyboard Shortcut:** Press Ctrl+Shift+S (configurable) to activate overlay mode—adjust speed with arrow keys, scroll, or type a number—without opening the popup
- **Settings Panel:** Gear icon in the popup lets you customize shortcut, step sizes, and min/max speed
- **Badge:** Extension icon shows current speed when not 1x
- **Works Everywhere:** YouTube, Vimeo, Loom, training platforms, and more
- **Persistent Settings:** Your speed preference saves across page loads

## Why This Extension?

Many video players limit maximum playback speed to 2x. This is fine for most users, but if you're a fast learner, need to review content quickly, or have accessibility needs that benefit from faster playback, these artificial limits are frustrating.

This extension removes those limitations, giving you full control over your viewing experience.

## Installation

### Chrome Web Store (recommended)

1. Open the [PlayFaster listing](https://chromewebstore.google.com/detail/playfaster/fppcbkhpahkbgijkdcpjgjmhpfbmfiih)
2. Click **Add to Chrome** → **Add extension**
3. Pin it if you want quick toolbar access

### Manual install (developer mode)

1. Run `npm install` then `npm run build` (or `npm run build:firefox` for Firefox)
2. **Chrome:** Open `chrome://extensions` → Enable **Developer mode** → **Load unpacked** → select `.output/chrome-mv3/`
3. **Firefox:** Open `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select any file in `.output/firefox-mv2/`
4. The extension will appear in your toolbar immediately

## Usage

1. Navigate to any video or audio page (YouTube, Vimeo, training site, etc.)
2. **Popup:** Click the extension icon to open the speed controls
3. Adjust your playback speed using any method:
   - **Type directly:** Enter any value from 0.1 to 64
   - **Fine tune:** Click `<` or `>` to adjust by 0.1x (or your configured small step)
   - **Quick adjust:** Click `<<` or `>>` to adjust by 0.5x (or your configured large step)
   - **Mouse wheel:** Scroll up/down in the popup; hold Shift for larger steps
   - **Arrow keys:** Use ↑/↓ while the popup is open
4. **Keyboard shortcut (overlay mode):** Press Ctrl+Shift+S on any page with video to show a floating overlay. Type a number and press Enter, use arrow keys, or scroll to adjust—no popup needed. Press Esc to close.
5. The media will immediately play at your selected speed
6. Your preference persists across page reloads

## Use Cases

- **Fast Learners:** Consume educational content more efficiently
- **Review Sessions:** Quickly review material you're already familiar with
- **Time Savers:** Get through mandatory training videos faster
- **Accessibility:** Some users process audio information better at higher speeds
- **Content Creators:** Review your own content quickly during editing

## Privacy

This extension:

- ✓ Stores your speed preference and settings locally
- ✓ Only affects video playback on pages you visit
- ✗ Does NOT collect or transmit any data
- ✗ Does NOT track your browsing
- ✗ Does NOT access personal information

**[Read our full Privacy Policy](PRIVACY.md)**

## Support & links

- Issues & feature requests: [GitHub Issues](https://github.com/whiteboard-works/play-faster/issues)
- Website & screenshots: [playfaster.app](https://playfaster.app)
- Email: [info@playfaster.app](mailto:info@playfaster.app)

---

A [Whiteboard Works](https://whiteboardworks.com) project.
