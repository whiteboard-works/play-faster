// Runs in page context - overrides playbackRate getter
;(function () {
  if (typeof HTMLMediaElement === "undefined") return
  if (HTMLMediaElement.prototype.__playbackRateOverridden) return

  const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate")
  if (!desc) return

  Object.defineProperty(HTMLMediaElement.prototype, "playbackRate", {
    get: function () {
      const real = desc.get.call(this)
      // Spoof cap: EasyLlama/Go1 reload the page when playbackRate > 2.
      // We lie to their checker while the real rate is set freely via the setter.
      return real > 2 ? 2 : real
    },
    set: function (val) {
      desc.set.call(this, val)
    },
    configurable: true,
  })

  HTMLMediaElement.prototype.__playbackRateOverridden = true
})()
