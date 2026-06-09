function selectAll(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = selectAll('[data-hero-slide]', hero);
  const dots = selectAll('[data-hero-dot]', hero);
  if (slides.length === 0) {
    return;
  }
  let index = 0;
  let timer = null;
  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }
  function start() {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  }
  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      start();
    });
  });
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

function setupSearch() {
  selectAll('[data-search-box]').forEach((box) => {
    const input = box.querySelector('[data-search-input]');
    const select = box.querySelector('[data-filter-select]');
    const scopeSelector = box.getAttribute('data-search-scope') || 'body';
    const scope = document.querySelector(scopeSelector) || document;
    const cards = selectAll('[data-search-card]', scope);
    function apply() {
      const keyword = normalizeText(input ? input.value : '');
      const filter = normalizeText(select ? select.value : '');
      cards.forEach((card) => {
        const text = normalizeText(card.getAttribute('data-search-text'));
        const category = normalizeText(card.getAttribute('data-category'));
        const matchedKeyword = !keyword || text.includes(keyword);
        const matchedFilter = !filter || category === filter;
        card.classList.toggle('hidden-card', !(matchedKeyword && matchedFilter));
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  });
}

function setupBackTop() {
  selectAll('[data-back-top]').forEach((button) => {
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupHero();
  setupSearch();
  setupBackTop();
});
