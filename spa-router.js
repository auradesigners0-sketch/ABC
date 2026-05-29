/**
 * SPA Router for ABC GLOBAL Church
 * 
 * - Intercepts all internal navigation links and loads page content
 *   via fetch() WITHOUT reloading the page.
 * - This keeps the <audio> element alive so the radio NEVER stops.
 * - On sub-pages: hides nav, arc menu, radio player, give button
 *   (sub-pages look like standalone pages with back buttons).
 * - On home page: shows all homepage-only elements.
 */

(function () {
    'use strict';

    // The container where dynamic page content will be injected
    const contentArea = document.getElementById('spa-content');
    if (!contentArea) {
        console.error('SPA Router: #spa-content container not found!');
        return;
    }

    // Homepage-only elements (shown on home, hidden on sub-pages)
    const floatingWidgets = document.getElementById('floatingWidgets');
    const desktopNav = document.getElementById('desktopNav');
    const arcNav = document.getElementById('arcNav');
    const arcTrigger = document.getElementById('arcTrigger');
    const mobileLogoFloat = document.getElementById('mobileLogoFloat');
    const rippleContainer = document.getElementById('ripple-container');

    // Capture the base path BEFORE any pushState/replaceState changes the URL.
    // This ensures relative fetch URLs (e.g. 'giving.html') resolve correctly
    // even when the SPA router changes the browser URL to '/' or '/giving'.
    const initialPath = window.location.pathname;
    const basePath = initialPath.substring(0, initialPath.lastIndexOf('/') + 1) || '/';
    // e.g. '/abc/' when loaded from /abc/index.html, or '/' when at root

    // Track current page for caching
    let currentPage = 'home';
    const pageCache = {};
    const pageStyles = {};
    const pageScripts = {};

    // Store the home page content (already in the DOM on first load)
    pageCache['home'] = contentArea.innerHTML;
    pageStyles['home'] = '';
    pageScripts['home'] = '';

    // Page-specific config (SEO-optimized titles)
    const pageConfig = {
        'home':       { bodyClass: 'spa-home',       bg: '#E0E0E0', title: 'ABC Global Church - Assembly of Believers Church | Dar es Salaam, Tanzania' },
        'giving':     { bodyClass: 'spa-giving',     bg: '#E0E0E0', title: 'Give - Tithes & Offerings | ABC Global Church' },
        'testimonies':{ bodyClass: 'spa-testimonies', bg: '#E0E0E0', title: 'Share Your Testimony | ABC Global Church' },
        'prayer':     { bodyClass: 'spa-prayer',     bg: '#E0E0E0', title: 'Prayer Request | ABC Global Church' },
        'connect':    { bodyClass: 'spa-connect',    bg: '#1f2937', title: 'Connect With Us | ABC Global Church' },
        'branches':   { bodyClass: 'spa-branches',   bg: '#f4f4f5', title: 'Our Branches Across Tanzania | ABC Global Church' },
        'history':    { bodyClass: 'spa-history',     bg: '#1f2937', title: 'Our History - Founded 2016 | ABC Global Church' }
    };

    // Map page names to their HTML files (used for fetch)
    // Use absolute paths so fetch() works regardless of pushState URL changes
    const pageFiles = {
        'giving': basePath + 'giving.html',
        'testimonies': basePath + 'testimonies.html',
        'prayer': basePath + 'prayer.html',
        'connect': basePath + 'connect.html',
        'branches': basePath + 'branches.html',
        'history': basePath + 'history.html'
    };

    // Clean URL paths (shown in browser address bar)
    // Prefix with basePath so they work inside iframes or subdirectories
    const cleanUrls = {
        'home': basePath,
        'giving': basePath + 'giving',
        'testimonies': basePath + 'testimonies',
        'prayer': basePath + 'prayer',
        'connect': basePath + 'connect',
        'branches': basePath + 'branches',
        'history': basePath + 'history'
    };

    // Reverse map: filename OR clean path -> page name
    const fileToPage = {};
    for (const [page, file] of Object.entries(pageFiles)) {
        fileToPage[file] = page;
        // Also register just the bare filename (e.g. 'giving.html') for backward compatibility
        const bareName = file.split('/').pop();
        fileToPage[bareName] = page;
    }
    for (const [page, path] of Object.entries(cleanUrls)) {
        if (page !== 'home') fileToPage[path] = page;
    }
    // Also register home path without trailing slash
    fileToPage[basePath.slice(0, -1)] = 'home';
    fileToPage[basePath] = 'home';

    /**
     * Get page name from an href string
     */
    function getPageFromHref(href) {
        if (!href || href === 'index.html' || href === '/' || href === basePath || href === basePath.slice(0, -1) || href === './' || href === '') return 'home';
        // Strip leading dot/slash for consistent matching
        const cleanHref = href.replace(/^\.\//, '');
        // Check clean URL paths first (e.g. /abc/giving, /abc/branches)
        if (fileToPage[cleanHref]) return fileToPage[cleanHref];
        // Also check without basePath prefix (for links that use '/giving' format)
        if (cleanHref.startsWith('/') && !cleanHref.startsWith(basePath)) {
            const withBase = basePath + cleanHref.substring(1);
            if (fileToPage[withBase]) return fileToPage[withBase];
        }
        // Then check by filename (e.g. giving.html)
        const filename = cleanHref.split('/').pop().split('?')[0].split('#')[0];
        return fileToPage[filename] || null;
    }

    /**
     * Show homepage-only elements
     */
    function showHomeElements() {
        // Clear ALL inline styles so CSS rules take full control again
        if (floatingWidgets) {
            floatingWidgets.removeAttribute('style');
        }
        if (desktopNav) {
            desktopNav.removeAttribute('style');
        }
        if (arcNav) {
            arcNav.removeAttribute('style');
            arcNav.classList.remove('active');
        }
        if (arcTrigger) {
            arcTrigger.removeAttribute('style');
            arcTrigger.classList.remove('active');
        }
        if (mobileLogoFloat) {
            mobileLogoFloat.removeAttribute('style');
        }
        if (rippleContainer) {
            rippleContainer.removeAttribute('style');
        }
        // Safety net: ensure menu overlay is closed when returning home
        var menuOverlay = document.getElementById('menuOverlay');
        if (menuOverlay) {
            if (menuOverlay.classList.contains('active')) {
                // Menu is still open — close it properly
                if (typeof window.closeMenu === 'function') {
                    window.closeMenu();
                } else {
                    menuOverlay.classList.remove('active');
                    menuOverlay.style.display = 'none';
                    var hamburger = document.getElementById('hamburger');
                    if (hamburger) hamburger.classList.remove('active');
                    document.body.style.overflow = '';
                }
            } else {
                // Menu is closed but might still have display:block from fade-out timeout
                // Force it to display:none so it doesn't block interactions
                menuOverlay.style.display = 'none';
            }
        }
    }

    /**
     * Hide homepage-only elements (sub-pages look like standalone pages)
     */
    function hideHomeElements() {
        // Hide radio player + give button
        if (floatingWidgets) {
            floatingWidgets.style.cssText = 'display: none !important;';
        }
        // Hide desktop bottom nav
        if (desktopNav) {
            desktopNav.style.cssText = 'display: none !important;';
        }
        // Hide arc nav and reset its state
        if (arcNav) {
            arcNav.classList.remove('active');
            arcNav.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important;';
        }
        if (arcTrigger) {
            arcTrigger.classList.remove('active');
        }
        if (mobileLogoFloat) {
            mobileLogoFloat.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important;';
        }
        // Hide ripple container
        if (rippleContainer) {
            rippleContainer.style.cssText = 'display: none !important;';
        }
        // Close arc menu if open
        if (arcNav && arcNav.classList.contains('active')) {
            arcNav.classList.remove('active');
        }
        if (arcTrigger && arcTrigger.classList.contains('active')) {
            arcTrigger.classList.remove('active');
        }
        // Close mobile menu overlay (safety net — closeMenu() may have already run)
        var menuOverlay = document.getElementById('menuOverlay');
        if (menuOverlay) {
            if (menuOverlay.classList.contains('active')) {
                // Menu is still open — close it
                if (typeof window.closeMenu === 'function') {
                    window.closeMenu();
                } else {
                    menuOverlay.classList.remove('active');
                    var hamburger = document.getElementById('hamburger');
                    if (hamburger) hamburger.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
            // Force hide immediately on sub-pages (no smooth fade needed)
            menuOverlay.style.display = 'none';
            menuOverlay.classList.remove('active');
        }
    }

    /**
     * Prepare content for SPA mode:
     * - Keep back buttons (they navigate back to home via SPA)
     * - Fix onclick attributes that do window.location
     */
    function cleanContent(html, pageName) {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Fix back-nav links to work with SPA (use basePath)
        temp.querySelectorAll('.back-nav').forEach(el => {
            el.setAttribute('href', basePath);
            el.removeAttribute('onclick');
        });

        // Fix "Back to Home" buttons (use basePath)
        temp.querySelectorAll('a.home-btn, a[href="index.html"]').forEach(el => {
            el.setAttribute('href', basePath);
            el.removeAttribute('onclick');
        });

        // Fix any other onclick="window.location..." attributes
        temp.querySelectorAll('[onclick]').forEach(el => {
            const onclick = el.getAttribute('onclick') || '';
            if (onclick.includes('window.location')) {
                el.removeAttribute('onclick');
            }
        });

        // Remove back-to-top buttons from fetched pages (main button persists in index.html)
        temp.querySelectorAll('.back-to-top').forEach(el => el.remove());

        return temp.innerHTML;
    }

    /**
     * Fetch a page's HTML and extract its content, styles, and scripts
     */
    async function fetchPageContent(pageName) {
        if (pageCache[pageName]) return; // Already cached

        const file = pageFiles[pageName];
        if (!file) return;

        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error('Failed to load page');
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Extract styles
            let styles = '';
            doc.querySelectorAll('style').forEach(style => {
                styles += style.textContent;
            });

            // Extract body content (remove <script> and <style> tags)
            const bodyContent = doc.body.cloneNode(true);
            bodyContent.querySelectorAll('script, style').forEach(el => el.remove());

            // Clean content for SPA
            const cleanedHTML = cleanContent(bodyContent.innerHTML, pageName);

            // Extract scripts (strip lucide.createIcons() lines instead of skipping entire scripts)
            let scripts = '';
            doc.querySelectorAll('script').forEach(script => {
                let text = script.textContent.trim();
                if (!text || text.length < 10) return;
                // Remove lucide.createIcons() lines so we don't double-call it
                text = text.split('\n')
                    .filter(line => !line.trim().startsWith('lucide.createIcons()') && !(line.trim() === 'lucide.createIcons();'))
                    .join('\n').trim();
                if (text.length < 10) return;
                scripts += text + '\n';
            });

            pageCache[pageName] = cleanedHTML;
            pageStyles[pageName] = styles;
            pageScripts[pageName] = scripts;
        } catch (error) {
            console.error('SPA Router: Failed to fetch page', pageName, error);
            pageCache[pageName] = '<div style="text-align:center;padding:60px 20px;"><h2 style="color:#111827;margin-bottom:10px;">Failed to load page</h2><p style="color:#6b7280;">Please check your connection and try again.</p></div>';
            pageStyles[pageName] = '';
            pageScripts[pageName] = '';
        }
    }

    /**
     * Dynamic style container
     */
    let dynamicStyleEl = document.getElementById('spa-dynamic-styles');
    if (!dynamicStyleEl) {
        dynamicStyleEl = document.createElement('style');
        dynamicStyleEl.id = 'spa-dynamic-styles';
        document.head.appendChild(dynamicStyleEl);
    }

    /**
     * Navigate to a page
     */
    async function navigateTo(pageName, pushState = true) {
        if (pageName === currentPage) return;

        const config = pageConfig[pageName] || pageConfig['home'];
        const isHome = (pageName === 'home');
        const leavingHome = (currentPage === 'home');

        // Wait for content (fetch first so we can swap instantly)
        await fetchPageContent(pageName);

        if (leavingHome && !isHome) {
            // === LEAVING HOME → SUB-PAGE ===
            // Instant transition: no fade-out needed.
            // Hide home widgets + swap content immediately so the user
            // never sees the home page flash between menu close and page load.
            hideHomeElements();
            document.body.style.backgroundColor = config.bg;
            document.body.classList.remove('spa-home', 'spa-giving', 'spa-testimonies', 'spa-prayer', 'spa-connect', 'spa-branches', 'spa-history');
            document.body.classList.add(config.bodyClass);

            // Disable transition so swap is instant
            contentArea.style.transition = 'none';
            contentArea.style.opacity = '0';

            // Swap content immediately
            contentArea.style.justifyContent = 'flex-start';
            contentArea.style.padding = '20px 20px 60px 20px';
            contentArea.style.minHeight = '100dvh';
            dynamicStyleEl.textContent = pageStyles[pageName] || '';
            contentArea.innerHTML = pageCache[pageName];
            document.title = config.title;

            // Execute page-specific scripts
            if (pageScripts[pageName]) {
                try { new Function(pageScripts[pageName])(); }
                catch (e) { console.error('SPA Router: Error executing page script for', pageName, e); }
            }
            if (typeof lucide !== 'undefined') { lucide.createIcons(); }
            window.scrollTo(0, 0);

            // Re-enable transition and fade in
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    contentArea.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
                    contentArea.style.opacity = '1';
                    contentArea.style.transform = 'translateY(0)';
                });
            });

            // Clear transform after transition to restore position:fixed behavior
            // (CSS spec: transform creates containing block for fixed descendants)
            setTimeout(function() {
                contentArea.style.transform = '';
                contentArea.style.transition = '';
            }, 400);

        } else if (isHome) {
            // === ARRIVING AT HOME ===
            // Smooth fade-out of sub-page, then show home
            contentArea.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            contentArea.style.opacity = '0';
            contentArea.style.transform = 'translateY(10px)';

            await new Promise(r => setTimeout(r, 250));

            showHomeElements();
            document.body.style.backgroundColor = config.bg;
            document.body.classList.remove('spa-home', 'spa-giving', 'spa-testimonies', 'spa-prayer', 'spa-connect', 'spa-branches', 'spa-history');
            document.body.classList.add(config.bodyClass);

            contentArea.style.justifyContent = 'center';
            contentArea.style.padding = '';
            contentArea.style.minHeight = '100dvh';
            dynamicStyleEl.textContent = pageStyles[pageName] || '';
            contentArea.innerHTML = pageCache[pageName];
            document.title = config.title;

            if (pageScripts[pageName]) {
                try { new Function(pageScripts[pageName])(); }
                catch (e) { console.error('SPA Router: Error executing page script for', pageName, e); }
            }
            if (typeof lucide !== 'undefined') { lucide.createIcons(); }
            window.scrollTo(0, 0);

            contentArea.style.opacity = '1';
            contentArea.style.transform = 'translateY(0)';

            // Clear transform after transition to restore position:fixed behavior
            setTimeout(function() {
                contentArea.style.transform = '';
                contentArea.style.transition = '';
            }, 350);

        } else {
            // === SUB-PAGE → SUB-PAGE ===
            // Normal cross-fade between sub-pages
            contentArea.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            contentArea.style.opacity = '0';
            contentArea.style.transform = 'translateY(10px)';

            await new Promise(r => setTimeout(r, 250));

            document.body.style.backgroundColor = config.bg;
            document.body.classList.remove('spa-home', 'spa-giving', 'spa-testimonies', 'spa-prayer', 'spa-connect', 'spa-branches', 'spa-history');
            document.body.classList.add(config.bodyClass);

            contentArea.style.justifyContent = 'flex-start';
            contentArea.style.padding = '20px 20px 60px 20px';
            contentArea.style.minHeight = '100dvh';
            dynamicStyleEl.textContent = pageStyles[pageName] || '';
            contentArea.innerHTML = pageCache[pageName];
            document.title = config.title;

            if (pageScripts[pageName]) {
                try { new Function(pageScripts[pageName])(); }
                catch (e) { console.error('SPA Router: Error executing page script for', pageName, e); }
            }
            if (typeof lucide !== 'undefined') { lucide.createIcons(); }
            window.scrollTo(0, 0);

            contentArea.style.opacity = '1';
            contentArea.style.transform = 'translateY(0)';
        }

        // Clear transform after transition to restore position:fixed behavior
        // (CSS spec: transform creates containing block for fixed descendants)
        setTimeout(function() {
            contentArea.style.transform = '';
            contentArea.style.transition = '';
        }, 350);

        // Update current page
        currentPage = pageName;

        // Update browser URL (clean URLs without .html)
        if (pushState) {
            const url = cleanUrls[pageName] || basePath;
            history.pushState({ page: pageName }, '', url);
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('spa-navigate', { detail: { page: pageName } }));
    }

    /**
     * Intercept all clicks on anchor tags
     */
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip external links, anchors, and special protocols
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

        const pageName = getPageFromHref(href);
        if (pageName === null) return; // Not a recognized SPA page

        // Close mobile menu BEFORE navigation so it closes smoothly
        // (The menu's own click listener can't fire because we stopPropagation below)
        if (typeof window.closeMenu === 'function') {
            window.closeMenu();
        }

        // PREVENT DEFAULT — This is what keeps the radio alive!
        e.preventDefault();
        e.stopPropagation();

        navigateTo(pageName);
    }, true);

    /**
     * Handle browser back/forward buttons
     */
    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.page) {
            const targetPage = e.state.page;
            if (targetPage !== currentPage) {
                const prevPage = currentPage;
                currentPage = '_navigating';
                navigateTo(targetPage, false).catch(() => {
                    currentPage = prevPage;
                });
            }
        } else {
            navigateTo('home', false);
        }
    });

    /**
     * Optimized prefetch strategy:
     * 1. Use requestIdleCallback for non-urgent prefetching
     * 2. Use <link rel="prefetch"> for browser-level priority management
     * 3. Fallback to sequential fetch with longer delay on slow connections
     */
    function prefetchWithHint(pageName) {
        // Use browser prefetch hint (lowest priority, respects network conditions)
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = pageFiles[pageName];
        link.as = 'document';
        document.head.appendChild(link);
    }

    async function prefetchPages() {
        const pageNames = Object.keys(pageFiles);

        // First pass: emit prefetch hints immediately (non-blocking)
        pageNames.forEach(pageName => prefetchWithHint(pageName));

        // Second pass: actual fetch + cache with idle callback
        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduleIdle = window.requestIdleCallback
            ? (fn) => window.requestIdleCallback(fn, { timeout: 8000 })
            : (fn) => setTimeout(fn, 200);

        let index = 0;
        function prefetchNext(deadline) {
            if (index >= pageNames.length) return;

            // Only fetch if browser is idle (or timeout passed)
            fetchPageContent(pageNames[index]).then(() => {
                index++;
                // Longer delay between fetches on slow connections
                const delay = navigator.connection && navigator.connection.effectiveType &&
                    ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType) ? 1500 : 600;
                setTimeout(() => scheduleIdle(prefetchNext), delay);
            }).catch(() => {
                index++;
                scheduleIdle(prefetchNext);
            });
        }

        // Start prefetching after initial page is fully loaded
        if (document.readyState === 'complete') {
            scheduleIdle(prefetchNext);
        } else {
            window.addEventListener('load', () => {
                // Delay prefetch start to let critical resources finish
                setTimeout(() => scheduleIdle(prefetchNext), 3000);
            });
        }
    }

    prefetchPages();

    // Set initial history state (use clean URL with basePath for home)
    if (window.location.pathname.endsWith('index.html')) {
        history.replaceState({ page: 'home' }, '', basePath);
    } else if (window.location.pathname === basePath || window.location.pathname === basePath.slice(0, -1)) {
        history.replaceState({ page: 'home' }, '', basePath);
    } else {
        // If user landed on a sub-page clean URL (e.g. /abc/giving), set appropriate state
        const pageName = fileToPage[window.location.pathname] || null;
        if (pageName) {
            history.replaceState({ page: pageName }, '', window.location.pathname);
        } else {
            history.replaceState({ page: 'home' }, '', basePath);
        }
    }

    // Set initial body class and background
    document.body.classList.add('spa-home');
    document.body.style.backgroundColor = '#E0E0E0';

    // Add transition styles to content area
    contentArea.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

    // Inject global back-nav glassmorphic style + page transition styles
    const globalSpaStyles = document.createElement('style');
    globalSpaStyles.id = 'spa-global-styles';
    globalSpaStyles.textContent = `
        /* ===== Glassmorphic Back Nav (all sub-pages) ===== */
        .back-nav {
            position: fixed !important; top: 24px; left: 24px; z-index: 100 !important;
            display: flex !important; align-items: center !important; gap: 8px !important;
            text-decoration: none !important;
            font-weight: 700 !important; font-size: 0.85rem !important;
            letter-spacing: 0.3px !important;
            padding: 10px 20px !important; border-radius: 50px !important;
            /* Fixed min-width to prevent shape shift on language switch */
            min-width: 95px !important;
            /* Glassmorphic base */
            background: rgba(255,255,255,0.15) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            -webkit-tap-highlight-color: transparent !important;
            overflow: hidden !important;
        }
        /* Subtle shimmer on back nav */
        .back-nav::after {
            content: '' !important;
            position: absolute !important; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent) !important;
            transform: skewX(-20deg) !important;
            pointer-events: none !important;
        }
        .back-nav:hover::after {
            animation: backNavShimmer 0.6s ease forwards !important;
        }
        @keyframes backNavShimmer {
            0% { left: -100%; }
            100% { left: 200%; }
        }
        .back-nav svg {
            width: 16px !important; height: 16px !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative !important; z-index: 1 !important;
        }
        .back-nav span, .back-nav [data-i18n] {
            position: relative !important; z-index: 1 !important;
        }
        .back-nav:hover {
            background: rgba(255,255,255,0.25) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25) !important;
            border-color: rgba(255,255,255,0.3) !important;
        }
        .back-nav:hover svg {
            transform: translateX(-3px) !important;
        }
        .back-nav:active {
            transform: translateY(0) scale(0.97) !important;
            transition-duration: 0.1s !important;
        }
        /* Dark pages (history, connect) */
        .spa-history .back-nav, .spa-connect .back-nav {
            color: #f3f4f6 !important;
            background: rgba(255,255,255,0.1) !important;
            border-color: rgba(255,255,255,0.12) !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08) !important;
        }
        .spa-history .back-nav:hover, .spa-connect .back-nav:hover {
            background: rgba(255,255,255,0.18) !important;
            box-shadow: 0 8px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12) !important;
            border-color: rgba(255,255,255,0.2) !important;
        }
        /* Light pages (giving, prayer, testimonies, branches) */
        .spa-giving .back-nav, .spa-prayer .back-nav, .spa-testimonies .back-nav, .spa-branches .back-nav {
            color: #1f2937 !important;
            background: rgba(255,255,255,0.6) !important;
            border-color: rgba(255,255,255,0.5) !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4) !important;
        }
        .spa-giving .back-nav:hover, .spa-prayer .back-nav:hover, .spa-testimonies .back-nav:hover, .spa-branches .back-nav:hover {
            background: rgba(255,255,255,0.75) !important;
            box-shadow: 0 8px 28px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5) !important;
            border-color: rgba(255,255,255,0.6) !important;
        }
        /* Back nav entrance animation */
        @keyframes backNavSlideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .back-nav {
            animation: backNavSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both !important;
        }
        /* Page content entrance animation — opacity only (NO transform!)
           transform on #spa-content creates a containing block that breaks
           position:fixed descendants like back-to-top buttons.
           The JS router handles the slide-up transform via inline styles
           and clears it after the transition completes. */
        @keyframes spaPageEnter {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        body:not(.spa-home) #spa-content {
            animation: spaPageEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        /* Staggered child entrance for sub-page content
           Exclude .main-logo-wrapper to prevent triple animation conflict on homepage */
        @keyframes spaChildFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        body:not(.spa-home) #spa-content > *:not(.back-nav) {
            animation: spaChildFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }
        /* Small screens */
        @media (max-width: 767px) {
            .back-nav {
                top: 12px !important; left: 12px !important;
                padding: 8px 16px !important; font-size: 0.78rem !important;
            }
        }
    `;
    document.head.appendChild(globalSpaStyles);

    // Expose navigateTo globally
    window.spaNavigate = navigateTo;

})();
