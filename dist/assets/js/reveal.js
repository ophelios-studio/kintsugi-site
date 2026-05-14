/* Reveal-on-scroll for .reveal and .seam-svg elements.
   Toggles .is-revealed once when ~15% of the element enters the viewport.
   Respects prefers-reduced-motion: short-circuits to immediate reveal. */
(function () {
    const targets = document.querySelectorAll('.reveal, .seam-svg');
    if (!targets.length) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-revealed'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                io.unobserve(entry.target);
            }
        }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((el) => io.observe(el));
})();
