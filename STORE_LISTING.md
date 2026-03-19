CHROME WEB STORE LISTING
========================


EXTENSION DETAILS
-----------------

Extension Name:
PlayFaster

Short Description (132 characters max):
Control video & audio speed from 0.1x to 64x — with keyboard shortcuts, scroll wheel, and an on-page speed overlay.

Category:
Productivity

Language:
English (United States)


DETAILED DESCRIPTION
--------------------

PlayFaster gives you complete control over media playback speed on any website — no arbitrary 2x limits.

WHAT'S NEW IN v2.0
• On-page speed overlay — activate with a keyboard shortcut and control speed without opening the popup
• Customizable keyboard shortcut to toggle the overlay
• Configurable small step (scroll) and large step (Shift+scroll)
• Configurable min and max speed limits
• Fully redesigned popup with cleaner, bolder controls

FEATURES
• Speed range: 0.1x to 64x playback
• Click the buttons to step speed up or down by your configured increment
• Scroll the mouse wheel over the popup to nudge speed
• Type any value directly into the speed display
• Keyboard overlay: activate with your shortcut, then scroll or use arrow keys to adjust
• Speed persists across tabs, pages, and browser restarts
• Works inside cross-origin iframes and embedded players (e-learning platforms, SCORM content)

PERFECT FOR
• Professionals grinding through mandatory training videos
• Students skimming familiar lecture material
• Podcast listeners pushing past the 2x cap
• Content creators reviewing their own footage
• Anyone who processes information better at a different speed

HOW TO USE
1. Click the extension icon on any video or audio page
2. Adjust speed using the buttons or scroll the mouse wheel
3. Or type any value directly (0.1 to 64)
4. Use the gear icon to set a keyboard shortcut for the on-page overlay
5. Your preference automatically saves across sessions

PRIVACY
• No data collection or tracking
• Settings stored locally only
• Open source and transparent
• No external servers or analytics

Take back control of your time. Never be limited by arbitrary speed restrictions again.

Works on YouTube, Vimeo, Loom, Udemy, Coursera, LinkedIn Learning, EasyLlama, and any other video or audio platform.


PRIVACY POLICY
--------------

This extension does NOT:
• Collect any personal information
• Track your browsing activity
• Send data to external servers
• Access your browsing history
• Use analytics or telemetry

This extension DOES:
• Store your playback speed preference locally using Chrome's storage API
• Modify video and audio playback speed on pages you visit
• Access media elements (video/audio tags) on web pages

All data stays on your device. No information ever leaves your computer.

Last updated: March 2026

Privacy Policy URL:
https://playfaster.app/privacy.html


PROMOTIONAL TILE TEXT
---------------------

Control Your Speed
0.1x to 64x

Watch Smarter, Not Slower


TAGLINE OPTIONS
---------------

Your videos, your speed, your way
Speed up learning without slowing down comprehension
Because 2x isn't always fast enough
Take control of your learning pace
Power user speed controls for any video


TAGS / KEYWORDS
---------------

video speed control
playback speed
video accelerator
fast forward
speed up videos
audio speed
youtube speed
video speed controller
playback rate
speed control
video player
faster playback
slow motion
training videos
educational videos


JUSTIFICATION FOR PERMISSIONS
------------------------------

Storage:
Required to save your playback speed preference and settings so they persist across browser sessions and page reloads.

Scripting:
Required to inject the playback speed control into web pages and modify video/audio elements.

WebNavigation:
Required to detect when pages with video/audio content load so we can apply your speed preference automatically.

Host Permissions (all_urls):
activeTab cannot be used here because the extension must apply the user's saved speed preference automatically at page load (document_start), before any user gesture occurs. Additionally, videos on training platforms are frequently embedded in cross-origin iframes (e.g. a course page on one domain embeds a video player from another domain). Chrome's content script injection with all_frames: true requires host permissions for every frame origin, which are unknown in advance and vary by platform. There is no narrower permission that achieves this functionality.


SINGLE PURPOSE DESCRIPTION
---------------------------

This extension's single purpose is to provide enhanced playback speed control for video and audio elements on web pages, allowing users to watch and listen to content at their preferred speed.


TARGET AUDIENCE
---------------

Primary Users:
• Students and online learners
• Professionals completing mandatory training
• Content creators and video editors
• Podcast listeners
• People with accessibility needs
• Power users who consume lots of video content

Age Rating:
Everyone


SUPPORT INFORMATION
-------------------

Support Email:
info@playfaster.app

Support URL:
https://github.com/Whiteboard-Works/play-faster/issues

Homepage URL:
https://playfaster.app/


VERSION HISTORY
---------------

Version 2.0.0
• On-page speed overlay with keyboard shortcut activation
• Overlay buttons for step-back and step-forward speed control
• Fully redesigned popup — dark theme, bold speed circle, new icon
• Configurable keyboard shortcut, small/large step, min/max speed
• Scroll throttle for smoother trackpad experience
• New PlayFaster icon and branding

Version 1.0.2
• Build script and documentation updates
• Renamed package to playfaster.zip

Version 1.0 - Initial Release
• Playback speed control from 0.1x to 64x
• Fine-grained increment/decrement buttons (0.1x and 0.5x)
• Direct speed input with number field
• Mouse wheel support for quick adjustments
• Persistent speed preference across sessions
• Works on all video and audio platforms


SCREENSHOT CAPTIONS
-------------------

Screenshot 1 - Popup Interface:
Simple, intuitive speed controls - adjust by typing or using increment buttons

Screenshot 2 - YouTube Example:
Works seamlessly on YouTube and all major video platforms

Screenshot 3 - Speed Range:
Full range from 0.1x (slow motion) to 64x (ultra fast) playback

Screenshot 4 - Training Platform:
Perfect for e-learning and training videos

Screenshot 5 - Fine Control:
Mouse wheel support and precision increments for perfect speed tuning


RESPONSE TO COMMON REVIEW QUESTIONS
-------------------------------------

Q: Why does this need access to all websites? Why not use activeTab?
A: The activeTab permission only grants access when the user explicitly clicks the extension icon — it cannot apply the saved speed preference automatically at page load. This extension must run at document_start so the playback rate override is in place before any media begins playing. Furthermore, videos are routinely embedded in cross-origin iframes (e.g. a training site on one domain embedding a video player from another). Chrome requires explicit host permissions to inject content scripts into each iframe origin, which cannot be known in advance. The all_urls permission is the minimum required for the extension to function correctly.

Q: Why does this modify page behavior?
A: This is a video speed controller — modifying playback speed is its core functionality. It only modifies HTMLMediaElement playback rates and does not change any other page content or behavior.

Q: Is this circumventing platform restrictions?
A: This extension provides accessibility and usability features. Many users need faster or slower playback for various reasons (learning differences, time constraints, reviewing familiar content). The ability to control playback speed is a standard browser feature — we just make it easier to access and remember preferences.

Q: Does this collect user data?
A: No. The extension only stores the user's speed preference locally using Chrome's storage API. No data is transmitted anywhere.


NOTES FOR SUBMISSION
--------------------

• Test on multiple platforms before submitting (YouTube, Vimeo, training sites)
• Prepare 3-5 high-quality screenshots showing the extension in action
• Consider creating a simple demo video (optional but helpful)
• Be ready to respond to reviewer questions about permissions
• Emphasize accessibility and productivity benefits
• Avoid language about "bypassing" or "circumventing" restrictions
• Frame as enabling user control and accessibility features
