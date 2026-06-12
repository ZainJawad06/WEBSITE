/* ============================================================
   SECTION 3 — Projects Interaction
   Luffy jumps to the top of hovered project cards and walks
   horizontally to follow the cursor.
   ============================================================ */

const ProjectsInteraction = (() => {
  'use strict';

  const luffy = document.querySelector('#luffy-sprite');
  const projectCards = document.querySelectorAll('.project-card');

  if (!luffy || !projectCards.length) return;

  projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (LuffyController.state.isScrollAnimating) return;
      if (LuffyController.state.currentSectionId !== 'arc-projects') return;

      gsap.killTweensOf(luffy);
      LuffyController.stopIdleBehavior();

      LuffyController.jumpToElement(card, {
        duration: 0.35,
        arcPx: 30,
      });
    });

    card.addEventListener('mousemove', (e) => {
      if (LuffyController.state.currentSectionId !== 'arc-projects') return;
      LuffyController.trackCursorOnElement(card, e.clientX);
    });
  });

  // Attach particle engine to paragraphs
  const paragraphs = document.querySelectorAll('#arc-projects .card-body p');
  if (typeof ParticleEngine !== 'undefined' && paragraphs.length) {
    ParticleEngine.bindCoinsToElements(paragraphs);
  }

})();
