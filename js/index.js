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
let users = JSON.parse(localStorage.getItem("user")) || [];

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
let updateErrNameInput = document.getElementById("update-err-name-input");
let updateErrMaxPriceInput = document.getElementById("update-err-max-price");
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
      let idsToDelete = Array.isArray(pendingDeleteId)
        ? pendingDeleteId
        : [pendingDeleteId];

      transactions = transactions.filter((e) => !idsToDelete.includes(e.id));
      setUserTransactions(transactions);
    }

    let selectedMonth = monthSelector
      ? monthSelector.value
      : historyMonthSelector
        ? historyMonthSelector.value
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

  hideError(updateNameInput, updateErrNameInput);
  hideError(updateMaxPriceInput, updateErrMaxPriceInput);

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
    if (pendingUpdateId === null || !updateNameInput || !updateMaxPriceInput) {
      return;
    }

    let name = updateNameInput.value.trim();
    let price = updateMaxPriceInput.value.trim();

    if (isCategoryPage) {
      hideError(updateNameInput, updateErrNameInput);
      hideError(updateMaxPriceInput, updateErrMaxPriceInput);

      let isValid = true;

      if (name === "") {
        showError(updateNameInput, updateErrNameInput);
        isValid = false;
      }

      if (price === "") {
        showError(updateMaxPriceInput, updateErrMaxPriceInput);
        isValid = false;
      }

      if (!isValid) {
        return;
      }
    } else if (name === "" || price === "") {
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

      // Cập nhật categoryName trong transactions
      transactions.forEach((transaction) => {
        if (String(transaction.categoryId) === String(pendingUpdateId)) {
          transaction.categoryName = name;
        }
      });
      setUserTransactions(transactions);
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
        description: transactions[transactionIndex].categoryName || name,
        note: name,
        total: Number(price),
      };

      setUserTransactions(transactions);
    }

    let selectedMonth = getNormalizedMonth(getSelectedMonthValue());
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
  updateNameInput.addEventListener("input", function () {
    if (updateNameInput.value.trim() !== "") {
      hideError(updateNameInput, updateErrNameInput);
    }
  });
}

if (updateMaxPriceInput) {
  updateMaxPriceInput.addEventListener("keydown", handleUpdateEnter);
  updateMaxPriceInput.addEventListener("input", function () {
    if (updateMaxPriceInput.value.trim() !== "") {
      hideError(updateMaxPriceInput, updateErrMaxPriceInput);
    }
  });
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

  users = JSON.parse(localStorage.getItem("user")) || [];
}

function revealPage() {
  document.documentElement.classList.remove("preload");
  document.documentElement.classList.add("page-ready");
}

let inputMonth = document.getElementById("input-month");
let inputBudget = document.getElementById("input-budget");
let btnSave = document.getElementById("btn-save-budget");
let moneyLeft = document.getElementById("text-money-left");
let inputNameEl = document.getElementById("input-name");
let inputEmailEl = document.getElementById("input-email");
let inputPhoneEl = document.getElementById("input-phone");
let inputGenderEl = document.getElementById("input-gender");
let btnChangeInfoEl = document.getElementById("btn-change-info");
let changeInfoOverlayEl = document.getElementById("change-info-overlay");
let changeInfoCloseEl = document.getElementById("change-info-close");
let changeInfoCancelEl = document.getElementById("change-info-cancel");
let changeInfoSaveEl = document.getElementById("change-info-save");
let modalInputNameEl = document.getElementById("modal-input-name");
let modalInputEmailEl = document.getElementById("modal-input-email");
let modalInputPhoneEl = document.getElementById("modal-input-phone");
let modalInputGenderEl = document.getElementById("modal-input-gender");

let errMonth = document.getElementById("err-month");
let errBudget = document.getElementById("err-budget");
let errInfoNameEl = document.getElementById("err-info-name");
let errInfoEmailEl = document.getElementById("err-info-email");
let errInfoPhoneEl = document.getElementById("err-info-phone");
let errInfoGenderEl = document.getElementById("err-info-gender");
let modalErrNameEl = document.getElementById("modal-err-name");
let modalErrEmailEl = document.getElementById("modal-err-email");
let modalErrPhoneEl = document.getElementById("modal-err-phone");
let modalErrGenderEl = document.getElementById("modal-err-gender");
let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Change Password elements
let btnChangePasswordEl = document.getElementById("btn-change-password");
let changePasswordOverlayEl = document.getElementById(
  "change-password-overlay",
);
let changePasswordCloseEl = document.getElementById("change-password-close");
let changePasswordCancelEl = document.getElementById("change-password-cancel");
let changePasswordSaveEl = document.getElementById("change-password-save");
let changePasswordOldEl = document.getElementById("change-password-old");
let changePasswordNewEl = document.getElementById("change-password-new");
let changePasswordConfirmEl = document.getElementById(
  "change-password-confirm",
);
let changePasswordErrOldEl = document.getElementById("change-password-err-old");
let changePasswordErrNewEl = document.getElementById("change-password-err-new");
let changePasswordErrConfirmEl = document.getElementById(
  "change-password-err-confirm",
);
let changePasswordSuccessEl = document.getElementById(
  "change-password-success",
);

checkAuth();
revealPage();
fillUserInformation();
window.addEventListener("DOMContentLoaded", revealPage);
window.addEventListener("pageshow", function () {
  checkAuth();
  revealPage();
  fillUserInformation();
  closeChangeInfoModal();
  closeChangePasswordModal();
  let selectedMonth = getSelectedMonthValue();

  if (selectedMonth) {
    updateInfoMoneyLeftDisplay(selectedMonth);
    updateMoneyLeftDisplay(selectedMonth);
    renderByMonth(selectedMonth);
  }
});

if (btnChangeInfoEl) {
  btnChangeInfoEl.addEventListener("click", function () {
    openChangeInfoModal();
  });
}

if (changeInfoCloseEl) {
  changeInfoCloseEl.addEventListener("click", closeChangeInfoModal);
}

if (changeInfoCancelEl) {
  changeInfoCancelEl.addEventListener("click", closeChangeInfoModal);
}

if (changeInfoSaveEl) {
  changeInfoSaveEl.addEventListener("click", function () {
    saveChangeInfoFromModal();
  });
}

if (inputNameEl) {
  inputNameEl.addEventListener("input", function () {
    hideError(inputNameEl, errInfoNameEl);
  });
}

if (inputEmailEl) {
  inputEmailEl.addEventListener("input", function () {
    hideError(inputEmailEl, errInfoEmailEl);
  });
}

if (inputPhoneEl) {
  inputPhoneEl.addEventListener("input", function () {
    hideError(inputPhoneEl, errInfoPhoneEl);
  });
}

if (inputGenderEl) {
  inputGenderEl.addEventListener("input", function () {
    hideError(inputGenderEl, errInfoGenderEl);
  });
}

if (modalInputNameEl) {
  modalInputNameEl.addEventListener("input", function () {
    hideError(modalInputNameEl, modalErrNameEl);
  });
}

if (modalInputEmailEl) {
  modalInputEmailEl.addEventListener("input", function () {
    hideError(modalInputEmailEl, modalErrEmailEl);
  });
}

if (modalInputPhoneEl) {
  modalInputPhoneEl.addEventListener("input", function () {
    hideError(modalInputPhoneEl, modalErrPhoneEl);
  });
}

if (modalInputGenderEl) {
  modalInputGenderEl.addEventListener("change", function () {
    hideError(modalInputGenderEl, modalErrGenderEl);
  });
}

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

function getCurrentUserRecord() {
  users = JSON.parse(localStorage.getItem("user")) || [];

  return (
    users.find((user) => String(user.id) === String(currentUserId)) || null
  );
}

function fillUserInformation() {
  let currentUser = getCurrentUserRecord();

  if (!currentUser) return;

  if (inputNameEl) inputNameEl.value = currentUser.fullName || "";
  if (inputEmailEl) inputEmailEl.value = currentUser.email || "";
  if (inputPhoneEl) inputPhoneEl.value = currentUser.phone || "";

  if (inputGenderEl) {
    if (typeof currentUser.gender === "boolean") {
      inputGenderEl.value = currentUser.gender ? "Male" : "Female";
    } else {
      inputGenderEl.value = currentUser.gender || "";
    }
  }
}

function fillChangeInfoModal() {
  let currentUser = getCurrentUserRecord();

  if (!currentUser) return;
  if (modalInputNameEl) modalInputNameEl.value = currentUser.fullName || "";
  if (modalInputEmailEl) modalInputEmailEl.value = currentUser.email || "";
  if (modalInputPhoneEl) modalInputPhoneEl.value = currentUser.phone || "";

  if (modalInputGenderEl) {
    if (typeof currentUser.gender === "boolean") {
      modalInputGenderEl.value = currentUser.gender ? "Male" : "Female";
    } else {
      modalInputGenderEl.value = currentUser.gender || "";
    }
  }
}

function closeChangeInfoModal() {
  if (changeInfoOverlayEl) {
    changeInfoOverlayEl.style.display = "none";
  }

  hideError(modalInputNameEl, modalErrNameEl);
  hideError(modalInputEmailEl, modalErrEmailEl);
  hideError(modalInputPhoneEl, modalErrPhoneEl);
  hideError(modalInputGenderEl, modalErrGenderEl);
}

function openChangeInfoModal() {
  fillChangeInfoModal();

  if (changeInfoOverlayEl) {
    changeInfoOverlayEl.style.display = "flex";
  }
}

function validateChangeInformation() {
  let isValid = true;
  let name = inputNameEl?.value.trim() || "";
  let email = inputEmailEl?.value.trim() || "";
  let phone = inputPhoneEl?.value.trim() || "";
  let gender = inputGenderEl?.value.trim() || "";

  hideError(inputNameEl, errInfoNameEl);
  hideError(inputEmailEl, errInfoEmailEl);
  hideError(inputPhoneEl, errInfoPhoneEl);
  hideError(inputGenderEl, errInfoGenderEl);

  if (!name) {
    showError(inputNameEl, errInfoNameEl);
    isValid = false;
  }

  if (!email || !emailRegex.test(email)) {
    if (errInfoEmailEl) {
      errInfoEmailEl.innerText = "Invalid email";
    }
    showError(inputEmailEl, errInfoEmailEl);
    isValid = false;
  } else {
    let duplicatedUser = users.find(
      (user) =>
        String(user.id) !== String(currentUserId) &&
        String(user.email || "").toLowerCase() === email.toLowerCase(),
    );

    if (duplicatedUser) {
      if (errInfoEmailEl) {
        errInfoEmailEl.innerText = "Email already exists";
      }
      showError(inputEmailEl, errInfoEmailEl);
      isValid = false;
    }
  }

  if (!phone) {
    showError(inputPhoneEl, errInfoPhoneEl);
    isValid = false;
  }

  if (!gender) {
    showError(inputGenderEl, errInfoGenderEl);
    isValid = false;
  }

  return isValid;
}

function saveChangeInformation() {
  if (!validateChangeInformation()) {
    return;
  }

  let userIndex = users.findIndex(
    (user) => String(user.id) === String(currentUserId),
  );

  if (userIndex === -1) return;

  let normalizedGender = inputGenderEl.value.trim();

  if (/^male$/i.test(normalizedGender)) {
    normalizedGender = true;
  } else if (/^female$/i.test(normalizedGender)) {
    normalizedGender = false;
  }

  users[userIndex] = {
    ...users[userIndex],
    fullName: inputNameEl.value.trim(),
    email: inputEmailEl.value.trim(),
    phone: inputPhoneEl.value.trim(),
    gender: normalizedGender,
  };

  localStorage.setItem("user", JSON.stringify(users));

  fillUserInformation();
}

function validateChangeInfoModal() {
  let isValid = true;
  let name = modalInputNameEl?.value.trim() || "";
  let email = modalInputEmailEl?.value.trim() || "";
  let phone = modalInputPhoneEl?.value.trim() || "";
  let gender = modalInputGenderEl?.value.trim() || "";

  hideError(modalInputNameEl, modalErrNameEl);
  hideError(modalInputEmailEl, modalErrEmailEl);
  hideError(modalInputPhoneEl, modalErrPhoneEl);
  hideError(modalInputGenderEl, modalErrGenderEl);

  if (!name) {
    showError(modalInputNameEl, modalErrNameEl);
    isValid = false;
  }

  if (!email || !emailRegex.test(email)) {
    if (modalErrEmailEl) {
      modalErrEmailEl.innerText = "Invalid email";
    }
    showError(modalInputEmailEl, modalErrEmailEl);
    isValid = false;
  } else {
    let duplicatedUser = users.find(
      (user) =>
        String(user.id) !== String(currentUserId) &&
        String(user.email || "").toLowerCase() === email.toLowerCase(),
    );

    if (duplicatedUser) {
      if (modalErrEmailEl) {
        modalErrEmailEl.innerText = "Email already exists";
      }
      showError(modalInputEmailEl, modalErrEmailEl);
      isValid = false;
    }
  }

  if (!phone) {
    showError(modalInputPhoneEl, modalErrPhoneEl);
    isValid = false;
  }

  if (!gender) {
    showError(modalInputGenderEl, modalErrGenderEl);
    isValid = false;
  }

  return isValid;
}

function saveChangeInfoFromModal() {
  if (!validateChangeInfoModal()) {
    return;
  }

  let userIndex = users.findIndex(
    (user) => String(user.id) === String(currentUserId),
  );

  if (userIndex === -1) return;

  let normalizedGender = modalInputGenderEl.value.trim();

  if (/^male$/i.test(normalizedGender)) {
    normalizedGender = true;
  } else if (/^female$/i.test(normalizedGender)) {
    normalizedGender = false;
  }

  users[userIndex] = {
    ...users[userIndex],
    fullName: modalInputNameEl.value.trim(),
    email: modalInputEmailEl.value.trim(),
    phone: modalInputPhoneEl.value.trim(),
    gender: normalizedGender,
  };

  localStorage.setItem("user", JSON.stringify(users));
  fillUserInformation();

  closeChangeInfoModal();
}

// Change Password Functions
function closeChangePasswordModal() {
  if (changePasswordOverlayEl) {
    changePasswordOverlayEl.style.display = "none";
  }

  hideError(changePasswordOldEl, changePasswordErrOldEl);
  hideError(changePasswordNewEl, changePasswordErrNewEl);
  hideError(changePasswordConfirmEl, changePasswordErrConfirmEl);

  changePasswordOldEl.value = "";
  changePasswordNewEl.value = "";
  changePasswordConfirmEl.value = "";
}

function openChangePasswordModal() {
  if (changePasswordOverlayEl) {
    changePasswordOverlayEl.style.display = "flex";
  }
  hideChangePasswordSuccess();
}

function hideChangePasswordSuccess() {
  if (!changePasswordSuccessEl) return;
  changePasswordSuccessEl.style.display = "none";
}

function showChangePasswordSuccess() {
  if (!changePasswordSuccessEl) return;
  changePasswordSuccessEl.style.display = "block";
}

function validateChangePassword() {
  let isValid = true;
  let oldPassword = changePasswordOldEl?.value.trim() || "";
  let newPassword = changePasswordNewEl?.value.trim() || "";
  let confirmPassword = changePasswordConfirmEl?.value.trim() || "";

  hideError(changePasswordOldEl, changePasswordErrOldEl);
  hideError(changePasswordNewEl, changePasswordErrNewEl);
  hideError(changePasswordConfirmEl, changePasswordErrConfirmEl);

  if (!oldPassword) {
    showError(changePasswordOldEl, changePasswordErrOldEl);
    isValid = false;
  } else {
    let currentUser = getCurrentUserRecord();
    if (!currentUser || currentUser.password !== oldPassword) {
      if (changePasswordErrOldEl) {
        changePasswordErrOldEl.innerText = "Old password is incorrect";
      }
      showError(changePasswordOldEl, changePasswordErrOldEl);
      isValid = false;
    }
  }

  if (!newPassword) {
    showError(changePasswordNewEl, changePasswordErrNewEl);
    isValid = false;
  }

  if (!confirmPassword) {
    if (changePasswordErrConfirmEl) {
      changePasswordErrConfirmEl.innerText = "Please confirm your new password";
    }
    showError(changePasswordConfirmEl, changePasswordErrConfirmEl);
    isValid = false;
  } else if (newPassword !== confirmPassword) {
    if (changePasswordErrConfirmEl) {
      changePasswordErrConfirmEl.innerText = "Passwords do not match";
    }
    showError(changePasswordConfirmEl, changePasswordErrConfirmEl);
    isValid = false;
  }

  return isValid;
}

function saveChangePassword() {
  if (!validateChangePassword()) {
    hideChangePasswordSuccess();
    return;
  }

  let userIndex = users.findIndex(
    (user) => String(user.id) === String(currentUserId),
  );

  if (userIndex === -1) return;

  users[userIndex] = {
    ...users[userIndex],
    password: changePasswordNewEl.value.trim(),
  };

  localStorage.setItem("user", JSON.stringify(users));
  closeChangePasswordModal();
  showChangePasswordSuccess();
}

// Change Password Event Listeners
if (btnChangePasswordEl) {
  btnChangePasswordEl.addEventListener("click", function () {
    openChangePasswordModal();
  });
}

if (changePasswordCloseEl) {
  changePasswordCloseEl.addEventListener("click", closeChangePasswordModal);
}

if (changePasswordCancelEl) {
  changePasswordCancelEl.addEventListener("click", closeChangePasswordModal);
}

if (changePasswordSaveEl) {
  changePasswordSaveEl.addEventListener("click", function () {
    saveChangePassword();
  });
}

if (changePasswordOldEl) {
  changePasswordOldEl.addEventListener("input", function () {
    if (changePasswordOldEl.value.trim()) {
      hideError(changePasswordOldEl, changePasswordErrOldEl);
    }
  });
}

if (changePasswordNewEl) {
  changePasswordNewEl.addEventListener("input", function () {
    if (changePasswordNewEl.value.trim()) {
      hideError(changePasswordNewEl, changePasswordErrNewEl);
    }
  });
}

if (changePasswordConfirmEl) {
  changePasswordConfirmEl.addEventListener("input", function () {
    if (changePasswordConfirmEl.value.trim()) {
      hideError(changePasswordConfirmEl, changePasswordErrConfirmEl);
    }
  });
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

if (btnSave && inputMonth && inputBudget) {
  btnSave.addEventListener(
    "click",
    function () {
      let selectedMonth = inputMonth.value;

      setTimeout(function () {
        if (selectedMonth) {
          updateInfoMoneyLeftDisplay(selectedMonth);
        }
      }, 0);
    },
    true,
  );
}

if (inputMonth) {
  inputMonth.addEventListener("change", function () {
    let selectedMonth = inputMonth.value;
    let total = getMonthlyBudget(selectedMonth);
    if (moneyLeft) {
      moneyLeft.innerText = total.toLocaleString("vi-vn") + " VND";
    }
  });

  inputMonth.addEventListener("change", function () {
    updateInfoMoneyLeftDisplay(inputMonth.value);
  });
}

// category

let monthSelector = document.getElementById("month-selector");
let historyMonthSelector = document.getElementById("history-month-selector");
let moneyLeftValue = document.querySelector(".money-left-value");
let historyAmountInput = document.getElementById("history-amount-input");
let historyCategorySelect = document.getElementById("history-category-select");
let historyNoteInput = document.getElementById("history-note-input");
let historyAddBtn = document.getElementById("history-add-btn");
let historyTableBody = document.getElementById("history-table-body");
let historyPagination = document.getElementById("history-pagination");
let historySortSelect = document.getElementById("history-sort-select");
let historySearchInput = document.getElementById("history-search-input");
let historySearchBtn = document.getElementById("history-search-btn");
let historyErrMonth = document.getElementById("history-err-month");
let historyErrAmount = document.getElementById("history-err-amount");
let historyErrCategory = document.getElementById("history-err-category");
let historyErrNote = document.getElementById("history-err-note");
let historyErrSearch = document.getElementById("history-err-search");
let historyAlertBox = document.querySelector(".alert-box");
let historyAlertContent = document.querySelector(".alert-content p");
let historyItemsPerPage = 5;
let currentHistoryPage = 1;
let lastHistoryWarningKey = "";
let historyAlertTimeoutId = null;
const HISTORY_ALERT_AUTO_HIDE_MS = 3000;

function getNormalizedMonth(value) {
  if (!value) return "";

  return String(value).slice(0, 7);
}

function getCurrentMonth() {
  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
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

  let total = getMoneyLeftAmount(month);
  moneyLeftValue.innerText = total.toLocaleString("vi-vn") + " VND";
}

let nameInput = document.getElementById("name-input");
let maxPrice = document.getElementById("max-price");
let btnAddEl = document.getElementById("btn-add");
let listCard = document.getElementById("list-card");
let errNameInput = document.getElementById("err-name-input");
let errMaxPrice = document.getElementById("err-max-price");
let errMonthSelector = document.getElementById("err-month-selector");
let isCategoryPage = Boolean(
  monthSelector && nameInput && maxPrice && listCard,
);
let isHistoryPage = Boolean(
  historyMonthSelector &&
  historyAmountInput &&
  historyCategorySelect &&
  historyNoteInput &&
  historyAddBtn &&
  historyTableBody,
);

function getSelectedMonthValue() {
  if (monthSelector) return monthSelector.value;
  if (historyMonthSelector) return historyMonthSelector.value;
  if (inputMonth) return inputMonth.value;

  return "";
}

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

  let selectedOptionValue =
    nameInput.tagName === "SELECT" ? nameInput.value.trim() : "";
  let selectedOptionText =
    nameInput.tagName === "SELECT" && selectedOptionValue
      ? nameInput.options[nameInput.selectedIndex].text.trim()
      : "";
  let name =
    nameInput.tagName === "SELECT"
      ? selectedOptionText
      : nameInput.value.trim();
  let price = maxPrice.value.trim();
  let selectedMonth = getNormalizedMonth(monthSelector.value);
  let isValid = true;

  hideError(nameInput, errNameInput);
  hideError(maxPrice, errMaxPrice);
  hideError(monthSelector, errMonthSelector);

  if (
    nameInput.tagName === "SELECT" ? selectedOptionValue === "" : name === ""
  ) {
    showError(nameInput, errNameInput);
    isValid = false;
  }

  if (price === "") {
    showError(maxPrice, errMaxPrice);
    isValid = false;
  }

  if (selectedMonth === "") {
    showError(monthSelector, errMonthSelector);
    isValid = false;
  }

  if (!isValid) {
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

function normalizeHistoryCategoryName(value) {
  let normalizedValue = String(value || "").trim().toLowerCase();
  return normalizedValue || "khac";
}

function getResolvedHistoryCategoryName(item) {
  return (
    String(
      item.categoryName ||
        getCategoriesByMonth(item.createdDate).find(
          (category) => category.id === item.categoryId,
        )?.description ||
        "Khac",
    ).trim() || "Khac"
  );
}

function getUniqueHistoryCategories(month) {
  let uniqueCategories = new Map();

  getCategoriesByMonth(month).forEach((item) => {
    let label = String(item.description || "").trim();

    if (!label) return;

    let categoryKey = normalizeHistoryCategoryName(label);

    if (!uniqueCategories.has(categoryKey)) {
      uniqueCategories.set(categoryKey, item);
    }
  });

  return Array.from(uniqueCategories.values());
}

function getHistoryCategoryBudget(month, categoryName) {
  let categoryKey = normalizeHistoryCategoryName(categoryName);

  return getCategoriesByMonth(month)
    .filter(
      (item) =>
        normalizeHistoryCategoryName(item.description || "") === categoryKey,
    )
    .reduce((sum, item) => sum + Number(item.budget || 0), 0);
}

function populateHistoryCategoryOptions(month) {
  if (!historyCategorySelect) return;

  let categories = getUniqueHistoryCategories(month);
  let selectedValue = historyCategorySelect.value;
  let options = ['<option value="">Danh mục chi tiêu</option>'];

  categories.forEach((item) => {
    let label = String(item.description || "").trim();

    if (!label) return;

    options.push(`<option value="${item.id}">${label}</option>`);
  });

  historyCategorySelect.innerHTML = options.join("");

  if (selectedValue) {
    historyCategorySelect.value = selectedValue;
  }
}

function getFilteredHistoryItems(items) {
  let keyword = String(historySearchInput?.value || "")
    .trim()
    .toLowerCase();

  if (!keyword) {
    return [...items];
  }

  return items.filter((item) => {
    let categoryName = getResolvedHistoryCategoryName(item).toLowerCase();
    let note = String(item.note || item.description || "").toLowerCase();
    let amount = String(item.total || "");
    let amountFormatted = Number(item.total || 0).toLocaleString("vi-vn");

    return (
      categoryName.includes(keyword) ||
      note.includes(keyword) ||
      amount.includes(keyword) ||
      amountFormatted.includes(keyword)
    );
  });
}

function getGroupedHistoryItems(items) {
  let groupedMap = new Map();

  items.forEach((item) => {
    let categoryName = getResolvedHistoryCategoryName(item);
    let groupKey = normalizeHistoryCategoryName(categoryName);
    let existingGroup = groupedMap.get(groupKey);

    if (!existingGroup) {
      groupedMap.set(groupKey, {
        id: item.id,
        categoryId: item.categoryId,
        categoryName: categoryName,
        total: Number(item.total || 0),
        note: String(item.note || item.description || "").trim(),
        groupedTransactionIds: [item.id],
      });
      return;
    }

    existingGroup.total += Number(item.total || 0);
    existingGroup.groupedTransactionIds.push(item.id);

    let nextNote = String(item.note || item.description || "").trim();

    if (nextNote && !existingGroup.note.includes(nextNote)) {
      existingGroup.note = existingGroup.note
        ? `${existingGroup.note}, ${nextNote}`
        : nextNote;
    }
  });

  return Array.from(groupedMap.values());
}

function getOverBudgetHistoryGroups(month) {
  let groupedItems = getGroupedHistoryItems(getTransactionsByMonth(month));

  return groupedItems
    .map((item) => ({
      ...item,
      budget: getHistoryCategoryBudget(month, item.categoryName),
    }))
    .filter(
      (item) =>
        Number(item.budget || 0) > 0 &&
        Number(item.total || 0) > Number(item.budget || 0),
    );
}

function showHistoryAlert(message) {
  if (!historyAlertBox || !historyAlertContent) return;

  if (historyAlertTimeoutId) {
    clearTimeout(historyAlertTimeoutId);
    historyAlertTimeoutId = null;
  }

  historyAlertContent.textContent = message;
  historyAlertBox.style.display = "flex";
  // Trigger reflow to ensure display change takes effect
  historyAlertBox.offsetHeight;
  historyAlertBox.classList.add("show");

  historyAlertTimeoutId = setTimeout(() => {
    hideHistoryAlert();
  }, HISTORY_ALERT_AUTO_HIDE_MS);
}

function hideHistoryAlert() {
  if (!historyAlertBox) return;

  if (historyAlertTimeoutId) {
    clearTimeout(historyAlertTimeoutId);
    historyAlertTimeoutId = null;
  }

  historyAlertBox.classList.remove("show");
  // Wait for transition to complete before hiding
  setTimeout(() => {
    historyAlertBox.style.display = "none";
  }, 300);
}

function notifyHistoryBudgetWarning(month, force = false) {
  if (!isHistoryPage) return;

  let normalizedMonth = getNormalizedMonth(month);

  if (!normalizedMonth) {
    lastHistoryWarningKey = "";
    hideHistoryAlert();
    return;
  }

  let exceededGroups = getOverBudgetHistoryGroups(normalizedMonth);

  if (exceededGroups.length === 0) {
    lastHistoryWarningKey = "";
    hideHistoryAlert();
    return;
  }

  let warningKey = exceededGroups
    .map(
      (item) =>
        `${normalizeHistoryCategoryName(item.categoryName)}:${item.total}:${item.budget}`,
    )
    .join("|");

  if (!force && lastHistoryWarningKey === `${normalizedMonth}|${warningKey}`) {
    return;
  }

  lastHistoryWarningKey = `${normalizedMonth}|${warningKey}`;

  let message = exceededGroups
    .map(
      (item) =>
        `Danh mục "${item.categoryName}" đã vượt giới hạn: ${Number(item.total || 0).toLocaleString("vi-vn")} / ${Number(getCategoriesByMonth(normalizedMonth).find((cat) => cat.id === item.categoryId)?.budget || 0).toLocaleString("vi-vn")} VND`,
    )
    .join("; ");

  let mergedMessage = exceededGroups
    .map(
      (item) =>
        `Danh muc "${item.categoryName}" vuot gioi han: ${Number(item.total || 0).toLocaleString("vi-vn")} / ${Number(item.budget || 0).toLocaleString("vi-vn")} VND`,
    )
    .join("; ");

  showHistoryAlert(mergedMessage);
}

function validateHistoryForm() {
  let isValid = true;

  hideError(historyMonthSelector, historyErrMonth);
  hideError(historyAmountInput, historyErrAmount);
  hideError(historyCategorySelect, historyErrCategory);
  hideError(historyNoteInput, historyErrNote);

  if (!historyMonthSelector?.value) {
    showError(historyMonthSelector, historyErrMonth);
    isValid = false;
  }

  if (!historyAmountInput?.value.trim()) {
    showError(historyAmountInput, historyErrAmount);
    isValid = false;
  }

  if (!historyCategorySelect?.value) {
    showError(historyCategorySelect, historyErrCategory);
    isValid = false;
  }

  if (!historyNoteInput?.value.trim()) {
    showError(historyNoteInput, historyErrNote);
    isValid = false;
  }

  return isValid;
}

function renderHistoryTable(items) {
  if (!historyTableBody) return;

  let filteredItems = getFilteredHistoryItems(items);

  if (!filteredItems || filteredItems.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="history-empty-cell">
          Không tìm thấy giao dịch!
        </td>
      </tr>
    `;
    renderHistoryPagination(0);
    return;
  }

  let sortedItems = [...filteredItems];

  if (historySortSelect?.value === "asc") {
    sortedItems.sort((a, b) => Number(a.total || 0) - Number(b.total || 0));
  } else if (historySortSelect?.value === "desc") {
    sortedItems.sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
  }

  let totalPages = Math.ceil(sortedItems.length / historyItemsPerPage);

  if (currentHistoryPage > totalPages) {
    currentHistoryPage = totalPages;
  }

  if (currentHistoryPage < 1) {
    currentHistoryPage = 1;
  }

  let startIndex = (currentHistoryPage - 1) * historyItemsPerPage;
  let paginatedItems = sortedItems.slice(
    startIndex,
    startIndex + historyItemsPerPage,
  );

  historyTableBody.innerHTML = paginatedItems
    .map((item, index) => {
      let amount = Number(item.total || 0).toLocaleString("vi-vn");
      let categoryName = getResolvedHistoryCategoryName(item);
      let note = item.note || item.description || "";

      return `
        <tr>
          <td>${startIndex + index + 1}</td>
          <td>${categoryName}</td>
          <td>${amount} VND</td>
          <td>${note || "-"}</td>
          <td class="delete">
            <img
              src="../assets/images/Trash.png"
              alt="Delete"
              onclick="deleteHistoryGroup(${Number(item.id)})"
              style="cursor: pointer"
            />
          </td>
        </tr>
      `;
    })
    .join("");

  renderHistoryPagination(totalPages);
}

function renderHistoryPagination(totalPages) {
  if (!historyPagination) return;

  if (!totalPages || totalPages <= 1) {
    historyPagination.innerHTML = `
      <button type="button" ${currentHistoryPage <= 1 ? "disabled" : ""}>←</button>
      <button type="button" class="active">1</button>
      <button type="button" ${currentHistoryPage >= 1 ? "disabled" : ""}>→</button>
    `;
    return;
  }

  let pageButtons = Array.from({ length: totalPages }, function (_, index) {
    let page = index + 1;

    return `
        <button
          type="button"
          class="${page === currentHistoryPage ? "active" : ""}"
          onclick="goToHistoryPage(${page})"
        >
          ${page}
        </button>
      `;
  }).join("");

  historyPagination.innerHTML = `
    <button
      type="button"
      onclick="goToHistoryPage(${currentHistoryPage - 1})"
      ${currentHistoryPage <= 1 ? "disabled" : ""}
    >
      ←
    </button>
    ${pageButtons}
    <button
      type="button"
      onclick="goToHistoryPage(${currentHistoryPage + 1})"
      ${currentHistoryPage >= totalPages ? "disabled" : ""}
    >
      →
    </button>
  `;
}

function goToHistoryPage(page) {
  let selectedMonth = historyMonthSelector?.value || "";
  let totalItems = getFilteredHistoryItems(
    getTransactionsByMonth(selectedMonth),
  ).length;
  let totalPages = Math.max(1, Math.ceil(totalItems / historyItemsPerPage));

  if (page < 1 || page > totalPages) {
    return;
  }

  currentHistoryPage = page;
  renderByMonth(selectedMonth);
}

function renderByMonth(month) {
  if (isCategoryPage) {
    render(getCategoriesByMonth(month));
    return;
  }

  if (isHistoryPage) {
    renderHistoryTable(getTransactionsByMonth(month));
    populateHistoryCategoryOptions(month);
    notifyHistoryBudgetWarning(month);
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
    if (selectedMonth !== "") {
      hideError(monthSelector, errMonthSelector);
    }
    updateMoneyLeftDisplay(selectedMonth);
    renderByMonth(selectedMonth);
  });

  monthSelector.value = "";
  updateMoneyLeftDisplay("");
  renderByMonth("");
}

if (historyMonthSelector) {
  historyMonthSelector.addEventListener("change", function () {
    let selectedMonth = historyMonthSelector.value;
    currentHistoryPage = 1;
    hideError(historyMonthSelector, historyErrMonth);
    updateMoneyLeftDisplay(selectedMonth);
    renderByMonth(selectedMonth);
  });

  historyMonthSelector.value = "";
  updateMoneyLeftDisplay("");
  renderByMonth("");
}

if (historySortSelect) {
  historySortSelect.addEventListener("change", function () {
    currentHistoryPage = 1;
    renderByMonth(historyMonthSelector?.value || "");
  });
}

if (historySearchInput) {
  historySearchInput.addEventListener("input", function () {
    hideError(historySearchInput, historyErrSearch);

    if (!historySearchInput.value.trim()) {
      currentHistoryPage = 1;
      renderByMonth(historyMonthSelector?.value || "");
    }
  });

  historySearchInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    currentHistoryPage = 1;
    renderByMonth(historyMonthSelector?.value || "");
  });
}

if (historySearchBtn) {
  historySearchBtn.addEventListener("click", function () {
    hideError(historySearchInput, historyErrSearch);
    currentHistoryPage = 1;
    renderByMonth(historyMonthSelector?.value || "");
  });
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

if (historyAddBtn) {
  historyAddBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (!validateHistoryForm()) {
      return;
    }

    let selectedMonth = getNormalizedMonth(historyMonthSelector?.value);
    let amount = historyAmountInput?.value.trim() || "";
    let note = historyNoteInput?.value.trim() || "";
    let categoryRecord = getCategoriesByMonth(selectedMonth).find(
      (item) => String(item.id) === historyCategorySelect?.value,
    );

    if (!selectedMonth || !amount || !categoryRecord || !note) {
      return;
    }

    transactions.push({
      id: Date.now(),
      createdDate: selectedMonth,
      total: Number(amount),
      description: note || categoryRecord.description,
      note: note,
      categoryId: categoryRecord.id,
      categoryName: categoryRecord.description,
      monthlyCategoryId: getMonthCategoryRecord(selectedMonth)?.id || null,
    });

    setUserTransactions(transactions);
    currentHistoryPage = 1;
    updateMoneyLeftDisplay(selectedMonth);
    renderByMonth(selectedMonth);

    historyAmountInput.value = "";
    historyCategorySelect.value = "";
    historyNoteInput.value = "";
  });
}

if (historyAmountInput) {
  historyAmountInput.addEventListener("input", function () {
    if (historyAmountInput.value.trim()) {
      hideError(historyAmountInput, historyErrAmount);
    }
  });
}

if (historyCategorySelect) {
  historyCategorySelect.addEventListener("change", function () {
    if (historyCategorySelect.value) {
      hideError(historyCategorySelect, historyErrCategory);
    }
  });
}

if (historyNoteInput) {
  historyNoteInput.addEventListener("input", function () {
    if (historyNoteInput.value.trim()) {
      hideError(historyNoteInput, historyErrNote);
    }
  });
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

function deleteHistoryGroup(...ids) {
  pendingDeleteId = ids;

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

  if (isCategoryPage) {
    // Thay đổi updateNameInput thành select nếu chưa phải
    if (updateNameInput.tagName !== "SELECT") {
      let select = document.createElement("select");
      select.id = "update-name-input";
      updateNameInput.parentNode.replaceChild(select, updateNameInput);
      updateNameInput = select;
    }

    // Populate options với các danh mục mặc định từ nameInput
    let options = ['<option value="">Chọn danh mục</option>'];
    if (nameInput && nameInput.tagName === "SELECT") {
      for (let i = 1; i < nameInput.options.length; i++) {
        let text = nameInput.options[i].text.trim();
        if (text) {
          options.push(`<option value="${text}">${text}</option>`);
        }
      }
    }
    updateNameInput.innerHTML = options.join("");

    // Set selected value
    updateNameInput.value = selectedTransaction.description || "";
  } else {
    // Nếu không phải category page, đảm bảo là input
    if (updateNameInput.tagName === "SELECT") {
      let input = document.createElement("input");
      input.type = "text";
      input.id = "update-name-input";
      updateNameInput.parentNode.replaceChild(input, updateNameInput);
      updateNameInput = input;
    }
    updateNameInput.value =
      selectedTransaction.note || selectedTransaction.description || "";
  }

  updateMaxPriceInput.value =
    selectedTransaction.total ?? selectedTransaction.budget ?? "";
  updateOverlay.style.display = "flex";
}
