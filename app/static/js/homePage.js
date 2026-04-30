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
});
