/* 2.0 Architecture — main.js
 * Lightbox, nav scroll state, mobile menu
 */

(function () {
    'use strict';

    /* ---------------------------------------------------------------
     * Nav: toggle scrolled state when hero leaves the viewport
     * ------------------------------------------------------------- */
    const nav = document.getElementById('nav');
    const hero = document.getElementById('hero');

    if (nav && hero && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    nav.classList.toggle('scrolled', !entry.isIntersecting);
                });
            },
            { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
        );
        observer.observe(hero);
    }

    /* ---------------------------------------------------------------
     * Mobile menu toggle
     * ------------------------------------------------------------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(open));
        });

        // Close the menu when a link is tapped (mobile)
        if (navLinks) {
            navLinks.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    nav.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    /* ---------------------------------------------------------------
     * Lightbox
     * ------------------------------------------------------------- */
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCaption = document.getElementById('lbCaption');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');

    const projectsSection = document.getElementById('projects');
    const projects = projectsSection
        ? Array.from(projectsSection.querySelectorAll('.project'))
        : [];

    let currentIndex = -1;

    const openLightbox = (index) => {
        if (index < 0 || index >= projects.length) return;
        currentIndex = index;

        const project = projects[index];
        const img = project.querySelector('img');
        const title = project.querySelector('.project__title');
        const meta = project.querySelector('.project__meta');

        if (img) {
            lbImg.src = img.src;
            lbImg.alt = img.alt || '';
        }

        const titleText = title ? title.textContent.trim() : '';
        const metaText = meta ? meta.textContent.trim() : '';
        lbCaption.textContent = [titleText, metaText].filter(Boolean).join(' · ');

        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');

        // Move focus to the close button so keyboard users can escape
        if (lbClose) lbClose.focus();
    };

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        currentIndex = -1;
    };

    const step = (delta) => {
        if (currentIndex < 0) return;
        const next = (currentIndex + delta + projects.length) % projects.length;
        openLightbox(next);
    };

    if (projectsSection && lightbox) {
        projectsSection.addEventListener('click', (e) => {
            const project = e.target.closest('.project');
            if (!project) return;
            const index = projects.indexOf(project);
            if (index !== -1) openLightbox(index);
        });

        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
        if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); step(1); });

        // Click on the backdrop (but not the image/figure) closes
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard: Esc closes, arrows navigate
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') step(-1);
            else if (e.key === 'ArrowRight') step(1);
        });
    }
})();
