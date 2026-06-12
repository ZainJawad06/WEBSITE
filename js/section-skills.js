/* ============================================================
   SECTION 2 — Skills Hover Engine
   Luffy jumps to the top of whichever skill box is hovered,
   and walks horizontally to follow the cursor.
   ============================================================ */

const SkillsInteraction = (() => {
  'use strict';

  const luffy = document.querySelector('#luffy-sprite');
  const skillBoxes = document.querySelectorAll('.skill-box');

  if (!luffy || !skillBoxes.length) return;

  skillBoxes.forEach(box => {
    // Jump to the box on enter
    box.addEventListener('mouseenter', () => {
      if (LuffyController.state.isScrollAnimating) return;
      if (LuffyController.state.currentSectionId !== 'arc-skills') return;

      gsap.killTweensOf(luffy);
      LuffyController.stopIdleBehavior();

      LuffyController.jumpToElement(box, {
        duration: 0.4,
        arcPx: 35,
      });
    });

    // Walk horizontally to follow cursor while inside the box
    box.addEventListener('mousemove', (e) => {
      if (LuffyController.state.currentSectionId !== 'arc-skills') return;
      LuffyController.trackCursorOnElement(box, e.clientX);
    });
  });

  // Attach particle engine to paragraphs
  const paragraphs = document.querySelectorAll('#arc-skills p');
  if (typeof ParticleEngine !== 'undefined' && paragraphs.length) {
    ParticleEngine.bindCoinsToElements(paragraphs);
  }

})();
