const authLink = document.querySelector('a[href="sign-in.html"]');
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

if (authLink && isLoggedIn) {
    authLink.textContent = "Sign out";

    authLink.addEventListener("click", function (event) {
        event.preventDefault();

        // Clear the saved login state and user information.
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("currentUser");

        alert("You have signed out successfully.");
        window.location.href = "sign-in.html";
    });
}
