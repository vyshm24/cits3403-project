// ===== USER STATE =====
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// ===== GLOBAL MAP =====
let map;

// ===== DATA（Demo用，未来替换） =====
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

  // ===== HEADER =====
  document.getElementById("title").innerText = itinerary.title;
  document.getElementById("author").innerText = itinerary.author;
  document.getElementById("date").innerText = itinerary.date;
  document.getElementById("overview").innerText = itinerary.overview;

  // ===== TAGS =====
  const tagsContainer = document.getElementById("tags");
  itinerary.tags.forEach(tag => {
    const el = document.createElement("span");
    el.className = "px-3 py-1 bg-gray-200 rounded-full text-sm";
    el.innerText = tag;
    tagsContainer.appendChild(el);
  });

  // ===== TIMELINE =====
  const timeline = document.getElementById("timeline");

  itinerary.days.forEach(dayObj => {
    const dayDiv = document.createElement("div");

    dayDiv.innerHTML = `<h2 class="text-xl font-bold mb-4">Day ${dayObj.day}</h2>`;

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
        line.style.display = "none";
      }

      left.appendChild(dot);
      left.appendChild(line);

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

      wrapper.appendChild(left);
      wrapper.appendChild(content);
      dayDiv.appendChild(wrapper);
    });

    timeline.appendChild(dayDiv);
  });

  setupObserver();
  setupAuth(); // 🔥 登录控制
});

// ===== MAP =====
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

// ===== CLICK MAP SYNC =====
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

        indicator.innerText =
          `Day ${el.dataset.day} - Activity ${el.dataset.index}`;

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

// ===== AUTH LOGIC =====
function setupAuth() {

  const likeBtn = document.getElementById("like-btn");
  const favBtn = document.getElementById("fav-btn");
  const commentBox = document.getElementById("comment-box");
  const commentBtn = document.getElementById("comment-btn");
  const avatar = document.getElementById("user-avatar");

  // 未登录
  if (!currentUser) {

    likeBtn?.classList.add("opacity-50", "cursor-not-allowed");
    favBtn?.classList.add("opacity-50", "cursor-not-allowed");

    commentBox?.classList.add("opacity-50");
    commentBox.placeholder = "Please sign in to comment...";

    likeBtn?.addEventListener("click", () => {
      alert("Please sign in first");
    });

    favBtn?.addEventListener("click", () => {
      alert("Please sign in first");
    });

    commentBtn?.addEventListener("click", () => {
      alert("Please sign in first");
    });

  }

  // 已登录
  else {

    // 更新头像
    if (avatar && currentUser.avatar) {
      avatar.src = currentUser.avatar;
    }

    // Like
    likeBtn?.addEventListener("click", () => {
      alert("Liked!");
    });

    // Favorite
    favBtn?.addEventListener("click", () => {
      alert("Added to favorites!");
    });

    // Comment
    commentBtn?.addEventListener("click", () => {

      const text = commentBox.value.trim();

      if (!text) {
        alert("Please enter a comment");
        return;
      }

      console.log("Comment:", {
        user: currentUser.name,
        text: text
      });

      alert("Comment posted!");
      commentBox.value = "";
    });
  }
}