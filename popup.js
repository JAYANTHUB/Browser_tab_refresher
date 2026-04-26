document.getElementById("start").addEventListener("click", () => {
  const time = parseInt(document.getElementById("time").value);

  if (time > 0) {
    chrome.runtime.sendMessage({
      action: "START",
      interval: time
    });
  }
});

document.getElementById("pause").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "PAUSE" });
});

document.getElementById("resume").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "RESUME" });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "STOP" });
});
``
