// author-profile-page.js
// JavaScript for the Author Profile Page
// Connect to backend by replacing renderProfile(mockUser) with a fetch() call

// ── DATA — replace with fetch() when backend ready ──
const mockUser = {
    uid: "",
    username: "",
    countries: {},
    itineraries: []
};

// ── HELPERS ──
function getInitials(n) { if(!n) return "?"; return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }
function calcAvg(r) { let t=0,c=0; for(let s=1;s<=5;s++){t+=s*(r[s]||0);c+=(r[s]||0);} return c?t/c:0; }
function starsHTML(avg, large=false) {
    const cls = large ? "text-xl text-yellow-400" : "text-xs text-gray-300";
    return [1,2,3,4,5].map(i=>`<span class="${cls} ${i<=Math.round(avg)?"!text-yellow-400":""}">★</span>`).join("");
}

// ── AVATAR UPLOAD ──
document.getElementById("avatar-overlay-btn").addEventListener("click", () => document.getElementById("avatar-upload").click());
document.getElementById("avatar-upload").addEventListener("change", e => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const src = ev.target.result;
        const d = document.getElementById("avatar-display");
        document.getElementById("avatar-initials").style.display = "none";
        let img = d.querySelector("img");
        if(!img){ img=document.createElement("img"); img.className="w-full h-full object-cover"; d.appendChild(img); }
        img.src = src;
        const nav = document.getElementById("nav-avatar-display");
        nav.innerHTML = `<img src="${src}" class="w-full h-full object-cover rounded-full">`;
    };
    reader.readAsDataURL(file);
});

// ── COUNTRY FILTER ──
let activeCountry = null;
function filterByCountry(country, tagEl) {
    if(activeCountry===country){ clearFilter(); return; }
    activeCountry = country;
    document.querySelectorAll(".country-tag").forEach(t=>t.classList.remove("active"));
    tagEl.classList.add("active");
    document.getElementById("filter-country-name").textContent = country;
    document.getElementById("filter-notice").classList.remove("hidden");
    document.getElementById("filter-notice").classList.add("flex");
    document.querySelectorAll(".itinerary-card").forEach(card=>{
        card.closest("li").style.display = card.dataset.country!==country ? "none" : "";
    });
}
function clearFilter() {
    activeCountry = null;
    document.querySelectorAll(".country-tag").forEach(t=>t.classList.remove("active"));
    document.getElementById("filter-notice").classList.add("hidden");
    document.getElementById("filter-notice").classList.remove("flex");
    document.querySelectorAll("#itineraries-grid li").forEach(li=>li.style.display="");
}

// ── RATING POPUP ──
const overlay = document.getElementById("rating-overlay");
const popup   = document.getElementById("rating-popup");
function closePopup() {
    overlay.classList.remove("opacity-100","pointer-events-auto");
    overlay.classList.add("opacity-0","pointer-events-none");
    popup.classList.add("translate-y-3");
}
document.getElementById("popup-close").addEventListener("click", closePopup);
overlay.addEventListener("click", e => { if(e.target===overlay) closePopup(); });

function openRatingPopup(it) {
    const avg=calcAvg(it.ratings||{}), total=Object.values(it.ratings||{}).reduce((s,n)=>s+n,0);
    document.getElementById("popup-trip-title").textContent    = it.title;
    document.getElementById("popup-avg-score").textContent     = avg.toFixed(1);
    document.getElementById("popup-total-ratings").textContent = total+" ratings";
    document.getElementById("popup-stars-large").innerHTML     = starsHTML(avg, true);
    const bars = document.getElementById("rating-bars");
    bars.innerHTML = "";
    for(let s=5;s>=1;s--){
        const n=it.ratings?.[s]||0, pct=total?Math.round(n/total*100):0;
        bars.innerHTML+=`
            <div class="flex items-center gap-2 text-xs">
                <span class="w-5 text-right text-gray-500 font-semibold">${s}★</span>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-400 rounded-full" style="width:${pct}%"></div>
                </div>
                <span class="w-5 text-gray-500">${n}</span>
            </div>`;
    }
    overlay.classList.remove("opacity-0","pointer-events-none");
    overlay.classList.add("opacity-100","pointer-events-auto");
    popup.classList.remove("translate-y-3");
}

// ── RENDER ──
function renderProfile(user) {
    const initials = getInitials(user.username);
    document.getElementById("avatar-initials").textContent    = initials;
    document.getElementById("nav-avatar-display").textContent = initials;
    document.getElementById("username").textContent           = user.username || "—";
    document.getElementById("uid").textContent                = "UID: " + (user.uid || "—");
    document.title = (user.username || "Author") + " – Travel Blog";

    const totalLikes = user.itineraries.reduce((s,it)=>s+it.likes,0);
    document.getElementById("stat-posts").textContent     = user.itineraries.length;
    document.getElementById("stat-countries").textContent = Object.keys(user.countries).length;
    document.getElementById("stat-likes").textContent     = totalLikes;

    renderCountries(user.countries);
    renderItineraries(user.itineraries);
}

function renderCountries(countries) {
    const list = document.getElementById("countries-list");
    list.innerHTML = "";
    const entries = Object.entries(countries);
    if(!entries.length) return;
    entries.forEach(([country, data]) => {
        const li  = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "country-tag";
        btn.style.setProperty("--expanded-width", (52+8+(country.length*8.5)+14)+"px");
        btn.innerHTML = `<span class="flag-circle">${data.flag}</span><span class="country-name">${country}</span>`;
        btn.addEventListener("click", () => filterByCountry(country, btn));
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function renderItineraries(itineraries) {
    const grid = document.getElementById("itineraries-grid");
    grid.innerHTML = "";
    if(!itineraries.length){
        grid.innerHTML = '<li class="col-span-4 text-center py-10 text-gray-500 text-sm">No itineraries posted yet.</li>';
        return;
    }
    const colors = ["#DBEAFE","#FEF3C7","#D1FAE5","#FCE7F3"];
    itineraries.forEach((it, i) => {
        const avg  = calcAvg(it.ratings||{});
        const li   = document.createElement("li");
        const link = document.createElement("a");
        link.href            = `post-interface.html?id=${it.id}`;
        link.className       = "itinerary-card block bg-white border border-gray-200 rounded-xl overflow-hidden no-underline text-inherit flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200";
        link.dataset.country = it.location;
        link.innerHTML = `
            <div class="h-24 flex items-center justify-center text-4xl" style="background:${colors[i%colors.length]}">${it.emoji||"✈️"}</div>
            <div class="p-3 flex-1">
                <h3 class="text-xs font-bold text-blue-900 mb-1 leading-snug">${it.title}</h3>
                <div class="text-xs text-gray-500">📍 ${it.location}</div>
            </div>
            <div class="px-3 pb-3 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
                <span>❤️ ${it.likes}</span>
                <span>🔖 ${it.saves}</span>
                <span class="ml-auto card-stars cursor-pointer px-1 py-0.5 rounded hover:bg-yellow-50 transition-colors" title="See ratings">
                    ${starsHTML(avg)}<span class="text-yellow-500 font-bold ml-0.5">${avg.toFixed(1)}</span>
                </span>
            </div>`;
        link.querySelector(".card-stars").addEventListener("click", e => {
            e.preventDefault(); e.stopPropagation(); openRatingPopup(it);
        });
        li.appendChild(link);
        grid.appendChild(li);
    });
}

// ── GO ──
renderProfile(mockUser);