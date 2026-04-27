// ===== GLOBAL =====
let map;
let activeInfoWindow = null;
const allMapMarkers = [];

// ===== DEMO ITINERARY DATA =====
// Author name should be auto when login in real project.
// Demo uses a preset name for display.
const itinerary = {
  title: "Three Days Extraordinary Trip in Perth",
  author: "Charlie",
  date: "2026-04-16",
  country: "Australia",
  coverPhoto:
    "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1400&q=80",
  tags: ["Short trip", "Island", "City"], // max 3
  overview:
    "Perth is a laid-back coastal city known for its beautiful beaches, relaxed lifestyle, and easy access to nature. This 3-day itinerary combines city highlights, local food, cultural exploration, and iconic Western Australian scenery for a balanced and memorable short trip.",

  days: [
    {
      day: 1,
      state: "Western Australia",
      city: "Perth",
      transport: ["Walking", "Bus"],
      accommodation: {
        name: "Pan Pacific Perth",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        place: "207 Adelaide Terrace, Perth WA 6000",
        description:
          "A comfortable riverside hotel close to the CBD, ideal for a short city stay.",
        time: "Check-in after 2:00PM",
        lat: -31.9615,
        lng: 115.8704,
        type: "accommodation"
      },
      restaurant: {
        name: "Ribs & Burgers Perth CBD",
        image:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
        place: "William Street, Perth WA",
        description:
          "Casual dining with burgers and ribs right in the city centre.",
        time: "6:30PM",
        lat: -31.9528,
        lng: 115.8586,
        type: "restaurant"
      },
      activities: [
        {
          title: "Kings Park",
          image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
          description:
            "Explore Kings Park & Botanic Garden with a morning walk, city views, and the Lotterywest Federation Walkway. Enjoy panoramic views over the Swan River and Perth skyline.",
          place: "Kings Park & Botanic Garden",
          time: "10:00AM",
          state: "Western Australia",
          city: "Perth",
          lat: -31.9607,
          lng: 115.834,
          type: "activity"
        },
        {
          title: "City Walk",
          image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
          description:
            "Visit Elizabeth Quay and Perth CBD, including Bell Tower, riverside walkways, and nearby cafés. Optional: a short Swan River cruise.",
          place: "Elizabeth Quay",
          time: "2:00PM",
          state: "Western Australia",
          city: "Perth",
          lat: -31.9523,
          lng: 115.8575,
          type: "activity"
        }
      ]
    },
    {
      day: 2,
      state: "Western Australia",
      city: "Fremantle",
      transport: ["Train", "Walking"],
      accommodation: {
        name: "Esplanade Hotel Fremantle",
        image:
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
        place: "Marine Terrace, Fremantle WA 6160",
        description:
          "A heritage-style hotel in the heart of Fremantle, close to markets and the waterfront.",
        time: "Check-in after 2:00PM",
        lat: -32.0569,
        lng: 115.7439,
        type: "accommodation"
      },
      restaurant: {
        name: "Little Creatures Brewery",
        image:
          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
        place: "40 Mews Rd, Fremantle WA 6160",
        description:
          "A famous waterfront brewery perfect for lunch or dinner with a relaxed Fremantle vibe.",
        time: "6:00PM",
        lat: -32.0595,
        lng: 115.7411,
        type: "restaurant"
      },
      activities: [
        {
          title: "Fremantle Markets",
          image:
            "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80",
          description:
            "Browse local crafts, fresh produce, and handmade souvenirs at the historic Fremantle Markets.",
          place: "Fremantle Markets",
          time: "10:30AM",
          state: "Western Australia",
          city: "Fremantle",
          lat: -32.0554,
          lng: 115.7455,
          type: "activity"
        },
        {
          title: "Fremantle Prison Tour",
          image:
            "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80",
          description:
            "Take a guided tour through one of Western Australia’s most iconic convict-era landmarks.",
          place: "Fremantle Prison",
          time: "1:30PM",
          state: "Western Australia",
          city: "Fremantle",
          lat: -32.056,
          lng: 115.7484,
          type: "activity"
        },
        {
          title: "Fremantle Cappuccino Strip",
          image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
          description:
            "Enjoy a slow afternoon with cafés, heritage streets, and a lively local atmosphere.",
          place: "South Terrace, Fremantle",
          time: "4:00PM",
          state: "Western Australia",
          city: "Fremantle",
          lat: -32.0567,
          lng: 115.7462,
          type: "activity"
        }
      ]
    },
    {
      day: 3,
      state: "Western Australia",
      city: "Rottnest Island",
      transport: ["Ferry", "Bike", "Walking"],
      accommodation: {
        name: "Discovery Rottnest Island",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        place: "Rottnest Island WA 6161",
        description:
          "Eco-friendly glamping stay surrounded by nature and close to the island’s best coastal spots.",
        time: "Check-in after 2:00PM",
        lat: -32.0061,
        lng: 115.5405,
        type: "accommodation"
      },
      restaurant: {
        name: "Frankie’s on Rotto",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        place: "Rottnest Island WA 6161",
        description:
          "A popular island dining stop for pizza, pasta, and casual seaside meals.",
        time: "5:30PM",
        lat: -31.9953,
        lng: 115.5415,
        type: "restaurant"
      },
      activities: [
        {
          title: "Rottnest Arrival and Quokka Spotting",
          image:
            "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80",
          description:
            "Arrive on Rottnest Island, stroll around the settlement, and spot the island’s famous quokkas.",
          place: "Rottnest Island Settlement",
          time: "9:30AM",
          state: "Western Australia",
          city: "Rottnest Island",
          lat: -31.9952,
          lng: 115.5409,
          type: "activity"
        },
        {
          title: "Bike Ride to The Basin",
          image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
          description:
            "Cycle to The Basin for crystal-clear water, scenic coastline, and one of the island’s best swimming spots.",
          place: "The Basin, Rottnest Island",
          time: "11:30AM",
          state: "Western Australia",
          city: "Rottnest Island",
          lat: -31.9899,
          lng: 115.5354,
          type: "activity"
        },
        {
          title: "West End Scenic Stop",
          image:
            "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
          description:
            "Take in dramatic coastal views and rugged cliffs on the western side of Rottnest Island.",
          place: "West End, Rottnest Island",
          time: "3:00PM",
          state: "Western Australia",
          city: "Rottnest Island",
          lat: -31.9998,
          lng: 115.502,
          type: "activity"
        }
      ]
    }
  ]
};

// ===== DOM RENDER =====
document.addEventListener("DOMContentLoaded", () => {
  renderItineraryHeader();
  renderTimeline();
  setupObserver();
  setupInteractionButtons();
});

// ===== HEADER =====
function renderItineraryHeader() {
  const titleEl = document.getElementById("title");
  const authorEl = document.getElementById("author");
  const dateEl = document.getElementById("date");
  const countryEl = document.getElementById("country");
  const overviewEl = document.getElementById("overview");
  const tagsContainer = document.getElementById("tags");
  const coverEl = document.getElementById("cover-photo");

  if (titleEl) titleEl.innerText = itinerary.title;
  if (authorEl) authorEl.innerText = itinerary.author;
  if (dateEl) dateEl.innerText = itinerary.date;
  if (countryEl) countryEl.innerText = itinerary.country;
  if (overviewEl) overviewEl.innerText = itinerary.overview;
  if (coverEl) {
    coverEl.src = itinerary.coverPhoto;
    coverEl.alt = itinerary.title;
  }

  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    itinerary.tags.slice(0, 3).forEach((tag) => {
      const el = document.createElement("span");
      el.className =
        "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium";
      el.innerText = tag;
      tagsContainer.appendChild(el);
    });
  }
}

// ===== TIMELINE =====
function renderTimeline() {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  timeline.innerHTML = "";

  itinerary.days.forEach((dayObj) => {
    const daySection = document.createElement("section");
    daySection.className = "space-y-5";

    const dayHeader = document.createElement("div");
    dayHeader.className = "day-header-card";
    dayHeader.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold">Day ${dayObj.day}</h2>
          <p class="text-gray-600 mt-1">${dayObj.state} · ${dayObj.city}</p>
        </div>
        <div class="text-sm text-gray-600">
          <span class="font-semibold">Transport:</span> ${dayObj.transport.join(", ")}
        </div>
      </div>
    `;
    daySection.appendChild(dayHeader);

    dayObj.activities.forEach((act, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "timeline-item";

      const left = document.createElement("div");
      left.className = "timeline-left";

      const dot = document.createElement("div");
      dot.className = "timeline-dot";

      const line = document.createElement("div");
      line.className = "timeline-line";

      if (i === dayObj.activities.length - 1) {
        line.classList.add("short-line");
      }

      left.appendChild(dot);
      left.appendChild(line);

      const content = createLocationCard({
        label: `Activity ${i + 1}`,
        title: act.title,
        image: act.image,
        description: act.description,
        place: act.place,
        time: act.time,
        state: act.state,
        city: act.city,
        lat: act.lat,
        lng: act.lng,
        day: dayObj.day,
        index: i + 1,
        type: "activity"
      });

      wrapper.appendChild(left);
      wrapper.appendChild(content);
      daySection.appendChild(wrapper);
    });

    const extras = document.createElement("div");
    extras.className = "day-extra-card space-y-4";

    const transportBlock = document.createElement("div");
    transportBlock.className = "info-chip-group";

    transportBlock.innerHTML = `
  <h3 class="font-semibold text-lg">Transport on this day</h3>
  <div class="flex flex-wrap gap-2 mt-2">
    ${dayObj.transport
        .map(
          (item) => `
          <div class="transport-card">
            ${item}
          </div>
        `
        )
        .join("")}
  </div>
`;
    extras.appendChild(transportBlock);

    const stayFoodGrid = document.createElement("div");
    stayFoodGrid.className = "stay-food-grid";

    const accommodationCard = createLocationCard({
      label: "Accommodation",
      title: dayObj.accommodation.name,
      image: dayObj.accommodation.image,
      description: dayObj.accommodation.description,
      place: dayObj.accommodation.place,
      time: dayObj.accommodation.time,
      state: dayObj.state,
      city: dayObj.city,
      lat: dayObj.accommodation.lat,
      lng: dayObj.accommodation.lng,
      day: dayObj.day,
      index: "A",
      type: "accommodation"
    });

    const restaurantCard = createLocationCard({
      label: "Restaurant",
      title: dayObj.restaurant.name,
      image: dayObj.restaurant.image,
      description: dayObj.restaurant.description,
      place: dayObj.restaurant.place,
      time: dayObj.restaurant.time,
      state: dayObj.state,
      city: dayObj.city,
      lat: dayObj.restaurant.lat,
      lng: dayObj.restaurant.lng,
      day: dayObj.day,
      index: "R",
      type: "restaurant"
    });

    stayFoodGrid.appendChild(accommodationCard);
    stayFoodGrid.appendChild(restaurantCard);

    extras.appendChild(stayFoodGrid);
    daySection.appendChild(extras);

    timeline.appendChild(daySection);
  });
}

function createLocationCard({
  label,
  title,
  image,
  description,
  place,
  time,
  state,
  city,
  lat,
  lng,
  day,
  index,
  type
}) {
  const content = document.createElement("article");
  content.className = `timeline-content map-item ${type}`;
  content.dataset.day = day;
  content.dataset.index = index;
  content.dataset.lat = lat;
  content.dataset.lng = lng;
  content.dataset.type = type;
  content.dataset.title = title;
  content.dataset.place = place || "";
  content.dataset.time = time || "";

  const typeBadgeClass = getBadgeClass(type);

  content.innerHTML = `
  ${image ? `<img src="${image}" class="card-image">` : ""}

  <div class="card-body">
    <div class="flex justify-between items-center">
      <span class="${typeBadgeClass}">${label}</span>
      ${time ? `<span class="text-sm text-gray-500">${time}</span>` : ""}
    </div>

    <h3 class="card-title">${title}</h3>

    ${description ? `<p class="card-desc">${description}</p>` : ""}

    ${place ? `<p class="card-meta"><b>Place:</b> ${place}</p>` : ""}
    <p class="card-meta"><b>State + City:</b> ${state}, ${city}</p>
  </div>
`;

  return content;
}

function getBadgeClass(type) {
  if (type === "restaurant") {
    return "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700";
  }
  if (type === "accommodation") {
    return "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700";
  }
  return "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700";
}

// ===== MAP =====
function initMap() {
  const defaultCenter = { lat: -31.9523, lng: 115.8613 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 10,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  });

  renderMapMarkers();
}

function renderMapMarkers() {
  const items = document.querySelectorAll(".map-item");
  const bounds = new google.maps.LatLngBounds();

  items.forEach((el) => {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    const type = el.dataset.type;
    const title = el.dataset.title || "Location";

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title,
      icon: getMarkerIcon(type),
      animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="min-width:180px;">
          <div style="font-weight:700; margin-bottom:6px;">${title}</div>
          <div style="font-size:13px; color:#555; text-transform:capitalize;">${type}</div>
          ${el.dataset.place
          ? `<div style="margin-top:6px; font-size:13px;">${el.dataset.place}</div>`
          : ""
        }
          ${el.dataset.time
          ? `<div style="margin-top:4px; font-size:13px;"><b>Time:</b> ${el.dataset.time}</div>`
          : ""
        }
        </div>
      `
    });

    marker.addListener("click", () => {
      highlightCard(el);
      focusMapLocation(lat, lng, marker, infoWindow);
      scrollCardIntoView(el);
    });

    el.addEventListener("click", () => {
      focusMapLocation(lat, lng, marker, infoWindow);
      highlightCard(el);
    });

    allMapMarkers.push({ marker, card: el, infoWindow });
    bounds.extend({ lat, lng });
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);
  }
}

function getMarkerIcon(type) {
  if (type === "restaurant") {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
  if (type === "accommodation") {
    return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  }
  return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
}

function focusMapLocation(lat, lng, marker, infoWindow) {
  if (!map) return;

  map.panTo({ lat, lng });
  map.setZoom(13);

  if (activeInfoWindow) {
    activeInfoWindow.close();
  }

  infoWindow.open({
    anchor: marker,
    map
  });

  activeInfoWindow = infoWindow;
}

function scrollCardIntoView(el) {
  el.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

// ===== OBSERVER =====
function setupObserver() {
  const indicator = document.getElementById("current-indicator");
  const observedItems = document.querySelectorAll(".map-item");

  if (!indicator || observedItems.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const type = el.dataset.type || "item";
        const title = el.dataset.title || "";
        const day = el.dataset.day || "";
        const index = el.dataset.index || "";

        highlightCard(el);

        if (type === "activity") {
          indicator.innerText = `Day ${day} - Activity ${index}: ${title}`;
        } else if (type === "accommodation") {
          indicator.innerText = `Day ${day} - Accommodation: ${title}`;
        } else if (type === "restaurant") {
          indicator.innerText = `Day ${day} - Restaurant: ${title}`;
        }

        const lat = parseFloat(el.dataset.lat);
        const lng = parseFloat(el.dataset.lng);

        if (map && !Number.isNaN(lat) && !Number.isNaN(lng)) {
          map.panTo({ lat, lng });
        }
      });
    },
    {
      threshold: 0.5
    }
  );

  observedItems.forEach((el) => observer.observe(el));
}

function highlightCard(el) {
  document.querySelectorAll(".timeline-content").forEach((item) => {
    item.classList.remove("active");
  });
  el.classList.add("active");
}

// ===== LIKE / FAVORITE / COMMENT =====
function setupInteractionButtons() {
  const likeBtn = document.getElementById("like-btn");
  const favBtn = document.getElementById("fav-btn");
  const commentBtn = document.getElementById("comment-btn");
  const commentBox = document.getElementById("comment-box");

  let liked = false;
  let favorited = false;

  if (likeBtn) {
    likeBtn.addEventListener("click", () => {
      liked = !liked;
      likeBtn.classList.toggle("bg-blue-500", liked);
      likeBtn.classList.toggle("text-white", liked);
      likeBtn.classList.toggle("bg-gray-200", !liked);
      likeBtn.innerText = liked ? "👍 Liked" : "👍 Like";
    });
  }

  if (favBtn) {
    favBtn.addEventListener("click", () => {
      favorited = !favorited;
      favBtn.classList.toggle("bg-yellow-400", favorited);
      favBtn.classList.toggle("text-white", favorited);
      favBtn.classList.toggle("bg-gray-200", !favorited);
      favBtn.innerText = favorited ? "⭐ Favorited" : "⭐ Favorite";
    });
  }

  if (commentBtn && commentBox) {
    commentBtn.addEventListener("click", () => {
      const value = commentBox.value.trim();
      if (!value) {
        alert("Please enter a comment before posting.");
        return;
      }

      alert(`Comment posted:\n${value}`);
      commentBox.value = "";
    });
  }
}