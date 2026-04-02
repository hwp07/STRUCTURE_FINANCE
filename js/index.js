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
// localStorage.setItem("user", JSON.stringify(user));

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
// localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));

let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

let monthlyCategories =
  JSON.parse(localStorage.getItem("monthlyCategories")) || [];

let optionHeaderEl = document.getElementById("optionHeader");
let overlay = document.getElementById("logout-overlay");
let confirmBtn = document.getElementById("confirm-btn");
let cancelBtn = document.getElementById("cancel-btn");
let loginPath = window.location.pathname.includes("/pages/")
  ? "./login.html"
  : "./pages/login.html";

// Xử lý khi chọn logout từ dropdown
function handleOption() {
  if (optionHeaderEl.value === "logout") {
    overlay.style.display = "flex";
  }
}

// Ẩn overlay và reset select khi nhấn "Không"
cancelBtn.addEventListener("click", function () {
  overlay.style.display = "none";
  optionHeaderEl.value = ""; // reset lại select
});

// Nhấn "Có" → logout: xóa user khỏi localStorage và chuyển về login
// Dùng replace để không push trang hiện tại vào history, tránh back về được
confirmBtn.addEventListener("click", function () {
  sessionStorage.removeItem("currentUser");
  window.location.replace(loginPath);
});

// Kiểm tra xác thực: nếu không có user, chuyển về login
function checkAuth() {
  currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.replace(loginPath); // Chuyển về login nếu chưa đăng nhập
    return;
  }
}

// Loại bỏ class preload và thêm page-ready để hiển thị trang
function revealPage() {
  document.documentElement.classList.remove("preload");
  document.documentElement.classList.add("page-ready");
}

checkAuth(); // Kiểm tra auth khi load trang
revealPage(); // Hiển thị trang sau khi load
window.addEventListener("DOMContentLoaded", revealPage); // Sự kiện DOMContentLoaded: hiển thị trang

// Sự kiện pageshow: kiểm tra auth và hiển thị trang (xử lý bfcache khi back)
window.addEventListener("pageshow", function () {
  checkAuth();
  revealPage();
});
