# Play Faster

A Chrome extension that bypasses playback rate limits on e-learning platforms, specifically targeting EasyLlama courses hosted on Go1.

## What It Does

Many e-learning platforms limit video/audio playback speed to 2x to ensure learners don't rush through content. This extension:

1. **Spoofs the `playbackRate` getter** - When the platform checks `media.playbackRate`, it always returns ≤2, even if the actual rate is higher
2. **Sets your desired playback rate** - Automatically applies your selected speed (2x, 2.5x, 3x, or 4x) to all audio/video elements
3. **Provides a simple popup UI** - Click the extension icon to select your speed

## How the Rate Limiting Works (EasyLlama)

EasyLlama's code includes a check that runs every 3 seconds:

```javascript
setInterval(() => {
  let rate = mediaElement.playbackRate
  if (rate !== undefined && rate > 2) {
    window.location.reload()
  }
}, 3000)
```

This reloads the page whenever it detects a playback rate above 2x.

## How the Bypass Works

We override `HTMLMediaElement.prototype.playbackRate` with a spoofed getter:

```javascript
const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate")
Object.defineProperty(HTMLMediaElement.prototype, "playbackRate", {
  get: function () {
    const real = desc.get.call(this)
    return real > 2 ? 2 : real // Lie to the checker
  },
  set: function (val) {
    desc.set.call(this, val) // Actually set the real value
  },
})
```

The setter applies the real rate, but the getter returns max 2. The platform's check sees "2" while audio plays at 3x.

## Obstacles Encountered

### 1. Cross-Origin Iframes

The course content is nested in multiple cross-origin iframes (Go1 → SCORM adapter → EasyLlama). JavaScript's Same-Origin Policy prevents accessing these from the parent page.

**Solution:** Chrome extensions with `all_frames: true` inject content scripts into every frame regardless of origin.

### 2. Content Script Isolation

Chrome content scripts run in an isolated JavaScript context. Modifying `HTMLMediaElement.prototype` in the content script doesn't affect the page's prototype.

**Solution:** Use `chrome.scripting.executeScript` with `world: 'MAIN'` to inject code directly into the page's JavaScript context.

### 3. Content Security Policy (CSP)

The page's CSP blocks inline script injection (`<script>` elements with inline code).

**Solution:** The `chrome.scripting` API with `world: 'MAIN'` bypasses CSP restrictions.

### 4. Cross-Frame Storage

The playback rate setting needs to be shared across all frames.

**Solution:** Use `chrome.storage.local` which is accessible from all content scripts, with `chrome.storage.onChanged` listeners to sync updates.

## File Structure

```
├── manifest.json      # Extension config with permissions
├── background.js      # Service worker - injects override into main world
├── inject.js          # Override code - runs in page context
├── content.js         # Storage handling and rate setting
├── popup.html         # Speed selection UI
├── popup.js           # Popup logic
├── eslint.config.mjs  # ESLint 9 flat config
├── .prettierrc        # Prettier config
├── .cursor/rules/     # AI enforcement (code-style.mdc)
└── script.js          # Original manual script (for reference)
```

## Lint & Format

ESLint 9 (flat config) + Prettier. Run from project root:

```bash
npm install           # first-time setup
npm run lint          # check lint
npm run lint:fix      # auto-fix lint
npm run format        # format with Prettier
npm run format:check  # check formatting
```

Config: `eslint.config.mjs`, `.prettierrc`. `.cursor/rules/code-style.mdc` enforces these conventions for AI edits.

GitHub Actions (`.github/workflows/lint.yml`) runs lint and format checks on push and pull requests to `master`. PRs must pass before merge.

## Installation

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder

## Usage

1. Navigate to your e-learning course
2. Click the extension icon
3. Select your desired speed (2x, 2.5x, 3x, or 4x)
4. The speed persists across page loads
