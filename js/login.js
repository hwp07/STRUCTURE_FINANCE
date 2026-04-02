let user = JSON.parse(localStorage.getItem("user")) || [];

let successMessageEl = document.getElementById("success-msg");
let emailEl = document.getElementById("email");
let passwordEl = document.getElementById("password");
let loginFormEl = document.getElementById("login-form");
let loginErrorEl = document.getElementById("login-err");

function redirectIfLoggedIn() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    window.location.replace("../index.html");
  }
}

function resetInputError(inputEl) {
  inputEl.classList.remove("input-error");

  if (
    !emailEl.classList.contains("input-error") &&
    !passwordEl.classList.contains("input-error")
  ) {
    loginErrorEl.style.display = "none";
  }
}

function handle(e) {
  e.preventDefault();

  let emailInput = emailEl.value.trim();
  let passwordInput = passwordEl.value.trim();

  let userByEmail = user.find((u) => u.email === emailInput);

  let isValid = true;

  // RESET
  loginErrorEl.style.display = "none";
  emailEl.classList.remove("input-error");
  passwordEl.classList.remove("input-error");

  if (!emailInput || !passwordInput) {
    loginErrorEl.innerText = "Please enter your email and password...";
    loginErrorEl.style.display = "block";
    if (!emailInput) emailEl.classList.add("input-error");
    if (!passwordInput) passwordEl.classList.add("input-error");
    isValid = false;
  } else if (!userByEmail || userByEmail.password !== passwordInput) {
    loginErrorEl.innerText = "Email or password is incorrect";
    loginErrorEl.style.display = "block";
    emailEl.classList.add("input-error");
    passwordEl.classList.add("input-error");
    isValid = false;
  }

  // CHỈ chạy khi tất cả hợp lệ
  if (!isValid) return;

  // SUCCESS
  localStorage.setItem("currentUser", JSON.stringify(userByEmail));

  successMessageEl.style.display = "block";

  setTimeout(() => {
    window.location.replace("../index.html");
  }, 1000);
}

redirectIfLoggedIn();
window.addEventListener("pageshow", redirectIfLoggedIn);
loginFormEl.addEventListener("submit", handle);
emailEl.addEventListener("focus", function () {
  resetInputError(emailEl);
});
passwordEl.addEventListener("focus", function () {
  resetInputError(passwordEl);
});
