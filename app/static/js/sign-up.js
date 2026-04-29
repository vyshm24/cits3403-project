const form = document.querySelector("form");
const username = document.querySelector('input[name="username"]');
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const errorMessage = document.getElementById("signup-error");

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

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (username) {
            username.value = username.value.trim();
        }

        if (errorMessage) {
            errorMessage.textContent = "";
            errorMessage.classList.add("is-hidden");
        }

        validatePassword();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json"
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                window.location.href = data.redirect_url;
                return;
            }

            if (errorMessage && data.error) {
                errorMessage.textContent = data.error;
                errorMessage.classList.remove("is-hidden");
            }
        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent = "Unable to sign up right now.";
                errorMessage.classList.remove("is-hidden");
            }
        }
    });
}
