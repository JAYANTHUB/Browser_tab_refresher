let refreshTabId = null;
let intervalSeconds = 0;
let remainingSeconds = 0;
let countdownTimer = null;
let isPaused = false;

// Update extension badge with seconds
function updateBadge() {
  let text = remainingSeconds > 99
    ? "99+"
    : remainingSeconds > 0
      ? remainingSeconds.toString()
      : "";

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: "#1976D2" });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message) => {

  if (message.action === "START") {
    intervalSeconds = message.interval;
    remainingSeconds = intervalSeconds;
    isPaused = false;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      refreshTabId = tabs[0].id;

      chrome.alarms.clear("autoRefresh");
      chrome.alarms.create("autoRefresh", {
        periodInMinutes: intervalSeconds / 60
      });

      startCountdown();
    });
  }

  if (message.action === "PAUSE") {
    isPaused = true;
    chrome.alarms.clear("autoRefresh");
    stopCountdown();
    updateBadge(); // freeze value
  }

  if (message.action === "RESUME") {
    if (!refreshTabId || remainingSeconds <= 0) return;

    isPaused = false;

    chrome.alarms.create("autoRefresh", {
      delayInMinutes: remainingSeconds / 60,
      periodInMinutes: intervalSeconds / 60
    });

    startCountdown();
  }

  if (message.action === "STOP") {
    chrome.alarms.clear("autoRefresh");
    stopCountdown();
    refreshTabId = null;
    isPaused = false;
    chrome.action.setBadgeText({ text: "" });
  }
});

// Alarm fires → refresh tab
chrome.alarms.onAlarm.addListener((alarm) => {
  if (
    alarm.name === "autoRefresh" &&
    refreshTabId !== null &&
    !isPaused
  ) {
    chrome.tabs.reload(refreshTabId);
    remainingSeconds = intervalSeconds;
    updateBadge();
  }
});

// Countdown logic (1‑second resolution)
function startCountdown() {
  stopCountdown();
  updateBadge();

  countdownTimer = setInterval(() => {
    if (!isPaused && remainingSeconds > 0) {
      remainingSeconds--;
      updateBadge();
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}
