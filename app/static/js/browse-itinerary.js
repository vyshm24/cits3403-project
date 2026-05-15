document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("card-container");

  if (!container) {
    return;
  }

  fetch("/api/itineraries")
    .then(res => res.json())
    .then(data => {
      container.textContent = "";

      data.forEach(item => {
        const card = document.createElement("div");
        card.className = "itinerary-card";

        const img = document.createElement("img");
        img.className = "card-image";
        img.src = sanitizeStaticImagePath(item.cover || "default.jpg");
        img.alt = String(item.title || "Itinerary cover");

        const content = document.createElement("div");
        content.className = "card-content";

        const title = document.createElement("div");
        title.className = "card-title";
        title.textContent = item.title || "";

        const meta = document.createElement("div");
        meta.className = "card-meta";
        meta.textContent = `${item.country || ""} • ${Number.parseInt(item.days, 10) || 0} days`;

        content.appendChild(title);
        content.appendChild(meta);

        card.appendChild(img);
        card.appendChild(content);

        const id = Number.parseInt(item.id, 10);
        card.addEventListener("click", () => {
          if (Number.isInteger(id) && id > 0) {
            window.location.href = `/itinerary/${id}`;
          }
        });

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Failed to load itineraries:", err);
    });
});

function sanitizeStaticImagePath(path) {
  if (!path || typeof path !== "string") {
    return "/static/default.jpg";
  }

  if (!/^[a-zA-Z0-9/_\-.]+\.(jpg|jpeg|png|webp|gif)$/i.test(path)) {
    return "/static/default.jpg";
  }

  return `/static/${path}`;
}