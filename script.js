// Lazy loading performant: "loading=lazy" natif + IntersectionObserver fallback
// Remplacer data-src -> src quand l'image approche du viewport
(function () {
  const $reader = document.querySelector('.reader');
  const $pages = Array.from(document.querySelectorAll('.page'));
  const $indicator = document.getElementById('indicator');
  const $prev = document.getElementById('prev');
  const $next = document.getElementById('next');

  // Indicateur de page
  function updateIndicator() {
    const viewportTop = $reader.scrollTop;
    const vh = $reader.clientHeight;
    // index de la page la plus visible
    let bestIndex = 0;
    let bestOverlap = -1;
    $pages.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      const containerRect = $reader.getBoundingClientRect();
      const top = rect.top - containerRect.top;
      const bottom = rect.bottom - containerRect.top;
      const overlap = Math.max(0, Math.min(vh, bottom) - Math.max(0, top));
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestIndex = i;
      }
    });
    $indicator.textContent = String(bestIndex + 1);
  }

  $reader.addEventListener('scroll', updateIndicator, { passive: true });
  window.addEventListener('resize', updateIndicator);

  // Navigation boutons: aller à la page précédente/suivante
  function scrollToPage(index) {
    const clamped = Math.max(0, Math.min(index, $pages.length - 1));
    $pages[clamped].scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  $prev.addEventListener('click', () => {
    const current = parseInt($indicator.textContent, 10) - 1;
    scrollToPage(current - 1);
  });

  $next.addEventListener('click', () => {
    const current = parseInt($indicator.textContent, 10) - 1;
    scrollToPage(current + 1);
  });

  // Lazy loading via IntersectionObserver (fallback utile sur vieux navigateurs)
  const lazyImgs = document.querySelectorAll('img.lazy');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Déclenche le chargement
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          io.unobserve(img);
        }
      });
    }, {
      root: $reader,
      rootMargin: '200px 0px', // précharge un peu avant
      threshold: 0.01
    });
    lazyImgs.forEach(img => io.observe(img));
  } else {
    // Fallback très simple
    lazyImgs.forEach(img => { img.src = img.dataset.src; img.classList.remove('lazy'); });
  }

  // Mise à jour initiale
  updateIndicator();
})();
