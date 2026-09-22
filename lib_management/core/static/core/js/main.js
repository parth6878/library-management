/**
 * BookHive — Core Interactive JavaScript
 * Light & Warm Frontend Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAlerts();
  initImageFallbacks();
  initLiveSearch();
  initRentalActions();
});

/* ==========================================================================
   1. Navbar & Mobile Navigation
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.warm-navbar');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Sticky Navbar shadow on scroll
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Mobile drawer toggle
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close on clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '☰';
      }
    });
  }
}

/* ==========================================================================
   2. Flash Messages & Alerts
   ========================================================================== */
function initAlerts() {
  const alerts = document.querySelectorAll('.warm-alert');
  alerts.forEach((alert) => {
    // Dismiss button
    const closeBtn = alert.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dismissAlert(alert);
      });
    }

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissAlert(alert);
    }, 5500);
  });
}

function dismissAlert(alert) {
  if (!alert) return;
  alert.style.transition = 'opacity 250ms ease, transform 250ms ease, max-height 250ms ease';
  alert.style.opacity = '0';
  alert.style.transform = 'translateY(-8px)';
  alert.style.maxHeight = '0';
  alert.style.paddingTop = '0';
  alert.style.paddingBottom = '0';
  alert.style.margin = '0';
  setTimeout(() => alert.remove(), 260);
}

/* ==========================================================================
   3. Book Cover Fallback Generator
   Creates a warm, literary illustrated placeholder if image fails to load
   ========================================================================== */
function initImageFallbacks() {
  const bookImages = document.querySelectorAll('img.book-cover-img, .card-img-top');
  bookImages.forEach((img) => {
    img.addEventListener('error', function() {
      const bookTitle = this.getAttribute('alt') || 'BookHive Book';
      const truncatedTitle = bookTitle.length > 28 ? bookTitle.substring(0, 26) + '…' : bookTitle;
      
      // Generate inline SVG warm cover
      const svgPlaceholder = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" width="100%" height="100%">
          <defs>
            <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F7E6D0"/>
              <stop offset="50%" stop-color="#EED5B7"/>
              <stop offset="100%" stop-color="#DDB992"/>
            </linearGradient>
            <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#C25E00" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="transparent"/>
            </linearGradient>
          </defs>
          <rect width="240" height="320" rx="6" fill="url(#warmGrad)"/>
          <rect width="18" height="320" rx="3" fill="url(#spineGrad)"/>
          <rect x="26" y="24" width="188" height="272" rx="4" fill="none" stroke="#C66900" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.45"/>
          <g transform="translate(120, 110)">
            <circle r="34" fill="#C66900" fill-opacity="0.12"/>
            <text x="0" y="10" text-anchor="middle" font-size="28" font-family="serif">📖</text>
          </g>
          <text x="120" y="180" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="14" fill="#2C241D">
            ${escapeXml(truncatedTitle)}
          </text>
          <text x="120" y="210" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#C66900" letter-spacing="1">
            BOOKHIVE
          </text>
        </svg>
      `;

      const blob = new Blob([svgPlaceholder], { type: 'image/svg+xml' });
      this.src = URL.createObjectURL(blob);
      this.classList.add('fallback-loaded');
    }, { once: true });
  });
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

/* ==========================================================================
   4. Live Search & Autocomplete across Author and Book Title
   ========================================================================== */
function initLiveSearch() {
  const searchInput = document.getElementById('catalogueSearchInput');
  const bookCards = document.querySelectorAll('.book-card-col');
  const emptyState = document.getElementById('noResultsState');
  const countDisplay = document.getElementById('resultsCount');
  const searchBySelect = document.querySelector('select[name="search_by"]');

  if (searchInput && bookCards.length > 0) {
    const performClientFilter = () => {
      const query = searchInput.value.toLowerCase().trim();
      const searchTarget = searchBySelect ? searchBySelect.value : 'all';
      const terms = query.split(/\s+/).filter(Boolean);
      let visibleCount = 0;

      bookCards.forEach((card) => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const author = (card.getAttribute('data-author') || '').toLowerCase();

        let matches = true;

        if (terms.length > 0) {
          if (searchTarget === 'title') {
            matches = terms.every((term) => title.includes(term));
          } else if (searchTarget === 'author') {
            matches = terms.every((term) => author.includes(term));
          } else {
            // 'all': matches either in title or author
            matches = terms.every((term) => title.includes(term) || author.includes(term));
          }
        }

        if (matches) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countDisplay) {
        countDisplay.textContent = visibleCount;
      }

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    };

    searchInput.addEventListener('input', performClientFilter);
    if (searchBySelect) {
      searchBySelect.addEventListener('change', performClientFilter);
    }
  }

  // Initialize Autocomplete suggestions for all search bars (navbar and catalogue)
  initAutocompleteSearch();
}

function initAutocompleteSearch() {
  const searchInputs = document.querySelectorAll('.search-autocomplete-input');

  searchInputs.forEach((input) => {
    const parentContainer = input.closest('.search-input-wrapper') || input.closest('.nav-search-form');
    if (!parentContainer) return;

    const dropdown = parentContainer.querySelector('.search-autocomplete-dropdown');
    if (!dropdown) return;

    let debounceTimer = null;

    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();

      if (query.length < 2) {
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
        return;
      }

      debounceTimer = setTimeout(() => {
        const searchBySelect = document.querySelector('select[name="search_by"]');
        const searchBy = searchBySelect ? searchBySelect.value : 'all';

        fetch(`/books/api/search/?q=${encodeURIComponent(query)}&search_by=${encodeURIComponent(searchBy)}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data.results || data.results.length === 0) {
              dropdown.innerHTML = `
                <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                  No books or authors found for "<strong>${escapeXml(query)}</strong>"
                </div>
              `;
              dropdown.classList.add('active');
              return;
            }

            let html = '';
            data.results.forEach((book) => {
              const highlightedTitle = highlightMatch(book.title, query);
              const highlightedAuthor = highlightMatch(book.authors, query);
              const coverImg = book.cover_url 
                ? `<img src="${book.cover_url}" class="suggestion-thumb" alt="${escapeXml(book.title)}">` 
                : `<div class="suggestion-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">📖</div>`;

              html += `
                <a href="/books/${book.id}/" class="search-suggestion-item">
                  ${coverImg}
                  <div class="suggestion-info">
                    <div class="suggestion-title">${highlightedTitle}</div>
                    <div class="suggestion-author">by ${highlightedAuthor}</div>
                  </div>
                  <div class="suggestion-meta">
                    <span style="color: #B45309; font-weight: 700;">⭐ ${book.rating}</span>
                    <span style="color: var(--accent-primary); font-weight: 800;">₹${book.price}</span>
                  </div>
                </a>
              `;
            });

            html += `
              <a href="/books/?q=${encodeURIComponent(query)}&search_by=${encodeURIComponent(searchBy)}" class="suggestion-view-all">
                View all results for "${escapeXml(query)}" &rarr;
              </a>
            `;

            dropdown.innerHTML = html;
            dropdown.classList.add('active');
          })
          .catch((err) => {
            console.error('Search API error:', err);
          });
      }, 180);
    });

    // Close on Escape or click outside
    document.addEventListener('click', (e) => {
      if (!parentContainer.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('active');
      }
    });
  });
}

function highlightMatch(text, query) {
  if (!text || !query) return escapeXml(text || '');
  const terms = query.split(/\s+/).filter(Boolean);
  let escapedText = escapeXml(text);
  terms.forEach((term) => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    escapedText = escapedText.replace(regex, '<strong style="color: var(--accent-primary);">$1</strong>');
  });
  return escapedText;
}

/* ==========================================================================
   5. Interactive Rental Feedback
   ========================================================================== */
function initRentalActions() {
  document.querySelectorAll('.btn-rent-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const bookTitle = btn.getAttribute('data-book-title') || 'this book';
      // Provide immediate warm feedback
      showWarmToast(`You selected "${bookTitle}". Rental request initialized!`);
    });
  });
}

function showWarmToast(message) {
  let toast = document.querySelector('.warm-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'warm-toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 28px;
      right: 28px;
      background: #2C241D;
      color: #FFFDF9;
      padding: 0.9rem 1.4rem;
      border-radius: 14px;
      box-shadow: 0 12px 32px rgba(44, 36, 29, 0.28);
      font-size: 0.92rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 9999;
      border-left: 4px solid #D97706;
      animation: slideUpToast 260ms ease-out forwards;
    ">
      <span>🍯</span>
      <span>${escapeXml(message)}</span>
    </div>
  `;

  setTimeout(() => {
    if (toast) toast.innerHTML = '';
  }, 4000);
}
