const DEFAULT_KB_SETTINGS = {
  shortcut: { ctrl: true, shift: true, alt: false, key: "s" },
  smallStep: 0.1,
  largeStep: 0.5,
  minSpeed: 0.5,
  maxSpeed: 4,
}

function ensureDefaults() {
  chrome.storage.local.get(["playbackRate", "kbSettings"], (data) => {
    const updates = {}
    if (data.playbackRate === undefined) updates.playbackRate = 2
    if (!data.kbSettings || typeof data.kbSettings !== "object") {
      updates.kbSettings = { ...DEFAULT_KB_SETTINGS }
    } else {
      const merged = { ...DEFAULT_KB_SETTINGS, ...data.kbSettings }
      if (JSON.stringify(merged) !== JSON.stringify(data.kbSettings)) {
        updates.kbSettings = merged
      }
    }
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates)
    }
  })
}

ensureDefaults()
chrome.runtime.onInstalled.addListener(ensureDefaults)
chrome.runtime.onStartup.addListener(ensureDefaults)

// Inject script into main world on every navigation
chrome.webNavigation.onCommitted.addListener((details) => {
  chrome.scripting
    .executeScript({
      target: { tabId: details.tabId, frameIds: [details.frameId] },
      files: ["inject.js"],
      world: "MAIN",
      injectImmediately: true,
    })
    .catch(() => {}) // Ignore errors for frames we can't access
})

function updateBadge(rate) {
  const text = rate === 1 ? "" : `${rate.toString().replace(/\.?0+$/, "")}x`
  chrome.action.setBadgeText({ text })
  chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" })
}

chrome.storage.local.get("playbackRate", (data) => {
  updateBadge(data.playbackRate || 2)
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.playbackRate) {
    updateBadge(changes.playbackRate.newValue)
  }
})

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "rateChanged") updateBadge(msg.rate)
})
