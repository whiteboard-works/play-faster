# Developer Guide - Chrome Web Store Submission

## Extension Name

**Enhanced Video & Audio Speed Control** - A general-purpose media playback speed controller.

## Positioning

This is a productivity tool for controlling video and audio playback speed across all web platforms (YouTube, Vimeo, Loom, training sites, etc.). It's positioned as an accessibility and efficiency tool, not specifically as a "bypass" or "unlocker."

## Files Required for Chrome Web Store

The extension zip must include:

### Required Files
- `manifest.json` - Extension configuration
- `background.js` - Service worker
- `content.js` - Content script for storage handling
- `inject.js` - Playback rate override code
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic
- `icon-16.png` - 16x16 icon
- `icon-48.png` - 48x48 icon
- `icon-128.png` - 128x128 icon

### Optional Files
- `README.md` - User-facing documentation (recommended for reviewers)

### Files to Exclude
- `.git/` - Version control
- `.gitignore` - Git configuration
- `CLAUDE.md` - Development notes
- `DEV_README.md` - This file
- `icon.svg` - Source SVG (not used by extension)

## Build Script

### Quick Build (macOS/Linux)
```bash
./build.sh
```

### Manual Build
```bash
# Create clean build directory
rm -rf build/
mkdir -p build/

# Copy required files
cp manifest.json build/
cp background.js build/
cp content.js build/
cp inject.js build/
cp popup.html build/
cp popup.js build/
cp icon-*.png build/
cp README.md build/

# Create zip for Chrome Web Store
cd build
zip -r ../playback-rate-unlocker.zip .
cd ..

echo "✓ Package created: playback-rate-unlocker.zip"
```

## Build Script Setup

Save the following as `build.sh` in the project root:

```bash
#!/bin/bash

# Playback Rate Unlocker - Chrome Web Store Build Script

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building Playback Rate Unlocker for Chrome Web Store...${NC}"

# Clean previous build
echo "Cleaning previous build..."
rm -rf build/
rm -f playback-rate-unlocker.zip

# Create build directory
echo "Creating build directory..."
mkdir -p build/

# Copy required files
echo "Copying extension files..."
cp manifest.json build/
cp background.js build/
cp content.js build/
cp inject.js build/
cp popup.html build/
cp popup.js build/
cp icon-16.png build/
cp icon-48.png build/
cp icon-128.png build/
cp README.md build/

# Create zip
echo "Creating zip archive..."
cd build
zip -r -q ../playback-rate-unlocker.zip .
cd ..

# Get zip size
SIZE=$(du -h playback-rate-unlocker.zip | cut -f1)

echo -e "${GREEN}✓ Build complete!${NC}"
echo ""
echo "Package: playback-rate-unlocker.zip"
echo "Size: $SIZE"
echo ""
echo "Ready to upload to Chrome Web Store Developer Dashboard:"
echo "https://chrome.google.com/webstore/devconsole"

# Clean up build directory
rm -rf build/
```

Make it executable:
```bash
chmod +x build.sh
```

## Chrome Web Store Submission Checklist

### 1. Test the Extension
- [ ] Load unpacked version in `chrome://extensions` with Developer mode
- [ ] Test on target e-learning platform
- [ ] Test playback rate selection (2x, 2.5x, 3x, 4x)
- [ ] Verify rate persists across page reloads
- [ ] Check for console errors

### 2. Prepare Store Listing

#### Required Assets
- [ ] Extension package (enhanced-video-audio-speed.zip)
- [ ] Store icon: 128x128 PNG (use `icon-128.png`)
- [ ] Small promo tile: 440x280 PNG
- [ ] Marquee promo tile: 1400x560 PNG (optional)
- [ ] Screenshots: 1280x800 or 640x400 PNG/JPG (at least 1, max 5)

**Screenshot Tips:**
- Show the popup interface with the speed input and increment/decrement buttons
- Demonstrate use on popular platforms (YouTube, Vimeo, etc.)
- Highlight the speed range (0.1x - 16x)
- Show before/after of speed controls on a video player

#### Store Listing Text

**Short description (132 characters max):**
```
Fine-tune video & audio playback speed from 0.1x to 16x. Perfect for power users, fast learners, and accessibility needs.
```

**Detailed description (400+ characters recommended):**
```
Enhanced Video & Audio Speed Control gives you complete control over media playback speed across all websites.

FEATURES:
• Wide speed range: 0.1x to 16x playback
• Fine-grained controls: adjust by 0.1x or 0.5x increments
• Direct input: type any speed value for precision
• Mouse wheel support: scroll to adjust speed quickly
• Works everywhere: YouTube, Vimeo, Loom, training platforms, and more
• Persistent: your preference saves across sessions

PERFECT FOR:
• Fast learners who want to consume content efficiently
• Students reviewing familiar material
• Professionals working through training videos
• Content creators previewing their work
• Anyone with accessibility needs who processes audio better at different speeds

PRIVACY:
• No data collection or tracking
• Settings stored locally only
• Open source and transparent

Take control of your learning pace. Never be limited by arbitrary speed restrictions again.
```

- [ ] Category: Productivity
- [ ] Language: English

### 3. Submit for Review
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload `playback-rate-unlocker.zip`
4. Fill in store listing details
5. Pay $5 one-time developer registration fee (if first submission)
6. Submit for review

### 4. Review Process
- **Typical review time:** 1-3 business days
- **Status:** Check dashboard for review status
- **Common rejection reasons:**
  - Permissions not justified in description
  - Missing privacy policy (if collecting data)
  - Misleading screenshots or description

## Version Updates

When updating the extension:

1. Update version in `manifest.json`:
   ```json
   "version": "1.1"
   ```

2. Rebuild the package:
   ```bash
   ./build.sh
   ```

3. Upload to Chrome Web Store dashboard
4. Update "What's new in this version" section

## Permissions Justification

If reviewers ask about permissions (include in store description):

- **storage:** Save user's playback rate preference across sessions
- **scripting:** Inject playback rate override into page context
- **webNavigation:** Detect when course pages load to apply settings
- **host_permissions (all_urls):** Extension works across different e-learning platforms and nested iframes

## Privacy Policy

If Chrome Web Store requires a privacy policy (for any data collection):

This extension does NOT:
- Collect personal information
- Track user behavior
- Send data to external servers
- Access browsing history

This extension DOES:
- Store playback rate preference locally using Chrome's storage API
- Modify video/audio playback speed on web pages
- Access media elements on pages you visit

## Notes

- The extension modifies browser behavior, which may be against some platforms' Terms of Service
- Consider adding a disclaimer in the store description
- The extension is for educational/accessibility purposes (e.g., users who can comfortably process information faster)
- Some reviewers may flag extensions that bypass platform limitations

## Useful Commands

```bash
# Quick build
./build.sh

# Test locally
# Open chrome://extensions, enable Developer mode, click "Load unpacked", select project folder

# Check manifest validity
# Upload to https://manifest-validator.appspot.com/

# Inspect extension
# chrome://extensions > Details > Inspect views: service worker
```

## Troubleshooting Build Issues

### "Permission denied" when running build.sh
```bash
chmod +x build.sh
```

### Zip command not found (Windows)
Install via WSL or use Git Bash, or use a GUI tool like 7-Zip

### Files missing from zip
Check that all files listed in "Required Files" section exist in project directory

## Resources

- [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/quality_guidelines/)
