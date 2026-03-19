// Content script - handles storage, sets playback rate, keyboard overlay
let currentRate = 2
let kbSettings = null
let isActive = false

const DEFAULTS = {
  shortcut: { ctrl: true, shift: true, alt: false, key: "s" },
  smallStep: 0.1,
  largeStep: 0.5,
  minSpeed: 0.5,
  maxSpeed: 4,
}

function mergeKbSettings(saved) {
  return Object.assign({}, DEFAULTS, saved)
}

chrome.storage.local.get(["playbackRate", "kbSettings"], (data) => {
  currentRate = data.playbackRate || 2
  kbSettings = mergeKbSettings(data.kbSettings || {})
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.playbackRate) currentRate = changes.playbackRate.newValue
  if (changes.kbSettings) kbSettings = mergeKbSettings(changes.kbSettings.newValue || {})
})

// Only write playbackRate when it differs, reducing unnecessary property sets across all frames
setInterval(() => {
  document.querySelectorAll("audio, video").forEach((m) => {
    if (m.playbackRate !== currentRate) m.playbackRate = currentRate
  })
}, 1000)

// Flash overlay and keyboard controls — top frame only
if (window === window.top) {
  let overlayEl = null
  let hideTimer = null
  let inputBuffer = ""

  function getOrCreateOverlay() {
    if (!overlayEl) {
      overlayEl = document.createElement("div")
      overlayEl.style.cssText = [
        "position:fixed",
        "bottom:24px",
        "right:24px",
        "background:rgba(22,163,74,0.92)",
        "color:#fff",
        "border-radius:10px",
        "padding:10px 18px",
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        "z-index:2147483647",
        "pointer-events:none",
        "opacity:0",
        "text-align:center",
        "transition:opacity 0.15s ease",
      ].join(";")
      ;(document.body || document.documentElement).appendChild(overlayEl)
    }
    return overlayEl
  }

  function renderOverlay() {
    const el = getOrCreateOverlay()
    if (inputBuffer) {
      el.innerHTML =
        `<div style="font-size:22px;font-weight:700;letter-spacing:-0.01em">${
          inputBuffer
        }<span style="opacity:0.5">|</span></div>` +
        `<div style="font-size:10px;font-weight:500;opacity:0.8;margin-top:4px;letter-spacing:0.03em">` +
        `Enter to confirm \u00b7 Esc to cancel` +
        `</div>`
    } else {
      el.innerHTML =
        `<div style="font-size:22px;font-weight:700;letter-spacing:-0.01em">${currentRate}x</div>` +
        `<div style="font-size:10px;font-weight:500;opacity:0.8;margin-top:4px;letter-spacing:0.03em">` +
        `\u2191\u2193 adjust \u00b7 Shift+scroll large step \u00b7 Esc to close` +
        `</div>`
    }
    el.style.opacity = "1"
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      el.style.opacity = "0"
      deactivateControls(false)
    }, 3000)
  }

  function applyRate(rate) {
    rate = Math.max(
      kbSettings.minSpeed,
      Math.min(kbSettings.maxSpeed, Math.round(rate * 100) / 100)
    )
    currentRate = rate
    inputBuffer = ""
    chrome.storage.local.set({ playbackRate: rate })
    chrome.runtime.sendMessage({ type: "rateChanged", rate }).catch(() => {})
    document.querySelectorAll("audio, video").forEach((m) => (m.playbackRate = rate))
    renderOverlay()
  }

  // Speed-control keydown — only registered while active
  function onControlKeydown(e) {
    const tag = e.target.tagName
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || e.target.isContentEditable)
      return

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      e.stopPropagation()
      inputBuffer += e.key
      renderOverlay()
    } else if (e.key === "." && !inputBuffer.includes(".")) {
      e.preventDefault()
      e.stopPropagation()
      inputBuffer += "."
      renderOverlay()
    } else if (e.key === "Backspace") {
      e.preventDefault()
      e.stopPropagation()
      inputBuffer = inputBuffer.slice(0, -1)
      renderOverlay()
    } else if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      const v = parseFloat(inputBuffer)
      if (!isNaN(v) && v > 0) applyRate(v)
      else {
        inputBuffer = ""
        renderOverlay()
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      e.stopPropagation()
      applyRate(currentRate + kbSettings.smallStep)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      e.stopPropagation()
      applyRate(currentRate - kbSettings.smallStep)
    } else if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      if (inputBuffer) {
        inputBuffer = ""
        renderOverlay()
      } else deactivateControls(true)
    }
  }

  // Scroll handler — only registered while active
  function onControlWheel(e) {
    e.preventDefault()
    e.stopPropagation()
    let raw
    if (e.shiftKey) {
      raw = e.deltaX // browser flips scroll to horizontal when Shift held, so reverse it
    } else {
      raw = e.deltaY
    }
    const step = e.shiftKey ? kbSettings.largeStep : kbSettings.smallStep
    applyRate(currentRate + (raw < 0 ? step : -step))
  }

  function activateControls() {
    isActive = true
    document.addEventListener("keydown", onControlKeydown, true)
    document.addEventListener("wheel", onControlWheel, {
      passive: false,
      capture: true,
    })
    renderOverlay()
  }

  function deactivateControls(hideOverlay) {
    if (!isActive) return
    isActive = false
    inputBuffer = ""
    document.removeEventListener("keydown", onControlKeydown, true)
    document.removeEventListener("wheel", onControlWheel, { capture: true })
    if (hideOverlay && overlayEl) {
      clearTimeout(hideTimer)
      overlayEl.style.opacity = "0"
    }
  }

  function matchesShortcut(e, sc) {
    if (!sc) return false
    const ctrlOk = sc.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
    const shiftOk = sc.shift ? e.shiftKey : !e.shiftKey
    const altOk = sc.alt ? e.altKey : !e.altKey
    return ctrlOk && shiftOk && altOk && e.key === sc.key
  }

  // Shortcut listener — always active, only for toggling the mode
  document.addEventListener(
    "keydown",
    (e) => {
      if (!kbSettings) return
      if (!matchesShortcut(e, kbSettings.shortcut)) return
      e.preventDefault()
      e.stopImmediatePropagation()
      isActive ? deactivateControls(true) : activateControls()
    },
    true
  )
}
