(function () {
  console.log("advanced.js loaded", new Date());

  function blockLinks() {
    console.log("Vlcok");
    const links = document.querySelectorAll("a, button");
    links.forEach((link) => {
      link.setAttribute("data-blocked", "true"); 
      link.addEventListener("click", (event) => {
        console.log("Linkki estetty", event);
        event.preventDefault(); 
      });
    });
  }

  document
    .getElementById("unblockLinksButton")
    .addEventListener("click", () => {});

  const addButton = document.getElementById("addButton");
  const addButtonStep = document.getElementById("addButtonStep");
  const inputContainer = document.getElementById("inputContainer");
  const removeLinkButton = document.getElementById("RemoveLinks");
  let inputGroupCounter = 0;

  chrome.storage.local.get(
    ["minimumDelay", "maximumDelay", "numberOfRuns"],
    (response) => {
      document.getElementById("minimumDelay").value =
        response.minimumDelay || 12;
      document.getElementById("maximumDelay").value =
        response.maximumDelay || 15;
      document.getElementById("numberOfRuns").value =
        response.numberOfRuns || 5;
    }
  );

  chrome.storage.local.get(["stepButtonSelector"], (response) => {
    if (!response.stepButtonSelector) {
      return;
    }
    document.getElementById("stepsSelector").value =
      response.stepButtonSelector;
  });

  chrome.storage.local.get(["nextButtonSelector"], (response) => {
    if (!response.nextButtonSelector) {
      return;
    }
    document.getElementById("selector").value = response.nextButtonSelector;
  });
  chrome.storage.local.get("inputData", (result) => {
    const savedData = result.inputData;

    if (savedData) {
      savedData.forEach((data) => {
        const inputGroup = createInputGroup(data.title, data.value);
        inputContainer.appendChild(inputGroup);
      });
      populateTable(savedData);
    }
  });

  function populateTable(savedData) {
    const contactTableHead = document.getElementById("contactTableHead");
    const contactTableBody = document.getElementById("contactTableBody");
    contactTableBody.innerHTML = "";
    contactTableHead.innerHTML = "";

    const headerRow = document.createElement("tr");
    const titleHeader = document.createElement("th");
    titleHeader.innerText = "Title";
    headerRow.appendChild(titleHeader);

    const valueHeader = document.createElement("th");
    valueHeader.innerText = "Value";
    headerRow.appendChild(valueHeader);
    contactTableHead.appendChild(headerRow);

    savedData.forEach((article) => {
      const row = document.createElement("tr");

      const titleCell = document.createElement("td");
      titleCell.innerText = article.title;
      row.appendChild(titleCell);

      const valueCell = document.createElement("td");
      valueCell.innerText = article.value;
      row.appendChild(valueCell);

      const removeCell = document.createElement("td");

      row.appendChild(removeCell);

      contactTableBody.appendChild(row);
    });
  }

  function createInputGroup(title = "", value = "") {
    inputGroupCounter++;
    const inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");

    const rowNameLabel = document.createElement("label");
    rowNameLabel.textContent = "Element Selector ";

    const columnNameLabel = document.createElement("label");
    columnNameLabel.textContent = "Column Name: ";
    columnNameLabel.classList.add(
      "input-label",
      "mt-2",
      "block",
      "text-sm",
      "font-medium",
      "text-gray-700"
    );

    const columnNameValue = document.createElement("span");
    columnNameValue.textContent = " " + title;

    const inputTitle = document.createElement("input");
    inputTitle.setAttribute("id", `tabletitle-${inputGroupCounter}`);
    inputTitle.setAttribute("name", "inputTitle");
    inputTitle.setAttribute("title", "Column name can be anything.");
    inputTitle.classList.add(
      "input-field",
      "bg-gray-100",
      "border",
      "border-gray-300",
      "rounded-md",
      "shadow-sm",
      "p-2",
      "w-full",
      "mb-2",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-gray-300"
    );
    inputTitle.setAttribute("placeholder", "Column name");
    inputTitle.value = title;

    inputTitle.addEventListener("input", () => {
      columnNameValue.textContent = inputTitle.value;
      saveAllInputs();
    });

    const inputRow = document.createElement("div");
    inputRow.classList.add("input-row");

    const inputTableValue = document.createElement("input");
    inputTableValue.setAttribute("id", `tablevalue-${inputGroupCounter}`);
    inputTableValue.setAttribute("name", "inputTableValue");
    inputTableValue.setAttribute("placeholder", "Row Element Value");
    inputTableValue.setAttribute(
      "title",
      "To fill this field try to locate element"
    );
    inputTableValue.classList.add(
      "input-field",
      "bg-gray-100",
      "border",
      "border-gray-300",
      "rounded-md",
      "shadow-sm",
      "p-2",
      "w-full",
      "mb-2",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-gray-300"
    );
    inputTableValue.value = value;

    inputTableValue.addEventListener("input", () => {
      saveAllInputs();
    });

    const locateButton = document.createElement("button");
    locateButton.textContent = "Locate Element";

    locateButton.classList.add(
      "bg-gray-800",
      "text-white",
      "px-4",
      "mr-2",
      "py-2",
      "rounded-md",
      "hover:bg-green-500"
    );

    locateButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            buttonId: inputTableValue.id,
            action: "startListeningForSingleDivClicks",
          },
          (response) => {
            if (chrome.runtime.lastError) {
            } else {
              alert(`Locating response for value: ${inputTableValue.value}`);
            }
          }
        );
      });
      window.close();
    });

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add(
      "bg-gray-800",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "hover:bg-green-500"
    );

    removeButton.addEventListener("click", () => {
      inputGroup.remove();
      saveAllInputs();
    });

    inputRow.appendChild(rowNameLabel);

    inputRow.appendChild(inputTableValue);
    inputRow.appendChild(locateButton);
    inputRow.appendChild(removeButton);

    inputGroup.appendChild(columnNameLabel);
    inputGroup.appendChild(columnNameValue);
    inputGroup.appendChild(document.createElement("br"));
    inputGroup.appendChild(inputTitle);
    inputGroup.appendChild(inputRow);

    return inputGroup;
  }

  function saveAllInputs() {
    const inputs = [];
    const inputGroups = inputContainer.getElementsByClassName("input-group");

    for (let group of inputGroups) {
      const title = group.querySelector('input[name="inputTitle"]').value;
      const value = group.querySelector('input[name="inputTableValue"]').value;
      inputs.push({ title, value });
    }

    chrome.storage.local.set({ inputData: inputs }, () => {
      populateTable(inputs);
    });
  }

  removeLinkButton.addEventListener("click", () => {
    const linkLocatorDiv = document.getElementById("linkLocatorDiv");
    if (linkLocatorDiv) {
      linkLocatorDiv.innerHTML = "";
      chrome.storage.local.set({
        articleButtonSelector: "",
      });
      const addButton = document.createElement("button");
      addButton.textContent = "+ Add";
      addButton.classList.add(
        "bg-gray-800",
        "text-white",
        "px-4",
        "py-2",
        "rounded-md",
        "hover:bg-green-500"
      );
      linkLocatorDiv.appendChild(addButton);

      addButton.addEventListener("click", function () {
        linkLocatorDiv.innerHTML = `
          <label class="input-label block text-sm font-medium text-gray-700" title="Input a CSS selector to find the links you want to scrape from the current page.">Locate Links:</label>          <input id="selectorAButtons" placeholder="e.g. div.123 > span > a"class="input-field bg-gray-100 border border-gray-300 rounded-md shadow-sm p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-gray-300">
          <button  class="tab-button bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-green-500"  id="locateArticleButton">Locate Links</button>
          <button  class="tab-button bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-red-500"  id="RemoveLinks">Remove</button>
        `;

        chrome.storage.local.get(["articleButtonSelector"], (response) => {
          if (response.articleButtonSelector) {
            document.getElementById("selectorAButtons").value =
              response.articleButtonSelector;
          }
        });

        document
          .getElementById("selectorAButtons")
          .addEventListener("input", function () {
            const selectorAButtons =
              document.getElementById("selectorAButtons").value;
            chrome.storage.local.set({
              articleButtonSelector: selectorAButtons,
            });
          });

        document
          .getElementById("selectorAButtons")
          .addEventListener("input", function () {
            const selectorValue =
              document.getElementById("selectorAButtons").value;
            chrome.storage.local.set({ articleButtonSelector: selectorValue });
          });

        document
          .getElementById("locateArticleButton")
          .addEventListener("click", () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  buttonId: "locateArticleButton",
                  action: "startListeningForArticleClicks",
                },
                (response) => {
                  console.log(response);
                }
              );
              window.close();

            });

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: blockLinks,
              });
            });
          });

        const newRemoveButton = document.getElementById("RemoveLinks");
        newRemoveButton.addEventListener("click", function () {
          linkLocatorDiv.innerHTML = "";
          linkLocatorDiv.appendChild(addButton);
        });
      });
    }
  });

  addButton.addEventListener("click", () => {
    const inputGroup = createInputGroup();
    inputContainer.appendChild(inputGroup);
    saveAllInputs();
  });

  chrome.storage.local.get(["articleButtonSelector"], (response) => {
    if (!response.articleButtonSelector) {
      return;
    }
    document.getElementById("selectorAButtons").value =
      response.articleButtonSelector;
  });

  document
    .getElementById("startContactScraping")
    .addEventListener("click", () => {
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
      const nextButtonSelector =
        document.getElementById("selector")?.value || "";

      const articleButtonSelector =
        document.getElementById("selectorAButtons")?.value || "";

      if (!nextButtonSelector) {
        alert("Please select/add next button.");
        isScraping = false;
        return;
      }
      chrome.storage.local.set({ scrapingStatus: true });

      let message = "Start Scraping";

      chrome.storage.local.get("inputData", function (result) {
        if (result.inputData) {
          let data = result.inputData;
          let foundSelectors = [];

          data.forEach((item) => {
            if (item.title === "Website" || item.title === "Email") {
              foundSelectors.push(item.title);
            }
          });

          if (foundSelectors.length > 0) {
            message += " Found Column Selector: " + foundSelectors.join(", ");
          } else {
            message;
          }

          alert(message);
          chrome.runtime.sendMessage({
            action: "startContactScrapingInBackground",
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
        } else {
          alert(message);
          chrome.runtime.sendMessage({
            action: "startContactScrapingInBackground",
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
        }
      });
    });

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

  document
    .getElementById("selectorAButtons")
    .addEventListener("input", function () {
      const selectorAButtons =
        document.getElementById("selectorAButtons").value;
      chrome.storage.local.set({ articleButtonSelector: selectorAButtons });
    });

  document
    .getElementById("locateArticleButton")
    .addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            buttonId: "locateArticleButton",
            action: "startListeningForArticleClicks",
          },
          (response) => {
            console.log(response);

            if (chrome.runtime.lastError) {
            }
          }
        );
      });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: blockLinks,
        });
      });
      window.close()
    });

  document
    .getElementById("ClearContacts")
    .addEventListener("click", function () {
      chrome.storage.local.set({ contacts: [] }, function () {
        alert("All stored emails have been cleared.");
        populateTable([]);
      });
    });

  document
    .getElementById("minimumDelay")
    .addEventListener("input", function () {
      const minimumDelay = document.getElementById("minimumDelay").value;
      chrome.storage.local.set({ minimumDelay: minimumDelay }, function () {});
    });

  document
    .getElementById("maximumDelay")
    .addEventListener("input", function () {
      const maximumDelay = document.getElementById("maximumDelay").value;
      chrome.storage.local.set({ maximumDelay: maximumDelay }, function () {});
    });
  document
    .getElementById("numberOfRuns")
    .addEventListener("input", function () {
      const numberOfRuns = document.getElementById("numberOfRuns").value;
      chrome.storage.local.set({ numberOfRuns: numberOfRuns }, function () {});
    });

  document
    .getElementById("locateNextStepButton")
    .addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            buttonId: "locateArticleButton",
            action: "startListeningForStepClicks",
          },
          (response) => {
            if (chrome.runtime.lastError) {
            }
          }
        );
      });
    });
})();
