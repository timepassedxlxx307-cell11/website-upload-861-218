(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.index || 0));
                restart();
            });
        });

        restart();
    }

    Array.prototype.slice.call(document.querySelectorAll('.filter-chip')).forEach(function (chip) {
        chip.addEventListener('click', function () {
            var page = chip.closest('.category-page');
            if (!page) {
                return;
            }

            Array.prototype.slice.call(page.querySelectorAll('.filter-chip')).forEach(function (item) {
                item.classList.remove('active');
            });
            chip.classList.add('active');

            var value = chip.dataset.filter || 'all';
            Array.prototype.slice.call(page.querySelectorAll('.filter-grid .movie-card')).forEach(function (card) {
                var type = card.dataset.type || '';
                card.classList.toggle('hidden', value !== 'all' && type !== value);
            });
        });
    });

    var searchInput = document.getElementById('searchInput');
    var typeFilter = document.getElementById('typeFilter');
    var regionFilter = document.getElementById('regionFilter');
    var sortFilter = document.getElementById('sortFilter');
    var searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q');

        if (preset) {
            searchInput.value = preset;
        }

        function applySearch() {
            var keyword = searchInput.value.trim().toLowerCase();
            var typeValue = typeFilter ? typeFilter.value : 'all';
            var regionValue = regionFilter ? regionFilter.value : 'all';
            var cards = Array.prototype.slice.call(searchResults.querySelectorAll('.movie-card'));

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.textContent
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchType = typeValue === 'all' || card.dataset.type === typeValue;
                var matchRegion = regionValue === 'all' || card.dataset.region === regionValue;
                card.classList.toggle('hidden', !(matchKeyword && matchType && matchRegion));
            });

            var visible = cards.filter(function (card) {
                return !card.classList.contains('hidden');
            });

            if (sortFilter && sortFilter.value !== 'default') {
                visible.sort(function (a, b) {
                    var ay = Number(a.dataset.year) || 0;
                    var by = Number(b.dataset.year) || 0;
                    return sortFilter.value === 'year-desc' ? by - ay : ay - by;
                });
                visible.forEach(function (card) {
                    searchResults.appendChild(card);
                });
            }
        }

        [searchInput, typeFilter, regionFilter, sortFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applySearch);
                control.addEventListener('change', applySearch);
            }
        });

        applySearch();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.play-overlay');
        var hlsInstance = null;

        function playVideo() {
            if (!video) {
                return;
            }

            var source = video.dataset.stream;

            if (!source) {
                return;
            }

            if (video.dataset.ready !== 'true') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.dataset.ready = 'true';
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.dataset.ready = 'true';
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = source;
                    video.dataset.ready = 'true';
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
