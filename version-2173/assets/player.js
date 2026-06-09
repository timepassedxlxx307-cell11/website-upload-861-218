function createMoviePlayer(videoId, coverId, playlistUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
        if (!video || attached) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playlistUrl;
            attached = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(playlistUrl);
            hlsInstance.attachMedia(video);
            attached = true;
            return;
        }
        video.src = playlistUrl;
        attached = true;
    }

    function playVideo() {
        attachStream();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        if (video) {
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }
    }

    if (cover) {
        cover.addEventListener("click", playVideo);
    }
    if (video) {
        video.addEventListener("click", function () {
            attachStream();
        });
    }
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
