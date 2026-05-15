// portfolio-page.js
// JavaScript for the Portfolio Page (your own profile)

// ── DATA — comes from PORTFOLIO_DATA injected by Flask ──

// ── HELPERS ──
function getCsrfToken() {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    return csrfMeta ? csrfMeta.content : "";
}

// ── XSS PROTECTION ──
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const COUNTRY_CODES = {
    "Australia": "au", "Canada": "ca", "China": "cn", "France": "fr",
    "Germany": "de", "Indonesia": "id", "Italy": "it", "Japan": "jp",
    "Malaysia": "my", "New Zealand": "nz", "Singapore": "sg",
    "South Korea": "kr", "Spain": "es", "Switzerland": "ch",
    "Thailand": "th", "United Kingdom": "gb", "United States": "us",
    "Vietnam": "vn"
};

function getInitials(n) { if (!n) return "?"; return n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

// ── UPLOAD VALIDATION ──
const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function validateImageFile(file) {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
        return "Only PNG, JPG, GIF, or WEBP images are allowed. Videos are not permitted.";
    }
    if (file.size > MAX_IMAGE_SIZE) {
        return "File must be smaller than 10MB.";
    }
    return null;
}

// ── AVATAR UPLOAD (saves to server) ──
document.getElementById("avatar-display").addEventListener("click", () => document.getElementById("avatar-upload").click());
document.getElementById("avatar-overlay-btn").addEventListener("click", () => document.getElementById("avatar-upload").click());
document.getElementById("avatar-upload").addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;

    const error = validateImageFile(file);
    if (error) {
        alert(error);
        e.target.value = "";
        return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    
    fetch("/api/upload-avatar", {
    method: "POST",
    headers: {
        "X-CSRFToken": getCsrfToken()
    },
    body: formData
    })
    
        .then(r => r.json())
        .then(data => {
            if (!data.success) { alert("Upload failed: " + data.error); return; }
            const d = document.getElementById("avatar-display");
            document.getElementById("avatar-initials").style.display = "none";
            let img = d.querySelector("img");
            if (!img) { img = document.createElement("img"); img.className = "w-full h-full object-cover"; d.appendChild(img); }
            img.src = data.url;
            const nav = document.getElementById("nav-avatar-display");
            if (nav) nav.innerHTML = `<img src="${data.url}" class="w-full h-full object-cover rounded-full">`;
        });
});

// ── BANNER UPLOAD (saves to server) ──
document.getElementById("banner-edit-btn").addEventListener("click", () => document.getElementById("banner-upload").click());
document.getElementById("banner-upload").addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;

    const error = validateImageFile(file);
    if (error) {
        alert(error);
        e.target.value = "";
        return;
    }

    const formData = new FormData();
    formData.append("banner", file);
    
    fetch("/api/upload-banner", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCsrfToken()
        },
        body: formData
    })

        .then(r => r.json())
        .then(data => {
            if (!data.success) { alert("Upload failed: " + data.error); return; }
            const banner = document.getElementById("banner");
            banner.style.background = "none";
            banner.style.backgroundImage = `url(${data.url})`;
            banner.style.backgroundSize = "cover";
            banner.style.backgroundPosition = "center";
        });
});

// ── COUNTRY FILTER ──
let activeCountries = new Set();

function filterByCountry(country, tagEl) {
    if (activeCountries.has(country)) {
        // unselect if already active
        activeCountries.delete(country);
        tagEl.classList.remove("active");
    } else {
        // add to selection
        activeCountries.add(country);
        tagEl.classList.add("active");
    }

    if (activeCountries.size === 0) {
        clearFilter();
        return;
    }

    // update filter notice
    document.getElementById("filter-country-name").textContent = [...activeCountries].join(", ");
    document.getElementById("filter-notice").classList.remove("hidden");
    document.getElementById("filter-notice").classList.add("flex");

    // show/hide cards
    document.querySelectorAll(".itinerary-card").forEach(card => {
        card.closest("li").style.display = activeCountries.has(card.dataset.country) ? "" : "none";
    });
}

function clearFilter() {
    activeCountries.clear();
    favouritesActive = false;
    document.querySelectorAll(".country-tag").forEach(t => {
        if (t.id !== "favourites-filter-btn") t.classList.remove("active");
    });
    document.getElementById("filter-notice").classList.add("hidden");
    document.getElementById("filter-notice").classList.remove("flex");
    document.querySelectorAll("#itineraries-grid li").forEach(li => {
        const id = parseInt(li.dataset.itineraryId);
        li.style.display = PORTFOLIO_DATA.own_itinerary_ids.includes(id) ? "" : "none";
    });
}

// -- FAVOURITES FILTER --
let favouritesActive = false;
document.getElementById("favourites-filter-btn").addEventListener("click", () => {
    favouritesActive = !favouritesActive;
    const btn = document.getElementById("favourites-filter-btn");

    if (favouritesActive) {
        // deactivate country filters
        activeCountries.clear();
        document.querySelectorAll(".country-tag").forEach(t => t.classList.remove("active"));
        document.getElementById("filter-notice").classList.add("hidden");
        document.getElementById("filter-notice").classList.remove("flex");
        // activate favourites
        btn.classList.add("active");
        document.querySelectorAll("#itineraries-grid li").forEach(li => {
            const id = parseInt(li.dataset.itineraryId);
            li.style.display = PORTFOLIO_DATA.favourited_ids.includes(id) ? "" : "none";
        });
    } else {
        btn.classList.remove("active");
        document.querySelectorAll("#itineraries-grid li").forEach(li => {
        const id = parseInt(li.dataset.itineraryId);
        li.style.display = PORTFOLIO_DATA.own_itinerary_ids.includes(id) ? "" : "none";
        });
    }
});


// ── RENDER ──
function renderProfile(user) {
    const initials = getInitials(user.username);
    document.getElementById("avatar-initials").textContent = initials;
    const navAvatar = document.getElementById("nav-avatar-display");
    if (navAvatar) navAvatar.textContent = initials;
    document.getElementById("username").textContent = user.username || "—";
    document.getElementById("uid").textContent = "UID: " + (user.uid || "—");
    document.title = (user.username || "My Profile") + " – Travel Blog";

    // Stats
    document.getElementById("stat-countries").textContent = Object.keys(user.countries).length;
    document.getElementById("stat-posts").textContent = PORTFOLIO_DATA.own_itinerary_ids.length;
}

function renderCountries(countries) {
    const list = document.getElementById("countries-list");
    Array.from(list.querySelectorAll("li")).forEach(li => {
        if (!li.querySelector("#favourites-filter-btn")) li.remove();
    });
    const entries = Object.entries(countries);
    if (!entries.length) return;
    entries.forEach(([country, data]) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "country-tag";
        btn.style.setProperty("--expanded-width", (52 + 8 + (country.length * 8.5) + 14) + "px");
        const code = COUNTRY_CODES[country] || "un";
        btn.innerHTML = `<span class="flag-circle"><img src="https://flagcdn.com/w40/${code}.png" alt="${escapeHtml(country)}" class="w-7 h-5 object-cover rounded-sm"></span><span class="country-name">${escapeHtml(country)}</span>`;
        btn.addEventListener("click", () => filterByCountry(country, btn));
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function renderItineraries(itineraries) {
    const grid = document.getElementById("itineraries-grid");
    grid.innerHTML = "";
    if (!itineraries.length) {
        grid.innerHTML = '<li class="col-span-4 text-center py-10 text-gray-500 text-sm">No itineraries posted yet.</li>';
        return;
    }
    const colors = ["#DBEAFE", "#FEF3C7", "#D1FAE5", "#FCE7F3"];
    itineraries.forEach((it, i) => {
        const li = document.createElement("li");
        li.style.position = "relative";
        li.dataset.itineraryId = it.id;

        const link = document.createElement("a");
        link.href = `/itinerary/${it.id}`;
        link.addEventListener("click", (e) => {
            if (document.getElementById("global-edit-btn").classList.contains("active")) {
                e.preventDefault();
                const msg = document.getElementById("edit-mode-msg");
                msg.classList.remove("hidden");
                clearTimeout(msg._hideTimer);
                msg._hideTimer = setTimeout(() => msg.classList.add("hidden"), 2500);
            }
        });
        link.className = "itinerary-card block bg-white border border-gray-200 rounded-xl overflow-hidden no-underline text-inherit flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200";
        link.dataset.country = it.location;
        link.innerHTML = `
            <div class="overflow-hidden relative" style="background:${colors[i % colors.length]}; height:230px;">
                ${it.cover_image_url
                    ? `<img src="${it.cover_image_url}" class="w-full h-full object-cover">`
                    : `<div class="w-full h-full flex items-center justify-center text-4xl">✈️</div>`}
                <div class="card-delete-overlay">
                    <button class="card-delete-btn"> X DELETE </button>
                </div>
            </div>
            <div class="p-3 flex-1">
                <h3 class="text-xs font-bold text-blue-900 mb-1 leading-snug">${escapeHtml(it.title)}</h3>
                <div class="text-xs text-gray-500">📍 ${escapeHtml(it.location)}</div>
            </div>
            <div class="px-3 pb-3 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
                <span>👍🏼 ${it.likes}</span>
                <span>${it.favorited_by_me ? '⭐️' : '☆'} ${it.saves}</span>
            </div>`;

        // Delete with confirmation
        link.querySelector(".card-delete-btn").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!confirm(`Are you sure you want to delete "${it.title}"? This cannot be undone.`)) return;

            fetch(`/api/itinerary/${it.id}/delete`, {
                method: "DELETE",
                headers: { "X-CSRFToken": getCsrfToken() }
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    li.remove();
                    PORTFOLIO_DATA.itineraries = PORTFOLIO_DATA.itineraries.filter(x => x.id !== it.id);
                    const remaining = PORTFOLIO_DATA.itineraries;
                    const countries = {};
                    remaining.forEach(x => { countries[x.location] = { flag: "🌍" }; });
                    renderCountries(countries);
                    document.getElementById("stat-posts").textContent = remaining.length;
                    document.getElementById("stat-countries").textContent = Object.keys(countries).length;
                } else {
                    alert(data.error || "Failed to delete.");
                }
            })
            .catch(() => alert("Something went wrong."));
        });

        li.appendChild(link);
        grid.appendChild(li);
    });
}

// ── GLOBAL EDIT MODE ──
document.getElementById("global-edit-btn").addEventListener("click", () => {
    if (favouritesActive) {
        alert("You can't edit while in Favourites view!");
        return;
    }
    const editBtn = document.getElementById("global-edit-btn");
    const isActive = editBtn.classList.toggle("active");
    document.querySelectorAll(".card-delete-overlay").forEach(overlay => {
        overlay.classList.toggle("active", isActive);
    });
    document.querySelectorAll(".itinerary-card").forEach(card => {
        if (isActive) {
            card.addEventListener("click", blockClick);
        } else {
            card.removeEventListener("click", blockClick);
        }
    });
});

function blockClick(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ── SETTINGS DROPDOWN ──
document.getElementById("settings-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("settings-dropdown").classList.toggle("hidden");
});

document.addEventListener("click", () => {
    document.getElementById("settings-dropdown").classList.add("hidden");
});


// ── CHANGE PASSWORD MODAL ──
document.getElementById("change-password-btn").addEventListener("click", () => {
    document.getElementById("change-password-modal").classList.remove("hidden");
});

document.getElementById("cancel-password-btn").addEventListener("click", () => {
    document.getElementById("change-password-modal").classList.add("hidden");
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
    document.getElementById("password-error").classList.add("hidden");
    document.getElementById("password-success").classList.add("hidden");
});

document.getElementById("save-password-btn").addEventListener("click", () => {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorEl = document.getElementById("password-error");
    const successEl = document.getElementById("password-success");

    errorEl.classList.add("hidden");
    successEl.classList.add("hidden");

     // Empty field validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        errorEl.textContent = "Please fill out all fields.";
        errorEl.classList.remove("hidden");
        return;
    }

    // Same password validation
    if (currentPassword === newPassword) {
        errorEl.textContent = "New password must be different from your current password.";
        errorEl.classList.remove("hidden");
        return;
    }

    fetch("/api/change-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            successEl.classList.remove("hidden");
            setTimeout(() => {
                document.getElementById("change-password-modal").classList.add("hidden");
                document.getElementById("current-password").value = "";
                document.getElementById("new-password").value = "";
                document.getElementById("confirm-password").value = "";
                successEl.classList.add("hidden");
            }, 1500);
        } else {
            errorEl.textContent = data.error;
            errorEl.classList.remove("hidden");
        }
    })
    .catch(() => {
        errorEl.textContent = "Something went wrong.";
        errorEl.classList.remove("hidden");
    });
});

// ── CHANGE USERNAME MODAL ──
document.getElementById("change-username-btn").addEventListener("click", () => {
    document.getElementById("change-username-modal").classList.remove("hidden");
    document.getElementById("settings-dropdown").classList.add("hidden");
});

document.getElementById("cancel-username-btn").addEventListener("click", () => {
    document.getElementById("change-username-modal").classList.add("hidden");
    document.getElementById("new-username").value = "";
    document.getElementById("username-error").classList.add("hidden");
    document.getElementById("username-success").classList.add("hidden");
});

document.getElementById("save-username-btn").addEventListener("click", () => {
    const newUsername = document.getElementById("new-username").value.trim();
    const errorEl = document.getElementById("username-error");
    const successEl = document.getElementById("username-success");

    errorEl.classList.add("hidden");
    successEl.classList.add("hidden");

    if (!newUsername) {
        errorEl.textContent = "Please fill out the username field.";
        errorEl.classList.remove("hidden");
        return;
    }

    fetch("/api/change-username", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
        },
        body: JSON.stringify({ new_username: newUsername })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            successEl.classList.remove("hidden");
            document.getElementById("username").textContent = newUsername;
            setTimeout(() => {
                document.getElementById("change-username-modal").classList.add("hidden");
                document.getElementById("new-username").value = "";
                successEl.classList.add("hidden");
            }, 1500);
        } else {
            errorEl.textContent = data.error;
            errorEl.classList.remove("hidden");
        }
    })
    .catch(() => {
        errorEl.textContent = "Something went wrong.";
        errorEl.classList.remove("hidden");
    });
});

// Restore saved avatar and banner on page load
if (PORTFOLIO_DATA.avatar_url) {
    const d = document.getElementById("avatar-display");
    document.getElementById("avatar-initials").style.display = "none";
    let img = d.querySelector("img");
    if (!img) { img = document.createElement("img"); img.className = "w-full h-full object-cover"; d.appendChild(img); }
    img.src = PORTFOLIO_DATA.avatar_url;
    const nav = document.getElementById("nav-avatar-display");
    if (nav) nav.innerHTML = `<img src="${PORTFOLIO_DATA.avatar_url}" class="w-full h-full object-cover rounded-full">`;
}
if (PORTFOLIO_DATA.banner_url) {
    const banner = document.getElementById("banner");
    banner.style.background = "none";
    banner.style.backgroundImage = `url(${PORTFOLIO_DATA.banner_url})`;
    banner.style.backgroundSize = "cover";
    banner.style.backgroundPosition = "center";
}

renderProfile(PORTFOLIO_DATA);
renderCountries(PORTFOLIO_DATA.countries);
renderItineraries(PORTFOLIO_DATA.itineraries);

// Hide other people's favourited itineraries by default
document.querySelectorAll("#itineraries-grid li").forEach(li => {
    const id = parseInt(li.dataset.itineraryId);
    if (!PORTFOLIO_DATA.own_itinerary_ids.includes(id)) {
        li.style.display = "none";
    }
});