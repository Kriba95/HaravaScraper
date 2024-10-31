
(function () {
function saveDelays() {
  const minDelay = document.getElementById("minimumDelay").value;
  const maxDelay = document.getElementById("maximumDelay").value;

  chrome.storage.local.set({
    minimumDelay: minDelay,
    maximumDelay: maxDelay
  }, function() {
    console.log('Delays saved:', { minimumDelay: minDelay, maximumDelay: maxDelay });
  });
}
function loadDelays() {
  chrome.storage.local.get(["minimumDelay", "maximumDelay"], function(result) {
    const minDelay = result.minimumDelay ||5; 
    const maxDelay = result.maximumDelay || 5; 

    document.getElementById("minimumDelay").value = minDelay;
    document.getElementById("minDelayValue").textContent = minDelay;
    
    document.getElementById("maximumDelay").value = maxDelay;
    document.getElementById("maxDelayValue").textContent = maxDelay;
  });
}
const minDelayRange = document.getElementById("minimumDelay");
const minDelayValue = document.getElementById("minDelayValue");
loadDelays();

minDelayRange.addEventListener("input", function () {
  minDelayValue.textContent = minDelayRange.value;
  saveDelays(); 
});

const maxDelayRange = document.getElementById("maximumDelay");
const maxDelayValue = document.getElementById("maxDelayValue");

maxDelayRange.addEventListener("input", function () {
  maxDelayValue.textContent = maxDelayRange.value;
  saveDelays(); 
});

chrome.storage.local.get({ emailList: [] }, function (result) {
  document.getElementById("contactCount").textContent = result.emailList.length;
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(
    tabs[0].id,
    { action: "scrapeCurrentSelectionEmails" },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else {
        if (response.emails) {
          document.getElementById("contactThisCount").textContent =
            response.emails.length;
        } else {
        }
      }
    }
  );
});

document.getElementById("highlightButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "scrapeCurrentSelectionEmailsHighlightButton" },
      (response) => {
        if (chrome.runtime.lastError) {
          window.close();
        } else {
          window.close();
        }
      }
    );
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(
    tabs[0].id,
    { action: "scrapeCurrentSelectionEmails" },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else {
        if (response.emails) {
          document.getElementById("contactThisCount").textContent =
            response.emails.length;
        } else {
        }
      }
    }
  );
});

document.getElementById("stopScraping").addEventListener("click", () => {
  isScraping = false;
  chrome.runtime.sendMessage({
    action: "scrapingStatus",
    isScraping,
  });
  isScraping = false;
  alert("Stop Scraping");
});

chrome.storage.local.get(["nextButtonSelector"], (response) => {
  if (!response.nextButtonSelector) {
    return;
  }
  document.getElementById("selector").value = response.nextButtonSelector;
});

chrome.storage.local.get(["articleButtonSelector"], (response) => {
  if (!response.articleButtonSelector) {
    return;
  }
  document.getElementById("selectorAButtons").value =
    response.articleButtonSelector;
});

chrome.storage.local.get(["articleButtonSelectorStep"], (response) => {
  if (!response.articleButtonSelectorStep) {
    return;
  }
  document.getElementById("selectorBButtons").value =
    response.articleButtonSelectorStep;
});

chrome.storage.local.get(["articleButtonSelectorStepStep"], (response) => {
  if (!response.articleButtonSelectorStepStep) {
    return;
  }
  document.getElementById("selectorCButtons").value =
    response.articleButtonSelectorStepStep;
});

chrome.storage.local.get(
  ["minimumDelay", "maximumDelay", "numberOfRuns"],
  (response) => {
    document.getElementById("minimumDelay").value = response.minimumDelay || 12;
    document.getElementById("maximumDelay").value = response.maximumDelay || 15;
    document.getElementById("numberOfRuns").value = response.numberOfRuns || 5;
  }
);

document.getElementById("previewEmails").addEventListener("click", () => {
  chrome.storage.local.get(["emailList"], (data) => {
    const emailsDiv = document.getElementById("emails");
    emailsDiv.innerHTML = `<p>Found Emails: ${data?.emailList.length}</p>`;
    let storageEmails = data?.emailList || [];
    let emails = Array.from(new Set(storageEmails));

    if (emails.length === 0) {
      emailsDiv.innerHTML = "<p>No emails found.</p>";
      if (document.getElementById("exportCSV"))
        document.getElementById("exportCSV").style.display = "none";
      document.getElementById("copyToClipboard").style.display = "none";
    } else {
      emails.forEach((email) => {
        const p = document.createElement("p");
        p.textContent = email;
        emailsDiv.appendChild(p);
      });

      if (document.getElementById("copyToClipboard"))
        document.getElementById("copyToClipboard").style.display = "block";
      if (document.getElementById("exportCSV"))
        document.getElementById("exportCSV").style.display = "block";
      if (document.getElementById("exportCSV"))
        document.getElementById("exportCSV").onclick = () =>
          exportToCSV(emails);
      if (document.getElementById("copyToClipboard"))
        document.getElementById("copyToClipboard").onclick = () =>
          exportToClipboard(emails);
    }
  });
});

document.getElementById("startScraping").addEventListener("click", () => {
  let isScraping = false;
  if (isScraping) return;
  isScraping = true;

  const minDelay = parseInt(
    document.getElementById("minimumDelay")?.value || 12
  );
  const maxDelay = parseInt(
    document.getElementById("maximumDelay")?.value || 15
  );
  const numberOfRuns = parseInt(
    document.getElementById("numberOfRuns")?.value || 5
  );
  const nextButtonSelector = document.getElementById("selector")?.value || "";
  const articleButtonSelector =
    document.getElementById("selectorAButtons")?.value || "";

  if (!nextButtonSelector) {
    alert("Please select/add next button.");
    isScraping = false;
    return;
  }

  alert("Start Scraping");

  chrome.runtime.sendMessage({
    action: "startScrapingInBackground",
    selector: nextButtonSelector,
    articleButtonSelector: articleButtonSelector,
    numberOfRuns,
    delayMin: minDelay,
    delayMax: maxDelay,
    isScraping,
  });

  setTimeout(() => {
    isScraping = false;
  }, 1000);
});

function toggleBlock(block) {
  window.postMessage({ type: "TOGGLE_BLOCK", block }, "*");
}
function exportToClipboard(emails) {
  const emailString = ["Email", ...emails].join("\n");
  const textArea = document.createElement("textarea");
  textArea.value = emailString;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  alert("Emails copied to clipboard!");
}

function exportToCSV(emails) {
  const csvContent = "data:text/csv;charset=utf-8," + emails.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "emails.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById("minimumDelay").addEventListener("input", function () {
  const minimumDelay = document.getElementById("minimumDelay").value;
  chrome.storage.local.set({ minimumDelay: minimumDelay }, function () {});
});

document.getElementById("maximumDelay").addEventListener("input", function () {
  const maximumDelay = document.getElementById("maximumDelay").value;
  chrome.storage.local.set({ maximumDelay: maximumDelay }, function () {});
});
document.getElementById("numberOfRuns").addEventListener("input", function () {
  const numberOfRuns = document.getElementById("numberOfRuns").value;
  chrome.storage.local.set({ numberOfRuns: numberOfRuns }, function () {});
});
document
  .getElementById("selectorAButtons")
  .addEventListener("input", function () {
    const selectorAButtons = document.getElementById("selectorAButtons").value;
    chrome.storage.local.set({ articleButtonSelector: selectorAButtons });
  });

// document.getElementById("clearEmails").addEventListener("click", function () {
//   chrome.storage.local.set({ emailList: [] }, function () {
//     alert("All stored emails have been cleared.");

//     window.close();
//   });
// });
document.getElementById("selector").addEventListener("input", function () {
  const selectorvalue = document.getElementById("selector").value;
  chrome.storage.local.set(
    { nextButtonSelector: selectorvalue },
    function () {}
  );
});

document.getElementById("locateNextButton").addEventListener("click", () => {
  window.close();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "startListeningForClicks" },
      (response) => {
        if (chrome.runtime.lastError) {
        }
      }
    );
  });
});

document.getElementById("locateArticleButton").addEventListener("click", () => {
  window.close();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        buttonId: "locateArticleButton",
        action: "startListeningForArticleClicks",
      },
      (response) => {
        if (chrome.runtime.lastError) {
        }
      }
    );
  });
});
})();