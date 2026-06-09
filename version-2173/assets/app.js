(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.getElementById("site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }
    }

    function setupGlobalSearch() {
        var form = document.querySelector("[data-global-search]");
        var results = document.querySelector("[data-global-results]");
        if (!form || !results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var input = form.querySelector("input");
        function render() {
            var query = (input.value || "").trim().toLowerCase();
            if (!query) {
                results.classList.remove("is-open");
                results.innerHTML = "";
                return;
            }
            var words = query.split(/\s+/).filter(Boolean);
            var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                var haystack = item.search;
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 12);
            if (!matches.length) {
                results.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有找到匹配的影片</strong><span>换个片名、年份、地区或标签试试</span></div></div>';
                results.classList.add("is-open");
                return;
            }
            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + escapeHtml(item.url) + '"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></span></a>';
            }).join("");
            results.classList.add("is-open");
        }
        input.addEventListener("input", render);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var first = results.querySelector("a");
            if (first) {
                window.location.href = first.getAttribute("href");
            } else {
                render();
            }
        });
    }

    function setupFilters() {
        selectAll("[data-filter-root]").forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var selects = selectAll("[data-filter-select]", root);
            var sort = root.querySelector("[data-sort-select]");
            var list = root.querySelector("[data-card-list]");
            var cards = selectAll(".movie-card", root);
            var empty = root.querySelector("[data-empty]");
            function apply() {
                var query = input ? (input.value || "").trim().toLowerCase() : "";
                var region = "all";
                var year = "all";
                selects.forEach(function (select) {
                    if (select.name === "region") {
                        region = select.value;
                    }
                    if (select.name === "year") {
                        year = select.value;
                    }
                });
                cards.forEach(function (card, index) {
                    card.setAttribute("data-default-index", String(index));
                });
                cards.forEach(function (card) {
                    var matchQuery = !query || (card.getAttribute("data-search") || "").indexOf(query) !== -1;
                    var matchRegion = region === "all" || card.getAttribute("data-region") === region;
                    var matchYear = year === "all" || card.getAttribute("data-year") === year;
                    card.hidden = !(matchQuery && matchRegion && matchYear);
                });
                var ordered = cards.slice();
                var sortValue = sort ? sort.value : "default";
                ordered.sort(function (a, b) {
                    if (sortValue === "score") {
                        return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
                    }
                    if (sortValue === "year") {
                        return String(b.getAttribute("data-year")).localeCompare(String(a.getAttribute("data-year")), "zh-Hans-CN");
                    }
                    if (sortValue === "title") {
                        return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
                    }
                    return Number(a.getAttribute("data-default-index")) - Number(b.getAttribute("data-default-index"));
                });
                ordered.forEach(function (card) {
                    list.appendChild(card);
                });
                if (empty) {
                    empty.hidden = !cards.every(function (card) {
                        return card.hidden;
                    });
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            if (sort) {
                sort.addEventListener("change", apply);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHero();
        setupGlobalSearch();
        setupFilters();
    });
})();
