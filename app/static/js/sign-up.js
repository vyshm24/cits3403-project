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
        event.preventDefault();
        validatePassword();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const userData = {
            username: username.value.trim(),
            password: password.value
        };

         // Save the registered account information in localStorage
        localStorage.setItem("registeredUser", JSON.stringify(userData));
        // Show a success message after sign-up and redirect to the sign-in page
        alert("Sign up successful! Please sign in.");
        // Redirect the user to the sign-in page
        window.location.href = "sign-in.html";
    });
}
