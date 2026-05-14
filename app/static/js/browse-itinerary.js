document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("card-container");

  // 从 Flask API get itineraries data and render cards
  fetch("/api/itineraries")
    .then(res => res.json())
    .then(data => {

      container.innerHTML = "";

      data.forEach(item => {

        const card = document.createElement("div");
        card.className = "itinerary-card";

        const cover = escapeHtml(item.cover || "default.jpg");
        const title = escapeHtml(item.title || "");
        const country = escapeHtml(item.country || "");
        const days = escapeHtml(item.days || "");

        card.innerHTML = `
          <img src="/static/${cover}" class="card-image">
          <div class="card-content">
            <div class="card-title">${title}</div>
            <div class="card-meta">
              ${country} • ${days} days
            </div>
          </div>
        `;

        // 关键：跳 Flask route（不是 html）
        card.addEventListener("click", () => {
          window.location.href = `/itinerary/${item.id}`;
        });

        container.appendChild(card);
      });

    })
    .catch(err => {
      console.error("Failed to load itineraries:", err);
    });

});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}