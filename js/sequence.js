console.log("settings.js loaded");

document.querySelectorAll(".remove-button").forEach((button) => {
  button.addEventListener("click", function () {
    removeUrl(button);
  });
});

function removeUrl(button) {
  const row = button.closest("tr");
  row.remove();
  const contactCount = document.getElementById("contactCount1");
  contactCount.textContent = parseInt(contactCount.textContent) - 1;
}
