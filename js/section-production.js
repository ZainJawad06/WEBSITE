/* ============================================================
   SECTION 4 — Production Interaction
   Mouse moving on card → Luffy drops onto top of Sehha card and walks
   Mouse leaves card or idle 1.2s → Falls off screen
   ============================================================ */

const ProductionInteraction = (() => {
  'use strict';

  const luffy = document.querySelector('#luffy-sprite');
  const card = document.querySelector('#card-sehha');

  if (!luffy || !card) return;

  let mouseTimer = null;
  let isLuffyAnchored = false;
  const IDLE_TIMEOUT = 1200;

  function awakeLuffy() {
    if (isLuffyAnchored) return;
    isLuffyAnchored = true;

    LuffyController.directDropToElement(card, {
      duration: 0.35,
      ease: 'power2.in',
    });
  }

  function sleepLuffy() {
    isLuffyAnchored = false;
    LuffyController.fallOffScreen({ duration: 0.4, ease: 'power1.in' });
  }

  function handleMouseMove(e) {
    if (LuffyController.state.isScrollAnimating) return;
    if (LuffyController.state.currentSectionId !== 'arc-production') return;

    awakeLuffy();
    
    if (isLuffyAnchored) {
        LuffyController.trackCursorOnElement(card, e.clientX);
    }

    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(sleepLuffy, IDLE_TIMEOUT);
  }

  card.addEventListener('mousemove', handleMouseMove);

  card.addEventListener('mouseleave', () => {
    if (LuffyController.state.isScrollAnimating) return;
    if (LuffyController.state.currentSectionId !== 'arc-production') return;

    clearTimeout(mouseTimer);
    if (isLuffyAnchored) {
        sleepLuffy();
    }
  });

})();
