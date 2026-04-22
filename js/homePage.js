document.addEventListener("DOMContentLoaded", () => {
  // ============ Background image setup ============
  const images = [
    "../images/homePic1.jpg",
    "../images/homePic2.jpeg",
    "../images/homePic3.jpg",
    "../images/homepic4.jpg",
  ];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  const heroBg = document.getElementById("hero-bg");

  if (heroBg) {
    heroBg.style.backgroundImage = `url('${randomImage}')`;
  }

  // ============ Authentication state check & navbar update ============
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentUser = localStorage.getItem("currentUser");
  
  const authLinksDiv = document.getElementById("auth-links");
  const profileMenuDiv = document.getElementById("profile-menu");
  const profileAvatarBtn = document.getElementById("profile-avatar-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const usernameDisplay = document.getElementById("username-display");
  const logoutBtn = document.getElementById("logout-btn");

  // Update navbar based on login state
  if (isLoggedIn && currentUser) {
    // User is logged in: show profile menu, hide auth links
    authLinksDiv.classList.add("hidden");
    profileMenuDiv.classList.remove("hidden");
    usernameDisplay.textContent = currentUser;
  } else {
    // User is not logged in: show auth links, hide profile menu
    authLinksDiv.classList.remove("hidden");
    profileMenuDiv.classList.add("hidden");
  }

  // ============ Dropdown menu toggle ============
  if (profileAvatarBtn) {
    profileAvatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("hidden");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (profileAvatarBtn && !profileAvatarBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add("hidden");
    }
  });

  // ============ Logout functionality ============
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Clear the saved login state and user information
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");

      alert("You have signed out successfully.");
      window.location.href = "../pages/home-page.html";
    });
  }
});