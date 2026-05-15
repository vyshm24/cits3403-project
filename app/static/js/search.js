document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Add login check for Post button
  const postLink = document.getElementById("post-link");
  if (postLink) {
    postLink.addEventListener("click", (e) => {
      if (!isLoggedIn) {
        e.preventDefault();
        alert("Please sign in to create a post.");
        window.location.href = "../pages/sign-in.html";
      }
    });
  }




  // Live search functionality
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");
  const toggleButtons = document.querySelectorAll(".search-toggle");
  const sortSelect = document.getElementById("sort-select");
  const sortDropdown = document.getElementById("sort-dropdown");
  const sortTrigger = document.getElementById("sort-trigger");
  const sortLabel = document.getElementById("sort-label");
  const sortMenu = document.getElementById("sort-menu");
  const sortChevron = document.getElementById("sort-chevron");
  const sortOptions = document.querySelectorAll(".sort-option");
  let searchTimeout;
  let activeSearchType = "title";
  let activeSortOrder = "default";
  let lastResults = [];

  // Toggle button behaviour
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeSearchType = btn.dataset.type;

      toggleButtons.forEach(b => {
        b.classList.remove("bg-white", "text-indigo-600");
        b.classList.add("bg-white/30", "text-white");
      });
      btn.classList.remove("bg-white/30", "text-white");
      btn.classList.add("bg-white", "text-indigo-600");

      const query = searchInput ? searchInput.value.trim() : "";
      if (query) performSearch(query);
    });
  });

  if (searchInput && resultsContainer) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      // Clear timeout if it exists
      clearTimeout(searchTimeout);

      // Clear results if query is empty
      if (!query) {
        resultsContainer.innerHTML = '';
        return;
      }

      // Debounce search requests
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    });
  }

  /**
   * Perform AJAX search
   */
  async function performSearch(query) {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(activeSearchType)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      lastResults = await response.json();
      renderResults(sortResults(lastResults), query);
    } catch (error) {
      console.error('Search error:', error);
      resultsContainer.innerHTML = '<p class="error-message">Search failed. Please try again.</p>';
    }
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      activeSortOrder = sortSelect.value;
      syncSortDropdown();
      const query = searchInput ? searchInput.value.trim() : "";
      if (lastResults.length) renderResults(sortResults(lastResults), query);
    });
  }

  if (sortTrigger && sortMenu && sortSelect) {
    sortTrigger.addEventListener("click", () => {
      const isOpen = !sortMenu.classList.contains("hidden");
      setSortDropdownOpen(!isOpen);
    });

    sortOptions.forEach((option) => {
      option.addEventListener("click", () => {
        sortSelect.value = option.dataset.value;
        sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
        setSortDropdownOpen(false);
      });
    });

    document.addEventListener("click", (event) => {
      if (sortDropdown && !sortDropdown.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    });

    syncSortDropdown();
  }

  function sortResults(results) {
    const sorted = [...results];
    if (activeSortOrder === "likes") {
      sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (activeSortOrder === "recent") {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return sorted;
  }

  /**
   * Render search results
   */
  function renderResults(results, query) {
    if (results.length === 0) {
      resultsContainer.innerHTML = `<p class="no-results">No itineraries found matching "${escapeHtml(query)}"</p>`;
      return;
    }

    const html = results.map(result => createResultBox(result)).join('');
    resultsContainer.innerHTML = html;
  }

  /**
   * Create HTML for a single result box
   */
  function createResultBox(itinerary) {
    const safeTitle = escapeHtml(String(itinerary.title || ""));
    const safeCountry = escapeHtml(String(itinerary.country || ""));

    const totalDays = Number.parseInt(itinerary.total_days, 10) || 0;
    const likesCount = Number.parseInt(itinerary.likes_count, 10) || 0;
    const id = Number.parseInt(itinerary.id, 10);

    const coverImage = sanitizeStaticImagePath(itinerary.cover_image_url);

    return `
    <div class="result-box">
      <div class="result-image">
        <img src="${escapeHtml(coverImage)}" alt="${safeTitle}" />
      </div>
      <div class="result-content">
        <h3 class="result-title">${safeTitle}</h3>
        <p class="result-country">${safeCountry}</p>
        <p class="result-duration">${totalDays} days &nbsp;·&nbsp; ♥ ${likesCount}</p>
        <a href="/itinerary/${id}" class="result-link">View Itinerary</a>
      </div>
    </div>
  `;
  }

  function sanitizeStaticImagePath(path) {
    if (!path || typeof path !== "string") {
      return "/static/images/placeholder.jpg";
    }

    // Only allow certain characters and extensions to prevent XSS
    if (!/^[a-zA-Z0-9/_\-.]+\.(jpg|jpeg|png|webp|gif)$/i.test(path)) {
      return "/static/images/placeholder.jpg";
    }

    return `/static/${path}`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  function setSortDropdownOpen(isOpen) {
    sortMenu.classList.toggle("hidden", !isOpen);
    sortTrigger.setAttribute("aria-expanded", String(isOpen));
    sortChevron.classList.toggle("rotate-180", isOpen);
  }

  function syncSortDropdown() {
    if (!sortSelect || !sortLabel) {
      return;
    }

    const selectedOption = sortSelect.options[sortSelect.selectedIndex];
    sortLabel.textContent = selectedOption ? selectedOption.textContent : "Sort: Default";

    sortOptions.forEach((option) => {
      const isSelected = option.dataset.value === sortSelect.value;
      option.classList.toggle("bg-slate-400", isSelected);
      option.classList.toggle("text-white", isSelected);
      option.classList.toggle("hover:bg-slate-500", isSelected);
      option.classList.toggle("text-slate-900", !isSelected);
      option.classList.toggle("hover:bg-indigo-50", !isSelected);
    });
  }
});
