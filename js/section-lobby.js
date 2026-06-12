/* ============================================================
   SECTION 5 — Lobby Interaction
   Luffy walks on the door header, jumps to portal on click,
   and drops off after idle.
   ============================================================ */

const LobbyInteraction = (() => {
  'use strict';

  const luffy = document.querySelector('#luffy-sprite');
  const section = document.querySelector('#arc-enies-lobby');
  const doorways = document.querySelectorAll('.doorway');
  const doorHeaders = document.querySelectorAll('.door-header');

  if (!luffy || !section || !doorways.length) return;

  let mouseTimer = null;
  let isLuffyAnchored = false;
  let lastActiveHeader = doorHeaders[0];
  const IDLE_TIMEOUT = 1200;

  function awakeLuffy() {
    if (isLuffyAnchored) return;
    isLuffyAnchored = true;

    LuffyController.directDropToElement(lastActiveHeader, {
      duration: 0.35,
      ease: 'power2.in',
    });
  }

  function voidDrop() {
    isLuffyAnchored = false;
    LuffyController.fallOffScreen({ duration: 0.45, ease: 'power2.in' });
  }

  function handleMouseMove(e) {
    if (LuffyController.state.isScrollAnimating) return;
    if (LuffyController.state.currentSectionId !== 'arc-enies-lobby') return;

    awakeLuffy();
    
    if (isLuffyAnchored) {
        LuffyController.trackCursorOnElement(lastActiveHeader, e.clientX);
    }

    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(voidDrop, IDLE_TIMEOUT);
  }

  doorHeaders.forEach(header => {
    header.addEventListener('mouseenter', () => {
      if (LuffyController.state.isScrollAnimating) return;
      if (LuffyController.state.currentSectionId !== 'arc-enies-lobby') return;
      
      if (lastActiveHeader !== header) {
          lastActiveHeader = header;
          LuffyController.jumpToElement(header, { duration: 0.35, arcPx: 30 });
      }
    });

    header.addEventListener('click', () => {
      if (LuffyController.state.isScrollAnimating) return;
      if (LuffyController.state.currentSectionId !== 'arc-enies-lobby') return;

      const doorway = header.closest('.doorway');
      if (!doorway) return;

      const portalBtn = doorway.querySelector('.btn-portal');
      if (!portalBtn) return;

      gsap.killTweensOf(luffy);
      LuffyController.stopIdleBehavior();
      clearTimeout(mouseTimer);
      isLuffyAnchored = true;

      const headerPos = LuffyController.getElementTopCenter(header);
      gsap.set(luffy, { left: headerPos.x, top: headerPos.y });
      LuffyController.setState('excited');

      setTimeout(() => {
        LuffyController.jumpToElement(portalBtn, {
          duration: 0.5,
          arcPx: 60,
          onComplete: () => {
            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(voidDrop, IDLE_TIMEOUT);
          },
        });
      }, 200);
    });
  });

  section.addEventListener('mousemove', handleMouseMove);

})();
