console.log("Content.js loaded", new Date());

console.log(document);
let currentHighlightedElement;

let showInnerText = false;

chrome.storage.local.get(["switchDropdown"], (result) => {
  if (!result.switchDropdown) {
    showInnerText = true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startListeningForSingleDivClicks") {
    window.highlighting = true;
    document.addEventListener("mouseover", highlightOnHover);
    document.addEventListener("mouseout", clearHighlightOnLeave);

    document.addEventListener(
      "click",
      (event) => {
        showAlertOnClick(event);
        handleTargetElementClick(event, request.buttonId);
      },
      {
        once: true,
      }
    );
  }

  if (request.action === "startListeningForDivClicks") {
    window.highlighting = true;
    document.addEventListener("mouseover", highlightOnHover);
    document.addEventListener("mouseout", clearHighlightOnLeave);

    document.addEventListener(
      "click",
      (event) => {
        showAlertOnClick(event);
        handleElementTableClick(event, request.buttonId);
      },
      {
        once: true,
      }
    );
  }

  if (request.action === "startListeningForArticleClicks") {
    window.highlighting = true;
    document.addEventListener("mouseover", highlightOnHover);
    document.addEventListener("mouseout", clearHighlightOnLeave);

    document.addEventListener(
      "click",
      (event) => handleFindLinksClick(event, request.buttonId),
      {
        once: true,
      }
    );
  }

  if (request.action === "startListeningForStepClicks") {
    window.highlighting = true;
    document.addEventListener("mouseover", highlightOnHover);
    document.addEventListener("mouseout", clearHighlightOnLeave);

    document.addEventListener("click", handleElementClickTwice, { once: true });
  }

  if (request.action === "stopHighlighting") {
    window.highlighting = false;

    if (currentHighlightedElement) {
      highlightElement(null);
    }

    const dropdown = document.getElementById("selectorDropdown");
    if (dropdown) {
      dropdown.style.display = "none";
    }

    document.removeEventListener("mouseover", highlightOnHover);
    document.removeEventListener("mouseout", clearHighlightOnLeave);
    document.removeEventListener("click", showAlertOnClick);
  }
  if (request.action === "showAlert") {
    alert(request.message);
  }
  if (request.action === "startListeningForClicks") {
    window.highlighting = true;
    document.addEventListener("mouseover", highlightOnHover);
    document.addEventListener("mouseout", clearHighlightOnLeave);

    document.addEventListener("click", handleElementClick, { once: true });
  }
  if (request.action === "clickNextPageXX") {
    setTimeout(() => {
      clickNextButtonXX(request.selector, request.delay);
    }, 2000);
  }
  if (request.action === "clickNextPageX") {
    setTimeout(() => {
      clickNextButtonX(request.selector, request.delay);
    }, 2000);
  }
  if (request.action === "clickNextPage") {
    setTimeout(() => {
      clickNextButton(request.selector, request.delay);
    }, 2000);
  }
  if (request.action === "findContactUrls") {
    urls = [];
    console.log("my job is to fuck")
    findContactURL(request.selectorAButtons, request.delay);
  }
  if (request.action === "findUrls") {
    urls = [];
    findArticleURL(request.selectorAButtons, request.delay);
  }
  if (request.action === "finish") {
    return;
  }
  if (request.action === "startStatus") {
    return;
  }

  if (request.action === "scrapeSelectionContacts") {
    console.log("Start Stepper")
    chrome.storage.local.get(["stepButtonSelector"], (result) => {
      if (result.stepButtonSelector) {
        function clickElementByXPath(xpath) {
          console.log(document);
          let element = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          if (element) {
            element.click();
          } else {
            console.log("Not found:", xpath);
          }
        }

        clickElementByXPath(result.stepButtonSelector);
      }

      chrome.storage.local.get({ domainValidate: false }, function (result) {
        const currentUrl = window.location.href;

        try {
          new URL(currentUrl);
          new URL(request.currentUrl);

          if (result.domainValidate) {
            if (isSameDomain(currentUrl, request.currentUrl)) {
              const contacts = scrapeContacts();

              processContacts(contacts, request.currentUrl);
              sendResponse({ emails: contacts });
              return true;
            }
          } else {
            const contacts = scrapeContacts();
            processContacts(contacts, request.currentUrl);
            sendResponse({ emails: contacts });
            return true;
          }
        } catch (e) {
          console.error("Error processing URLs:", e.message);
          sendResponse({ emails: [] });

          return true;
        }
      });
    });

    return true;
  }

  if (request.action === "scrapeCurrentSelectionEmailsHighlightButton") {
    const emails = scrapeEmails();
    highlightEmails(emails);
  }

  if (request.action === "scrapeCurrentSelectionEmails") {
    const emails = scrapeEmails();

    if (emails.length !== 0) {
      let newEmails = [...new Set(emails)];

      chrome.storage.local.get({ emailList: [] }, function (result) {
        let emailList = result.emailList;
        let emailsToAdd = newEmails.filter(
          (email) => !emailList.includes(email)
        );

        if (emailsToAdd.length > 0) {
          emailList = emailList.concat(emailsToAdd);

          chrome.storage.local.set({ emailList: emailList }, function () {});
        }
      });

      sendResponse({ emails: newEmails });
    }
  }

  if (request.action === "scrapeSelectionEmailsNumbers") {
    const numbers = scrapeTelephone();
    const emails = scrapeEmails();

    let newEmails = [...new Set(emails)];
    let newNumbers = [...new Set(numbers)];

    const currentUrl = window.location.href;

    if (newEmails.length > 0 || newNumbers.length > 0) {
      chrome.storage.local.get({ emailNumberList: [] }, function (result) {
        let existingEmailNumberList = result.emailNumberList || [];
        const newEntry = {
          url: currentUrl,
          emails: newEmails,
          numbers: newNumbers,
        };

        existingEmailNumberList.push(newEntry);

        chrome.storage.local.set(
          { emailNumberList: existingEmailNumberList },
          function () {}
        );
      });
    }

    sendResponse({ emails: newEmails, numbers: newNumbers });
  }

  if (request.action === "scrapeSelectionEmails") {
    const emails = scrapeEmails();

    let newEmails = [...new Set(emails)];

    chrome.storage.local.get({ emailList: [] }, function (result) {
      let emailList = result.emailList;
      let emailsToAdd = newEmails.filter((email) => !emailList.includes(email));

      if (emailsToAdd.length > 0) {
        emailList = emailList.concat(emailsToAdd);

        chrome.storage.local.set({ emailList: emailList }, function () {});
      }
    });

    sendResponse({ emails: newEmails });
    return true;
  }

  if (request.action === "scrapeEmails") {
    let newEmails = scrapeEmails();

    chrome.storage.local.get({ emailList: [] }, function (result) {
      let emailList = result.emailList;
      let emailsToAdd = newEmails.filter((email) => !emailList.includes(email));

      if (emailsToAdd.length > 0) {
        emailList = emailList.concat(emailsToAdd);

        chrome.storage.local.set({ emailList: emailList }, function () {});
      }
    });

    sendResponse({ emails: true });
  }

  if (request.action === "actionError") {
    alertError(request.e);
  }
});
let results = [];

function processContacts(contacts, requestUrl) {
  if (contacts) {
    updateContacts(contacts);
  }
}

function handleFindLinksClick(event, buttonId) {
  const clickedElement = event.target;
  const parentElement = clickedElement.parentElement;
  const grandParentElement = parentElement ? parentElement.parentElement : null;

  const elementsToSearch = [
    clickedElement,
    parentElement,
    grandParentElement,
  ].filter(Boolean);
  let totalLinks = 0;
  let targetClassName = [];
  let targetId = [];
  let foundLinks = [];

  elementsToSearch.forEach((element, index) => {
    if (element.className) {
      targetClassName.push(element.className);
    }
    if (element.id) {
      targetId.push(element.id);
    }

    // function getRandomDarkColor() {
    //   const r = Math.floor(Math.random() * 128);
    //   const g = Math.floor(Math.random() * 128);
    //   const b = Math.floor(Math.random() * 128);
    //   return `rgb(${r}, ${g}, ${b})`;
    // }

    try {
      targetClassName.forEach((className) => {
        if (typeof className === "string") {
          document.querySelectorAll(`.${className}`).forEach((el) => {
            el.style.border = "2px solid red";
            // el.style.backgroundColor = getRandomDarkColor();
            el.style.padding = "5px";
            const links = el.querySelectorAll("a[href]");
            if (links.length > 0) {
              links.forEach((link) => {
                foundLinks.push(link.href);
              });
              totalLinks += links.length;
            }
          });
        } else {
        }
      });
    } catch (error) {}

    try {
      targetId.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.border = "2px solid red";
          // el.style.backgroundColor = getRandomDarkColor(); // Use random dark color
          el.style.padding = "5px";
          const links = el.querySelectorAll("a[href]");
          if (links.length > 0) {
            links.forEach((link) => {
              foundLinks.push(link.href);
            });
            totalLinks += links.length;
          }
        }
      });
    } catch (error) {}
  });

  const selector = getSelector(event.target);

  window.highlighting = false;

  if (currentHighlightedElement) {
    highlightElement(null);
  }

  const dropdown = document.getElementById("selectorDropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }

  document.removeEventListener("mouseover", highlightOnHover);
  document.removeEventListener("mouseout", clearHighlightOnLeave);
  document.removeEventListener("click", showAlertOnClick);

  buttonId === "locateArticleButton" &&
    chrome.storage.local.set({ articleButtonSelector: selector });
  buttonId === "locateArticleButtonStep" &&
    chrome.storage.local.set({ articleButtonSelectorStep: selector });
  buttonId === "locateArticleButtonStepStep" &&
    chrome.storage.local.set({ articleButtonSelectorStepStep: selector });

  let validUrls = foundLinks
    .filter((link) => link.startsWith("http"))
    .map((link) => {
      let url = new URL(link);
      return url.origin + url.pathname;
    });

  let foundLinksLength = [...new Set(validUrls)];


  if (foundLinks.length === 0) {
  
    document.querySelectorAll(selector).forEach((el) => {
      el.style.border = "2px solid red";
      el.style.backgroundColor = "#f0f0f0";
      el.style.padding = "5px";
  
      if (el.parentNode) {
        el.parentNode.style.border = "5px solid black";
      }
  
      let link = el.getAttribute("href");
      if (link) {
        // Tarkistaa, onko link absoluuttinen (täydellinen URL)
        if (!link.startsWith("http")) {
          link = `${window.location.origin}${link}`; // Lisää domainin jos link on suhteellinen
        }
  
        foundLinks.push(link); // Lisää linkin foundLinks-taulukkoon
        totalLinks++;
      }
    });
  
    // Poistaa duplikaatit foundLinks-taulukosta
    foundLinksLength = [...new Set(foundLinks)]; 
 
  }
  
  unblockLinks(); // Tämä poistaa linkkien eston
  alert(`Links found: ${foundLinksLength.length}`);

  return;
}

function unblockLinks() {
  const links = document.querySelectorAll(
    "a[data-blocked], button[data-blocked]"
  );

  links.forEach((link) => {
    link.removeAttribute("data-blocked"); // Poistetaan 'data-blocked'-attribuutti
    const newLink = link.cloneNode(true); // Tehdään kopio elementistä
    link.parentNode.replaceChild(newLink, link); // Korvataan vanha elementti uudella
  });
}

function updateContacts(contacts) {
  const currentUrl = window.location.href;

  chrome.storage.local.get({ contacts: [] }, function (result) {
    let existingContacts = result.contacts || [];

    const updatedText = contacts.texts
      .map((text) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.value);
        const isWebsite =
          /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(text.value);

        if (text.title === "Email") {
          if (isEmail) {
            return {
              title: text.title,
              value: text.value,
            };
          } else {
            return {
              title: text.title,
              value: "",
            };
          }
        } else if (text.title === "Website") {
          if (isWebsite) {
            return {
              title: text.title,
              value: text.value,
            };
          } else {
            return {
              title: text.title,
              value: "",
            };
          }
        } else {
          return {
            title: text.title,
            value: text.value,
          };
        }
      })
      .filter(Boolean);

    let urlIndex = existingContacts.findIndex(
      (contact) => contact.url === currentUrl
    );

    if (urlIndex > -1) {
      existingContacts[urlIndex].emails = [
        ...new Set([...existingContacts[urlIndex].emails, ...contacts.emails]),
      ];

      updatedText.forEach((newText) => {
        const exists = existingContacts[urlIndex].text.some(
          (existingText) =>
            existingText.title === newText.title &&
            existingText.value === newText.value
        );
        if (!exists) {
          existingContacts[urlIndex].text.push(newText);
        }
      });
    } else {
      const newContact = {
        url: currentUrl,
        emails: [...new Set(contacts.emails)],
        text: updatedText,
      };
      existingContacts.push(newContact);
    }

    const hasNonEmptyValues = existingContacts.some((contact) => {
      return (
        contact.url === currentUrl &&
        (contact.emails.length > 0 ||
          contact.text.some((t) => t.value.trim() !== ""))
      );
    });

    if (hasNonEmptyValues) {
      chrome.storage.local.set({ contacts: existingContacts });
    }

    return;
  });
}

function isSameDomain(currentUrl, requestUrl) {
  try {
    const currentDomain = new URL(currentUrl).hostname;
    const requestDomain = new URL(requestUrl).hostname;
    return currentDomain === requestDomain;
  } catch (e) {
    console.error("Invalid URL provided to isSameDomain:", e.message);
    return false;
  }
}

function highlightEmails(emails) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let currentNode;
  let firstEmailNode = null;

  while ((currentNode = walker.nextNode())) {
    emails.forEach((email) => {
      if (currentNode.nodeValue.includes(email)) {
        const parentElement = currentNode.parentNode;
        const emailSpan = document.createElement("span");

        emailSpan.style.border = "2px solid red";
        emailSpan.style.backgroundColor = "yellow";
        emailSpan.style.padding = "2px";
        emailSpan.textContent = email;

        const range = document.createRange();
        range.setStartBefore(currentNode);
        range.setEndAfter(currentNode);
        range.deleteContents();
        range.insertNode(emailSpan);
        if (!firstEmailNode) {
          firstEmailNode = emailSpan;
        }
      }
    });
  }
  if (firstEmailNode) {
    firstEmailNode.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
function handleTargetElementClick(event, buttonId) {
  event.preventDefault();

  const clickedElement = event.target;

  const elementsToSearch = [clickedElement].filter(Boolean);

  let totalLinks = 0;
  let targetClassName = [];
  let targetId = [];
  let foundLinks = [];

  elementsToSearch.forEach((element, index) => {
    if (element.className) {
      targetClassName.push(element.className);
    }
    if (element.id) {
      targetId.push(element.id);
    }

    // function getRandomDarkColor() {
    //   const r = Math.floor(Math.random() * 128);
    //   const g = Math.floor(Math.random() * 128);
    //   const b = Math.floor(Math.random() * 128);
    //   return `rgb(${r}, ${g}, ${b})`;
    // }

    try {
      targetClassName.forEach((className) => {
        if (typeof className === "string") {
          document.querySelectorAll(`.${className}`).forEach((el) => {
            el.style.border = "2px solid red";
            // el.style.backgroundColor = getRandomDarkColor();
            el.style.padding = "5px";
            const links = el.querySelectorAll("a[href]");
            if (links.length > 0) {
              links.forEach((link) => {
                foundLinks.push(link.href);
              });
              totalLinks += links.length;
            }
          });
        } else {
        }
      });
    } catch (error) {}

    try {
      targetId.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.border = "2px solid red";
          // el.style.backgroundColor = getRandomDarkColor()
          el.style.padding = "5px";
          const links = el.querySelectorAll("a[href]");
          if (links.length > 0) {
            links.forEach((link) => {
              foundLinks.push(link.href);
            });
            totalLinks += links.length;
          }
        }
      });
    } catch (error) {}
  });

  const selector = getSelectorForSingleElement(event.target);

  if (buttonId) {
    let buttonIndex = buttonId.replace(/tablevalue-/g, "");

    let bid = buttonIndex - 1;
    chrome.storage.local.get(["inputData"], function (result) {
      if (result.inputData) {
        result.inputData[bid].value = selector;

        chrome.storage.local.set({ inputData: result.inputData }, function () {
          window.highlighting = false;

          if (currentHighlightedElement) {
            highlightElement(null);
          }

          const dropdown = document.getElementById("selectorDropdown");
          if (dropdown) {
            dropdown.style.display = "none";
          }

          document.removeEventListener("mouseover", highlightOnHover);
          document.removeEventListener("mouseout", clearHighlightOnLeave);
          document.removeEventListener("click", showAlertOnClick);
          alert(`${result.inputData[bid].value}`);
        });
      } else {
      }
    });
  }
  return;
}

function handleElementTableClick(event, buttonId) {
  event.preventDefault();

  const clickedElement = event.target;
  const parentElement = clickedElement.parentElement;
  const grandParentElement = parentElement ? parentElement.parentElement : null;

  const elementsToSearch = [
    clickedElement,
    parentElement,
    grandParentElement,
  ].filter(Boolean);

  let totalLinks = 0;
  let targetClassName = [];
  let targetId = [];
  let foundLinks = [];

  elementsToSearch.forEach((element, index) => {
    if (element.className) {
      targetClassName.push(element.className);
    }
    if (element.id) {
      targetId.push(element.id);
    }

    // function getRandomDarkColor() {
    //   const r = Math.floor(Math.random() * 128);
    //   const g = Math.floor(Math.random() * 128);
    //   const b = Math.floor(Math.random() * 128);
    //   return `rgb(${r}, ${g}, ${b})`;
    // }

    try {
      targetClassName.forEach((className, indexs) => {
        if (typeof className === "string") {
          document.querySelectorAll(`.${className}`).forEach((el, indexx) => {
            function findTextContent(node) {
              node.childNodes.forEach((child, indexss) => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                  const className =
                    child.className !== ""
                      ? child.className
                      : child.className
                      ? child.parentElement.className
                      : child.parentElement.className;
                  let textContent = child.textContent.trim() || "";
                  if (className !== "") {
                    const newEntry = {
                      ids: indexx,
                      Title: className,
                      Type: textContent,
                      element: element,
                    };

                    const exists = results.some(
                      (entry) =>
                        entry.Title === newEntry.Title &&
                        entry.Type === newEntry.Type
                    );

                    if (!exists) {
                      results.push(newEntry);
                    }
                  }

                  if (className && textContent) {
                    const key = `${className}-${index}`;
                    const existingValue = localStorage.getItem(key);
                    if (existingValue) {
                      localStorage.setItem(
                        key,
                        existingValue + ", " + textContent
                      );
                    } else {
                      localStorage.setItem(key, textContent);
                    }
                  }

                  findTextContent(child);
                }
              });
            }

            findTextContent(el);

            el.style.border = "2px solid red";
            el.style.padding = "5px";
            const links = el.querySelectorAll("a[href]");
            if (links.length > 0) {
              links.forEach((link) => {
                foundLinks.push(link.href);
              });
              totalLinks += links.length;
            }
          });
        } else {
          console.log(`Invalid className: ${className}`);
        }
      });
    } catch (error) {
      console.log("Not supported className");
    }

    try {
      targetId.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.border = "2px solid red";
          el.style.padding = "5px";
          const links = el.querySelectorAll("a[href]");
          if (links.length > 0) {
            links.forEach((link) => {
              foundLinks.push(link.href);
            });
            totalLinks += links.length;
          }
        }
      });
    } catch (error) {}
  });

  const combinedResults = results.reduce((acc, item) => {
    const existing = acc.find((el) => el.ids === item.ids);
    if (existing) {
      existing[item.Title] = item.Type;
    } else {
      acc.push({
        ids: item.ids,
        [item.Title]: item.Type,
      });
    }
    return acc;
  }, []);

  const selector = getSelector(event.target);

  buttonId === "locateTable" &&
    chrome.storage.local.set({ articleTable: combinedResults });

  buttonId === "locateArticleButton" &&
    chrome.storage.local.set({ articleButtonSelector: selector });
  buttonId === "locateArticleButtonStep" &&
    chrome.storage.local.set({ articleButtonSelectorStep: selector });
  buttonId === "locateArticleButtonStepStep" &&
    chrome.storage.local.set({ articleButtonSelectorStepStep: selector });

  alert(`Contacts found: ${combinedResults.length}`);
  return;
}

function findContactURL(selectorAButtons, maxDelay) {

  console.log(selectorAButtons, maxDelay)
  chrome.storage.local.get("scrapingStatus", (result) => {
    if (result.scrapingStatus === false) {
    } else {
      const button = document.querySelector(selectorAButtons);
      console.log(button,"")
      if (button) {
        const clickedElement = button;
        const parentElement = clickedElement.parentElement;
        const grandParentElement = parentElement
        ? parentElement.parentElement
        : null;
        
        const elementsToSearch = [
          clickedElement,
          parentElement,
          grandParentElement,
        ].filter(Boolean);
        
        let totalLinks = 0;
        let targetClassName = [];
        let targetId = [];
        let foundLinks = [];
        
        elementsToSearch.forEach((element) => {
          if (element.className) {
            targetClassName.push(element.className);
          }
          if (element.id) {
            targetId.push(element.id);
          }
          
          targetClassName.forEach((className) => {
            document.querySelectorAll(`.${className}`).forEach((el) => {
              const links = el.querySelectorAll("a[href]");
              if (links.length > 0) {
                links.forEach((link) => {
                  foundLinks.push(link.href);
                });
                totalLinks += links.length;
              }
            });
          });
          
          targetId.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
              const links = el.querySelectorAll("a[href]");
              if (links.length > 0) {
                links.forEach((link) => {
                  foundLinks.push(link.href);
                });
                totalLinks += links.length;
              }
            }
          });
        });
        
        let validUrls = foundLinks
        .filter((link) => link.startsWith("http"))
        .map((link) => {
          let url = new URL(link);
          return url.origin + url.pathname;
        });
        foundLinks = [...new Set(validUrls)];


        
  if (foundLinks.length === 0) {
  
    document.querySelectorAll(selectorAButtons).forEach((el) => {
      let link = el.getAttribute("href");
      if (link) {
        // Tarkistaa, onko link absoluuttinen (täydellinen URL)
        if (!link.startsWith("http")) {
          link = `${window.location.origin}${link}`; // Lisää domainin jos link on suhteellinen
        }
  
        foundLinks.push(link); // Lisää linkin foundLinks-taulukkoon
        totalLinks++;
      }
    });
  
    // Poistaa duplikaatit foundLinks-taulukosta
    foundLinksLength = [...new Set(foundLinks)]; 
 
  }
  

  
        
        foundLinks &&
        chrome.runtime.sendMessage(
          { action: "sendContactUrls", urls: foundLinks },
          function (response) {}
        );

        return;
      } else {
        console.log(button,"No button")
        return;
      }
    }
  });
}

function findArticleURL(selectorAButtons, maxDelay) {
  const button = document.querySelector(selectorAButtons);
  if (button) {
    const clickedElement = button;
    const parentElement = clickedElement.parentElement;
    const grandParentElement = parentElement
      ? parentElement.parentElement
      : null;

    const elementsToSearch = [
      clickedElement,
      parentElement,
      grandParentElement,
    ].filter(Boolean);

    let totalLinks = 0;
    let targetClassName = [];
    let targetId = [];
    let foundLinks = [];

    elementsToSearch.forEach((element) => {
      if (element.className) {
        targetClassName.push(element.className);
      }
      if (element.id) {
        targetId.push(element.id);
      }

      targetClassName.forEach((className) => {
        document.querySelectorAll(`.${className}`).forEach((el) => {
          const links = el.querySelectorAll("a[href]");
          if (links.length > 0) {
            links.forEach((link) => {
              foundLinks.push(link.href);
            });
            totalLinks += links.length;
          }
        });
      });

      targetId.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const links = el.querySelectorAll("a[href]");
          if (links.length > 0) {
            links.forEach((link) => {
              foundLinks.push(link.href);
            });
            totalLinks += links.length;
          }
        }
      });
    });

    let validUrls = foundLinks
      .filter((link) => link.startsWith("http"))
      .map((link) => {
        let url = new URL(link);
        return url.origin + url.pathname;
      });
    foundLinks = [...new Set(validUrls)];
    foundLinks &&
      chrome.runtime.sendMessage(
        { action: "sendUrls", urls: foundLinks },
        function (response) {}
      );

    return;
  }
}

function clickNextButton(selector, selectorAButtons, maxDelay) {
  const nextButton = document.querySelector(selector);
  if (nextButton) {
    const delay = getRandomDelay(2000, maxDelay);
    setTimeout(() => {
      simulateClick(nextButton);
    }, delay);
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: "nextPageLoaded" });
    }, delay);
  } else {
  }
}

function clickNextButtonX(selector, maxDelay) {
  const nextButton = document.querySelector(selector);
  if (nextButton) {
    const delay = getRandomDelay(2000, maxDelay);
    setTimeout(() => {
      simulateClick(nextButton);
    }, delay);
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: "nextPageLoadedX" });
    }, delay);
  } else {
  }
}
function clickNextButtonXX(selector, maxDelay) {
  const nextButton = document.querySelector(selector);
  if (nextButton) {
    const delay = getRandomDelay(2000, maxDelay);
    setTimeout(() => {
      simulateClick(nextButton);
    }, delay);
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: "nextPageLoadedXX" });
    }, delay);
  } else {
  }
}

function handleElementClickTwice(event) {
  event.preventDefault();
  event.stopPropagation();
  const selector = getXPath(event.target);
  console.log(selector);
  chrome.storage.local.set({ stepButtonSelector: selector });
  window.highlighting = false;

  if (currentHighlightedElement) {
    highlightElement(null);
  }

  const dropdown = document.getElementById("selectorDropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }

  document.removeEventListener("mouseover", highlightOnHover);
  document.removeEventListener("mouseout", clearHighlightOnLeave);
  document.removeEventListener("click", showAlertOnClick);

  alert("Selector selected: " + selector);
  return selector;
}
function handleElementClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const selector = getSelector(event.target);
  chrome.storage.local.set({ nextButtonSelector: selector });
  window.highlighting = false;

  if (currentHighlightedElement) {
    highlightElement(null);
  }

  const dropdown = document.getElementById("selectorDropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }

  document.removeEventListener("mouseover", highlightOnHover);
  document.removeEventListener("mouseout", clearHighlightOnLeave);
  document.removeEventListener("click", showAlertOnClick);

  alert("Selector selected: " + selector);
  return selector;
}

function getXPath(element) {
  let path = [];
  let currentElement = element;

  while (
    currentElement &&
    currentElement.nodeType === Node.ELEMENT_NODE &&
    currentElement.tagName.toLowerCase() !== "body"
  ) {
    let tagName = currentElement.tagName.toLowerCase();

    if (
      tagName !== "div" &&
      tagName !== "tpt-root" &&
      tagName !== "main" &&
      tagName !== "tpt-detail"
    ) {
      let index = 1;
      let sibling = currentElement.previousElementSibling;

      while (sibling) {
        if (sibling.tagName.toLowerCase() === tagName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }

      let selector = index > 1 ? `${tagName}[${index}]` : tagName;

      path.unshift(`//${selector}`);
    }

    currentElement = currentElement.parentElement;
  }

  return `${path.join("")}`;
}

function getSelector(element) {
  let path = [];
  let currentElement = element;

  while (currentElement && currentElement.tagName.toLowerCase() !== "body") {
    let tagName = currentElement.tagName.toLowerCase();
    let selector = tagName;

    if (currentElement.className) {
      let classes = currentElement.className.trim().split(/\s+/).join(".");
      selector += `.${classes}`;
    }

    if (currentElement.id) {
      selector += `#${currentElement.id}`;
      path.unshift(selector);
      break;
    } else {
      path.unshift(selector);
      currentElement = currentElement.parentElement;
    }
  }

  if (path.length >= 2) {
    return `${path[path.length - 2]} > ${path[path.length - 1]}`;
  } else {
    return path[0];
  }
}
function getSelectorForSingleElement(element) {
  let path = [];
  let currentElement = element;

  while (currentElement && currentElement.tagName.toLowerCase() !== "body") {
    let tagName = currentElement.tagName.toLowerCase();
    let selector = tagName;

    if (currentElement.className) {
      let classes = currentElement.className
        .trim()
        .split(/\s+/)
        .map((cls) =>
          cls
            .replace(/:/g, "\\\\:") // Insane
            .replace(/\//g, "\\\\/")
        )
        .join(".");
      selector += `.${classes}`;
    }

    if (currentElement.id) {
      selector += `#${currentElement.id}`;
      path.unshift(selector);
      break;
    } else {
      path.unshift(selector);
      currentElement = currentElement.parentElement;
    }
  }
  const length = path.length;
  if (length >= 3) {
    return `${path[length - 3]} > ${path[length - 2]} > ${path[length - 1]}`;
  } else if (length === 2) {
    return `${path[0]} > ${path[1]}`;
  } else {
    return path[0] || "";
  }
}

function simulateClick(element) {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

function scrapeContacts() {
  let scrapedTexts = [];

  chrome.storage.local.get(["inputData"], (response) => {
    response.inputData.forEach((selector) => {
      try {
        let inputDataValue = selector.value;
        let scrapeData = document.querySelectorAll(inputDataValue);

        if (scrapeData.length > 1) {
          scrapeData.forEach((element) => {
            let grand = element.parentElement.parentElement.innerText;
            let lfElement = selector.title;

            if (grand.includes(lfElement)) {
              let text = element.innerText;

              scrapedTexts.push({ title: selector.title, value: text });
            }
          });
        } else if (scrapeData.length === 0) {
          scrapedTexts.push({ title: selector.title, value: "" });
        } else {
          scrapeData.forEach((element) => {
            let text = element.innerText;

            scrapedTexts.push({ title: selector.title, value: text });
          });
        }
      } catch (error) {
        console.error(
          "No document or element found for selector:",
          inputDataValue,
          error
        );
      }
    });
  });

  const emails = scrapeEmails();
  return {
    emails: emails,
    texts: scrapedTexts,
  };
}

function scrapeTelephone() {
  const phoneRegex =
    /(?<!\d)(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{1,4}?\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}(?!\d)/g;
  const bodyText = document.body.innerText;
  const numbers = bodyText.match(phoneRegex) || [];
  const filteredNumbers = numbers.filter((number) => {
    const digitsOnly = number.replace(/\D/g, "");
    return digitsOnly.length >= 7;
  });

  return Array.from(new Set(filteredNumbers));
}

function scrapeEmails() {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const bodyText = document.body.innerText;
  const emails = bodyText.match(emailRegex) || [];
  const cleanedEmails = emails.map((email) => {
    return email.replace(/[^a-zA-Z]+$/, "");
  });
  return Array.from(new Set(cleanedEmails));
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function highlightOnHover(event) {
  if (window.highlighting) {
    highlightElement(event.target);
  }
}

function clearHighlightOnLeave(event) {
  if (window.highlighting && currentHighlightedElement === event.target) {
    highlightElement(null);
  }
}

function showAlertOnClick(event) {
  if (window.highlighting) {
    // const selector = getElementSelector(event.target);
    // alert(`Element selector: ${selector}`);
  }
}

function getElementSelector(element) {
  let path = [];
  while (element.parentElement) {
    let selector = element.tagName.toLowerCase();
    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className) {
      selector += `.${element.className.trim().split(/\s+/).join(".")}`;
    }
    path.unshift(selector);
    element = element.parentElement;
  }
  return path.join(" > ");
}

function createDropdown() {
  let dropdown = document.getElementById("selectorDropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "selectorDropdown";
    dropdown.style.position = "absolute";
    dropdown.style.color = "black";

    dropdown.style.backgroundColor = "#f0f0f0";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.padding = "5px";
    dropdown.style.width = "320px";
    dropdown.style.zIndex = "9999";
    dropdown.style.display = "none";
    dropdown.style.whiteSpace = "pre-wrap";
    document.body.appendChild(dropdown);
  }
  return dropdown;
}

function highlightElement(element) {
  if (currentHighlightedElement) {
    currentHighlightedElement.style.border = "";
    currentHighlightedElement.style.boxShadow = "";
  }
  if (element) {
    chrome.storage.local.get(["showDropdown"], (result) => {
      if (!result.showDropdown) {
        element.style.border = "2px solid red";
        element.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";

        currentHighlightedElement = element;
        const dropdown = createDropdown();
        updateDropdownContent(element, dropdown);

        dropdown.style.display = "block";
        dropdown.style.left = `${
          element.getBoundingClientRect().left + window.scrollX + 25
        }px`;
        dropdown.style.top = `${
          element.getBoundingClientRect().top + window.scrollY + 25
        }px`;

        chrome.runtime.sendMessage({ selector: dropdown.textContent });
      }
    });
  }
}

function alertError(e) {
  console.error("Alerting error:", e);
  alert(JSON.stringify(e));
}

function updateDropdownContent(element, dropdown) {
  if (showInnerText) {
    dropdown.textContent =
      element.innerText.trim() || getElementSelector(element);
  } else {
    const selector = getElementSelector(element);
    dropdown.textContent = selector;
  }
}
