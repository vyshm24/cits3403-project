document.addEventListener("DOMContentLoaded", () => {

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
      window.location.href = "../pages/home-page.html";
    });
  }
});