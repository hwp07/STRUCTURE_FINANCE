const users = JSON.parse(localStorage.getItem("user")) || [];

// DOM
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const confirmPasswordEl = document.getElementById("confirm-password");
const successMessageEl = document.getElementById("success-message");
const registerFormEl = document.getElementById("register-form");

const emailErr = document.getElementById("email-error");
const passwordErr = document.getElementById("password-error");
const confirmPasswordErr = document.getElementById("confirm-password-error");

// Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirectIfLoggedIn() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (currentUser) {
    window.location.replace("../index.html");
  }
}

function revealPage() {
  document.documentElement.classList.remove("preload");
  document.documentElement.classList.add("page-ready");
}

// Helper
function showError(input, errorEl, message) {
  errorEl.innerText = message;
  errorEl.style.display = "block";
  input.classList.add("input-error");
}

function clearError(input, errorEl) {
  errorEl.style.display = "none";
  input.classList.remove("input-error");
}

function resetFieldError(input, errorEl) {
  clearError(input, errorEl);
}

function handle(e) {
  e.preventDefault();

  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();
  const confirmPassword = confirmPasswordEl.value.trim();

  let isValid = true;

  // RESET
  clearError(emailEl, emailErr);
  clearError(passwordEl, passwordErr);
  clearError(confirmPasswordEl, confirmPasswordErr);

  // EMAIL
  if (!email || !emailRegex.test(email)) {
    showError(emailEl, emailErr, "Invalid email");
    isValid = false;
  }

  // CHECK EMAIL EXIST
  const isExist = users.some((u) => u.email === email);
  if (isExist) {
    showError(emailEl, emailErr, "Email already exists");
    isValid = false;
  }

  // PASSWORD
  if (!password) {
    showError(passwordEl, passwordErr, "Password is required");
    isValid = false;
  } else if (password.length < 6) {
    showError(passwordEl, passwordErr, "At least 6 characters");
    isValid = false;
  }

  // CONFIRM PASSWORD
  if (!confirmPassword || password !== confirmPassword) {
    showError(confirmPasswordEl, confirmPasswordErr, "Password not match");
    isValid = false;
  }

  if (!isValid) return;

  // SAVE USER
  const newUser = {
    id: Date.now(),
    email,
    password,
    fullName: "",
    phone: "",
    gender: null,
    status: true,
  };
  users.push(newUser);
  localStorage.setItem("user", JSON.stringify(users));

  // SUCCESS
  successMessageEl.style.display = "block";

  setTimeout(() => {
    window.location.href = "../pages/login.html";
  }, 800);
}

redirectIfLoggedIn();
revealPage();
window.addEventListener("pageshow", function () {
  redirectIfLoggedIn();
  revealPage();
});
registerFormEl.addEventListener("submit", handle);
emailEl.addEventListener("focus", function () {
  resetFieldError(emailEl, emailErr);
});
passwordEl.addEventListener("focus", function () {
  resetFieldError(passwordEl, passwordErr);
});
confirmPasswordEl.addEventListener("focus", function () {
  resetFieldError(confirmPasswordEl, confirmPasswordErr);
});
