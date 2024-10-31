let emails = [];
let currentRun = 1;
let numberOfRuns = 0;
let delay = 0;
let selector = "";
let selectorAButtons = "";
let startStatus = false;
let ogTabid = "";
let currentPage = 1;
let currentIndex = 0;
let urls = [];

let sequence = [];

chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: "pages/popup.html", // Tämä on ikkuna, joka avataan
    type: "popup", // Tämä tekee ikkunasta liikkuvan
    width: 600, // Voit säätää ikkunan leveyttä
    height: 400, // Voit säätää ikkunan korkeutta
  });
});

chrome.runtime.onInstalled.addListener(() => {
  const defaultHotkey =
    navigator.platform.indexOf("Mac") !== -1
      ? "Command+Shift+Y"
      : "Ctrl+Shift+Y";
  chrome.storage.local.get(["hotkey"], function (result) {
    if (!result.hotkey) {
      chrome.storage.local.set({ hotkey: defaultHotkey });
    }
  });
});

chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.get(["hotkey"], function (result) {
    const customHotkey =
      result.hotkey ||
      (navigator.platform.indexOf("Mac") !== -1
        ? "Command+Shift+Y"
        : "Ctrl+Shift+Y");

    if (command === "sendMessage") {
      currentIndex = 0;
      currentPage = 0;
      startStatus = false;
      chrome.storage.local.set({ scrapingStatus: false });
      console.log(`Hotkey used: ${customHotkey}. Scraping has been stopped.`);
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapingStatus") {
    currentIndex = 0;
    currentPage = 0;
    startStatus = false;
    urls = [];
    chrome.storage.local.set({ scrapingStatus: false });
    return;
  }

  if (request.action === "startContactScrapingInBackground") {
    startStatus = true;
    numberOfRuns = request.numberOfRuns;
    selector = request.selector;
    selectorAButtons = request.articleButtonSelector;
    delay = request.delayMin * 1000;
    currentRun = 0;
    console.log("Start Scrape");
    startContactScraping();
  }

  if (request.action === "startScrapingInBackground") {
    startStatus = true;
    numberOfRuns = request.numberOfRuns;
    selector = request.selector;
    selectorAButtons = request.articleButtonSelector;
    delay = request.delayMin * 1000;
    currentRun = 0;

    startScraping();
  }

  if (request.action === "sendContactUrls") {
    if (request.step === 1) {
      urls = [];
      const newUrls = request.urls.filter((url) => !urls.includes(url));

      if (newUrls.length > 0) {
        urls.push(...newUrls);
      }
      ogTabid = sender.tab.id;
      urls = [...new Set(newUrls)];
    } else {
      urls = [];
      const newUrls = request.urls.filter((url) => !urls.includes(url));

      if (newUrls.length > 0) {
        urls.push(...newUrls);
      }

      urls = [...new Set(newUrls)];

      ogTabid = sender.tab.id;
      scrapeNextContact(sender.tab.id);
    }
  }
  if (request.action === "sendUrls") {
    if (request.step === 1) {
      urls = [];
      const newUrls = request.urls.filter((url) => !urls.includes(url));

      if (newUrls.length > 0) {
        urls.push(...newUrls);
      }
      ogTabid = sender.tab.id;
      urls = [...new Set(newUrls)];
    } else {
      urls = [];
      const newUrls = request.urls.filter((url) => !urls.includes(url));

      if (newUrls.length > 0) {
        urls.push(...newUrls);
      }

      urls = [...new Set(newUrls)];

      ogTabid = sender.tab.id;
      scrapeNextArticle(sender.tab.id);
    }
  }

  if (request.action === "nextPageLoaded") {
    if (startStatus === false) {
      return;
    }

    chrome.tabs.sendMessage(
      ogTabid,
      { action: "findUrls", selectorAButtons, delay },
      (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
      }
    );
  }

  if (request.action === "nextPageLoadedX") {
    if (!startStatus || currentRun >= numberOfRuns) {
      startStatus = false;
      chrome.storage.local.set({ scrapingStatus: false });

      chrome.tabs.sendMessage(ogTabid, {
        action: "startStatus",
      });

      return;
    } else {
      scrapePagination();
    }
  }

  if (request.action === "nextPageLoadedXX") {
    if (!startStatus || currentRun >= numberOfRuns) {
      startStatus = false;
      chrome.storage.local.set({ scrapingStatus: false });

      chrome.tabs.sendMessage(ogTabid, {
        action: "startStatus",
      });

      return;
    } else {
      startContactScraping();
    }
  }

  if (request.action === "processURLs") {
    startStatus = true;
    delay = request.delay * 1000;
    urls = [];
    if (request.props) {
      processURLs(request.urls, request.props);
    } else {
      processURLs(request.urls);
    }
  }

  if (request.action === "resetApplication") {
    emails = [];
    currentRun = 0;
    numberOfRuns = 0;
    delay = 0;
    selector = "";
    selectorAButtons = "";
    startStatus = false;
    chrome.storage.local.set({ scrapingStatus: false });
    ogTabid = "";
    currentPage = 1;
    currentIndex = 0;
    urls = [];
    chrome.storage.local.clear();
    sendResponse({ message: "Application variables have been reset." });
  }
});

function scrapeNextContact() {
  if (!startStatus || currentPage >= numberOfRuns) {
    startStatus = false;
    chrome.storage.local.set({ scrapingStatus: false });

    chrome.tabs.sendMessage(ogTabid, {
      action: "startStatus",
    });

    return;
  }

  if (currentIndex !== 0) {
    if (currentIndex === urls.length) {
      chrome.tabs.update(ogTabid, { active: true }, function () {
        currentIndex = 0;
        currentRun++;

        chrome.tabs.sendMessage(ogTabid, {
          action: "clickNextPageXX",
          selector,
          delay,
        });
      });

      return;
    }
  }

  if (currentIndex < urls.length) {
    chrome.tabs.create({ url: urls[currentIndex] }, (newTab) => {
      currentIndex++;

      function checkTab(tabId, info) {
        if (tabId === newTab.id && info.status === "complete") {
          chrome.tabs.sendMessage(
            newTab.id,
            {
              action: "scrapeSelectionContacts",
              currentUrl: urls[currentIndex],
            },
            (response) => {
              if (response && response.emails) {
                emails = emails.concat(response.emails);

                chrome.storage.local.set(
                  {
                    currentRun,
                    emails,
                    numberOfRuns,
                    selector,
                    selectorAButtons,
                    delay,
                  },
                  () => {
                    if (currentRun === numberOfRuns) {
                      chrome.tabs.update(
                        ogTabid,
                        { active: true },
                        function () {
                          currentIndex = 0;
                          currentPage = 0;
                          startStatus = false;
                          chrome.storage.local.set({ scrapingStatus: false });

                          chrome.tabs.sendMessage(ogTabid, {
                            action: "finish",
                          });
                          setTimeout(() => {
                            chrome.tabs.remove(newTab.id, () => {});
                          }, delay);
                        }
                      );
                    } else {
                      setTimeout(() => {
                        chrome.tabs.remove(newTab.id, () => {
                          scrapeNextContact(tabId);
                        });
                      }, 1000);
                    }
                  }
                );
              }
            }
          );

          chrome.tabs.onUpdated.removeListener(checkTab);
        }
      }

      chrome.tabs.onUpdated.addListener(checkTab);
    });

    return;
  }
}

function scrapeNextArticle() {
  if (!startStatus || currentPage >= numberOfRuns) {
    startStatus = false;
    chrome.storage.local.set({ scrapingStatus: false });

    chrome.tabs.sendMessage(ogTabid, {
      action: "startStatus",
    });

    return;
  }

  if (currentIndex !== 0) {
    if (currentIndex === urls.length) {
      chrome.tabs.update(ogTabid, { active: true }, function () {
        currentIndex = 0;
        currentRun++;

        chrome.tabs.sendMessage(ogTabid, {
          action: "clickNextPage",
          selector,
          delay,
        });
      });

      return;
    }
  }

  if (currentIndex < urls.length) {
    chrome.tabs.create({ url: urls[currentIndex] }, (newTab) => {
      currentIndex++;

      function checkTab(tabId, info) {
        if (tabId === newTab.id && info.status === "complete") {
          chrome.tabs.sendMessage(
            newTab.id,
            { action: "scrapeEmails" },
            (response) => {
              if (response && response.emails) {
                emails = emails.concat(response.emails);

                chrome.storage.local.set(
                  {
                    currentRun,
                    emails,
                    numberOfRuns,
                    selector,
                    selectorAButtons,
                    delay,
                  },
                  () => {
                    if (currentRun === numberOfRuns) {
                      chrome.tabs.update(
                        ogTabid,
                        { active: true },
                        function () {
                          currentIndex = 0;
                          currentPage = 0;
                          startStatus = false;
                          chrome.storage.local.set({ scrapingStatus: false });

                          chrome.tabs.sendMessage(ogTabid, {
                            action: "finish",
                          });
                          setTimeout(() => {
                            chrome.tabs.remove(newTab.id, () => {});
                          }, delay);
                        }
                      );
                    } else {
                      setTimeout(() => {
                        chrome.tabs.remove(newTab.id, () => {
                          scrapeNextArticle(tabId);
                        });
                      }, delay);
                    }
                  }
                );
              }
            }
          );

          chrome.tabs.onUpdated.removeListener(checkTab);
        }
      }

      chrome.tabs.onUpdated.addListener(checkTab);
    });

    return;
  }
}

function scrapePagination() {
  if (selectorAButtons === "") {
    if (currentRun === numberOfRuns) {
      startStatus = false;
      chrome.storage.local.set({ scrapingStatus: false });

      chrome.tabs.sendMessage(ogTabid, {
        action: "startStatus",
      });

      return;
    }

    setTimeout(() => {
      chrome.tabs.sendMessage(
        ogTabid,
        { action: "scrapeSelectionEmails" },
        (response) => {
          currentIndex = 0;
          currentRun++;

          if (chrome.runtime.lastError) {
            startScraping();
            return;
          } else {
            chrome.tabs.sendMessage(
              ogTabid,
              { action: "clickNextPageX", selector, delay },
              (response) => {
                if (chrome.runtime.lastError) {
                  return;
                }
              }
            );
          }
        }
      );
    }, 1000);

    return;
  }
}

function startContactScraping() {

  console.log("Asda")
  chrome.tabs.query(
    { active: true, currentWindow: true, lastFocusedWindow: true },
    (tabs) => {
      const activeTab = tabs[0]?.id;

      if (currentRun === numberOfRuns) {
        startStatus = false;
        chrome.storage.local.set({ scrapingStatus: false });
        chrome.tabs.sendMessage(ogTabid, {
          action: "startStatus",
        });

        return;
      }
      console.log("Asda")


      console.log("Asda",selectorAButtons)



      if (selectorAButtons === "") {
        try {
          setTimeout(() => {
            chrome.tabs.sendMessage(
              activeTab,
              {
                action: "scrapeSelectionContacts",
                currentUrl: urls[currentIndex],
              },
              (response) => {
                ogTabid = activeTab;
                currentIndex = 0;
                currentRun++;

                if (chrome.runtime.lastError) {
                  chrome.tabs.query(
                    { active: true, currentWindow: true },
                    (tabs) => {
                      if (tabs.length > 0) {
                        const currentUrl = tabs[0].url;
                        chrome.tabs.sendMessage(tabs[0].id, {
                          action: "actionError",
                          e: chrome.runtime.lastError,
                        });

                        chrome.tabs.create({ url: currentUrl });
                      } else {
                      }
                    }
                  );

                  return;
                } else {
                  chrome.tabs.sendMessage(
                    activeTab,
                    { action: "clickNextPageXX", selector, delay },
                    (response) => {
                      if (chrome.runtime.lastError) {
                        return;
                      }
                    }
                  );
                }
              }
            );
          }, 1000);
        } catch (e) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
              const currentUrl = tabs[0].url;
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "actionError",
                e: e.message,
              });

              chrome.tabs.create({ url: currentUrl });
            } else {
            }
          });
        }

        return;
      } else {
        try {
          setTimeout(() => {
            chrome.tabs.sendMessage(
              activeTab,
              { action: "findContactUrls", selectorAButtons, delay },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.log(chrome.runtime.lastError)
                  return;
                }
              }
            );
          }, 1000);
        } catch (e) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
              const currentUrl = tabs[0].url;
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "actionError",
                e: e.message,
              });

              chrome.tabs.create({ url: currentUrl });
            } else {
            }
          });
        }
      }
    }
  );
}





function startScraping() {
  chrome.tabs.query(
    { active: true, currentWindow: true, lastFocusedWindow: true },
    (tabs) => {
      const activeTab = tabs[0]?.id;

      if (!activeTab) {
        return;
      }
      if (selectorAButtons === "") {
        if (currentRun === numberOfRuns) {
          startStatus = false;
          chrome.storage.local.set({ scrapingStatus: false });

          chrome.tabs.sendMessage(ogTabid, {
            action: "startStatus",
          });

          return;
        }

        setTimeout(() => {
          chrome.tabs.sendMessage(
            activeTab,
            { action: "scrapeSelectionEmails" },
            (response) => {
              ogTabid = activeTab;

              currentIndex = 0;
              currentRun++;

              if (chrome.runtime.lastError) {
                return;
              } else {
                chrome.tabs.sendMessage(
                  activeTab,
                  { action: "clickNextPageX", selector, delay },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      return;
                    }
                  }
                );
              }
            }
          );
        }, 1000);

        return;
      } else {
        setTimeout(() => {
          chrome.tabs.sendMessage(
            activeTab,
            { action: "findUrls", selectorAButtons, delay },
            (response) => {
              if (chrome.runtime.lastError) {
                return;
              }
            }
          );
        }, 1000);
      }
    }
  );
}

function scrapeNextPage(tabId) {
  setTimeout(() => {
    chrome.tabs.sendMessage(tabId, {
      action: "clickNextPage",
      selector,
      delay,
    });
  }, delay);
}

function processURLs(urls, props) {
  let ogTabid = null;
  let loadingTabId = null;
  console.log(startStatus);

  const updateTab = (url) => {
    if (!startStatus) {
      return;
    }

    if (ogTabid === null) {
      chrome.tabs.create({ url: url }, (tab) => {
        ogTabid = tab.id;
        loadingTabId = ogTabid;
        waitForTabToLoad(ogTabid, () => {
          if (props) {
            sendScrapeEmailsNumbers(ogTabid);
          } else {
            sendScrapeMessage(ogTabid);
          }
        });
      });
    } else {
      try {
        chrome.tabs.update(ogTabid, { url: url }, (updatedTab) => {
          if (chrome.runtime.lastError) {
            chrome.tabs.create({ url: url }, (tab) => {
              ogTabid = tab.id;
              loadingTabId = ogTabid;

              waitForTabToLoad(ogTabid, () => {
                if (props) {
                  sendScrapeEmailsNumbers(ogTabid);
                } else {
                  sendScrapeMessage(ogTabid);
                }
              });
            });
            return;
          }
          loadingTabId = updatedTab.id;

          waitForTabToLoad(updatedTab.id, () => {
            if (props) {
              sendScrapeEmailsNumbers(updatedTab.id);
            } else {
              sendScrapeMessage(updatedTab.id);
            }
          });
        });
      } catch (e) {
        chrome.tabs.create({ url: url }, (tab) => {
          ogTabid = tab.id;
          loadingTabId = ogTabid;

          waitForTabToLoad(ogTabid, () => {
            if (props) {
              sendScrapeEmailsNumbers(ogTabid);
            } else {
              sendScrapeMessage(ogTabid);
            }
          });
        });
      }
    }
  };

  const waitForTabToLoad = (tabId, callback) => {
    const checkTabStatus = (tabId) => {
      chrome.tabs.get(tabId, (tab) => {
        if (tab.status === "complete") {
          chrome.tabs.onUpdated.removeListener(onTabUpdated);
          if (callback) callback();
        }
      });
    };

    const onTabUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        checkTabStatus(tabId);
      }
    };

    chrome.tabs.onUpdated.addListener(onTabUpdated);
    checkTabStatus(tabId);
  };

  const sendScrapeEmailsNumbers = (activeTab) => {
    chrome.tabs.sendMessage(
      activeTab,
      { action: "scrapeSelectionEmailsNumbers" },
      (response) => {
        // console.log("Response from content script:", response);
      }
    );
  };

  const sendScrapeMessage = (activeTab) => {
    chrome.tabs.sendMessage(
      activeTab,
      { action: "scrapeSelectionEmails" },
      (response) => {
        // console.log("Response from content script:", response);
      }
    );
  };

  const updatedUrls = urls.map((url) => {
    if (!/^https?:\/\//.test(url)) {
      return `https://${url}`;
    }
    return url;
  });

  updatedUrls.forEach((url, index) => {
    console.log(index * delay);
    console.log(delay);
    setTimeout(() => {
      updateTab(url);
    }, index * delay);
  });
}
