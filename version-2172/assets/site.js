(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    var current = 0;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-card-search]');
  var list = document.querySelector('[data-card-list]');

  if (searchInput && list) {
    var cards = Array.prototype.slice.call(list.children);

    searchInput.addEventListener('input', function () {
      var keyword = searchInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  var homeSearch = document.querySelector('.site-search');
  if (homeSearch) {
    homeSearch.addEventListener('submit', function () {
      var field = homeSearch.querySelector('input[name="q"]');
      if (field && field.value.trim()) {
        window.sessionStorage.setItem('qiqi-search', field.value.trim());
      }
    });
  }

  if (searchInput) {
    var saved = window.sessionStorage.getItem('qiqi-search');
    if (saved) {
      searchInput.value = saved;
      searchInput.dispatchEvent(new Event('input'));
      window.sessionStorage.removeItem('qiqi-search');
    }
  }
})();
