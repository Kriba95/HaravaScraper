(function () {
  const delayRange = document.getElementById("delayRange");
  const delayValue = document.getElementById("delayValue");
  delayValue.textContent = delayRange.value;
  delayRange.addEventListener("input", function () {
    delayValue.textContent = delayRange.value;
    chrome.storage.local.set({ delay: delayRange.value });
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

  
  
  document.getElementById("processURLs").addEventListener("click", () => {
    chrome.storage.local.get("delay", function (data) {
      const urls = document
        .getElementById("urls")
        .value.split("\n")
        .filter((url) => url.trim() !== "");
      chrome.runtime.sendMessage({
        action: "processURLs",
        props: "EmailsNumbers",
        urls,
        delay: data.delay,
      });
    });
  });

  document.getElementById("previewURLs").addEventListener("click", function () {
    chrome.storage.local.get("emailNumberList", function (data) {
      const emailNumberList = data.emailNumberList || [];
      const tableBody = document
        .getElementById("dataPreviewTable")
        .querySelector("tbody");
      tableBody.innerHTML = "";

      emailNumberList.forEach((item) => {
        const row = document.createElement("tr");
        const emailCell = document.createElement("td");
        emailCell.textContent = item.emails.join(", ");
        row.appendChild(emailCell);

        const numberCell = document.createElement("td");
        numberCell.textContent = item.numbers.join(", ");
        row.appendChild(numberCell);

        const urlCell = document.createElement("td");
        urlCell.innerHTML = `<a href="${item.url}" target="_blank">${item.url}</a>`;
        row.appendChild(urlCell);
        tableBody.appendChild(row);
      });

      document
        .getElementById("copyToClipboard")
        .addEventListener("click", function () {
          const table = document.getElementById("dataPreviewTable");
          let data = "";

          for (let row of table.rows) {
            let rowData = Array.from(row.cells)
              .map((cell) => cell.innerText)
              .join("\t");
            data += rowData + "\n";
          }

          navigator.clipboard
            .writeText(data)
            .then(() => {
              alert("Data copied to clipboard!");
            })
            .catch((err) => {});
        });

      document
        .getElementById("exportCSV")
        .addEventListener("click", function () {
          const table = document.getElementById("dataPreviewTable");
          let csv = "";

          for (let row of table.rows) {
            let rowData = Array.from(row.cells)
              .map((cell) => `"${cell.innerText}"`)
              .join(",");
            csv += rowData + "\n";
          }

          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "data.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });

      document.getElementById("dataPreviewContainer").style.display = "block";
    });
  });

  document.getElementById("clearData").addEventListener("click", function () {
    document.getElementById("confirmationModal").style.display = "block";
  });

  document
    .getElementById("confirmClear")
    .addEventListener("click", function () {
      const tableBody = document
        .getElementById("dataPreviewTable")
        .querySelector("tbody");
      tableBody.innerHTML = "";
      document.getElementById("dataPreviewContainer").style.display = "none";
      document.getElementById("confirmationModal").style.display = "none";
      chrome.storage.local.set({ emailNumberList: [] });
      alert("Table cleared!");
    });

  document.getElementById("cancelClear").addEventListener("click", function () {
    document.getElementById("confirmationModal").style.display = "none";
  });
})();
