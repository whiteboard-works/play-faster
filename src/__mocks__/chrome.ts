// Minimal in-memory mock for chrome.storage.local

const store: Record<string, unknown> = {}

export const chrome = {
  storage: {
    local: {
      get: vi.fn(async (keys: string | string[] | null) => {
        if (keys === null) return { ...store }
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

export function resetStore() {
  for (const key of Object.keys(store)) {
    delete store[key]
  }
}
