// import {saveToken} from "./token.js";

const API = "http://blogs.csm.linkpc.net/api/v1/auth/login";
// For when click the toggle pasword hide/show
const password = document.getElementById("password");
const togglePwd = document.getElementById("toggleLoginPwd");
const toggleIcon = togglePwd.querySelector("i");

togglePwd.addEventListener('click', () => {
    let type = password.type === "password" ? "text" : "password";
    password.type = type;
    toggleIcon.classList.toggle("fa-eye");
    toggleIcon.classList.toggle("fa-eye-slash");
});

function onClickLogin(){
    let form = document.getElementById("loginForm");
    let email = document.getElementById("email");
    const successMessage = new bootstrap.Toast(document.getElementById('successToast'));
    const errorMessage = new bootstrap.Toast(document.getElementById("errorToast"));
    let isValid = true;

    //Reset previous error messages
    email.classList.remove("is-invalid");
    password.classList.remove("is-invalid");

    //Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!email.value.trim() || !emailPattern.test(email.value.trim())){
        email.classList.add("is-invalid");
        isValid = false;
    }
    //Password validation
    if(!password.value.trim()){
        password.classList.add("is-invalid");
        isValid = false;
    }
    if(!isValid) return;

    let userData = {
        email : email.value.trim(),
        password : password.value.trim()
    }
    fetch(API, {
        method: "POST",
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    })
    .then(res => res.json().then(data => ({ ok: res.ok, body: data })))
    .then((result) =>{
        console.log(result.body);
       if(result.ok){
        // For this code here command for store token in localStorage that ACESS from token.js
        // saveToken(data.token);
        
            const token = result.body.data.token;
            localStorage.setItem("authToken", token);
            successMessage.show();
            window.location.href = "../index.html";
       }else{
            document.querySelector("#errorToast .toast-body").textContent = result.body.message || "Login failed.";
            errorMessage.show();
       }
    })
    .catch((error) => {
        console.error("Error", error.message);
        document.querySelector("#errorToast .toast-body").textContent = "Network error, Please try again later";
        errorMessage.show();
    })
}

