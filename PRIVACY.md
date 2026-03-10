# Privacy Policy for PlayFaster

**Last Updated:** February 7, 2026

## Overview

PlayFaster ("the Extension") is committed to protecting your privacy. This privacy policy explains what data we collect (spoiler: none) and how the Extension operates.

## Data Collection

**The Extension does NOT collect, store, transmit, or share ANY of the following:**

- Personal information (name, email, address, etc.)
- Browsing history or activity
- Video or audio content you watch
- Websites you visit
- Search queries
- IP addresses
- Device information
- Analytics or usage statistics
- Cookies or tracking data

**In short: We collect ZERO data about you.**

## Local Storage

The Extension uses Chrome's local storage API (`chrome.storage.local`) to store only one piece of information:

- **Your playback speed preference** (a single number, e.g., "2.5")

This data:
- Stays entirely on your device
- Never leaves your computer
- Is not transmitted to any server
- Is not accessible to us or anyone else
- Can be cleared by uninstalling the Extension

## Permissions Explained

The Extension requires certain permissions to function. Here's what each permission is used for:

### Storage Permission
**Purpose:** Save your playback speed preference locally on your device.

**What it accesses:** Only the speed setting you choose (e.g., 2x, 3x, etc.)

**What it does NOT access:** Browsing history, passwords, personal data, or any other information.

### Scripting Permission
**Purpose:** Inject code into web pages to modify video and audio playback speed.

**What it accesses:** Only HTML video and audio elements on pages you visit.

**What it does NOT access:** Form data, passwords, cookies, or personal information.

### WebNavigation Permission
**Purpose:** Detect when pages load so the Extension can apply your speed preference automatically.

**What it accesses:** Notification that a page has loaded (not the page content).

**What it does NOT access:** Your browsing history or the content of pages you visit.

### Host Permissions (<all_urls>)
**Purpose:** Allow the Extension to work on all video platforms (YouTube, Vimeo, training sites, etc.) and handle videos embedded in iframes from different domains.

**What it accesses:** Video and audio elements on any website where they appear.

**What it does NOT access:** Page content, user inputs, or personal data.

## Third-Party Services

The Extension does NOT use any third-party services, including:

- No analytics services (Google Analytics, etc.)
- No advertising networks
- No tracking pixels
- No external APIs
- No cloud services
- No crash reporting tools

## How the Extension Works

1. You select a playback speed using the popup interface
2. The Extension saves your preference locally on your device
3. When you visit a page with video or audio, the Extension applies your speed preference
4. That's it. No data is sent anywhere.

## Children's Privacy

The Extension does not knowingly collect any information from anyone, including children under 13. Since we collect no data at all, the Extension is safe for users of all ages.

## Open Source

The Extension's source code is available for inspection. You can verify that it does not collect or transmit any data by reviewing the code.

## Changes to This Policy

If we ever change how the Extension handles data (which would require collecting data in the first place), we will update this privacy policy and the Extension's version number. Users will be notified through the Chrome Web Store update mechanism.

## Data Security

Since the Extension collects no data and transmits no data, there is no data to secure. Your playback speed preference is stored locally using Chrome's secure storage API.

## Your Rights

Since we collect no data about you, there is no data to:
- Request access to
- Request deletion of
- Request correction of
- Export or port

If you uninstall the Extension, your locally stored speed preference is automatically removed.

## Contact

If you have questions about this privacy policy or the Extension's operation, please:

- Open an issue on GitHub: [Your GitHub Repository URL]
- Email: [Your Email Address]

## Compliance

This Extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Children's Online Privacy Protection Act (COPPA)

Compliance is straightforward because we collect no data.

## Summary

**What we collect:** Nothing

**What we store:** Your speed preference (locally, on your device only)

**What we transmit:** Nothing

**Third parties we share with:** None

**Your privacy:** 100% protected

---

## Technical Details (For Developers)

The Extension's data usage is limited to:

```javascript
// This is the ONLY data operation in the entire extension
chrome.storage.local.set({ playbackRate: 2.5 });
chrome.storage.local.get('playbackRate', (data) => { ... });
```

That's it. One value, stored locally, never transmitted.

---

**Questions?** We're happy to clarify anything about how the Extension works. We believe in complete transparency about data and privacy.
