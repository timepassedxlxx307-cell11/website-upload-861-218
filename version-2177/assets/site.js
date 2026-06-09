(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        start();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
        inputs.forEach(function (input) {
            var targetSelector = input.getAttribute('data-target') || '.movie-card';
            var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
            input.addEventListener('input', function () {
                var term = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    card.classList.toggle('hidden-by-search', term && haystack.indexOf(term) === -1);
                });
            });
        });
    }

    function attachStream(video, streamUrl, done) {
        var sourceType = 'application/vnd.apple.mpegurl';
        var canUseNative = video.canPlayType(sourceType) || video.canPlayType('application/x-mpegURL');
        if (canUseNative) {
            if (!video.src) {
                video.src = streamUrl;
            }
            done();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsPlayer) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsPlayer = hls;
                hls.on(window.Hls.Events.MANIFEST_PARSED, done);
                return;
            }
            done();
            return;
        }
        if (!video.src) {
            video.src = streamUrl;
        }
        done();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-wrap'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var source = player.querySelector('source');
            var overlay = player.querySelector('.player-overlay');
            if (!video || !source || !overlay) {
                return;
            }
            var streamUrl = source.getAttribute('src');
            function playVideo() {
                attachStream(video, streamUrl, function () {
                    player.classList.add('is-playing');
                    video.setAttribute('controls', 'controls');
                    var playPromise = video.play();
                    if (playPromise && playPromise.catch) {
                        playPromise.catch(function () {
                            video.setAttribute('controls', 'controls');
                        });
                    }
                });
            }
            overlay.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
}());
