const form = document.querySelector("form");
const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');

if (form && usernameInput && passwordInput) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const storedUser = JSON.parse(localStorage.getItem("registeredUser"));

        if (!storedUser) {
            alert("No account found. Please sign up first.");
            return;
        }

        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value;

        if (
            enteredUsername === storedUser.username &&
            enteredPassword === storedUser.password
        ) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("currentUser", storedUser.username);
            alert("Sign in successful!");
            window.location.href = "home-page.html";
        } else {
            alert("Incorrect username or password.");
        }
    });
}
