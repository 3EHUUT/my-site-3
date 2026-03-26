(function () {
    'use strict';

    // ── Scroll Reveal Animations ────────────────────────────────────────
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = entry.target.classList.contains('product-card')
                    ? (Array.from(entry.target.parentElement.children).indexOf(entry.target) % 8) * 80
                    : 0;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card').forEach(card => revealObserver.observe(card));

    document.querySelectorAll('.section-header, .hero-content, .trust-grid, .categories-grid, .category-card, .price-history-section, .user-reviews-section, .pros-cons-widget').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // ── Cookie Banner ───────────────────────────────────────────────────
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner && !localStorage.getItem('cookies_accepted')) {
        setTimeout(() => cookieBanner.classList.add('visible'), 2000);
    }

    window.acceptCookies = function () {
        localStorage.setItem('cookies_accepted', '1');
        if (cookieBanner) cookieBanner.classList.remove('visible');
    };

    // ── Mobile Menu ─────────────────────────────────────────────────────
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // ── Search Toggle ───────────────────────────────────────────────────
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.toggle('active');
            if (searchOverlay.classList.contains('active') && searchInput) searchInput.focus();
        });
        if (searchClose) searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase().trim();
                document.querySelectorAll('.product-card').forEach(card => {
                    const title = (card.querySelector('.card-title') || {}).textContent || '';
                    const brand = (card.querySelector('.card-brand') || {}).textContent || '';
                    card.style.display = (!query || title.toLowerCase().includes(query) || brand.toLowerCase().includes(query)) ? '' : 'none';
                });
            });
        }
    }

    // ── "X people viewing now" widget ───────────────────────────────────
    function updateViewers() {
        document.querySelectorAll('.product-viewers, .card-viewers').forEach(el => {
            const min = parseInt(el.dataset.min) || 2;
            const max = parseInt(el.dataset.max) || 25;
            const countEl = el.querySelector('.viewer-count');
            if (countEl) {
                const current = parseInt(countEl.textContent) || Math.floor(Math.random() * (max - min) + min);
                const jitter = Math.floor(Math.random() * 6) - 2;
                countEl.textContent = Math.max(min, Math.min(max, current + jitter));
            }
        });
    }
    updateViewers();
    setInterval(updateViewers, 30000 + Math.random() * 30000);

    // ── "Only X left in stock" widget ───────────────────────────────────
    function updateStock() {
        document.querySelectorAll('.stock-urgency').forEach(el => {
            const min = parseInt(el.dataset.min) || 2;
            const max = parseInt(el.dataset.max) || 15;
            const countEl = el.querySelector('.stock-count');
            if (countEl) countEl.textContent = Math.floor(Math.random() * (max - min) + min);
        });
    }
    updateStock();
    setInterval(updateStock, 180000 + Math.random() * 120000);

    // ── View counter ────────────────────────────────────────────────────
    document.querySelectorAll('.total-views, .card-view-count').forEach(el => {
        const base = parseInt(el.textContent) || 0;
        el.textContent = (base + Math.floor(Math.random() * 50) + 10).toLocaleString();
    });

    // ── CTA Click Tracking ──────────────────────────────────────────────
    document.querySelectorAll('[data-track="cta"]').forEach(link => {
        link.addEventListener('click', function () {
            console.log('[CTA Click]', { productId: this.dataset.productId, url: this.href, t: Date.now() });
            if (window.__trackUrl) {
                navigator.sendBeacon(window.__trackUrl, JSON.stringify({
                    event: 'cta_click', product_id: this.dataset.productId,
                    timestamp: Date.now(), url: this.href, user_agent: navigator.userAgent
                }));
            }
        });
    });

    // ── Banner Tracking ─────────────────────────────────────────────────
    if ('IntersectionObserver' in window) {
        const bannerObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('[Banner Impression]', { bannerId: entry.target.dataset.bannerId });
                    bannerObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('[data-track="banner"]').forEach(el => bannerObs.observe(el));
    }
    document.querySelectorAll('[data-track="banner"]').forEach(link => {
        link.addEventListener('click', function () {
            console.log('[Banner Click]', { bannerId: this.dataset.bannerId, url: this.href, t: Date.now() });
            if (window.__trackUrl) {
                navigator.sendBeacon(window.__trackUrl, JSON.stringify({
                    event: 'banner_click', banner_id: this.dataset.bannerId,
                    timestamp: Date.now(), url: this.href, user_agent: navigator.userAgent
                }));
            }
        });
    });

    // ── Filter & Sort (Home Page) ───────────────────────────────────────
    const filterBtns = document.querySelectorAll('.filters-bar .filter-btn');
    const productGrid = document.getElementById('productGrid');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            if (productGrid) {
                productGrid.querySelectorAll('.product-card').forEach(card => {
                    const show = filter === 'all' || card.dataset.category === filter;
                    card.style.display = show ? '' : 'none';
                    if (show) card.classList.add('visible');
                });
            }
        });
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect && productGrid) {
        sortSelect.addEventListener('change', () => {
            const cards = Array.from(productGrid.querySelectorAll('.product-card'));
            cards.sort((a, b) => {
                switch (sortSelect.value) {
                    case 'price-asc': return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                    case 'price-desc': return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                    case 'rating': return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
                    case 'popular': return parseInt(b.dataset.views) - parseInt(a.dataset.views);
                    default: return 0;
                }
            });
            cards.forEach(card => productGrid.appendChild(card));
        });
    }

    // ── Category Page Filters ───────────────────────────────────────────
    window.filterProducts = function () {
        const priceFilter = document.getElementById('priceFilter');
        const discountFilter = document.getElementById('discountFilter');
        const grid = document.getElementById('categoryGrid');
        if (!grid) return;
        grid.querySelectorAll('.product-card').forEach(card => {
            const price = parseFloat(card.dataset.price) || 0;
            let show = true;
            if (priceFilter && priceFilter.value !== 'all') {
                const [min, max] = priceFilter.value.split('-').map(Number);
                if (price < min || price > max) show = false;
            }
            if (discountFilter && discountFilter.value === 'yes' && !card.querySelector('.card-badge')) show = false;
            card.style.display = show ? '' : 'none';
        });
    };

    window.sortProducts = function () {
        const sortFilter = document.getElementById('sortFilter');
        const grid = document.getElementById('categoryGrid');
        if (!grid || !sortFilter) return;
        const cards = Array.from(grid.querySelectorAll('.product-card'));
        cards.sort((a, b) => {
            switch (sortFilter.value) {
                case 'price-asc': return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-desc': return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'rating': return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
                default: return 0;
            }
        });
        cards.forEach(card => grid.appendChild(card));
    };

    // ── Card hover lift effect ──────────────────────────────────────────
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-4px)'; });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ── Animate numbers on scroll (stats bar) ───────────────────────────
    document.querySelectorAll('.stat-number').forEach(el => {
        const text = el.textContent;
        const match = text.match(/[\d,]+/);
        if (!match) return;
        const target = parseInt(match[0].replace(/,/g, ''));
        if (isNaN(target) || target === 0) return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let current = 0;
                    const step = Math.max(1, Math.floor(target / 40));
                    const timer = setInterval(() => {
                        current = Math.min(current + step, target);
                        el.textContent = text.replace(match[0], current.toLocaleString());
                        if (current >= target) clearInterval(timer);
                    }, 30);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        obs.observe(el);
    });

})();
