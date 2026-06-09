(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function toNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function setMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === index);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        start();
      });
    });

    activate(0);
    start();
  }

  function setCardFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    blocks.forEach(function (scope) {
      var searchInput = scope.querySelector("[data-filter-search]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var ratingSelect = scope.querySelector("[data-filter-rating]");
      var sortSelect = scope.querySelector("[data-filter-sort]");
      var grid = scope.querySelector("[data-filter-grid]");
      var empty = scope.querySelector("[data-filter-empty]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".js-card"));

      function matches(card, keyword, year, rating) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year");
        var cardRating = toNumber(card.getAttribute("data-rating"), 0);
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = year === "all" || cardYear === year;
        var okRating = rating === "all" || cardRating >= toNumber(rating, 0);
        return okKeyword && okYear && okRating;
      }

      function sortCards(value) {
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (value === "rating") {
            return toNumber(b.getAttribute("data-rating"), 0) - toNumber(a.getAttribute("data-rating"), 0);
          }
          if (value === "year") {
            return toNumber(b.getAttribute("data-year"), 0) - toNumber(a.getAttribute("data-year"), 0);
          }
          return toNumber(a.getAttribute("data-year"), 0) - toNumber(b.getAttribute("data-year"), 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "all";
        var rating = ratingSelect ? ratingSelect.value : "all";
        var visible = 0;
        cards.forEach(function (card) {
          var show = matches(card, keyword, year, rating);
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [searchInput, yearSelect, ratingSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
      if (sortSelect) {
        sortSelect.addEventListener("change", function () {
          sortCards(sortSelect.value);
          apply();
        });
      }
      apply();
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a href="' + movie.href + '" class="poster-link" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="rating-badge">' + movie.rating + '</span>',
      '<span class="play-badge">播放</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h2><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p class="movie-meta">' + movie.year + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setSearchPage() {
    var grid = document.querySelector("[data-search-grid]");
    if (!grid || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim().toLowerCase();
    var input = document.querySelector("[data-search-input]");
    var empty = document.querySelector("[data-search-empty]");
    if (input) {
      input.value = params.get("q") || "";
    }

    function render(query) {
      var words = query.trim().toLowerCase();
      grid.innerHTML = "";
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.category, movie.oneLine].join(" ").toLowerCase();
        return !words || haystack.indexOf(words) !== -1;
      }).slice(0, 120);
      results.forEach(function (movie) {
        grid.appendChild(createSearchCard(movie));
      });
      if (empty) {
        empty.style.display = results.length ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(keyword);
  }

  function attachStream(video, streamUrl) {
    if (video.getAttribute("data-ready") === "1") {
      return;
    }
    video.setAttribute("data-ready", "1");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = streamUrl;
        }
      });
      video._hlsInstance = hls;
      return;
    }
    video.src = streamUrl;
  }

  window.setupHlsPlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }

    function startPlayback() {
      attachStream(video, streamUrl);
      button.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
  };

  ready(function () {
    setMobileMenu();
    setHeroSlider();
    setCardFilters();
    setSearchPage();
  });
})();
