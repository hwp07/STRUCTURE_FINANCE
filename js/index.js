// let user = [
//   {
//     id: 1,
//     fullName: "Nguyễn Văn A",
//     email: "nguyenvana@gmail.com",
//     password: "123456",
//     phone: "0987654321",
//     gender: true,
//     status: true,
//   },
//   {
//     id: 2,
//     fullName: "Phạm Thị B",
//     email: "phamthib@gmail.com",
//     password: "123456",
//     phone: "0987654321",
//     gender: false,
//     status: true,
//   },
// ];
// localStorage.setItem("user", JSON.stringify("user"));

// let monthlyCategories = [
//   {
//     id: 1,
//     month: "2025-09-30",
//     categories: [
//       {
//         id: 1,
//         categoryId: 1,
//         budget: 300000,
//       },
//       {
//         id: 2,
//         categoryId: 2,
//         budget: 500000,
//       },
//     ],
//   },
// ];
// localStorage.setItem("monthlyCategories", JSON.stringify("monthlyCategories"));

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

let monthlyCategories =
  JSON.parse(localStorage.getItem("monthlyCategories")) || [];

let optionHeaderEl = document.getElementById("optionHeader");
let overlay = document.getElementById("logout-overlay");
let confirmBtn = document.getElementById("confirm-btn");
let cancelBtn = document.getElementById("cancel-btn");
let loginPath = window.location.pathname.includes("/pages/")
  ? "./login.html"
  : "./pages/login.html";

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
  localStorage.removeItem("currentUser");
  window.location.replace(loginPath);
});

function checkAuth() {
  currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.replace(loginPath);
    return;
  }

  document.documentElement.classList.remove("auth-pending");
}

checkAuth();
window.addEventListener("pageshow", checkAuth);
