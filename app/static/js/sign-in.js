const form = document.querySelector("form");
const usernameInput = document.querySelector('input[name="username"]');

if (form && usernameInput) {
    form.addEventListener("submit", function () {
        usernameInput.value = usernameInput.value.trim();
    });
}
