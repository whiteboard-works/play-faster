import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { DEFAULT_RATE, DEFAULT_KB_SETTINGS } from "../shared/defaults"
import type { KbSettings } from "../shared/types"

// In-memory store and mock — defined inline to avoid module resolution quirks
const store: Record<string, unknown> = {}

function resetStore() {
  for (const key of Object.keys(store)) delete store[key]
}

const chromeMock = {
  storage: {
    local: {
      get: vi.fn(async (keys: string | string[]) => {
        const keyList = typeof keys === "string" ? [keys] : keys
        const result: Record<string, unknown> = {}
        for (const k of keyList) {
          if (k in store) result[k] = store[k]
        }
        return result
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(store, items)
      }),
    },
  },
}

beforeEach(() => {
  resetStore()
  vi.stubGlobal("chrome", chromeMock)
  // Reset call counts between tests
  chromeMock.storage.local.get.mockClear()
  chromeMock.storage.local.set.mockClear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Dynamic imports so the stubbed global is in place when the module runs
async function loadStorage() {
  // Force re-evaluation each test by cache-busting
  const mod = await import("../shared/storage?t=" + Date.now())
  return mod
}

describe("getRate()", () => {
  it("returns DEFAULT_RATE when storage is empty", async () => {
    const { getRate } = await loadStorage()
    const rate = await getRate()
    expect(rate).toBe(DEFAULT_RATE)
  })

  it("returns the stored value when set", async () => {
    store.playbackRate = 3.5
    const { getRate } = await loadStorage()
    const rate = await getRate()
    expect(rate).toBe(3.5)
  })
})

describe("setRate()", () => {
  it("writes to the playbackRate key", async () => {
    const { setRate } = await loadStorage()
    await setRate(2.5)
    expect(store.playbackRate).toBe(2.5)
  })
})

describe("getSettings()", () => {
  it("returns defaults when storage is empty", async () => {
    const { getSettings } = await loadStorage()
    const settings = await getSettings()
    expect(settings).toEqual(DEFAULT_KB_SETTINGS)
  })

  it("merges stored partial settings over defaults", async () => {
    store.kbSettings = { smallStep: 0.25 } as Partial<KbSettings>
    const { getSettings } = await loadStorage()
    const settings = await getSettings()
    expect(settings.smallStep).toBe(0.25)
    // Other fields come from defaults
    expect(settings.largeStep).toBe(DEFAULT_KB_SETTINGS.largeStep)
    expect(settings.shortcut).toEqual(DEFAULT_KB_SETTINGS.shortcut)
  })
})

describe("setSettings()", () => {
  it("writes to the kbSettings key", async () => {
    const { setSettings } = await loadStorage()
    const custom: KbSettings = {
      shortcut: { ctrl: false, shift: true, alt: false, key: "f" },
      smallStep: 0.2,
      largeStep: 1,
      minSpeed: 0.25,
      maxSpeed: 8,
    }
    await setSettings(custom)
    expect(store.kbSettings).toEqual(custom)
  })
})

describe("getAll()", () => {
  it("returns both rate and settings from storage", async () => {
    store.playbackRate = 1.5
    store.kbSettings = { smallStep: 0.3 } as Partial<KbSettings>
    const { getAll } = await loadStorage()
    const result = await getAll()
    expect(result.rate).toBe(1.5)
    expect(result.settings.smallStep).toBe(0.3)
    expect(result.settings.largeStep).toBe(DEFAULT_KB_SETTINGS.largeStep)
  })

  it("returns defaults when storage is empty", async () => {
    const { getAll } = await loadStorage()
    const result = await getAll()
    expect(result.rate).toBe(DEFAULT_RATE)
    expect(result.settings).toEqual(DEFAULT_KB_SETTINGS)
  })
})
