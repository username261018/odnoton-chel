/* Odnoton nails v2: pointer spot, tilted hero photo, photo reels, map on request. */
(function () {
  var root = document.documentElement;
  var still = matchMedia('(prefers-reduced-motion: reduce)');
  var fine = matchMedia('(hover: hover) and (pointer: fine)');

  /* warm light spot: follows a precise pointer; on touch or reduced motion it rests where it is */
  var spotFrame = 0, sx = 0, sy = 0;
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || !fine.matches || still.matches) return;
    sx = e.clientX; sy = e.clientY;
    if (spotFrame) return;
    spotFrame = requestAnimationFrame(function () {
      spotFrame = 0;
      root.style.setProperty('--sx', sx + 'px');
      root.style.setProperty('--sy', sy + 'px');
    });
  }, { passive: true });

  /* hero photo: the pointer tilts it, a held mouse button turns it harder */
  var tilt = document.querySelector('.tilt');
  if (tilt) {
    var box = tilt.parentElement;
    box.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !fine.matches || still.matches) return;
      var r = box.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.setProperty('--ty', (px * 14).toFixed(2) + 'deg');
      tilt.style.setProperty('--tx', (-py * 14).toFixed(2) + 'deg');
    });
    box.addEventListener('pointerleave', function () {
      tilt.style.removeProperty('--tx'); tilt.style.removeProperty('--ty'); tilt.classList.remove('is-held');
    });
    box.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button === 0 && fine.matches && !still.matches) tilt.classList.add('is-held');
    });
    window.addEventListener('pointerup', function () { tilt.classList.remove('is-held'); });
    window.addEventListener('blur', function () { tilt.classList.remove('is-held'); });
  }

  /* photo reels */
  document.querySelectorAll('.reel').forEach(function (reel) {
    var track = reel.querySelector('.reel__track');
    var slides = Array.prototype.slice.call(track.children);
    var prev = reel.querySelector('.reel__arrow--prev');
    var next = reel.querySelector('.reel__arrow--next');
    var dots = Array.prototype.slice.call(reel.querySelectorAll('.reel__dot'));
    var index = 0;

    function perView() {
      var w = slides[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return Math.max(1, Math.round((track.clientWidth - 16 + gap) / (w + gap)));
    }
    function last() { return Math.max(0, slides.length - perView()); }
    function current() {
      var start = track.getBoundingClientRect().left + 8, best = 0, dist = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.getBoundingClientRect().left - start);
        if (d < dist) { dist = d; best = i; }
      });
      return Math.min(best, last());
    }
    function paint() {
      var lim = last(), per = perView();
      index = current();
      reel.dataset.index = index;
      prev.disabled = index <= 0;
      next.disabled = index >= lim;
      dots.forEach(function (d, i) {
        d.hidden = i > lim;
        if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      slides.forEach(function (s, i) {
        var seen = i >= index && i < index + per;
        s.inert = !seen;
        s.setAttribute('aria-hidden', seen ? 'false' : 'true');
      });
    }
    function go(i) {
      i = Math.max(0, Math.min(i, last()));
      var left = slides[i].offsetLeft - slides[0].offsetLeft;
      track.scrollTo({ left: left, behavior: still.matches ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { go(current() - 1); });
    next.addEventListener('click', function () { go(current() + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(last()); }
    });
    var t = 0;
    track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(paint, 90); }, { passive: true });
    if ('onscrollend' in window) track.addEventListener('scrollend', paint);
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(paint, 120); });
    paint();
  });

  /* map loads only on request */
  var stub = document.querySelector('.map-stub');
  if (stub) {
    stub.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = stub.getAttribute('data-map');
      f.title = 'Odnoton nails на Яндекс Картах';
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      stub.parentNode.replaceChild(f, stub);
    });
  }
})();
