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
        validatePassword();

        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            return;
        }

        const userData = {
            username: username.value.trim(),
            password: password.value
        };

        // Keep the temporary localStorage flow, but let Flask handle the redirect.
        localStorage.setItem("registeredUser", JSON.stringify(userData));
    });
}
