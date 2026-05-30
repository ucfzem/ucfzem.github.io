/* ================================================================
   ناس الغيوان - الپاروليير
   Script principal - Flipbook, swipe, animations
   ================================================================ */

$(document).ready(function() {

  var $flipbook = $('#flipbook');
  var $bookContainer = $('.book-container');
  var $openBtn = $('#openBook');
  var $closeBtn = $('#closeBook');

  // ============================================================
  //  INITIALISATION DU FLIPBOOK
  // ============================================================

  function initFlipbook() {
    var width = $flipbook.width();
    var height = Math.min(width * 0.65, 600);

    if (window.innerWidth <= 600) {
      height = Math.min(width * 0.7, 400);
    } else if (window.innerWidth <= 960) {
      height = Math.min(width * 0.65, 500);
    }

    $flipbook.turn({
      width: width,
      height: height,
      autoCenter: true,
      gradients: true,
      acceleration: true,
      duration: 1000,
      elevation: 50,
      pages: $flipbook.children().length,
      when: {
        turning: function(e, page) {
          // Optional: track page turns
        },
        turned: function(e, page) {
          // Optional: page turned callback
        }
      }
    });

    // Fix first page visibility
    if (!$flipbook.turn('is')) return;
    $flipbook.turn('page', 1);
  }

  // ============================================================
  //  OUVRIR / FERMER LE LIVRE
  // ============================================================

  $openBtn.on('click', function() {
    $bookContainer.removeClass('hidden');
    $(this).fadeOut(400);

    // Init flipbook after display
    setTimeout(function() {
      if (!$flipbook.turn('is')) {
        initFlipbook();
      } else {
        $flipbook.turn('resize');
      }
    }, 100);
  });

  $closeBtn.on('click', function() {
    $bookContainer.addClass('hidden');
    $openBtn.fadeIn(400);

    // Reset to first page on close
    if ($flipbook.turn('is')) {
      $flipbook.turn('page', 1);
    }
  });

  // Double-click on book background (not on pages) to close
  $bookContainer.on('dblclick', function(e) {
    if (!$(e.target).closest('#flipbook').length &&
        !$(e.target).closest('.close-btn').length &&
        !$(e.target).closest('.book-header').length) {
      $closeBtn.trigger('click');
    }
  });

  // ============================================================
  //  KEYBOARD NAVIGATION
  // ============================================================

  $(document).on('keydown', function(e) {
    if ($bookContainer.is(':hidden')) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (e.key === 'ArrowRight') {
        $flipbook.turn('next');
      } else {
        $flipbook.turn('previous');
      }
    }

    // Escape to close
    if (e.key === 'Escape') {
      $closeBtn.trigger('click');
    }
  });

  // ============================================================
  //  TOUCH & SWIPE SUPPORT
  // ============================================================

  var touchStartX = 0;
  var touchStartY = 0;
  var touchEndX = 0;
  var touchEndY = 0;
  var isSwiping = false;

  $flipbook.on('touchstart', function(e) {
    var touch = e.originalEvent.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    isSwiping = true;
  });

  $flipbook.on('touchmove', function(e) {
    if (!isSwiping) return;
    var touch = e.originalEvent.touches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
  });

  $flipbook.on('touchend', function(e) {
    if (!isSwiping) return;
    isSwiping = false;

    var deltaX = touchEndX - touchStartX;
    var deltaY = touchEndY - touchStartY;
    var absDeltaX = Math.abs(deltaX);
    var absDeltaY = Math.abs(deltaY);

    // Only trigger if horizontal swipe is dominant and significant
    if (absDeltaX > absDeltaY && absDeltaX > 40) {
      if (deltaX < 0) {
        $flipbook.turn('next');
      } else {
        $flipbook.turn('previous');
      }
    }
  });

  // Click on edges of pages as fallback
  $flipbook.on('click', function(e) {
    var clickX = e.clientX || e.pageX;
    var offset = $flipbook.offset();
    var relX = clickX - offset.left;
    var width = $flipbook.width();

    // Click on right 30% -> next, left 30% -> previous
    if (relX > width * 0.7) {
      $flipbook.turn('next');
    } else if (relX < width * 0.3) {
      $flipbook.turn('previous');
    }
  });

  // ============================================================
  //  RESPONSIVE RESIZE
  // ============================================================

  var resizeTimer;
  $(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if ($flipbook.turn('is')) {
        var width = $flipbook.width();
        var height = Math.min(width * 0.65, 600);

        if (window.innerWidth <= 600) {
          height = Math.min(width * 0.7, 400);
        } else if (window.innerWidth <= 960) {
          height = Math.min(width * 0.65, 500);
        }

        $flipbook.turn('size', width, height);
        $flipbook.turn('resize');
      }
    }, 250);
  });

  // ============================================================
  //  PREVENT CONTEXT MENU ON BOOK (clean UX)
  // ============================================================

  $flipbook.on('contextmenu', function(e) {
    e.preventDefault();
  });

  // ============================================================
  //  LOG READY
  // ============================================================

  console.log('📖 ناس الغيوان - الپاروليير جاهز !');
});
