const input = document.getElementById('speed');
const buttons = document.querySelectorAll('button[data-delta]');

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function round(val) {
  return Math.round(val * 10) / 10;
}

function setRate(rate) {
  rate = clamp(round(rate), 0.1, 16);
  input.value = rate;
  chrome.storage.local.set({ playbackRate: rate });
}

chrome.storage.local.get('playbackRate', (data) => {
  input.value = data.playbackRate || 2;
});

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const delta = parseFloat(btn.dataset.delta);
    const current = parseFloat(input.value) || 2;
    setRate(current + delta);
  });
});

input.addEventListener('change', () => {
  setRate(parseFloat(input.value) || 2);
});

input.addEventListener('wheel', (e) => {
  e.preventDefault();
  const current = parseFloat(input.value) || 2;
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  setRate(current + delta);
});
