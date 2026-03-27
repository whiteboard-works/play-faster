import { useRef, useState } from "preact/hooks"
import styles from "./SingleKeyRecorder.module.css"

interface Props {
  value: string | null
  onChange: (key: string | null) => void
}

const IGNORED_KEYS = ["Control", "Shift", "Alt", "Meta"]

export const SingleKeyRecorder = ({ value, onChange }: Props) => {
  const [recording, setRecording] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onKeyDown = (e: KeyboardEvent) => {
    if (!recording) return
    e.preventDefault()
    e.stopPropagation()

    if (IGNORED_KEYS.includes(e.key)) return

    if (e.key === "Escape") {
      onChange(null)
    } else {
      onChange(e.key)
    }
    setRecording(false)
    inputRef.current?.blur()
  }

  return (
    <input
      ref={inputRef}
      type="text"
      class={`${styles.keyInput}${recording ? ` ${styles.recording}` : ""}`}
      readOnly
      placeholder="—"
      value={recording ? "…" : (value?.toUpperCase() ?? "None")}
      onClick={() => setRecording(true)}
      onBlur={() => setRecording(false)}
      onKeyDown={onKeyDown}
    />
  )
}
