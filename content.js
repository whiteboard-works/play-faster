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

  const OVERLAY_BLUE = "#5bc4e8"
  const OVERLAY_INK = "#0f172a"
  const OVERLAY_FONT = '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'

  const iconURL = (name) => chrome.runtime.getURL(`icons/${name}`)

  function buildOverlayDOM() {
    overlayEl = document.createElement("div")
    overlayEl.style.cssText = [
      "position:fixed",
      "bottom:32px",
      "left:50%",
      "transform:translateX(-50%)",
      `background:${OVERLAY_BLUE}`,
      "border-radius:38px",
      "padding:11px 26px 9px",
      `font-family:${OVERLAY_FONT}`,
      "z-index:2147483647",
      "pointer-events:auto",
      "opacity:0",
      "text-align:center",
      "width:270px",
      "transition:opacity 0.15s ease",
    ].join(";")

    const btnStyle = (flip) => [
      "background:none",
      "border:none",
      "padding:4px",
      "cursor:pointer",
      "display:flex",
      "align-items:center",
      "opacity:0.85",
      flip ? "transform:scaleX(-1)" : "",
    ].filter(Boolean).join(";")

    const imgStyle = (h) =>
      `height:${h}px;width:auto;display:block;filter:brightness(0)`

    const big = iconURL("big-step.png")
    const small = iconURL("small-step.png")

    overlayEl.innerHTML =
      `<div style="display:flex;align-items:center;justify-content:space-around;margin-bottom:6px">` +
      `<button data-dir="-1" data-step="large" style="${btnStyle(true)}"><img src="${big}" style="${imgStyle(26)}" /></button>` +
      `<button data-dir="-1" data-step="small" style="${btnStyle(true)}"><img src="${small}" style="${imgStyle(20)}" /></button>` +
      `<div style="width:40px;height:40px;border-radius:50%;border:3px solid ${OVERLAY_INK};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(0,0,0,0.08)">` +
      `<span id="pf-speed" style="font-size:16px;font-weight:900;font-style:italic;color:${OVERLAY_INK};letter-spacing:-0.02em;font-family:Montserrat,sans-serif"></span>` +
      `</div>` +
      `<button data-dir="1" data-step="small" style="${btnStyle(false)}"><img src="${small}" style="${imgStyle(20)}" /></button>` +
      `<button data-dir="1" data-step="large" style="${btnStyle(false)}"><img src="${big}" style="${imgStyle(26)}" /></button>` +
      `</div>` +
      `<div id="pf-hint" style="font-size:10px;font-weight:700;font-style:italic;color:${OVERLAY_INK}"></div>`

    overlayEl.querySelectorAll("button[data-dir]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const dir = parseInt(btn.dataset.dir)
        const step = btn.dataset.step === "large" ? kbSettings.largeStep : kbSettings.smallStep
        applyRate(currentRate + dir * step)
      })
    })

    // Prevent overlay wheel events from bubbling to the page
    overlayEl.addEventListener("wheel", (e) => e.stopPropagation())

    ;(document.body || document.documentElement).appendChild(overlayEl)
  }

  function getOrCreateOverlay() {
    if (!overlayEl) buildOverlayDOM()
    return overlayEl
  }

  function renderOverlay() {
    const el = getOrCreateOverlay()

    const speedEl = el.querySelector("#pf-speed")
    const hintEl = el.querySelector("#pf-hint")

    if (speedEl) speedEl.textContent = inputBuffer ? `${inputBuffer}|` : `${currentRate}`
    if (hintEl) hintEl.textContent = inputBuffer
      ? "Enter to confirm \u00b7 Esc to cancel"
      : "Scroll to adjust speed"

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
  let lastWheel = 0
  function onControlWheel(e) {
    e.preventDefault()
    e.stopPropagation()
    const now = Date.now()
    if (now - lastWheel < 200) return
    lastWheel = now
    const raw = e.shiftKey ? e.deltaX : e.deltaY
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
