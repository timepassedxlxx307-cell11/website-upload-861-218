(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupLocalFilters() {
    selectAll("[data-filter-form]").forEach(function (form) {
      var root = document.querySelector(form.getAttribute("data-filter-form"));
      if (!root) {
        return;
      }
      var cards = selectAll("[data-card]", root);
      var keyword = form.querySelector("[data-filter-keyword]");
      var year = form.querySelector("[data-filter-year]");
      var type = form.querySelector("[data-filter-type]");

      function applyFilter() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre"));
          var okKeyword = !q || text.indexOf(q) !== -1;
          var okYear = !y || normalize(card.getAttribute("data-year")) === y;
          var okType = !t || normalize(card.getAttribute("data-type")).indexOf(t) !== -1;
          card.style.display = okKeyword && okYear && okType ? "" : "none";
        });
      }

      [keyword, year, type].forEach(function (field) {
        if (field) {
          field.addEventListener("input", applyFilter);
          field.addEventListener("change", applyFilter);
        }
      });
    });
  }

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardHtml(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '<div class="thumb">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="badge">' + escapeHtml(movie.region) + '</span>',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-mark">▶</span>',
      '</div>',
      '<div class="card-body">',
      '<h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
      '<p class="card-text">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>·</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</a>'
    ].join("");
  }

  function setupGlobalSearch() {
    var form = document.querySelector("[data-global-search]");
    var result = document.querySelector("[data-search-result]");
    if (!form || !result || !window.moviesIndex) {
      return;
    }
    var queryInput = form.querySelector("[name='q']");
    var regionInput = form.querySelector("[name='region']");
    var typeInput = form.querySelector("[name='type']");
    var params = new URLSearchParams(window.location.search);
    if (params.get("q") && queryInput) {
      queryInput.value = params.get("q");
    }

    function render() {
      var q = normalize(queryInput && queryInput.value);
      var region = normalize(regionInput && regionInput.value);
      var type = normalize(typeInput && typeInput.value);
      var matches = window.moviesIndex.filter(function (movie) {
        var haystack = normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.genre + " " + movie.tags + " " + movie.oneLine);
        var okQuery = !q || haystack.indexOf(q) !== -1;
        var okRegion = !region || normalize(movie.region).indexOf(region) !== -1;
        var okType = !type || normalize(movie.type).indexOf(type) !== -1;
        return okQuery && okRegion && okType;
      }).slice(0, 96);

      if (!q && !region && !type) {
        result.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签后开始查找</div>';
        return;
      }

      if (!matches.length) {
        result.innerHTML = '<div class="empty-state">暂无匹配内容</div>';
        return;
      }

      result.innerHTML = '<div class="movie-grid">' + matches.map(cardHtml).join("") + '</div>';
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    [queryInput, regionInput, typeInput].forEach(function (field) {
      if (field) {
        field.addEventListener("input", render);
        field.addEventListener("change", render);
      }
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupHero();
    setupLocalFilters();
    setupGlobalSearch();
  });
})();
