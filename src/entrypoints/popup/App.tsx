import { useEffect, useRef, useState } from "preact/hooks"
import { DEFAULT_KB_SETTINGS, DEFAULT_RATE } from "../../shared/defaults"
import { getAll, setRate, setSettings } from "../../shared/storage"
import type { KbSettings, Message } from "../../shared/types"
import { SpeedControl } from "./components/SpeedControl"
import { SettingsPanel } from "./components/SettingsPanel"
import styles from "./App.module.css"

export function App() {
  const [rate, setLocalRate] = useState(DEFAULT_RATE)
  const [settings, setLocalSettings] = useState<KbSettings>(DEFAULT_KB_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Refs for access inside event listeners without stale closure
  const rateRef = useRef(rate)
  const settingsRef = useRef(settings)
  rateRef.current = rate
  settingsRef.current = settings

  const lastWheelRef = useRef(0)

  useEffect(() => {
    getAll().then(({ rate: r, settings: s }) => {
      setLocalRate(r)
      setLocalSettings(s)
    })

    const onChanged = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.playbackRate) setLocalRate(changes.playbackRate.newValue as number)
      if (changes.kbSettings) {
        setLocalSettings({
          ...DEFAULT_KB_SETTINGS,
          ...((changes.kbSettings.newValue as Partial<KbSettings>) ?? {}),
        })
      }
    }
    chrome.storage.onChanged.addListener(onChanged)

    // Body-level wheel: adjust speed when not scrolling inside a form element
    const onWheel = (e: WheelEvent) => {
      if ((e.target as Element).closest("input, select, textarea")) return
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheelRef.current < 200) return
      lastWheelRef.current = now
      const raw = e.shiftKey ? -e.deltaX : e.deltaY
      const step = e.shiftKey ? settingsRef.current.largeStep : settingsRef.current.smallStep
      applyRateImmediate(rateRef.current + (raw < 0 ? step : -step))
    }

    // Body-level arrow keys: increment/decrement when not focused on a form element
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as Element)?.tagName
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return
      if (e.key === "ArrowUp") {
        e.preventDefault()
        applyRateImmediate(rateRef.current + settingsRef.current.smallStep)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        applyRateImmediate(rateRef.current - settingsRef.current.smallStep)
      }
    }

    document.addEventListener("wheel", onWheel, { passive: false })
    document.addEventListener("keydown", onKeyDown)

    return () => {
      chrome.storage.onChanged.removeListener(onChanged)
      document.removeEventListener("wheel", onWheel)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const applyRateImmediate = (newRate: number) => {
    const s = settingsRef.current
    const clamped = Math.max(s.minSpeed, Math.min(s.maxSpeed, Math.round(newRate * 100) / 100))
    rateRef.current = clamped
    setLocalRate(clamped)
    setRate(clamped)
    chrome.runtime.sendMessage({ type: "rateChanged", rate: clamped } as Message).catch(() => {})
  }

  const applySettings = (updated: KbSettings) => {
    setLocalSettings(updated)
    setSettings(updated)
  }

  return (
    <div class={styles.popupWrapper}>
      <div class={styles.topIcon}>
        <img src="icons/playfaster-icon.png" alt="" />
      </div>

      <button
        class={`${styles.gearBtn}${settingsOpen ? ` ${styles.open}` : ""}`}
        title="Settings"
        onClick={() => setSettingsOpen((o) => !o)}
      >
        <img src="icons/gear.png" alt="Settings" />
      </button>

      <a href="https://playfaster.app" target="_blank" rel="noopener" class={styles.title}>
        <span class={styles.titlePlay}>Play</span>
        <span class={styles.titleFaster}>Faster</span>
      </a>

      <SpeedControl rate={rate} settings={settings} onRateChange={applyRateImmediate} />

      <p class={styles.scrollHint}>Scroll to adjust speed</p>

      {settingsOpen && <SettingsPanel settings={settings} onSettingsChange={applySettings} />}

      <div class={styles.footer}>
        <a href="https://whiteboardworks.com" target="_blank" rel="noopener">
          whiteboardworks.com
        </a>
      </div>
    </div>
  )
}
