// ===== GLOBAL MAP =====
let map;

// ===== DATA =====
const itinerary = {
  title: "Three Days Extraordinary Trip in Perth",
  author: "Charlie",
  date: "2026-04-16",
  tags: ["Short trip", "Beach", "Island", "City", "Cultural"],
  overview: "Perth is a laid-back coastal city known for its beautiful beaches...",

  days: [
    {
      day: 1,
      activities: [
        {
          title: "Kings Park",
          description: "Explore Kings Park...",
          place: "Kings Park",
          time: "10:00AM",
          lat: -31.9607,
          lng: 115.8340,
          image: "https://picsum.photos/400/200?1"
        },
        {
          title: "City Walk",
          description: "Elizabeth Quay...",
          lat: -31.9523,
          lng: 115.8575
        }
      ]
    }
  ]
};

// ===== RENDER PAGE =====
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("title").innerText = itinerary.title;
  document.getElementById("author").innerText = itinerary.author;
  document.getElementById("date").innerText = itinerary.date;
  document.getElementById("overview").innerText = itinerary.overview;

  // TAGS
  const tagsContainer = document.getElementById("tags");
  itinerary.tags.forEach(tag => {
    const el = document.createElement("span");
    el.className = "px-3 py-1 bg-gray-200 rounded-full text-sm";
    el.innerText = tag;
    tagsContainer.appendChild(el);
  });

  const timeline = document.getElementById("timeline");

  itinerary.days.forEach(dayObj => {
    const dayDiv = document.createElement("div");

    dayDiv.innerHTML = `<h2 class="text-xl font-bold mb-4">Day ${dayObj.day}</h2>`;

    dayObj.activities.forEach((act, i) => {

      // ===== TIMELINE WRAPPER =====
      const wrapper = document.createElement("div");
      wrapper.className = "timeline-item";

      // ===== LEFT SIDE =====
      const left = document.createElement("div");
      left.className = "timeline-left";

      const dot = document.createElement("div");
      dot.className = "timeline-dot";

      const line = document.createElement("div");
      line.className = "timeline-line";

      // Last activity, hide the line
      if (i === dayObj.activities.length - 1) {
        line.style.display = "none";
      }

      left.appendChild(dot);
      left.appendChild(line);

      // ===== RIGHT CONTENT =====
      const content = document.createElement("div");
      content.className = "timeline-content activity";

      content.dataset.day = dayObj.day;
      content.dataset.index = i + 1;
      content.dataset.lat = act.lat;
      content.dataset.lng = act.lng;

      content.innerHTML = `
        <h3 class="font-semibold">Activity ${i + 1}: ${act.title}</h3>
        ${act.image ? `<img src="${act.image}" class="my-2 rounded">` : ""}
        <p>${act.description || ""}</p>
        ${act.place ? `<p><b>Place:</b> ${act.place}</p>` : ""}
        ${act.time ? `<p><b>Time:</b> ${act.time}</p>` : ""}
      `;

      // wrap left and content together
      wrapper.appendChild(left);
      wrapper.appendChild(content);

      dayDiv.appendChild(wrapper);
    });

    timeline.appendChild(dayDiv);
  });

  setupObserver();
});

// ===== MAP INIT =====
function initMap() {

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -31.95, lng: 115.86 },
    zoom: 11
  });

  document.querySelectorAll(".activity").forEach(el => {
    new google.maps.Marker({
      position: {
        lat: parseFloat(el.dataset.lat),
        lng: parseFloat(el.dataset.lng)
      },
      map: map
    });
  });
}

// ===== CLICK =====
document.addEventListener("click", e => {
  const el = e.target.closest(".activity");
  if (!el || !map) return;

  map.panTo({
    lat: +el.dataset.lat,
    lng: +el.dataset.lng
  });

  map.setZoom(14);
});

// ===== SCROLL TRACK =====
function setupObserver() {

  const indicator = document.getElementById("current-indicator");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {

        const el = entry.target;

        // Update indicator(text)
        indicator.innerText =
          `Day ${el.dataset.day} - Activity ${el.dataset.index}`;

        // Hightlight in timeline
        document.querySelectorAll(".timeline-content").forEach(item =>
          item.classList.remove("active")
        );
        el.classList.add("active");

        if (map) {
          map.panTo({
            lat: +el.dataset.lat,
            lng: +el.dataset.lng
          });
        }
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll(".activity").forEach(el => {
    observer.observe(el);
  });
}