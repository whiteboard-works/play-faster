import { describe, it, expect } from "vitest"
import { DEFAULT_RATE, DEFAULT_KB_SETTINGS } from "../shared/defaults"

describe("DEFAULT_RATE", () => {
  it("is a positive number", () => {
    expect(typeof DEFAULT_RATE).toBe("number")
    expect(DEFAULT_RATE).toBeGreaterThan(0)
  })
})

describe("DEFAULT_KB_SETTINGS", () => {
  it("has a valid shortcut shape", () => {
    const { shortcut } = DEFAULT_KB_SETTINGS
    expect(shortcut).not.toBeNull()
    if (shortcut !== null) {
      expect(typeof shortcut.ctrl).toBe("boolean")
      expect(typeof shortcut.shift).toBe("boolean")
      expect(typeof shortcut.alt).toBe("boolean")
      expect(typeof shortcut.key).toBe("string")
      expect(shortcut.key.length).toBeGreaterThan(0)
    }
  })

  it("has positive step values", () => {
    expect(DEFAULT_KB_SETTINGS.smallStep).toBeGreaterThan(0)
    expect(DEFAULT_KB_SETTINGS.largeStep).toBeGreaterThan(0)
  })

  it("has positive min/max speed values", () => {
    expect(DEFAULT_KB_SETTINGS.minSpeed).toBeGreaterThan(0)
    expect(DEFAULT_KB_SETTINGS.maxSpeed).toBeGreaterThan(0)
    expect(DEFAULT_KB_SETTINGS.maxSpeed).toBeGreaterThan(DEFAULT_KB_SETTINGS.minSpeed)
  })
})
