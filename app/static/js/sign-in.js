const form = document.querySelector("form");
const usernameInput = document.querySelector('input[name="username"]');
const errorMessage = document.getElementById("signin-error");

if (form && usernameInput) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        usernameInput.value = usernameInput.value.trim();

        if (errorMessage) {
            errorMessage.textContent = "";
            errorMessage.classList.add("is-hidden");
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
                errorMessage.textContent = "Unable to sign in right now.";
                errorMessage.classList.remove("is-hidden");
            }
        }
    });
}
