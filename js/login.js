let user = JSON.parse(localStorage.getItem("user")) || [];

let successMessageEl = document.getElementById("success-msg");
let emailEl = document.getElementById("email");
let passwordEl = document.getElementById("password");

let emailErrorEl = document.getElementById("email-err");
let passwordErrorEl = document.getElementById("password-err");

function handle(e) {
  e.preventDefault();

  let emailInput = emailEl.value.trim();
  let passwordInput = passwordEl.value.trim();

  let userByEmail = user.find((u) => u.email === emailInput);

  let isValid = true;

  // RESET
  emailErrorEl.style.display = "none";
  passwordErrorEl.style.display = "none";
  emailEl.classList.remove("input-error");
  passwordEl.classList.remove("input-error");

  // EMAIL
  if (!emailInput) {
    emailErrorEl.innerText = "Please enter your email...";
    emailErrorEl.style.display = "block";
    emailEl.classList.add("input-error");
    isValid = false;
  } else if (!userByEmail) {
    emailErrorEl.innerText = "Email does not exist";
    emailErrorEl.style.display = "block";
    emailEl.classList.add("input-error");
    isValid = false;
  }

  // PASSWORD
  if (!passwordInput) {
    passwordErrorEl.innerText = "Please enter your password...";
    passwordErrorEl.style.display = "block";
    passwordEl.classList.add("input-error");
    isValid = false;
  } else if (userByEmail && userByEmail.password !== passwordInput) {
    passwordErrorEl.innerText = "Password is incorrect";
    passwordErrorEl.style.display = "block";
    passwordEl.classList.add("input-error");
    isValid = false;
  }

  // ❗ CHỈ chạy khi tất cả hợp lệ
  if (!isValid) return;

  // SUCCESS
  localStorage.setItem("user", JSON.stringify(user));

  successMessageEl.style.display = "block";

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1000);
}
