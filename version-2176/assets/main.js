(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            window.clearInterval(timer);
            start();
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        hero.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        if (!cards.length) {
            return;
        }
        var activeFilter = { key: 'all', value: 'all' };
        var searchValue = '';
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        inputs.forEach(function (input) {
            if (input.hasAttribute('data-global-search') && query) {
                input.value = query;
                searchValue = query;
            }
            input.addEventListener('input', function () {
                searchValue = input.value;
                apply();
            });
        });
        var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
        filterBars.forEach(function (bar) {
            bar.addEventListener('click', function (event) {
                var button = event.target.closest('button[data-filter-key]');
                if (!button) {
                    return;
                }
                activeFilter = {
                    key: button.getAttribute('data-filter-key'),
                    value: button.getAttribute('data-filter-value')
                };
                bar.querySelectorAll('button').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        function matchesFilter(card) {
            if (activeFilter.key === 'all') {
                return true;
            }
            var source = normalize(card.getAttribute('data-' + activeFilter.key));
            return source.indexOf(normalize(activeFilter.value)) !== -1;
        }
        function matchesSearch(card) {
            var q = normalize(searchValue);
            if (!q) {
                return true;
            }
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ');
            return normalize(haystack).indexOf(q) !== -1;
        }
        function apply() {
            cards.forEach(function (card) {
                var visible = matchesFilter(card) && matchesSearch(card);
                card.classList.toggle('hidden-by-filter', !visible);
            });
        }
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video[data-video-src]');
            var button = player.querySelector('[data-play-button]');
            var status = player.querySelector('[data-player-status]');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-video-src');
            var hlsInstance = null;
            var initialized = false;
            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }
            function attachSource() {
                if (initialized) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    setStatus('正在加载播放源');
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源已就绪');
                        video.play().catch(function () {});
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        setStatus('播放源正在重试');
                    });
                    return;
                }
                video.src = source;
                setStatus('正在使用浏览器播放能力');
            }
            function play() {
                attachSource();
                player.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setStatus('点击视频画面继续播放');
                    });
                }
            }
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
            player.addEventListener('click', function (event) {
                if (event.target === video || event.target.closest('video')) {
                    return;
                }
                if (!player.classList.contains('is-playing')) {
                    play();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
