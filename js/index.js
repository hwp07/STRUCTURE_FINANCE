let user = JSON.parse(localStorage.getItem("user")) || [];

let optionHeaderEl = document.getElementById("optionHeader");
let overlay = document.getElementById("logout-overlay");
let confirmBtn = document.getElementById("confirm-btn");
let cancelBtn = document.getElementById("cancel-btn");

function handleOption() {
  if (optionHeaderEl.value === "logout") {
    overlay.style.display = "flex";
  }
}

cancelBtn.addEventListener("click", function () {
  overlay.style.display = "none";
  optionHeaderEl.value = ""; // reset lại select
});

// Nhấn "Có" → logout
confirmBtn.addEventListener("click", function () {
  localStorage.removeItem("user");

  // chuyển về login
  window.location.href = "./pages/login.html";
});
