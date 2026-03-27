export interface Shortcut {
  ctrl: boolean
  shift: boolean
  alt: boolean
  key: string
}

export interface KbSettings {
  shortcut: Shortcut | null
  speedUpKey: string | null
  speedDownKey: string | null
  smallStep: number
  largeStep: number
  minSpeed: number
  maxSpeed: number
}

export type Message = { type: "rateChanged"; rate: number }
