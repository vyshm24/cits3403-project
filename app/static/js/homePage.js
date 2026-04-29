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
});
