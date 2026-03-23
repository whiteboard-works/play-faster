import type { KbSettings } from "../../../shared/types"
import { ShortcutRecorder } from "./ShortcutRecorder"
import { SingleKeyRecorder } from "./SingleKeyRecorder"
import { StepRow } from "./StepRow"
import styles from "./SettingsPanel.module.css"

interface Props {
  settings: KbSettings
  onSettingsChange: (updated: KbSettings) => void
}

export function SettingsPanel({ settings, onSettingsChange }: Props) {
  const update = (patch: Partial<KbSettings>) => {
    onSettingsChange({ ...settings, ...patch })
  }

  return (
    <div class={styles.settingsPanel}>
      <div class={styles.shortcutRow}>
        <span class={styles.settingLabel}>Activate Overlay</span>
        <ShortcutRecorder
          shortcut={settings.shortcut}
          onChange={(sc) => update({ shortcut: sc })}
        />
      </div>

      <p class={styles.speedsHeader}>Quick keys</p>

      <div class={styles.shortcutRow}>
        <span class={styles.settingLabel}>Speed Up</span>
        <SingleKeyRecorder
          value={settings.speedUpKey}
          onChange={(key) => update({ speedUpKey: key })}
        />
      </div>

      <div class={styles.shortcutRow}>
        <span class={styles.settingLabel}>Speed Down</span>
        <SingleKeyRecorder
          value={settings.speedDownKey}
          onChange={(key) => update({ speedDownKey: key })}
        />
      </div>

      <p class={styles.speedsHeader}>Customize your speeds</p>

      <StepRow
        label="Small Step"
        sublabel="(Scroll)"
        id="smallStep"
        value={settings.smallStep}
        min={0.1}
        max={2}
        step={0.1}
        onChange={(v) => update({ smallStep: v })}
      />
      <StepRow
        label="Large Step"
        sublabel="(Shift+Scroll)"
        id="largeStep"
        value={settings.largeStep}
        min={0.1}
        max={4}
        step={0.1}
        onChange={(v) => update({ largeStep: v })}
      />
      <StepRow
        label="Min Speed"
        id="minSpeed"
        value={settings.minSpeed}
        min={0.1}
        max={settings.maxSpeed - 0.1}
        step={0.1}
        onChange={(v) => update({ minSpeed: v })}
      />
      <StepRow
        label="Max Speed"
        id="maxSpeed"
        value={settings.maxSpeed}
        min={settings.minSpeed + 0.1}
        max={64}
        step={0.5}
        onChange={(v) => update({ maxSpeed: v })}
      />

      <p class={styles.version}>v{browser.runtime.getManifest().version}</p>
    </div>
  )
}
