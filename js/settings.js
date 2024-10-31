(function () {
  document.getElementById("resetApp").addEventListener("click", function () {
    chrome.runtime.sendMessage(
      { action: "resetApplication" },
      function (response) {
        alert("All settings have been restored to default values!");
        window.close();
      }
    );
  });

  function saveCheckboxState() {
    const switchDropdown = document.getElementById("switchDropdown");
    const showDropdown = document.getElementById("showDropdown");
    const domainValidate = document.getElementById("domainValidate");

    chrome.storage.local.set({
      domainValidate: domainValidate.checked,
      switchDropdown: switchDropdown.checked,
      showDropdown: showDropdown.checked,
    });
  }

  function loadCheckboxState() {
    chrome.storage.local.get(["switchDropdown", "showDropdown","domainValidate"], (result) => {
      document.getElementById("switchDropdown").checked = result.switchDropdown || false;
      document.getElementById("domainValidate").checked = result.domainValidate || false;
      document.getElementById("showDropdown").checked = result.showDropdown || false;
    });
  }

  loadCheckboxState();

  document.getElementById("switchDropdown").addEventListener("change", saveCheckboxState);
  document.getElementById("showDropdown").addEventListener("change", saveCheckboxState);
  document.getElementById("domainValidate").addEventListener("change", saveCheckboxState);


  document.getElementById("clearEmails").addEventListener("click", function () {
    chrome.storage.local.set({ emailList: [] }, function () {
      alert("All stored emails have been cleared.");
    });
  });

  document.getElementById("ClearContacts").addEventListener("click", function () {
    chrome.storage.local.set({ contacts: [] }, function () {
      alert("All stored contacts have been cleared.");

    });
  });



})();
