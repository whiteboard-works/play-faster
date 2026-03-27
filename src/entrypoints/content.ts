import { DEFAULT_KB_SETTINGS, DEFAULT_RATE } from "../shared/defaults"
import type { KbSettings, Message } from "../shared/types"

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  allFrames: true,

  main() {
    let currentRate: number = DEFAULT_RATE
    let kbSettings: KbSettings = { ...DEFAULT_KB_SETTINGS }

    // ── Storage sync ─────────────────────────────────────────────────────────

    chrome.storage.local.get(["playbackRate", "kbSettings"], (data) => {
      currentRate = (data.playbackRate as number) ?? DEFAULT_RATE
      kbSettings = { ...DEFAULT_KB_SETTINGS, ...((data.kbSettings as Partial<KbSettings>) ?? {}) }
    })

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.playbackRate) {
        currentRate = changes.playbackRate.newValue as number
        applyRateToAll()
      }
      if (changes.kbSettings) {
        kbSettings = {
          ...DEFAULT_KB_SETTINGS,
          ...((changes.kbSettings.newValue as Partial<KbSettings>) ?? {}),
        }
      }
    })

    // ── Rate application ──────────────────────────────────────────────────────

    function applyRateToAll() {
      document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((m) => {
        if (m.playbackRate !== currentRate) m.playbackRate = currentRate
      })
    }

    // Apply to media elements added dynamically (SPA navigation, lazy iframes, etc.)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLMediaElement) {
            if (node.playbackRate !== currentRate) node.playbackRate = currentRate
          } else if (node instanceof Element) {
            node.querySelectorAll<HTMLMediaElement>("audio, video").forEach((el) => {
              if (el.playbackRate !== currentRate) el.playbackRate = currentRate
            })
          }
        }
      }
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })

    // Reduced-frequency fallback for any elements the observer misses
    setInterval(applyRateToAll, 2000)

    // ── Overlay (top frame only) ──────────────────────────────────────────────

    if (window !== window.top) return

    // Shadow DOM overlay — CSS is fully isolated from the host page
    const OVERLAY_CSS = `
      :host {
        all: initial;
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2147483647;
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .overlay {
        background: #5bc4e8;
        border-radius: 38px;
        padding: 10px 22px 8px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .overlay.visible { opacity: 1; }
      .controls {
        display: flex;
        align-items: center;
        justify-content: space-around;
        gap: 10px;
        margin-bottom: 5px;
      }
      .arrow-btn {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        opacity: 0.85;
      }
      .arrow-btn.flip { transform: scaleX(-1); }
      .arrow-btn img { display: block; height: 20px; width: auto; filter: brightness(0); }
      .arrow-btn.large img { height: 26px; }
      .speed-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 3px solid #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(0,0,0,0.08);
      }
      .speed-num {
        font-size: 15px;
        font-weight: 900;
        font-style: italic;
        color: #0f172a;
        letter-spacing: -0.02em;
        font-family: Montserrat, sans-serif;
      }
      .hint {
        font-size: 10px;
        font-weight: 700;
        font-style: italic;
        color: #000;
        -webkit-font-smoothing: antialiased;
      }
    `

    class SpeedOverlay {
      private host: HTMLElement
      private shadow: ShadowRoot
      private overlayEl: HTMLDivElement
      private speedEl: HTMLSpanElement
      private hintEl: HTMLDivElement
      private hideTimer: ReturnType<typeof setTimeout> | null = null

      constructor() {
        this.host = document.createElement("div")
        this.shadow = this.host.attachShadow({ mode: "closed" })

        const style = document.createElement("style")
        style.textContent = OVERLAY_CSS
        this.shadow.appendChild(style)

        const bigUrl = chrome.runtime.getURL("icons/big-step.png")
        const smallUrl = chrome.runtime.getURL("icons/small-step.png")

        this.overlayEl = document.createElement("div")
        this.overlayEl.className = "overlay"
        this.overlayEl.innerHTML = `
          <div class="controls">
            <button data-dir="-1" data-step="large" class="arrow-btn large flip">
              <img src="${bigUrl}" alt="" />
            </button>
            <button data-dir="-1" data-step="small" class="arrow-btn flip">
              <img src="${smallUrl}" alt="" />
            </button>
            <div class="speed-circle">
              <span class="speed-num"></span>
            </div>
            <button data-dir="1" data-step="small" class="arrow-btn">
              <img src="${smallUrl}" alt="" />
            </button>
            <button data-dir="1" data-step="large" class="arrow-btn large">
              <img src="${bigUrl}" alt="" />
            </button>
          </div>
          <div class="hint"></div>
        `

        this.speedEl = this.overlayEl.querySelector(".speed-num")!
        this.hintEl = this.overlayEl.querySelector(".hint")!

        this.overlayEl.querySelectorAll<HTMLButtonElement>("button[data-dir]").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation()
            const dir = parseInt(btn.dataset.dir!)
            const step = btn.dataset.step === "large" ? kbSettings.largeStep : kbSettings.smallStep
            applyRate(currentRate + dir * step)
          })
        })

        // Prevent overlay scroll from propagating to the page
        this.overlayEl.addEventListener("wheel", (e) => e.stopPropagation())

        this.shadow.appendChild(this.overlayEl)
      }

      render(inputBuffer: string) {
        this.speedEl.textContent = inputBuffer ? `${inputBuffer}|` : `${currentRate}`
        this.hintEl.textContent = inputBuffer
          ? "Enter to confirm \u00b7 Esc to cancel"
          : "Scroll to adjust speed"
        this.overlayEl.classList.add("visible")

        if (this.hideTimer) clearTimeout(this.hideTimer)
        this.hideTimer = setTimeout(() => {
          this.overlayEl.classList.remove("visible")
          deactivateControls(false)
        }, 3000)
      }

      hide() {
        if (this.hideTimer) clearTimeout(this.hideTimer)
        this.overlayEl.classList.remove("visible")
      }

      mount() {
        ;(document.body ?? document.documentElement).appendChild(this.host)
      }

      unmount() {
        this.host.remove()
      }
    }

    let overlay: SpeedOverlay | null = null
    let isActive = false
    let inputBuffer = ""
    let lastWheel = 0

    function getOrCreateOverlay(): SpeedOverlay {
      if (!overlay) {
        overlay = new SpeedOverlay()
        overlay.mount()
      }
      return overlay
    }

    function applyRate(rate: number) {
      rate = Math.max(
        kbSettings.minSpeed,
        Math.min(kbSettings.maxSpeed, Math.round(rate * 100) / 100)
      )
      currentRate = rate
      inputBuffer = ""
      chrome.storage.local.set({ playbackRate: rate })
      chrome.runtime.sendMessage({ type: "rateChanged", rate } as Message).catch(() => {})
      document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((m) => {
        m.playbackRate = rate
      })
      getOrCreateOverlay().render(inputBuffer)
    }

    function onControlKeydown(e: KeyboardEvent) {
      const tag = (e.target as Element).tagName
      if (
        tag === "INPUT" ||
        tag === "SELECT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement).isContentEditable
      )
        return

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        inputBuffer += e.key
        getOrCreateOverlay().render(inputBuffer)
      } else if (e.key === "." && !inputBuffer.includes(".")) {
        e.preventDefault()
        e.stopPropagation()
        inputBuffer += "."
        getOrCreateOverlay().render(inputBuffer)
      } else if (e.key === "Backspace") {
        e.preventDefault()
        e.stopPropagation()
        inputBuffer = inputBuffer.slice(0, -1)
        getOrCreateOverlay().render(inputBuffer)
      } else if (e.key === "Enter") {
        e.preventDefault()
        e.stopPropagation()
        const v = parseFloat(inputBuffer)
        if (!isNaN(v) && v > 0) applyRate(v)
        else {
          inputBuffer = ""
          getOrCreateOverlay().render(inputBuffer)
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
          getOrCreateOverlay().render(inputBuffer)
        } else {
          deactivateControls(true)
        }
      }
    }

    function onControlWheel(e: WheelEvent) {
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
      document.addEventListener("wheel", onControlWheel, { passive: false, capture: true })
      getOrCreateOverlay().render(inputBuffer)
    }

    function deactivateControls(hideOverlay: boolean) {
      if (!isActive) return
      isActive = false
      inputBuffer = ""
      document.removeEventListener("keydown", onControlKeydown, true)
      document.removeEventListener("wheel", onControlWheel, { capture: true })
      if (hideOverlay && overlay) overlay.hide()
    }

    function matchesShortcut(e: KeyboardEvent, sc: KbSettings["shortcut"]): boolean {
      if (!sc) return false
      const ctrlOk = sc.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
      const shiftOk = sc.shift ? e.shiftKey : !e.shiftKey
      const altOk = sc.alt ? e.altKey : !e.altKey
      return ctrlOk && shiftOk && altOk && e.key === sc.key
    }

    // Quick keys — single keypress speed up/down (always active, no overlay needed)
    document.addEventListener(
      "keydown",
      (e) => {
        const tag = (e.target as HTMLElement).tagName
        if (
          tag === "INPUT" ||
          tag === "SELECT" ||
          tag === "TEXTAREA" ||
          (e.target as HTMLElement).isContentEditable
        )
          return
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
        if (kbSettings.speedUpKey && e.key === kbSettings.speedUpKey) {
          e.preventDefault()
          applyRate(currentRate + kbSettings.smallStep)
        } else if (kbSettings.speedDownKey && e.key === kbSettings.speedDownKey) {
          e.preventDefault()
          applyRate(currentRate - kbSettings.smallStep)
        }
      },
      true
    )

    document.addEventListener(
      "keydown",
      (e) => {
        if (!matchesShortcut(e, kbSettings.shortcut)) return
        e.preventDefault()
        e.stopImmediatePropagation()
        isActive ? deactivateControls(true) : activateControls()
      },
      true
    )
  },
})
