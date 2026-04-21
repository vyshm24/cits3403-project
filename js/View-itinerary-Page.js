// ===== MOCK DATA（later can be stored in localStorage） =====
const itinerary = {
  title: "Three Days Extraordinary Trip in Perth",
  author: "Charlie",
  date: "2026-04-16",
  tags: ["Short trip", "Beach", "Island", "City", "Cultural"],
  overview:
    "Perth is a laid-back coastal city known for its beautiful beaches...",
  days: [
    {
      day: 1,
      activities: [
        {
          title: "Kings Park",
          description: "Explore Kings Park & Botanic Garden...",
          place: "Kings Park",
          time: "10:00AM",
          lat: -31.9607,
          lng: 115.834,
          image: "https://picsum.photos/400/200"
        },
        {
          title: "City Walk",
          description: "Visit Elizabeth Quay and CBD...",
          lat: -31.9523,
          lng: 115.8575
        }
      ]
    },
    {
      day: 2,
      activities: [
        {
          title: "Fremantle Market",
          description: "Explore markets...",
          lat: -32.0569,
          lng: 115.7439
        }
      ]
    }
  ]
};

// ===== RENDER HEADER =====
document.getElementById("title").innerText = itinerary.title;
document.getElementById("author").innerText = itinerary.author;
document.getElementById("date").innerText = itinerary.date;
document.getElementById("overview").innerText = itinerary.overview;

// TAGS（最多5个）
const tagsContainer = document.getElementById("tags");
itinerary.tags.slice(0, 5).forEach(tag => {
  const el = document.createElement("span");
  el.className = "px-3 py-1 bg-gray-200 rounded-full text-sm";
  el.innerText = tag;
  tagsContainer.appendChild(el);
});

// ===== RENDER TIMELINE =====
const timeline = document.getElementById("timeline");

itinerary.days.forEach(dayObj => {
  const dayDiv = document.createElement("div");
  dayDiv.className = "space-y-4";

  const title = document.createElement("h2");
  title.className = "text-xl font-bold";
  title.innerText = `Day ${dayObj.day}`;
  dayDiv.appendChild(title);

  dayObj.activities.forEach((act, index) => {
    const actDiv = document.createElement("div");
    actDiv.className = "activity bg-white p-4 rounded shadow cursor-pointer";
    actDiv.dataset.day = dayObj.day;
    actDiv.dataset.index = index + 1;
    actDiv.dataset.lat = act.lat;
    actDiv.dataset.lng = act.lng;

    actDiv.innerHTML = `
      <h3 class="font-semibold">Activity ${index + 1}: ${act.title}</h3>
      ${act.image ? `<img src="${act.image}" class="my-2 rounded">` : ""}
      <p class="text-sm text-gray-600">${act.description || ""}</p>
      ${act.place ? `<p><b>Place:</b> ${act.place}</p>` : ""}
      ${act.time ? `<p><b>Time:</b> ${act.time}</p>` : ""}
    `;

    dayDiv.appendChild(actDiv);
  });

  timeline.appendChild(dayDiv);
});

// ===== GOOGLE MAP =====
let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -31.95, lng: 115.86 },
    zoom: 12,
  });

  loadMarkers();
}

// MARKERS
function loadMarkers() {
  document.querySelectorAll(".activity").forEach(el => {
    const marker = new google.maps.Marker({
      position: {
        lat: parseFloat(el.dataset.lat),
        lng: parseFloat(el.dataset.lng)
      },
      map
    });
  });
}

// CLICK → MAP
document.addEventListener("click", function (e) {
  const el = e.target.closest(".activity");
  if (!el) return;

  map.panTo({
    lat: parseFloat(el.dataset.lat),
    lng: parseFloat(el.dataset.lng)
  });

  map.setZoom(15);
});

// ===== SCROLL TRACKING =====
const indicator = document.getElementById("current-indicator");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;

        const day = el.dataset.day;
        const index = el.dataset.index;

        indicator.innerText = `Day ${day} - Activity ${index}`;

        map.panTo({
          lat: parseFloat(el.dataset.lat),
          lng: parseFloat(el.dataset.lng)
        });
      }
    });
  },
  { threshold: 0.6 }
);

setTimeout(() => {
  document.querySelectorAll(".activity").forEach(el => {
    observer.observe(el);
  });
}, 500);

// INIT
window.onload = initMap;