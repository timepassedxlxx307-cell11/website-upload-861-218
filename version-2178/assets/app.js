(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('[data-site-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var value = input ? input.value.trim() : '';
        var target = 'search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function setupCardFilter() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-result]');

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedRegion && selectedRegion !== cardRegion) {
          matched = false;
        }
        if (selectedYear && selectedYear !== cardYear) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, region, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var input = page.querySelector('[data-search-input]');
    var region = page.querySelector('[data-search-region]');
    var list = page.querySelector('[data-search-results]');
    var empty = page.querySelector('[data-search-empty]');
    if (input) {
      input.value = initial;
    }

    function render() {
      var keyword = normalize(input ? input.value : '');
      var selectedRegion = region ? region.value : '';
      var results = window.SEARCH_INDEX.filter(function (item) {
        var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' '));
        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }
        if (selectedRegion && selectedRegion !== item.region) {
          return false;
        }
        return true;
      }).slice(0, 120);
      list.innerHTML = results.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="card-cover" href="' + item.link + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="card-play">▶</span>',
          '    <span class="card-badge">' + escapeHtml(item.region) + '</span>',
          '    <span class="card-duration">' + escapeHtml(item.year) + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <h2 class="card-title"><a href="' + item.link + '">' + escapeHtml(item.title) + '</a></h2>',
          '    <p class="card-text">' + escapeHtml(item.oneLine) + '</p>',
          '    <div class="card-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
      if (empty) {
        empty.classList.toggle('show', results.length === 0);
      }
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    [input, region].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });
    render();
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
}());
