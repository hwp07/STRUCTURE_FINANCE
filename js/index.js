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

let currentUserId = localStorage.getItem("currentUserId");

function getUserStorageKey(key) {
  return currentUserId ? `${key}_${currentUserId}` : key;
}

function getUserTransactions() {
  return (
    JSON.parse(localStorage.getItem(getUserStorageKey("transactions"))) || []
  );
}

function setUserTransactions(data) {
  localStorage.setItem(getUserStorageKey("transactions"), JSON.stringify(data));
}

function getUserMonthlyCategories() {
  return (
    JSON.parse(localStorage.getItem(getUserStorageKey("monthlyCategories"))) ||
    []
  );
}

function setUserMonthlyCategories(data) {
  localStorage.setItem(
    getUserStorageKey("monthlyCategories"),
    JSON.stringify(data),
  );
}

let transactions = getUserTransactions();
let monthlyCategories = getUserMonthlyCategories();

function normalizeMonthlyCategories(data) {
  let hasChanges = false;

  let normalizedData = data.map((item) => {
    let categories = Array.isArray(item.categories) ? item.categories : [];
    let legacyBudgetCategories = categories.filter(
      (category) =>
        Number(category?.budget || 0) > 0 &&
        !String(category?.description || "").trim(),
    );

    if (item.budget == null && legacyBudgetCategories.length > 0) {
      hasChanges = true;
    }

    return {
      ...item,
      budget:
        item.budget != null
          ? Number(item.budget || 0)
          : legacyBudgetCategories.reduce(
              (sum, category) => sum + Number(category.budget || 0),
              0,
            ),
      categories: categories.filter((category) =>
        String(category?.description || "").trim(),
      ),
    };
  });

  return { normalizedData, hasChanges };
}

let normalizedMonthlyCategoriesResult =
  normalizeMonthlyCategories(monthlyCategories);
monthlyCategories = normalizedMonthlyCategoriesResult.normalizedData;

if (normalizedMonthlyCategoriesResult.hasChanges) {
  setUserMonthlyCategories(monthlyCategories);
}

let optionHeaderEl =
  document.getElementById("select-account") ||
  document.getElementById("optionHeader");
let logoutOverlay = document.getElementById("logout-overlay");

let confirmBtn =
  document.getElementById("btn-confirm-logout") ||
  document.getElementById("confirm-btn");
let cancelBtn =
  document.getElementById("btn-cancel-logout") ||
  document.getElementById("cancel-btn");
let deleteOverlay = document.getElementById("delete-overlay");
let confirmDeleteBtn = document.getElementById("confirm-delete-btn");
let cancelDeleteBtn = document.getElementById("cancel-delete-btn");
let pendingDeleteId = null;
let updateOverlay = document.getElementById("update-overlay");
let closeUpdateBtn = document.getElementById("close-update-btn");
let cancelUpdateBtn = document.getElementById("cancel-update-btn");
let saveUpdateBtn = document.getElementById("save-update-btn");
let updateNameInput = document.getElementById("update-name-input");
let updateMaxPriceInput = document.getElementById("update-max-price");
let pendingUpdateId = null;
let loginPath = window.location.pathname.includes("/pages/")
  ? "./login.html"
  : "./pages/login.html";

function handleOption() {
  if (optionHeaderEl && logoutOverlay && optionHeaderEl.value === "logout") {
    logoutOverlay.style.display = "flex";
  }
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", function () {
    if (logoutOverlay) {
      logoutOverlay.style.display = "none";
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

if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener("click", function () {
    if (deleteOverlay) {
      deleteOverlay.style.display = "none";
    }

    pendingDeleteId = null;
  });
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", function () {
    if (pendingDeleteId === null) return;

    if (isCategoryPage) {
      let selectedMonth = getNormalizedMonth(monthSelector?.value);
      let monthlyCategory = getMonthCategoryRecord(selectedMonth);

      if (monthlyCategory) {
        monthlyCategory.categories = monthlyCategory.categories.filter(
          (item) => item.id !== pendingDeleteId,
        );
        setUserMonthlyCategories(monthlyCategories);
      }
    } else {
      transactions = transactions.filter((e) => e.id !== pendingDeleteId);
      setUserTransactions(transactions);
    }

    let selectedMonth = monthSelector
      ? monthSelector.value
      : inputMonth
        ? inputMonth.value
        : "";

    if (selectedMonth) {
      updateMoneyLeftDisplay(selectedMonth);
      renderByMonth(selectedMonth);
    } else if (!isCategoryPage) {
      render(transactions);
    }

    if (deleteOverlay) {
      deleteOverlay.style.display = "none";
    }

    pendingDeleteId = null;
  });
}

function closeUpdatePopup() {
  if (updateOverlay) {
    updateOverlay.style.display = "none";
  }

  pendingUpdateId = null;
}

if (closeUpdateBtn) {
  closeUpdateBtn.addEventListener("click", closeUpdatePopup);
}

if (cancelUpdateBtn) {
  cancelUpdateBtn.addEventListener("click", closeUpdatePopup);
}

if (saveUpdateBtn) {
  saveUpdateBtn.addEventListener("click", function () {
    if (
      pendingUpdateId === null ||
      !updateNameInput ||
      !updateMaxPriceInput ||
      !monthSelector
    ) {
      return;
    }

    let name = updateNameInput.value.trim();
    let price = updateMaxPriceInput.value.trim();

    if (name === "" || price === "") {
      return;
    }

    if (isCategoryPage) {
      let selectedMonth = getNormalizedMonth(monthSelector.value);
      let monthlyCategory = getMonthCategoryRecord(selectedMonth);
      let categoryIndex =
        monthlyCategory?.categories.findIndex(
          (item) => item.id === pendingUpdateId,
        ) ?? -1;

      if (!monthlyCategory || categoryIndex === -1) {
        closeUpdatePopup();
        return;
      }

      monthlyCategory.categories[categoryIndex] = {
        ...monthlyCategory.categories[categoryIndex],
        description: name,
        budget: Number(price),
      };

      setUserMonthlyCategories(monthlyCategories);
    } else {
      let transactionIndex = transactions.findIndex(
        (item) => item.id === pendingUpdateId,
      );

      if (transactionIndex === -1) {
        closeUpdatePopup();
        return;
      }

      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        description: name,
        total: Number(price),
      };

      setUserTransactions(transactions);
    }

    let selectedMonth = getNormalizedMonth(monthSelector.value);
    updateMoneyLeftDisplay(selectedMonth);
    renderByMonth(selectedMonth);
    closeUpdatePopup();
  });
}

function handleUpdateEnter(event) {
  if (event.key !== "Enter" || !saveUpdateBtn) return;

  event.preventDefault();
  saveUpdateBtn.click();
}

if (updateNameInput) {
  updateNameInput.addEventListener("keydown", handleUpdateEnter);
}

if (updateMaxPriceInput) {
  updateMaxPriceInput.addEventListener("keydown", handleUpdateEnter);
}

function checkAuth() {
  currentUserId = localStorage.getItem("currentUserId");

  if (!currentUserId) {
    window.location.replace(loginPath);
    return;
  }

  // Load user-specific data after xác thực
  transactions = getUserTransactions();
  monthlyCategories = getUserMonthlyCategories();
  let normalizedResult = normalizeMonthlyCategories(monthlyCategories);
  monthlyCategories = normalizedResult.normalizedData;

  if (normalizedResult.hasChanges) {
    setUserMonthlyCategories(monthlyCategories);
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
      found.budget = Number(budget);
    } else {
      monthlyCategories.push({
        id: Date.now(),
        month: month,
        budget: Number(budget),
        categories: [],
      });
    }

    // Tính tổng budget của tháng
    let totalBudget = getMonthlyBudget(month);

    if (moneyLeft) {
      moneyLeft.innerText = totalBudget.toLocaleString("vi-vn") + " VND";
    }

    setUserMonthlyCategories(monthlyCategories);

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
    let total = getMonthlyBudget(selectedMonth);
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

  if (found.budget != null) {
    return Number(found.budget || 0);
  }

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

function getMonthlyCategoryBudget(month) {
  return getCategoriesByMonth(month).reduce(
    (sum, item) => sum + Number(item.budget || 0),
    0,
  );
}

function getCategoryMoneyLeftAmount(month) {
  return getMonthlyBudget(month) - getMonthlyCategoryBudget(month);
}

function updateInfoMoneyLeftDisplay(month) {
  if (!moneyLeft) return;

  let total = getMoneyLeftAmount(month);
  moneyLeft.innerText = total.toLocaleString("vi-vn") + " VND";
}

function updateMoneyLeftDisplay(month) {
  if (!moneyLeftValue) return;

  let total = isCategoryPage
    ? getCategoryMoneyLeftAmount(month)
    : getMoneyLeftAmount(month);
  moneyLeftValue.innerText = total.toLocaleString("vi-vn") + " VND";
}

let nameInput = document.getElementById("name-input");
let maxPrice = document.getElementById("max-price");
let btnAddEl = document.getElementById("btn-add");
let listCard = document.getElementById("list-card");
let errNameInput = document.getElementById("err-name-input");
let errMaxPrice = document.getElementById("err-max-price");
let isCategoryPage = Boolean(
  monthSelector && nameInput && maxPrice && listCard,
);

function getMonthCategoryRecord(month) {
  let normalizedMonth = getNormalizedMonth(month);

  if (!normalizedMonth) return null;

  return (
    monthlyCategories.find(
      (item) => getNormalizedMonth(item.month) === normalizedMonth,
    ) || null
  );
}

function getCategoriesByMonth(month) {
  let monthlyCategory = getMonthCategoryRecord(month);
  return monthlyCategory ? monthlyCategory.categories || [] : [];
}

function btnAdd(e) {
  e.preventDefault();

  if (!monthSelector || !listCard || !nameInput || !maxPrice) return;

  let selectedOptionText =
    nameInput.tagName === "SELECT" && nameInput.selectedIndex >= 0
      ? nameInput.options[nameInput.selectedIndex].text.trim()
      : "";
  let name = selectedOptionText || nameInput.value.trim();
  let price = maxPrice.value.trim();
  let selectedMonth = getNormalizedMonth(monthSelector.value);
  let isValid = true;

  hideError(nameInput, errNameInput);
  hideError(maxPrice, errMaxPrice);

  if (name === "") {
    showError(nameInput, errNameInput);
    isValid = false;
  }

  if (price === "") {
    showError(maxPrice, errMaxPrice);
    isValid = false;
  }

  if (selectedMonth === "" || !isValid) {
    return;
  }

  // Tìm monthly category cho tháng đã chọn
  let monthlyCategory = monthlyCategories.find(
    (item) => getNormalizedMonth(item.month) === selectedMonth,
  );

  if (!monthlyCategory) {
    // Tạo monthly category mới nếu chưa có
    monthlyCategory = {
      id: Date.now(),
      month: selectedMonth,
      categories: [],
    };
    monthlyCategories.push(monthlyCategory);
  }

  // Thêm category mới vào monthly category
  const newCategory = {
    id: Date.now(),
    categoryId: Date.now(),
    budget: Number(price),
    description: name,
  };

  monthlyCategory.categories.push(newCategory);
  setUserMonthlyCategories(monthlyCategories);

  // Tạo transaction tương ứng để hiển thị
  updateMoneyLeftDisplay(selectedMonth);
  renderByMonth(selectedMonth);
  if (nameInput.tagName === "SELECT") {
    nameInput.selectedIndex = 0;
  } else {
    nameInput.value = "";
  }
  maxPrice.value = "";
}

function handleCategoryEnter(event) {
  if (event.key !== "Enter") return;

  btnAdd(event);
}

function getTransactionsByMonth(month) {
  let normalizedMonth = getNormalizedMonth(month);

  if (!normalizedMonth) return [];

  return transactions.filter(
    (item) => getNormalizedMonth(item.createdDate) === normalizedMonth,
  );
}

function renderByMonth(month) {
  if (isCategoryPage) {
    render(getCategoriesByMonth(month));
    return;
  }

  render(getTransactionsByMonth(month));
}

function renderEmptyState() {
  if (!listCard) return;

  listCard.innerHTML = `
    <div class="card empty-card">
      <div class="icon">📋</div>
      <div class="content">
        <p class="title">Chưa có danh mục trong tháng này</p>
        <p class="price">Hãy chọn tháng và thêm danh mục mới.</p>
      </div>
    </div>
  `;
}

function render(items) {
  if (!listCard) return;

  // Xóa nội dung cũ
  listCard.innerHTML = "";

  // Nếu không có transactions, hiển thị trạng thái trống
  if (!items || items.length === 0) {
    renderEmptyState();
    return;
  }

  // Tạo HTML cho tất cả cards một lần để tối ưu performance
  const cardsHTML = items
    .filter((item) => item && item.id)
    .map((item) => {
      const description = item.description || "Không có tên";
      const total = Number(item.total ?? item.budget) || 0;
      const formattedTotal = total.toLocaleString("vi-vn");

      return `
        <div class="card" data-id="${item.id}">
          <div class="icon">
            <img src="../assets/images/Vector.svg" alt="" />
          </div>
          <div class="content">
            <p class="title">${description}</p>
            <p class="price">${formattedTotal} VND</p>
          </div>
          <div class="actions">
            <button onclick="deleteBtn(${item.id})" class="delete-btn" title="Xóa">✕</button>
            <button onclick="openUpdatePopup(${item.id})" class="edit-btn" title="Sửa">✎</button>
          </div>
        </div>
      `;
    })
    .join("");

  // Set HTML một lần
  listCard.innerHTML = cardsHTML;
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

if (nameInput) {
  nameInput.addEventListener("keydown", handleCategoryEnter);
  nameInput.addEventListener("change", function () {
    let selectedOptionText =
      nameInput.tagName === "SELECT" && nameInput.selectedIndex >= 0
        ? nameInput.options[nameInput.selectedIndex].text.trim()
        : nameInput.value.trim();

    if (selectedOptionText !== "") {
      hideError(nameInput, errNameInput);
    }
  });
}

if (maxPrice) {
  maxPrice.addEventListener("keydown", handleCategoryEnter);
  maxPrice.addEventListener("input", function () {
    if (maxPrice.value.trim() !== "") {
      hideError(maxPrice, errMaxPrice);
    }
  });
}

if (!monthSelector && listCard) {
  render(transactions);
}

if (inputMonth) {
  inputMonth.addEventListener(
    "change",
    function () {
      updateInfoMoneyLeftDisplay(inputMonth.value);
    },
    true,
  );
}

function deleteBtn(id) {
  pendingDeleteId = id;

  if (deleteOverlay) {
    deleteOverlay.style.display = "flex";
  }
}

function openUpdatePopup(id) {
  if (!updateOverlay || !updateNameInput || !updateMaxPriceInput) return;

  let selectedTransaction = isCategoryPage
    ? getCategoriesByMonth(monthSelector?.value).find((item) => item.id === id)
    : transactions.find((item) => item.id === id);

  if (!selectedTransaction) return;

  pendingUpdateId = id;
  updateNameInput.value = selectedTransaction.description || "";
  updateMaxPriceInput.value =
    selectedTransaction.total ?? selectedTransaction.budget ?? "";
  updateOverlay.style.display = "flex";
}
