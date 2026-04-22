// ===== FAKE DATA (API in future) =====
const itineraries = [
  {
    id: 1,
    title: "3 Days in Perth",
    author: "Charlie",
    date: "2026-04-16",
    tags: ["Beach", "City"],
    image: "https://picsum.photos/400/200?random=1"
  },
  {
    id: 2,
    title: "Melbourne Coffee Tour",
    author: "Anna",
    date: "2026-03-20",
    tags: ["Food", "City"],
    image: "https://picsum.photos/400/200?random=2"
  },
  {
    id: 3,
    title: "Sydney Adventure",
    author: "Jack",
    date: "2026-02-10",
    tags: ["Harbour", "Opera House"],
    image: "https://picsum.photos/400/200?random=3"
  }
];

// ===== RENDER CARDS =====
document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("card-container");

  itineraries.forEach(item => {

    const card = document.createElement("div");
    card.className = "itinerary-card";

    card.innerHTML = `
      <img src="${item.image}" class="card-image">
      <div class="card-content">
        <div class="card-title">${item.title}</div>
        <div class="card-meta">
          ${item.author} • ${item.date}
        </div>
        <div class="card-tags">
          ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
    `;

    // ===== CLICK -> GO TO VIEW PAGE =====
    card.addEventListener("click", () => {
      window.location.href = `view-IT-Demo.html?id=${item.id}`;
    });

    container.appendChild(card);
  });

});