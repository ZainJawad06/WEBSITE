/* ============================================================
   SECTION 1 — Intro Interaction Engine
   Luffy walks horizontally along the top of the hero text box
   to follow the cursor. If the cursor leaves the text box,
   Luffy falls off the edge into the sky below.
   ============================================================ */

const IntroInteraction = (() => {
  'use strict';

  const luffy = document.querySelector('#luffy-sprite');
  const heroBox = document.querySelector('.hero-text-box');

  if (!luffy || !heroBox) return;

  let isLuffyAnchored = true;

  heroBox.addEventListener('mouseenter', () => {
    if (LuffyController.state.isScrollAnimating) return;
    if (LuffyController.state.currentSectionId !== 'arc-intro') return;

    if (!isLuffyAnchored) {
        isLuffyAnchored = true;
        LuffyController.directDropToElement(heroBox, {
            duration: 0.35, ease: 'power2.in'
        });
    }
  });

  heroBox.addEventListener('mousemove', (e) => {
    if (LuffyController.state.currentSectionId !== 'arc-intro') return;
    
    if (isLuffyAnchored) {
        LuffyController.trackCursorOnElement(heroBox, e.clientX);
    }
  });

  heroBox.addEventListener('mouseleave', () => {
    if (LuffyController.state.isScrollAnimating) return;
    if (LuffyController.state.currentSectionId !== 'arc-intro') return;

    isLuffyAnchored = false;
    LuffyController.fallOffScreen({ duration: 0.45, ease: 'power2.in' });
  });

})();
