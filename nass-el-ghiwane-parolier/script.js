/* ================================================================
   ناس الغيوان - الپاروليير
   Custom 3D flipbook — fixed click & animation
   ================================================================ */

(function() {
  'use strict';

  // DOM refs
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

  // State
  var currentSpread = 0;
  var totalSpreads = spreads.length;
  var isAnimating = false;
  var totalPages = totalSpreads * 2;

  // ============================================================
  //  UPDATE DISPLAY
  // ============================================================

  function updatePages() {
    for (var i = 0; i < totalSpreads; i++) {
      if (i === currentSpread) {
        spreads[i].classList.add('active');
      } else {
        spreads[i].classList.remove('active');
      }
    }

    var pageNum = currentSpread * 2 + 1;
    pageIndicator.textContent = pageNum + ' / ' + totalPages;

    // Disable buttons at edges
    if (currentSpread === 0) {
      turnPrev.classList.add('disabled');
    } else {
      turnPrev.classList.remove('disabled');
    }
    if (currentSpread >= totalSpreads - 1) {
      turnNext.classList.add('disabled');
    } else {
      turnNext.classList.remove('disabled');
    }
  }

  // ============================================================
  //  GET PAGE CONTENT FOR CLONING
  // ============================================================

  function getSideContent(spreadIndex, side) {
    var spread = spreads[spreadIndex];
    if (!spread) return '';
    var el = spread.querySelector('.page-side.' + side);
    return el ? el.innerHTML : '';
  }

  // ============================================================
  //  3D FLIP ANIMATION (reliable version)
  // ============================================================

  function doFlip(direction) {
    if (isAnimating) return;

    // direction: +1 forward, -1 backward
    var nextSpread = currentSpread + direction;
    if (nextSpread < 0 || nextSpread >= totalSpreads) return;

    isAnimating = true;

    // Set overlay content
    if (direction === 1) {
      flFront.innerHTML = getSideContent(currentSpread, 'right');
      flBack.innerHTML = getSideContent(nextSpread, 'left');
      flOverlay.className = 'flip-overlay flip-forward';
    } else {
      flFront.innerHTML = getSideContent(currentSpread, 'left');
      flBack.innerHTML = getSideContent(nextSpread, 'right');
      flOverlay.className = 'flip-overlay flip-backward';
    }

    // Force reflow so initial state is painted
    void flOverlay.offsetHeight;

    // Start visible + animate
    flOverlay.classList.add('animating');

    requestAnimationFrame(function() {
      flOverlay.classList.add('flipping');
    });

    // Wait for animation + safety timeout
    var completed = false;

    function finishFlip() {
      if (completed) return;
      completed = true;

      flOverlay.classList.remove('animating', 'flipping');
      flOverlay.className = 'flip-overlay';
      flFront.innerHTML = '';
      flBack.innerHTML = '';

      currentSpread = nextSpread;
      updatePages();
      isAnimating = false;
    }

    // transitionend
    var onEnd = function() {
      flOverlay.removeEventListener('transitionend', onEnd);
      finishFlip();
    };
    flOverlay.addEventListener('transitionend', onEnd);

    // Safety timeout (falls back if transitionend doesn't fire)
    setTimeout(finishFlip, 1000);
  }

  var flipForward  = function() { doFlip(1); };
  var flipBackward = function() { doFlip(-1); };

  // ============================================================
  //  CLICK ON VIEWPORT (direct, no separate zones needed but kept)
  // ============================================================

  bookViewport.addEventListener('click', function(e) {
    if (isAnimating) return;
    var rect = bookViewport.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var w = rect.width;
    var third = w / 3;

    if (x > w - third) {
      flipForward();
    } else if (x < third) {
      flipBackward();
    }
  });

  // Also keep zone buttons as visual + extra handlers
  turnNext.addEventListener('click', function(e) {
    e.stopPropagation();
    flipForward();
  });
  turnPrev.addEventListener('click', function(e) {
    e.stopPropagation();
    flipBackward();
  });

  // ============================================================
  //  TOUCH / SWIPE
  // ============================================================

  var tx = 0, ty = 0;

  bookViewport.addEventListener('touchstart', function(e) {
    var t = e.changedTouches[0];
    tx = t.clientX;
    ty = t.clientY;
  }, { passive: true });

  bookViewport.addEventListener('touchend', function(e) {
    var t = e.changedTouches[0];
    var dx = t.clientX - tx;
    var dy = t.clientY - ty;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) flipForward();
      else flipBackward();
    }
  }, { passive: true });

  // ============================================================
  //  KEYBOARD
  // ============================================================

  document.addEventListener('keydown', function(e) {
    if (bookContainer.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); flipForward(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); flipBackward(); }
    else if (e.key === 'Escape') { closeBook(); }
  });

  // ============================================================
  //  OPEN / CLOSE BOOK
  // ============================================================

  function openBook() {
    bookContainer.classList.remove('hidden');
    openBtn.style.display = 'none';
    setTimeout(function() {
      currentSpread = 0;
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
