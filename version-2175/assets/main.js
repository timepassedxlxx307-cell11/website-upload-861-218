(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupSearchForms() {
        Array.prototype.forEach.call(document.querySelectorAll("[data-site-search]"), function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (!query) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(query);
            });
        });
    }

    function setupFilters() {
        var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));
        groups.forEach(function (group) {
            var searchInput = group.querySelector("[data-filter-input]");
            var typeSelect = group.querySelector("[data-filter-type]");
            var yearSelect = group.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(group.querySelectorAll("[data-movie-card]"));

            function apply() {
                var query = normalize(searchInput ? searchInput.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                cards.forEach(function (card) {
                    var keywords = normalize(card.getAttribute("data-keywords"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matchesQuery = !query || keywords.indexOf(query) !== -1;
                    var matchesType = !type || cardType === type;
                    var matchesYear = !year || cardYear === year;
                    card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesType && matchesYear));
                });
            }

            if (searchInput) {
                searchInput.addEventListener("input", apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        var event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
        setupSearchPage();
    });
})();
