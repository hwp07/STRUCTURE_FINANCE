// let user = [
//   {
//     id: 1,
//     fullName: "Nguyá»…n VÄƒn A",
//     email: "nguyenvana@gmail.com",
//     password: "123456",
//     phone: "0987654321",
//     gender: true,
//     status: true,
//   },
//   {
//     id: 2,
//     fullName: "Pháº¡m Thá»‹ B",
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

// let transactions = [
//   {
//     id: 1,
//     createdDate: "2025-10-01",
//     total: 150000,
//     description: "Tiền đi chơi",
//     categoryId: 1,
//     monthlyCategoryId: 1,
//   },
// ];
// localStorage.setItem("transactions", JSON.stringify(transactions));

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let currentUserId = localStorage.getItem("currentUserId");

let monthlyCategories =
  JSON.parse(localStorage.getItem("monthlyCategories")) || [];

let optionHeaderEl =
  document.getElementById("select-account") ||
  document.getElementById("optionHeader");
let overlay = document.getElementById("logout-overlay");
let confirmBtn =
  document.getElementById("btn-confirm-logout") ||
  document.getElementById("confirm-btn");
let cancelBtn =
  document.getElementById("btn-cancel-logout") ||
  document.getElementById("cancel-btn");
let loginPath = window.location.pathname.includes("/pages/")
  ? "./login.html"
  : "./pages/login.html";

function handleOption() {
  if (optionHeaderEl && overlay && optionHeaderEl.value === "logout") {
    overlay.style.display = "flex";
  }
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", function () {
    if (overlay) {
      overlay.style.display = "none";
    }

    if (optionHeaderEl) {
      optionHeaderEl.value = "";
    }
  });
}

if (confirmBtn) {
  confirmBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUserId");
    window.location.replace(loginPath);
  });
}

function checkAuth() {
  currentUserId = localStorage.getItem("currentUserId");

  if (!currentUserId) {
    window.location.replace(loginPath);
  }
}

function revealPage() {
  document.documentElement.classList.remove("preload");
  document.documentElement.classList.add("page-ready");
}

checkAuth();
revealPage();
window.addEventListener("DOMContentLoaded", revealPage);
window.addEventListener("pageshow", function () {
  checkAuth();
  revealPage();
});

let inputMonth = document.getElementById("input-month");
let inputBudget = document.getElementById("input-budget");
let btnSave = document.getElementById("btn-save-budget");
let moneyLeft = document.getElementById("text-money-left");

let errMonth = document.getElementById("err-month");
let errBudget = document.getElementById("err-budget");

function showError(input, error) {
  if (!input || !error) return;

  input.classList.add("input-error");
  error.style.display = "block";
}

function hideError(input, error) {
  if (!input || !error) return;

  input.classList.remove("input-error");
  error.style.display = "none";
}

if (btnSave && inputMonth && inputBudget) {
  btnSave.onclick = function (e) {
    e.preventDefault();

    let month = inputMonth.value;
    let budget = inputBudget.value;

    let isValid = true;

    hideError(inputMonth, errMonth);
    hideError(inputBudget, errBudget);

    if (month === "") {
      showError(inputMonth, errMonth);
      isValid = false;
    }

    if (budget === "") {
      showError(inputBudget, errBudget);
      isValid = false;
    }

    if (!isValid) return;

    let found = monthlyCategories.find((item) => item.month === month);

    if (found) {
      found.categories.push({
        id: Date.now(),
        categoryId: Date.now(),
        budget: Number(budget),
      });
    } else {
      monthlyCategories.push({
        id: Date.now(),
        month: month,
        categories: [
          {
            id: Date.now(),
            categoryId: Date.now(),
            budget: Number(budget),
          },
        ],
      });
    }

    // Tính tổng budget của tháng
    let totalBudget = monthlyCategories
      .find((item) => item.month === month)
      .categories.reduce((sum, cat) => sum + cat.budget, 0);

    if (moneyLeft) {
      moneyLeft.innerText = totalBudget.toLocaleString("vi-vn") + " VND";
    }

    localStorage.setItem(
      "monthlyCategories",
      JSON.stringify(monthlyCategories),
    );

    inputMonth.value = "";
    inputBudget.value = "";
  };
}

if (inputMonth) {
  inputMonth.oninput = () => {
    if (inputMonth.value !== "") {
      hideError(inputMonth, errMonth);
    }
  };
}

if (inputBudget) {
  inputBudget.oninput = () => {
    if (inputBudget.value !== "") {
      hideError(inputBudget, errBudget);
    }
  };
}

if (inputMonth) {
  inputMonth.addEventListener("change", function () {
    let selectedMonth = inputMonth.value;
    let found = monthlyCategories.find((item) => item.month === selectedMonth);
    let total = 0;
    if (found) {
      total = found.categories.reduce((sum, cat) => sum + cat.budget, 0);
    }
    if (moneyLeft) {
      moneyLeft.innerText = total.toLocaleString("vi-vn") + " VND";
    }
  });
}

// category

let monthSelector = document.getElementById("month-selector");
let moneyLeftValue = document.querySelector(".money-left-value");

function getNormalizedMonth(value) {
  if (!value) return "";

  return String(value).slice(0, 7);
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getMonthlyBudget(month) {
  let normalizedMonth = getNormalizedMonth(month);

  if (!normalizedMonth) return 0;

  let found = monthlyCategories.find(
    (item) => getNormalizedMonth(item.month) === normalizedMonth,
  );

  if (!found) return 0;

  return found.categories.reduce(
    (sum, cat) => sum + Number(cat.budget || 0),
    0,
  );
}

function getMonthlySpent(month) {
  let normalizedMonth = getNormalizedMonth(month);

  if (!normalizedMonth) return 0;

  return transactions
    .filter((item) => getNormalizedMonth(item.createdDate) === normalizedMonth)
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
}

function getMoneyLeftAmount(month) {
  return getMonthlyBudget(month) - getMonthlySpent(month);
}

function updateInfoMoneyLeftDisplay(month) {
  if (!moneyLeft) return;

  let total = getMoneyLeftAmount(month);
  moneyLeft.innerText = total.toLocaleString("vi-vn") + " VND";
}

function updateMoneyLeftDisplay(month) {
  if (!moneyLeftValue) return;

  let total = getMoneyLeftAmount(month);
  moneyLeftValue.innerText = total.toLocaleString("vi-vn") + " VND";
}

let nameInput = document.getElementById("name-input");
let maxPrice = document.getElementById("max-price");
let btnAddEl = document.getElementById("btn-add");
let listCard = document.getElementById("list-card");
let pendingInfoMonth = "";

function btnAdd(e) {
  e.preventDefault();

  if (!monthSelector || !listCard || !nameInput || !maxPrice) return;

  let name = nameInput.value;
  let price = maxPrice.value;
  let selectedMonth = getNormalizedMonth(monthSelector.value);

  if (selectedMonth === "" || name.trim() === "" || price === "") {
    return;
  }

  let newTransaction = {
    id: Date.now(),
    createdDate: selectedMonth,
    total: Number(price),
    description: name.trim(),
    categoryId: Date.now(),
    monthlyCategoryId: Date.now(),
  };

  transactions.push(newTransaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateMoneyLeftDisplay(selectedMonth);
  renderByMonth(selectedMonth);
  nameInput.value = "";
  maxPrice.value = "";
}

function getTransactionsByMonth(month) {
  let normalizedMonth = getNormalizedMonth(month);

  if (!normalizedMonth) return [];

  return transactions.filter(
    (item) => getNormalizedMonth(item.createdDate) === normalizedMonth,
  );
}

function renderByMonth(month) {
  render(getTransactionsByMonth(month));
}

function renderEmptyState() {
  if (!listCard) return;

  listCard.innerHTML = `
    <div class="card empty-card">
      <div class="content">
        <p class="title">Chưa có danh mục trong tháng này</p>
        <p class="price">Hãy chọn tháng và thêm danh mục mới.</p>
      </div>
    </div>
  `;
}

function render(transactions) {
  if (!listCard) return;

  listCard.innerHTML = "";

  if (transactions.length === 0) {
    renderEmptyState();
    return;
  }

  transactions.forEach((e) => {
    listCard.innerHTML += `
      <div class="card">
        <div class="icon">$</div>
        <div class="content">
          <p class="title">${e.description}</p>
          <p class="price">${e.total.toLocaleString("vi-vn")} VND</p>
        </div>
        <div class="actions">
          <button onclick="deleteBtn(${e.id})">✕</button>
          <button>✎</button>
        </div>
      </div>
    `;
  });
}

if (monthSelector) {
  monthSelector.addEventListener("change", function () {
    let selectedMonth = monthSelector.value;
    updateMoneyLeftDisplay(selectedMonth);
    renderByMonth(selectedMonth);
  });

  let initialMonth =
    getNormalizedMonth(monthSelector.value) || getCurrentMonth();
  monthSelector.value = initialMonth;
  updateMoneyLeftDisplay(initialMonth);
  renderByMonth(initialMonth);
}

if (!monthSelector && listCard) {
  render(transactions);
}

if (inputMonth) {
  inputMonth.addEventListener(
    "change",
    function () {
      pendingInfoMonth = inputMonth.value;
      updateInfoMoneyLeftDisplay(pendingInfoMonth);
    },
    true,
  );
}

if (btnSave && inputMonth) {
  btnSave.addEventListener(
    "click",
    function () {
      pendingInfoMonth = inputMonth.value;
    },
    true,
  );

  btnSave.addEventListener("click", function () {
    if (pendingInfoMonth) {
      updateInfoMoneyLeftDisplay(pendingInfoMonth);
    }
  });
}

function deleteBtn(id) {
  transactions = transactions.filter((e) => e.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  let selectedMonth = monthSelector
    ? monthSelector.value
    : inputMonth
      ? inputMonth.value
      : "";
  if (selectedMonth) {
    updateMoneyLeftDisplay(selectedMonth);
    renderByMonth(selectedMonth);
  } else {
    render(transactions);
  }
}
