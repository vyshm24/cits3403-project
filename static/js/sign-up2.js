form.addEventListener("submit", async function (event) {
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

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Sign up successful! Please sign in.");
            window.location.href = "/sign-in";
        } else {
            alert(result.error || "Sign up failed");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Try again.");
    }
});