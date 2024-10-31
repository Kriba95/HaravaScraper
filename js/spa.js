

document.addEventListener("DOMContentLoaded", function () {

  
  let scriptUrls = [
    "js/settings.js",
    "js/preview.js",
    "js/popup.js",
    "js/advanced.js",
    "js/sequence.js",
    "js/urlscraper.js",
  ];

  const tabOneButton = document.getElementById("tabOneButton");
  const tabTwoButton = document.getElementById("tabTwoButton");
  const tabThreeButton = document.getElementById("tabThreeButton");
  const tabFourButton = document.getElementById("tabFourButton");
  const tabFiveButton = document.getElementById("tabFiveButton");
  const tabSixButton = document.getElementById("tabSixButton");

  if (
    !tabOneButton ||
    !tabTwoButton ||
    !tabThreeButton ||
    !tabFourButton ||
    !tabFiveButton ||
    !tabSixButton 
  ) {
    console.error("One or more tab buttons are missing in the HTML.");
    return;
  }

  let tabs = [
    { button: tabOneButton, html: "pages/homepage.html", script: "js/popup.js" },
    { button: tabTwoButton, html: "pages/settings.html", script: "js/settings.js" },
    { button: tabThreeButton, html: "pages/preview.html", script: "js/preview.js" },
    { button: tabFourButton, html: "pages/advanced.html", script: "js/advanced.js" },
    { button: tabFiveButton, html: "pages/sequence.html", script: "js/sequence.js" },
    { button: tabSixButton, html: "pages/urlscraper.html", script: "js/urlscraper.js" },
  ];

  let openTabs = [false, false, false, false, false, false];
  tabs.forEach((tab, index) => {
    tab.button.addEventListener("click", function () {
      tabs.forEach((t) => {
        if (t.button) {
          t.button.classList.remove("active");
        }
      });

      if (!openTabs[index]) {
        openTab(tab.button, tab.html, tab.script, function () {
          openTabs.fill(false);
          openTabs[index] = true;
          tab.button.classList.add("active");
        });
      }
    });
  });

  function loadScript(scriptUrl) {
    const existingScript = document.querySelector(
      `script[src="${chrome.runtime.getURL(scriptUrl)}"]`
    );
    if (existingScript) {
      return;
    }
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(scriptUrl);
    script.onload = function () {
    };
    script.onerror = function () {
      console.error(`Failed to load ${scriptUrl}`);
    };
    document.body.appendChild(script);
  }

  function unloadScript() {
    scriptUrls.forEach((scriptUrl) => {
      const existingScript = document.querySelector(
        `script[src="${chrome.runtime.getURL(scriptUrl)}"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    });
  }

  function openTab(tabButton, tabUrl, scriptName, setTabOpenState) {
    unloadScript();
    fetch(chrome.runtime.getURL(tabUrl))
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("content").innerHTML = data;
        loadScript(scriptName);
        setTabOpenState();
        localStorage.setItem("lastOpenTab", tabButton.id);
      })
      .catch((error) => {
        console.error(`Error fetching ${tabUrl}:`, error);
      });
  }
  const lastOpenTabId = localStorage.getItem("lastOpenTab");
  if (lastOpenTabId) {
    const lastOpenTabButton = document.getElementById(lastOpenTabId);
    if (lastOpenTabButton) {
      lastOpenTabButton.click();
    }
  } else {
    tabOneButton.click();
  }
});
