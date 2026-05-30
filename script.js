/* ================================================================
   ناس الغيوان - الپاروليير
   Custom 3D flipbook — no external dependencies
   ================================================================ */

(function() {
  'use strict';

  var bookViewport = document.getElementById('bookViewport');
  var spreads = document.querySelectorAll('.spread');
  var flOverlay = document.getElementById('flipOverlay');
  var flFront = document.getElementById('flipFront');
  var flBack = document.getElementById('flipBack');
  var turnPrev = document.getElementById('turnPrev');
  var turnNext = document.getElementById('turnNext');
  var pageIndicator = document.getElementById('pageIndicator');
  var openBtn = document.getElementById('openBook');
  var closeBtn = document.getElementById('closeBook');
  var bookContainer = document.getElementById('bookContainer');

  var currentSpread = 0;
  var totalSpreads = spreads.length;
  var isAnimating = false;
  var totalPages = totalSpreads * 2;

  // ============================================================
  //  UPDATE DISPLAY
  // ============================================================

  function updatePages() {
    spreads.forEach(function(s, i) {
      s.classList.toggle('active', i === currentSpread);
    });

    var pageNum = currentSpread * 2 + 1;
    pageIndicator.textContent = pageNum + ' / ' + totalPages;

    turnPrev.classList.toggle('disabled', currentSpread === 0);
    turnNext.classList.toggle('disabled', currentSpread >= totalSpreads - 1);
  }

  // ============================================================
  //  3D FLIP ANIMATION
  // ============================================================

  function cloneContent(el) {
    return el ? el.innerHTML : '';
  }

  function flipForward() {
    if (isAnimating || currentSpread >= totalSpreads - 1) return;
    isAnimating = true;

    var currentRight = spreads[currentSpread].querySelector('.page-side.right');
    var nextLeft = spreads[currentSpread + 1].querySelector('.page-side.left');

    flFront.innerHTML = cloneContent(currentRight);
    flBack.innerHTML = cloneContent(nextLeft);

    flOverlay.className = 'flip-overlay flip-forward animating';

    requestAnimationFrame(function() {
      flOverlay.classList.add('flipping');
    });

    flOverlay.addEventListener('transitionend', function handler() {
      flOverlay.removeEventListener('transitionend', handler);
      flOverlay.classList.remove('animating', 'flipping');
      flOverlay.className = 'flip-overlay';
      flFront.innerHTML = '';
      flBack.innerHTML = '';
      currentSpread++;
      updatePages();
      isAnimating = false;
    });
  }

  function flipBackward() {
    if (isAnimating || currentSpread <= 0) return;
    isAnimating = true;

    var currentLeft = spreads[currentSpread].querySelector('.page-side.left');
    var prevRight = spreads[currentSpread - 1].querySelector('.page-side.right');

    flFront.innerHTML = cloneContent(currentLeft);
    flBack.innerHTML = cloneContent(prevRight);

    flOverlay.className = 'flip-overlay flip-backward animating';

    requestAnimationFrame(function() {
      flOverlay.classList.add('flipping');
    });

    flOverlay.addEventListener('transitionend', function handler() {
      flOverlay.removeEventListener('transitionend', handler);
      flOverlay.classList.remove('animating', 'flipping');
      flOverlay.className = 'flip-overlay';
      flFront.innerHTML = '';
      flBack.innerHTML = '';
      currentSpread--;
      updatePages();
      isAnimating = false;
    });
  }

  // ============================================================
  //  TURN ZONE CLICKS
  // ============================================================

  turnNext.addEventListener('click', flipForward);
  turnPrev.addEventListener('click', flipBackward);

  // ============================================================
  //  TOUCH / SWIPE
  // ============================================================

  var touch = { startX: 0, startY: 0, endX: 0, endY: 0, swiping: false };

  bookViewport.addEventListener('touchstart', function(e) {
    var t = e.changedTouches[0];
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.swiping = true;
  }, { passive: true });

  bookViewport.addEventListener('touchmove', function(e) {
    if (!touch.swiping) return;
    var t = e.changedTouches[0];
    touch.endX = t.clientX;
    touch.endY = t.clientY;
  }, { passive: true });

  bookViewport.addEventListener('touchend', function(e) {
    if (!touch.swiping) return;
    touch.swiping = false;

    var dx = touch.endX - touch.startX;
    var dy = touch.endY - touch.startY;
    var absDx = Math.abs(dx);
    var absDy = Math.abs(dy);

    if (absDx > absDy && absDx > 30) {
      if (dx < 0) {
        flipForward();
      } else {
        flipBackward();
      }
    }
  }, { passive: true });

  // ============================================================
  //  KEYBOARD
  // ============================================================

  document.addEventListener('keydown', function(e) {
    if (bookContainer.classList.contains('hidden')) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      flipForward();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      flipBackward();
    } else if (e.key === 'Escape') {
      closeBook();
    }
  });

  // ============================================================
  //  OPEN / CLOSE BOOK
  // ============================================================

  function openBook() {
    bookContainer.classList.remove('hidden');
    openBtn.style.display = 'none';
    setTimeout(function() {
      updatePages();
      resizeViewport();
    }, 50);
  }

  function closeBook() {
    bookContainer.classList.add('hidden');
    openBtn.style.display = '';
    currentSpread = 0;
    updatePages();
  }

  openBtn.addEventListener('click', openBook);
  closeBtn.addEventListener('click', closeBook);

  // Double-click on background to close
  bookContainer.addEventListener('dblclick', function(e) {
    var t = e.target;
    if (!t.closest('.book-header') && !t.closest('.turn-zone')) {
      closeBook();
    }
  });

  // ============================================================
  //  RESIZE
  // ============================================================

  function resizeViewport() {
    var w = bookViewport.offsetWidth;
    var h;

    if (window.innerWidth <= 600) {
      h = Math.min(w * 0.7, 400);
    } else if (window.innerWidth <= 960) {
      h = Math.min(w * 0.6, 500);
    } else {
      h = Math.min(w * 0.58, 600);
    }

    bookViewport.style.height = h + 'px';
  }

  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeViewport, 200);
  });

  // ============================================================
  //  INIT
  // ============================================================

  updatePages();
  resizeViewport();

  console.log('📖 ناس الغيوان - الپاروليير جاهز');
})();
