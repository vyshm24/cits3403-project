const form = document.querySelector("form");
const username = document.querySelector('input[name="username"]');
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

function validatePassword() {
    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match");
    } else {
        confirmPassword.setCustomValidity("");
    }
}

if (form && password && confirmPassword) {
    password.addEventListener("input", validatePassword);
    confirmPassword.addEventListener("input", validatePassword);

    form.addEventListener("submit", function (event) {
        if (username) {
            username.value = username.value.trim();
        }

        validatePassword();

        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            return;
        }
    });
}
