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
      const query = searchInput ? searchInput.value.trim() : "";
      if (lastResults.length) renderResults(sortResults(lastResults), query);
    });
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
    const coverImage = itinerary.cover_image_url
      ? `/static/${itinerary.cover_image_url}`
      : '/static/images/placeholder.jpg';

    return `
      <div class="result-box">
        <div class="result-image">
          <img src="${coverImage}" alt="${escapeHtml(itinerary.title)}" />
        </div>
        <div class="result-content">
          <h3 class="result-title">${escapeHtml(itinerary.title)}</h3>
          <p class="result-country">${escapeHtml(itinerary.country)}</p>
          <p class="result-duration">${itinerary.total_days} days &nbsp;·&nbsp; ♥ ${itinerary.likes_count || 0}</p>
          <a href="/itinerary/${itinerary.id}" class="result-link">View Itinerary</a>
        </div>
      </div>
    `;
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
});
