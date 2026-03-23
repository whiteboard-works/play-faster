import type { KbSettings } from "./types"

export const DEFAULT_RATE = 2

export const DEFAULT_KB_SETTINGS: KbSettings = {
  shortcut: { ctrl: true, shift: true, alt: false, key: "s" },
  speedUpKey: "d",
  speedDownKey: "s",
  smallStep: 0.1,
  largeStep: 0.5,
  minSpeed: 0.5,
  maxSpeed: 4,
}
