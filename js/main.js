/* =============================================================================
   2.0 ARCHITECTURE — main.js
   Running-head updater · chapter reveals · lightbox · mobile menu
   ============================================================================= */

(function () {
    'use strict';

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const runner        = $('#runner');
    const runnerFolio   = $('#runnerFolio');
    const runnerSection = $('#runnerSection');
    const navToggle     = $('#navToggle');
    const navLinks      = $('#navLinks');
    const cover         = $('#hero');
    const chapters      = $$('.chapter, .cover');
    const sections      = $$('section[data-chapter], footer[data-chapter]');

    /* ---------------------------------------------------------------
     * Runner: toggle "scrolled" state once the cover leaves the top
     * ------------------------------------------------------------- */

    if (runner && cover && 'IntersectionObserver' in window) {
        const scrollObs = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                runner.classList.toggle('scrolled', !e.isIntersecting);
            }),
            { rootMargin: '-56px 0px 0px 0px', threshold: 0 }
        );
        scrollObs.observe(cover);
    }

    /* ---------------------------------------------------------------
     * Runner: update folio + section label as chapters pass the
     * horizontal sightline in the middle of the viewport
     * ------------------------------------------------------------- */

    if (runnerFolio && runnerSection && sections.length && 'IntersectionObserver' in window) {
        const labelObs = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => {
                    if (!e.isIntersecting) return;
                    const { chapter, name } = e.target.dataset;
                    if (chapter) runnerFolio.textContent = chapter;
                    if (name)    runnerSection.textContent = name;
                });
            },
            { rootMargin: '-42% 0px -52% 0px', threshold: 0 }
        );
        sections.forEach(s => labelObs.observe(s));
    }

    /* ---------------------------------------------------------------
     * Chapter reveals — add .in-view once the chapter appears
     * ------------------------------------------------------------- */

    if (chapters.length && 'IntersectionObserver' in window) {
        const revealObs = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('in-view');
                        revealObs.unobserve(e.target);
                    }
                });
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
        );
        chapters.forEach(c => revealObs.observe(c));
    }

    /* ---------------------------------------------------------------
     * Mobile menu toggle
     * ------------------------------------------------------------- */

    if (runner && navToggle) {
        navToggle.addEventListener('click', () => {
            const open = runner.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(open));
        });

        if (navLinks) {
            navLinks.querySelectorAll('a').forEach((a) => {
                a.addEventListener('click', () => {
                    runner.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    /* ---------------------------------------------------------------
     * Lightbox
     * ------------------------------------------------------------- */

    const lightbox  = $('#lightbox');
    const lbImg     = $('#lbImg');
    const lbName    = $('#lbName');
    const lbMeta    = $('#lbMeta');
    const lbCounter = $('#lbCounter');
    const lbClose   = $('#lbClose');
    const lbPrev    = $('#lbPrev');
    const lbNext    = $('#lbNext');

    const folioItems = $$('.folio__item');
    let currentIndex = -1;

    const pad2 = (n) => String(n).padStart(2, '0');

    const extractMeta = (item) => {
        const name = $('.folio__name', item)?.textContent.trim() ?? '';
        const year = $('.folio__y', item)?.textContent.trim() ?? '';
        const dds  = $$('.folio__data dd', item).map(el => el.textContent.trim());
        // data order: [Coord, Scope, Typology, Status]
        const typology = dds[2] || '';
        return { name, year, typology };
    };

    const openLightbox = (index) => {
        if (!lightbox || index < 0 || index >= folioItems.length) return;

        currentIndex = index;
        const item = folioItems[index];
        const img  = $('img', item);
        const { name, year, typology } = extractMeta(item);

        if (img && img.src) {
            lbImg.src = img.src;
            lbImg.alt = img.alt || name;
        } else {
            lbImg.removeAttribute('src');
            lbImg.alt = '';
        }

        if (lbName) lbName.textContent = name;
        if (lbMeta) lbMeta.textContent = [year, typology].filter(Boolean).join(' · ');
        if (lbCounter) {
            lbCounter.textContent = `№ ${pad2(index + 1)} / ${pad2(folioItems.length)}`;
        }

        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');

        if (lbClose) lbClose.focus();
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        currentIndex = -1;
    };

    const step = (delta) => {
        if (currentIndex < 0) return;
        const next = (currentIndex + delta + folioItems.length) % folioItems.length;
        openLightbox(next);
    };

    if (lightbox && folioItems.length) {
        // Delegate clicks on the Works section
        const works = $('#projects');
        if (works) {
            works.addEventListener('click', (e) => {
                const item = e.target.closest('.folio__item');
                if (!item) return;
                const index = folioItems.indexOf(item);
                if (index !== -1) openLightbox(index);
            });
        }

        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        if (lbPrev)  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
        if (lbNext)  lbNext.addEventListener('click', (e) => { e.stopPropagation(); step( 1); });

        // Click on the backdrop closes
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape')     closeLightbox();
            else if (e.key === 'ArrowLeft')  step(-1);
            else if (e.key === 'ArrowRight') step( 1);
        });
    }
})();
