// ---- Throttle helper ----

function throttle(fn, ms) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      fn.apply(this, args)
    }
  }
}

// ---- Settings defaults (declared first so all handlers below can reference kbSettings safely) ----

const DEFAULT_KB_SETTINGS = {
  shortcut: { ctrl: true, shift: true, alt: false, key: "s" },
  smallStep: 0.1,
  largeStep: 0.5,
  minSpeed: 0.5,
  maxSpeed: 4,
}

// Fix #1: initialize synchronously so button handlers never see null/undefined
let kbSettings = mergeSettings({})

// ---- Speed controls ----

const input = document.getElementById("speed")

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function round(val) {
  return Math.round(val * 100) / 100
}

function setRate(newRate) {
  const clampedRate = clamp(round(newRate), kbSettings.minSpeed, kbSettings.maxSpeed)
  input.value = clampedRate
  chrome.storage.local.set({ playbackRate: clampedRate })
  // Fix #2: notify background to update badge even if service worker was dormant
  chrome.runtime.sendMessage({ type: "rateChanged", rate: clampedRate }).catch(() => {})
}

// Single storage read for faster popup load (was 2 separate async calls)
chrome.storage.local.get(["playbackRate", "kbSettings"], (data) => {
  input.value = data.playbackRate || 2
  kbSettings = mergeSettings(data.kbSettings || {})
  populateSettings(kbSettings)
})

document
  .getElementById("btnLargeDown")
  .addEventListener("click", () =>
    setRate((Number.parseFloat(input.value) || 2) - kbSettings.largeStep)
  )
document
  .getElementById("btnSmallDown")
  .addEventListener("click", () =>
    setRate((Number.parseFloat(input.value) || 2) - kbSettings.smallStep)
  )
document
  .getElementById("btnSmallUp")
  .addEventListener("click", () =>
    setRate((Number.parseFloat(input.value) || 2) + kbSettings.smallStep)
  )
document
  .getElementById("btnLargeUp")
  .addEventListener("click", () =>
    setRate((Number.parseFloat(input.value) || 2) + kbSettings.largeStep)
  )

input.addEventListener("change", () => {
  setRate(Number.parseFloat(input.value) || 2)
})

input.addEventListener("wheel", throttle((e) => {
  e.preventDefault()
  const delta = e.deltaY < 0 ? kbSettings.smallStep : -kbSettings.smallStep
  setRate((Number.parseFloat(input.value) || 2) + delta)
}, 200))

// ---- Settings Panel ----

const gearBtn = document.getElementById("gearBtn")
const settingsPanel = document.getElementById("settingsPanel")
const shortcutInput = document.getElementById("shortcutInput")
const smallStepInput = document.getElementById("smallStep")
const largeStepInput = document.getElementById("largeStep")
let recordingShortcut = false

// Fix #8: handle special keys in shortcut display
const KEY_LABELS = {
  ".": "Period",
  " ": "Space",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Escape: "Esc",
  Enter: "Enter",
  Backspace: "Backspace",
  Tab: "Tab",
}

function formatShortcut(sc) {
  if (!sc) return "None"
  const parts = []
  if (sc.ctrl) parts.push("Ctrl")
  if (sc.shift) parts.push("Shift")
  if (sc.alt) parts.push("Alt")
  parts.push(KEY_LABELS[sc.key] || (sc.key ? sc.key.toUpperCase() : "?"))
  return parts.join("+")
}

function mergeSettings(saved) {
  return Object.assign({}, DEFAULT_KB_SETTINGS, saved)
}

function populateSettings(s) {
  shortcutInput.value = formatShortcut(s.shortcut)
  smallStepInput.value = s.smallStep
  largeStepInput.value = s.largeStep
  document.getElementById("minSpeed").value = s.minSpeed
  document.getElementById("maxSpeed").value = s.maxSpeed
}

function saveSettings() {
  chrome.storage.local.set({ kbSettings })
}

// Toggle settings panel
gearBtn.addEventListener("click", () => {
  const open = settingsPanel.style.display === "block"
  settingsPanel.style.display = open ? "none" : "block"
  gearBtn.classList.toggle("open", !open)
})

// Shortcut recorder
shortcutInput.addEventListener("click", () => {
  recordingShortcut = true
  shortcutInput.value = "Press shortcut…"
  shortcutInput.classList.add("recording")
})

shortcutInput.addEventListener("blur", () => {
  if (recordingShortcut) {
    recordingShortcut = false
    shortcutInput.classList.remove("recording")
    shortcutInput.value = formatShortcut(kbSettings.shortcut)
  }
})

shortcutInput.addEventListener("keydown", (e) => {
  if (!recordingShortcut) return
  e.preventDefault()
  e.stopPropagation()

  if (e.key === "Escape") {
    kbSettings.shortcut = null
    recordingShortcut = false
    shortcutInput.classList.remove("recording")
    shortcutInput.value = "None"
    shortcutInput.blur()
    saveSettings()
    return
  }

  if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return

  kbSettings.shortcut = {
    ctrl: e.ctrlKey || e.metaKey,
    shift: e.shiftKey,
    alt: e.altKey,
    key: e.key,
  }

  recordingShortcut = false
  shortcutInput.classList.remove("recording")
  shortcutInput.value = formatShortcut(kbSettings.shortcut)
  shortcutInput.blur()
  saveSettings()
})

// Settings step buttons (< and > on each row)
document.querySelectorAll(".step-btn[data-action]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target)
    if (!input) return
    const step = Number.parseFloat(input.step) || 0.1
    const dir = btn.dataset.action === "inc" ? 1 : -1
    const next = round((Number.parseFloat(input.value) || 0) + dir * step)
    input.value = Math.min(Number.parseFloat(input.max), Math.max(Number.parseFloat(input.min), next))
    input.dispatchEvent(new Event("change"))
  })
})

// Step inputs
smallStepInput.addEventListener("change", () => {
  const v = Number.parseFloat(smallStepInput.value)
  if (!Number.isNaN(v) && v > 0 && v <= 2) {
    kbSettings.smallStep = round(v)
    saveSettings()
  }
})

largeStepInput.addEventListener("change", () => {
  const v = Number.parseFloat(largeStepInput.value)
  if (!Number.isNaN(v) && v > 0 && v <= 4) {
    kbSettings.largeStep = round(v)
    saveSettings()
  }
})

document.getElementById("minSpeed").addEventListener("change", (e) => {
  const v = Number.parseFloat(e.target.value)
  if (!Number.isNaN(v) && v >= 0.1 && v < kbSettings.maxSpeed) {
    kbSettings.minSpeed = round(v)
    saveSettings()
  }
})

document.getElementById("maxSpeed").addEventListener("change", (e) => {
  const v = Number.parseFloat(e.target.value)
  if (!Number.isNaN(v) && v <= 64 && v > kbSettings.minSpeed) {
    kbSettings.maxSpeed = round(v)
    saveSettings()
  }
})

// Arrow keys work while popup is open
document.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return

  if (e.key === "ArrowUp") {
    e.preventDefault()
    setRate((Number.parseFloat(input.value) || 2) + kbSettings.smallStep)
  } else if (e.key === "ArrowDown") {
    e.preventDefault()
    setRate((Number.parseFloat(input.value) || 2) - kbSettings.smallStep)
  }
})

// Wheel to adjust speed (use closest() to reliably detect input focus during wheel)
document.addEventListener(
  "wheel",
  throttle((e) => {
    if (e.target.closest("input, select, textarea")) return
    e.preventDefault()
    const raw = e.shiftKey ? -e.deltaX : e.deltaY
    const step = e.shiftKey ? kbSettings.largeStep : kbSettings.smallStep
    setRate((Number.parseFloat(input.value) || 2) + (raw < 0 ? step : -step))
  }, 200),
  { passive: false }
)
