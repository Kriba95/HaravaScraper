(function () {
  console.log("preview.js loaded", new Date());

  chrome.storage.local.get(["contacts"], (response) => {
    const contactData = response.contacts || [];
    populateTable(contactData);

    document.getElementById("copyToClipboard").addEventListener("click", function () {
      let clipboardData = "Source Emails\tSource Url\t" + contactData[0].text.map(item => item.title).join("\t") + "\n";
      contactData.forEach((contact) => {
        const rowData = [];
        Object.keys(contact).forEach((key) => {
          if (key !== "text") {
            rowData.push(Array.isArray(contact[key]) ? contact[key].join(", ") : contact[key]);
          }
        });

        contact.text.forEach((item) => {
          const cleanValue = item.value.replace(/\n/g, ' ');
          rowData.push(cleanValue);
        });


        clipboardData += rowData.join("\t") + "\n";
      });
      navigator.clipboard.writeText(clipboardData).then(() => {
        alert("Copied to clipboard");
      }).catch((err) => {
        console.error("Copy fail: ", err);
      });
    });

    document.getElementById("exportCSV").addEventListener("click", function () {
      let csvData = "Source Emails,Source Url," + contactData[0].text.map(item => item.title).join(",") + "\n";
      
      contactData.forEach((contact) => {
        const rowData = [];
        Object.keys(contact).forEach((key) => {
          if (key !== "text") {
            rowData.push(Array.isArray(contact[key]) ? contact[key].join(", ") : contact[key]);
          }
        });
    
        contact.text.forEach((item) => {
          const cleanValue = item.value.replace(/\n/g, '').replace(/,/g, ' ');
          rowData.push(cleanValue);
        });
    
        csvData += rowData.join(",") + "\n"; 
      });
    
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "contact_data.csv"); 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    
  });

  document.getElementById("ClearContacts").addEventListener("click", function () {
    chrome.storage.local.set({ contacts: [] }, function () {
      alert("All stored emails have been cleared.");
      populateTable([]);
    });
  });

  
  function populateTable(contactData) {
    const contactTableHead = document.getElementById("contactTableHead");
    const contactTableBody = document.getElementById("contactTableBody");
    const contactCount = document.getElementById("contactCount");

    contactTableHead.innerHTML = "";
    contactTableBody.innerHTML = "";

    const headerRow = document.createElement("tr");

    contactCount.innerText = `Found ${contactData.length} contacts`;

    if (contactData.length > 0) {
      const contactKeys = Object.keys(contactData[0]);

      contactKeys.forEach((key) => {
        if (key !== "text") {
          const th = document.createElement("th");
          th.innerText = `${key}`;
          headerRow.appendChild(th);
        }
      });

      contactData[0].text.forEach((item) => {
        const th = document.createElement("th");
        th.innerText = `${item.title}`;
        headerRow.appendChild(th);
      });

      contactTableHead.appendChild(headerRow);

      contactData.forEach((contact) => {
        const row = document.createElement("tr");

        contactKeys.forEach((key) => {
          if (key !== "text") {
            const td = document.createElement("td");
            td.innerText = Array.isArray(contact[key])
              ? contact[key].join(", ")
              : contact[key];
            row.appendChild(td);
          }
        });

        contact.text.forEach((item) => {
          const td = document.createElement("td");
          td.innerText = item.value;
          row.appendChild(td);
        });

        contactTableBody.appendChild(row);
      });
    } else {
      const th = document.createElement("th");
      th.colSpan = 100;
      th.innerText = "No contacts available.";
      contactTableBody.appendChild(th);
    }
  }

})();
