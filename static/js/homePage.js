document.addEventListener("DOMContentLoaded", () => {

  const images = [
      "/static/images/homePic1.jpg",
      "/static/images/homePic2.jpeg",
      "/static/images/homePic3.jpg",
      "/static/images/homepic4.jpg",
  ];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  const heroBg = document.getElementById("hero-bg");

  if (heroBg) {
    heroBg.style.backgroundImage = `url('${randomImage}')`;
  }


  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentUser = localStorage.getItem("currentUser");
  
  const authLinksDiv = document.getElementById("auth-links");
  const profileMenuDiv = document.getElementById("profile-menu");
  const logoutBtn = document.getElementById("logout-btn");


  if (isLoggedIn && currentUser) {
  
    authLinksDiv.classList.add("hidden");
    profileMenuDiv.classList.remove("hidden");
  } else {
   
    authLinksDiv.classList.remove("hidden");
    profileMenuDiv.classList.add("hidden");
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
  
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");

      alert("You have signed out successfully.");
      window.location.href = "/";
    });
  }

  const postLink = document.getElementById("post-link");
  if (postLink) {
    postLink.addEventListener("click", (e) => {
      if (!isLoggedIn) {
        e.preventDefault();
        alert("Please sign in to create a post.");
        window.location.href = "/sign-in";
      }
    });
  }
});