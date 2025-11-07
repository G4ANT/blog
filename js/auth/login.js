
const API = "http://blogs.csm.linkpc.net/api/v1/auth/login";
function onClickLogin(){
    if(!validationForm('loginForm')){
        return;
    }
    let email = document.getElementById("email");
    let password = document.getElementById("password");

    let userData = {
        email : email.value,
        password : password.value
    }
    fetch(API, {
        method: "POST",
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    })
    .then((res) => res.json())
    .then((data) =>{
        console.log(data);
    })
    .catch((error) => {console.error("Error", error.message)})
}