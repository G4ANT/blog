const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const strengthFill = document.getElementById('strengthFill');
const togglePwd = document.getElementById('togglePwd');
const toggleIcon = togglePwd.querySelector('i');
const form = document.getElementById('signupForm');
const successToast = new bootstrap.Toast(document.getElementById('successToast'));
const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));

let errorBoxMessage = document.querySelector("#errorToast .toast-body");


// For when click the toggle password hide/show
togglePwd.addEventListener('click', () => {

  const type = password.type === 'password' ? 'text' : 'password';
  password.type = type;
  toggleIcon.classList.toggle('fa-eye');
  toggleIcon.classList.toggle('fa-eye-slash');
  confirmPassword.type = type;
});

password.addEventListener('input', () => {
  const val = password.value.trim();
  const isStrongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-z]).{8,}$/.test(val);

  strengthFill.className = '';
  if (!val) {
    strengthFill.style.width = '0%';
  } else if (isStrongPassword) {
    strengthFill.classList.add('strength-strong');
    strengthFill.style.width = '100%';
  } else {
    strengthFill.classList.add('strength-weak');
    strengthFill.style.width = '33%';
  }
});

const API = "http://blogs.csm.linkpc.net/api/v1/auth/register";

// Form submission handler
function onClickCreate() {

  let isValid = true;
  const passwordValue = password.value.trim();
  const confirmValue = confirmPassword.value.trim();
  const passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  // Validate password rules
  if (!passwordPattern.test(passwordValue)) {
    password.classList.add('is-invalid');
    document.getElementById('passwordFeedback').innerText = 
      "Password must be at least 8 characters and include a special character.";
    isValid = false;
  } else {
    password.classList.remove('is-invalid');
  }

  // Confirm password match
  if (confirmValue !== passwordValue || confirmValue === '') {
    confirmPassword.classList.add('is-invalid');
    isValid = false;
  } else {
    confirmPassword.classList.remove('is-invalid');
  }

  // Validate other inputs
  form.classList.add('was-validated');
  if (!form.checkValidity()) isValid = false;
  if (!isValid) return;

  // Prepare form data
  const userData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: passwordValue,
    confirmPassword: confirmValue
  };

    fetch(API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData)
    })
    .then((res) => res.json().then((data) => ({ ok: res.ok, body: data })))
    .then((result) =>{
        console.log(result.body);
        window.location.href = "loginUser.html";
        if(result.ok){
          successToast.show();
            form.reset();
            form.classList.remove('was-validated');
<<<<<<< HEAD
            
=======
            location.href = ""
>>>>>>> remotes/origin/Phearaa
        }else{
            errorBoxMessage.textContent = result.body.message || "Registration failed.";
            errorToast.show();
        }   
    })
    .catch((error) => {
      console.error("Error", error.message);
      errorBoxMessage.textContent = "Network error, Please try again later";
      errorToast.show();
    })
}