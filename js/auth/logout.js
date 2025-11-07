
// import { removeToken } from "./token.js";

function onLogout() {
    // For this code here command for remove token from localStorage that ACESS file token.js
    // removeToken();
    localStorage.removeItem("authToken");

    const modal = bootstrap.Modal.getInstance(document.getElementById('logoutModal'));
    modal.hide();
    const toast = new bootstrap.Toast(document.getElementById('logoutToast'));
    toast.show();

    setTimeout(() => {
    window.location.href = "loginUser.html";
    }, 1500);
}
