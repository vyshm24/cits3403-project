// ===== GLOBAL =====
let map;
let activeInfoWindow = null;
const allMapMarkers = [];

let itinerary = null;
let mapInitialized = false;
let googleMapsReady = false;

window.onGoogleMapsReady = function () {
    googleMapsReady = true;
    tryInitMap();
};

function tryInitMap() {
    if (mapInitialized) return;
    if (!itinerary) return;
    if (!googleMapsReady) return;
    if (!window.google || !window.google.maps) return;

    mapInitialized = true;
    initMap();
}

// ===== CSRF =====
function getCsrfToken() {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    return csrfMeta ? csrfMeta.content : "";
}

// ===== DOM RENDER =====
//change background each time
document.addEventListener("DOMContentLoaded", () => {
    const background = document.getElementById("page-background");
    const themes = ["bg-theme-1", "bg-theme-2", "bg-theme-3", "bg-theme-4", "bg-theme-5"];

    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    if (background) {
        background.classList.add(randomTheme);
    }

    const itineraryId = window.location.pathname.split("/").pop();

    fetch(`/api/itinerary/${itineraryId}`)
        .then(res => res.json())
        .then(data => {
            itinerary = data;

            renderItineraryHeader();
            renderTimeline();
            setupObserver();
            setupInteractionButtons();

            // fetch 完成后立刻尝试初始化地图
            tryInitMap();
        })
        .catch(err => {
            console.error("Failed to load itinerary:", err);
        });
});

// Google Maps script 加载完成后，再尝试一次
window.addEventListener("load", () => {
    tryInitMap();
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
        coverEl.src = sanitizeUploadImageUrl(itinerary.coverPhoto);
        coverEl.alt = String(itinerary.title || "Itinerary cover");
    }

    if (tagsContainer) {
        tagsContainer.innerHTML = "";

        const tags = itinerary.tags || [];

        tags.slice(0, 3).forEach((tag) => {
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
    if (!itinerary) return;

    timeline.innerHTML = "";

    const days = itinerary.days || [];

    if (days.length === 0) {
        timeline.innerHTML = `
            <div class="glass-card border border-slate-200 rounded-2xl p-6 text-slate-500">
                No daily itinerary details yet.
            </div>
        `;
        return;
    }

    days.forEach((dayObj) => {
        const transport = dayObj.transport || [];
        const activities = dayObj.activities || [];

        const daySection = document.createElement("section");
        daySection.className = "space-y-5";

        const dayHeader = document.createElement("div");
        dayHeader.className = "day-header-card";
        const safeDay = escapeHtml(dayObj.day || "");
        const safeState = escapeHtml(dayObj.state || "");
        const safeCity = escapeHtml(dayObj.city || "");
        const safeTransport = transport.length
            ? transport.map((item) => escapeHtml(item)).join(", ")
            : "Not specified";

        dayHeader.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
            <h2 class="text-2xl font-bold">Day ${safeDay}</h2>
            <p class="text-gray-600 mt-1">${safeState} · ${safeCity}</p>
            </div>
            <div class="text-sm text-gray-600">
            <span class="font-semibold">Transport:</span> ${safeTransport}
            </div>
        </div>
        `;
        daySection.appendChild(dayHeader);

        activities.forEach((act, i) => {
            const wrapper = document.createElement("div");
            wrapper.className = "timeline-item";

            const left = document.createElement("div");
            left.className = "timeline-left";

            const dot = document.createElement("div");
            dot.className = "timeline-dot";

            const line = document.createElement("div");
            line.className = "timeline-line";

            if (i === activities.length - 1) {
                line.classList.add("short-line");
            }

            left.appendChild(dot);
            left.appendChild(line);

            const content = createLocationCard({
                label: `Activity ${i + 1}`,
                title: act.title || "Untitled activity",
                image: act.image || "",
                description: act.description || "",
                place: act.place || "",
                time: act.time || "",
                state: dayObj.state || "",
                city: dayObj.city || "",
                lat: act.lat,
                lng: act.lng,
                day: dayObj.day || "",
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
                ${transport.length
                ? transport.map((item) => `
                            <div class="transport-card">
                                ${escapeHtml(item)}
                            </div>
                        `).join("")
                : `<div class="text-sm text-slate-500">Not specified</div>`
            }
            </div>
            `;

        extras.appendChild(transportBlock);

        const stayFoodGrid = document.createElement("div");
        stayFoodGrid.className = "stay-food-grid";

        const accommodations = dayObj.accommodations || [];
        const restaurants = dayObj.restaurants || [];

        const accommodationText =
            dayObj.accommodation_specific ||
            (accommodations.length ? accommodations.join(", ") : "");

        const restaurantText =
            dayObj.restaurant_specific ||
            (restaurants.length ? restaurants.join(", ") : "");

        if (accommodationText) {
            const accommodationCard = createLocationCard({
                label: "Accommodation",
                title: accommodationText,
                image: "",
                description: "",
                place: accommodationText,
                time: "",
                state: dayObj.state || "",
                city: dayObj.city || "",
                lat: "",
                lng: "",
                day: dayObj.day || "",
                index: "A",
                type: "accommodation"
            });

            stayFoodGrid.appendChild(accommodationCard);
        }

        if (restaurantText) {
            const restaurantCard = createLocationCard({
                label: "Restaurant",
                title: restaurantText,
                image: "",
                description: "",
                place: restaurantText,
                time: "",
                state: dayObj.state || "",
                city: dayObj.city || "",
                lat: "",
                lng: "",
                day: dayObj.day || "",
                index: "R",
                type: "restaurant"
            });

            stayFoodGrid.appendChild(restaurantCard);
        }

        if (stayFoodGrid.children.length > 0) {
            extras.appendChild(stayFoodGrid);
        }

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

    // 这行非常重要：map marker 靠 .map-item 找卡片
    content.className = `timeline-content map-item ${type}`;

    content.dataset.day = day;
    content.dataset.index = index;
    content.dataset.type = type;
    content.dataset.title = title || "";
    content.dataset.place = place || "";
    content.dataset.time = time || "";
    content.dataset.state = state || "";
    content.dataset.city = city || "";
    content.dataset.country = itinerary?.country || "";

    if (lat !== undefined && lat !== null && lat !== "") {
        content.dataset.lat = lat;
    }

    if (lng !== undefined && lng !== null && lng !== "") {
        content.dataset.lng = lng;
    }

    const typeBadgeClass = getBadgeClass(type);

    const safeLabel = escapeHtml(label || "");
    const safeTitle = escapeHtml(title || "Untitled");
    const safeImage = sanitizeUploadImageUrl(image || "");
    const safeDescription = escapeHtml(description || "");
    const safePlace = escapeHtml(place || "");
    const safeTime = escapeHtml(time || "");
    const safeState = escapeHtml(state || "");
    const safeCity = escapeHtml(city || "");

    content.innerHTML = `
        ${safeImage ? `<img src="${safeImage}" class="card-image" alt="${safeTitle}">` : ""}

        <div class="card-body">
            <div class="flex justify-between items-center">
                <span class="${typeBadgeClass}">${safeLabel}</span>
                ${safeTime ? `<span class="text-sm text-gray-500">${safeTime}</span>` : ""}
            </div>

            <h3 class="card-title">${safeTitle}</h3>

            ${safeDescription ? `<p class="card-desc">${safeDescription}</p>` : ""}

            ${safePlace ? `<p class="card-meta"><b>Place:</b> ${safePlace}</p>` : ""}
            <p class="card-meta"><b>State + City:</b> ${safeState}, ${safeCity}</p>
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
// 初始化地图（在 Google Maps API 加载完成后）,要加保护
function initMap() {
    if (!itinerary) return;

    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const defaultCenter = { lat: -31.9523, lng: 115.8613 };

    map = new google.maps.Map(mapEl, {
        center: defaultCenter,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });

    renderMapMarkers();
}

function geocodeAddress(geocoder, address) {
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results && results.length > 0) {
                resolve(results[0].geometry.location);
            } else if (status === "ZERO_RESULTS") {
                resolve(null);
            } else {
                reject(status);
            }
        });
    });
}

async function renderMapMarkers() {
    const items = document.querySelectorAll(".map-item");
    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();

    let markerCount = 0;

    for (const el of items) {
        const type = el.dataset.type;

        // 只给 activity 做地图 marker
        if (type !== "activity") {
            continue;
        }

        const title = el.dataset.title || "Location";
        const place = el.dataset.place || "";
        const city = el.dataset.city || "";
        const state = el.dataset.state || "";
        const country = el.dataset.country || "";

        let lat = parseFloat(el.dataset.lat);
        let lng = parseFloat(el.dataset.lng);

        // 如果数据库/API 没有 lat/lng，就用地址文字 geocode
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            const address = [place, city, state, country]
                .filter(Boolean)
                .join(", ");

            console.log("Geocoding address:", address);

            if (!address) {
                continue;
            }

            try {
                const location = await geocodeAddress(geocoder, address);

                if (!location) {
                    console.warn("No geocode result for:", address);
                    continue;
                }

                lat = location.lat();
                lng = location.lng();

                el.dataset.lat = lat;
                el.dataset.lng = lng;
            } catch (err) {
                console.warn("Geocoding failed:", address, err);
                continue;
            }
        }

        const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title,
            icon: getMarkerIcon(type),
            animation: google.maps.Animation.DROP
        });

        const safeTitle = escapeHtml(title);
        const safeType = escapeHtml(type);
        const safePlace = escapeHtml(place);
        const safeInfoTime = escapeHtml(el.dataset.time || "");

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="min-width:180px;">
                    <div style="font-weight:700; margin-bottom:6px;">${safeTitle}</div>
                    <div style="font-size:13px; color:#555; text-transform:capitalize;">${safeType}</div>
                    ${safePlace ? `<div style="margin-top:6px; font-size:13px;">${safePlace}</div>` : ""}
                    ${safeInfoTime ? `<div style="margin-top:4px; font-size:13px;"><b>Time:</b> ${safeInfoTime}</div>` : ""}
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
        markerCount += 1;
    }

    // If only one marker, do not zoom too much - just center on it. If multiple markers, fit bounds.
    if (markerCount === 1) {
        const onlyMarker = allMapMarkers[0].marker;
        map.setCenter(onlyMarker.getPosition());
        map.setZoom(11);
    } else if (markerCount > 1) {
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
// 1. 准备一个 POST 请求
// 2. 告诉后端：我发的是 JSON
// 3. 如果有 body，就 JSON.stringify(body)
// 4. fetch 这个 url
// 5. 把后端返回的 JSON 转成 JavaScript object
// 6. 出错时显示错误信息
function setupInteractionButtons() {
    const itineraryId = window.location.pathname.split("/").pop();

    const likeBtn = document.getElementById("like-btn");
    const favBtn = document.getElementById("fav-btn");
    const commentBtn = document.getElementById("comment-btn");
    const commentBox = document.getElementById("comment-box");

    loadInteractions(itineraryId);

    if (likeBtn) {
        likeBtn.addEventListener("click", async () => {
            const data = await postJson(`/api/itinerary/${itineraryId}/like`);

            if (!data) return;
            if (handleLoginRequired(data)) return;

            updateLikeButton(data.liked_by_me, data.like_count);
        });
    }

    if (favBtn) {
        favBtn.addEventListener("click", async () => {
            const data = await postJson(`/api/itinerary/${itineraryId}/favorite`);

            if (!data) return;
            if (handleLoginRequired(data)) return;

            updateFavoriteButton(data.favorited_by_me, data.favorite_count);
        });
    }

    if (commentBtn && commentBox) {
        commentBtn.addEventListener("click", async () => {
            const content = commentBox.value.trim();

            if (!content) {
                showInteractionMessage("Please enter a comment before posting.");
                return;
            }

            const data = await postJson(`/api/itinerary/${itineraryId}/comments`, {
                content
            });

            if (!data) return;
            if (handleLoginRequired(data)) return;

            commentBox.value = "";
            showInteractionMessage("");

            await loadInteractions(itineraryId);
        });
    }
}

async function loadInteractions(itineraryId) {
    try {
        const res = await fetch(`/api/itinerary/${itineraryId}/interactions`);
        const data = await res.json();

        updateLikeButton(data.liked_by_me, data.like_count);
        updateFavoriteButton(data.favorited_by_me, data.favorite_count);
        updateCommentCount(data.comment_count);
        renderComments(data.comments || []);
    } catch (err) {
        console.error("Failed to load interactions:", err);
    }
}

async function postJson(url, body = null) {
    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken()
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const res = await fetch(url, options);
        const data = await res.json();

        if (!res.ok && data.error) {
            return data;
        }

        return data;
    } catch (err) {
        console.error("Request failed:", err);
        showInteractionMessage("Something went wrong. Please try again.");
        return null;
    }
}

// DELETE comment
async function deleteComment(commentId) {
    try {
        const res = await fetch(`/api/itinerary/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": getCsrfToken()   //DELETE need CSRF token
            }
        });

        const data = await res.json();

        if (handleLoginRequired(data)) return;

        if (!res.ok) {
            showInteractionMessage(data.error || "Could not delete comment.");
            return;
        }

        const itineraryId = window.location.pathname.split("/").pop();
        await loadInteractions(itineraryId);
    } catch (err) {
        console.error("Failed to delete comment:", err);
        showInteractionMessage("Something went wrong. Please try again.");
    }
}

function safeRedirect(url) {
    const fallbackUrl = "/";

    if (typeof url !== "string") {
        window.location.href = fallbackUrl;
        return;
    }

    if (!url.startsWith("/") || url.startsWith("//")) {
        window.location.href = fallbackUrl;
        return;
    }

    window.location.href = url;
}
function handleLoginRequired(data) {
    if (data && data.redirect_url) {
        safeRedirect(data.redirect_url);
        return true;
    }

    return false;
}

function updateLikeButton(liked, count) {
    const likeBtn = document.getElementById("like-btn");
    const likeCount = document.getElementById("like-count");

    if (!likeBtn) return;

    likeBtn.classList.toggle("bg-blue-500", liked);
    likeBtn.classList.toggle("text-white", liked);
    likeBtn.classList.toggle("bg-slate-100", !liked);

    likeBtn.innerHTML = liked
        ? `👍 Liked <span id="like-count">${count}</span>`
        : `👍 Like <span id="like-count">${count}</span>`;

    if (likeCount) {
        likeCount.innerText = count;
    }
}

function updateFavoriteButton(favorited, count) {
    const favBtn = document.getElementById("fav-btn");
    const favoriteCount = document.getElementById("favorite-count");

    if (!favBtn) return;

    favBtn.classList.toggle("bg-yellow-400", favorited);
    favBtn.classList.toggle("text-white", favorited);
    favBtn.classList.toggle("bg-slate-100", !favorited);

    favBtn.innerHTML = favorited
        ? `⭐ Favorited <span id="favorite-count">${count}</span>`
        : `⭐ Favorite <span id="favorite-count">${count}</span>`;

    if (favoriteCount) {
        favoriteCount.innerText = count;
    }
}

function updateCommentCount(count) {
    const commentCount = document.getElementById("comment-count");

    if (commentCount) {
        commentCount.innerText = count;
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById("comments-list");

    if (!commentsList) return;

    commentsList.innerHTML = "";

    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="empty-comments">
                No comments yet. Be the first to comment.
            </div>
        `;
        return;
    }

    comments.forEach((comment) => {
        const item = document.createElement("div");
        item.className = "comment-item";

        const author = escapeHtml(comment.author || "User");
        const createdAt = escapeHtml(comment.created_at || "");
        const content = escapeHtml(comment.content || "");
        const avatarUrl = sanitizeUploadImageUrl(comment.author_avatar_url || "");
        const initial = author.charAt(0).toUpperCase();

        const commentId = Number.parseInt(comment.id, 10);
        const canDelete = comment.can_delete && Number.isInteger(commentId) && commentId > 0;

        const avatarHtml = avatarUrl
            ? `<img src="${avatarUrl}" alt="${author}'s avatar" class="comment-avatar-img">`
            : `<div class="comment-avatar">${initial}</div>`;

        item.innerHTML = `
            ${avatarHtml}

            <div class="comment-main">
                <div class="comment-header">
                    <div>
                        <div class="comment-author">${author}</div>
                        <div class="comment-time">${createdAt}</div>
                    </div>

                    ${canDelete
                        ? `<button
                                class="delete-comment-btn"
                                data-comment-id="${commentId}"
                            >
                                Delete
                            </button>`
                        : ""
                    }
                </div>

                <p class="comment-content">${content}</p>
            </div>
        `;

        commentsList.appendChild(item);
    });

    document.querySelectorAll(".delete-comment-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const commentId = btn.dataset.commentId;
            deleteComment(commentId);
        });
    });
}

function showInteractionMessage(message) {
    const messageEl = document.getElementById("interaction-message");

    if (messageEl) {
        messageEl.innerText = message;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function safeRedirect(url) {
    const fallbackUrl = "/";

    if (typeof url !== "string") {
        window.location.href = fallbackUrl;
        return;
    }

    if (!url.startsWith("/") || url.startsWith("//")) {
        window.location.href = fallbackUrl;
        return;
    }

    window.location.href = url;
}

function sanitizeUploadImageUrl(url) {
    if (!url || typeof url !== "string") {
        return "";
    }

    let value = url.trim();

    // 兼容 uploads/activity_photos/a.jpg
    if (value.startsWith("uploads/")) {
        value = "/static/" + value;
    }

    // 兼容 static/uploads/activity_photos/a.jpg
    if (value.startsWith("static/uploads/")) {
        value = "/" + value;
    }

    // 兼容 /uploads/activity_photos/a.jpg
    if (value.startsWith("/uploads/")) {
        value = "/static" + value;
    }

    const pattern = /^\/static\/uploads\/(activity_photos|avatar_photos|banner_photos|cover_photos)\/[a-zA-Z0-9_\-.]+\.(jpg|jpeg|png|webp|gif)$/i;

    if (pattern.test(value)) {
        return value;
    }

    return "";
}