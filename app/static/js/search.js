document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Add login check for Post button
  const postLink = document.getElementById("post-link");
  if (postLink) {
    postLink.addEventListener("click", (e) => {
      if (!isLoggedIn) {
        e.preventDefault();
        alert("Please sign in to create a post.");
        window.location.href = "../pages/sign-in.html";
      }
    });
  }
});
