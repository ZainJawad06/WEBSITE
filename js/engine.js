/* ============================================================
   ENGINE — GSAP ScrollTrigger Orchestrator
   When entering a new section, Luffy will fall off the screen
   and drop from the sky onto the new section's target element.
   ============================================================ */

const ScrollEngine = (() => {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ── Section config: maps section IDs to their primary landing elements ──
  const SECTION_LANDING = {
    'arc-intro':       '.hero-text-box',
    'arc-skills':      '#skill-prompt',        
    'arc-projects':    '#card-iot',             
    'arc-production':  '#card-sehha',
    'arc-enies-lobby': '#header-github',          
  };

  const SECTION_IDS = Object.keys(SECTION_LANDING);
  let activeSectionIndex = 0;

  /**
   * initParallaxBackgrounds — Subtle parallax on each section bg.
   */
  function initParallaxBackgrounds() {
    SECTION_IDS.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;

      gsap.to(section, {
        backgroundPositionY: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.fromTo(section, { opacity: 0.85 }, {
        opacity: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 0.5,
        },
      });
    });
  }

  /**
   * initScrollPopups — Add pop-up/fade-up effects to major boxes.
   */
  function initScrollPopups() {
    const popTargets = gsap.utils.toArray('.hero-text-box, .skill-box, .project-card, #card-sehha, .doorway');
    
    popTargets.forEach(target => {
      gsap.from(target, {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: target,
          start: 'top 85%', // Trigger when top of box is 85% down viewport
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  /**
   * initSectionTriggers — Detect when each section becomes active.
   */
  function initSectionTriggers() {
    SECTION_IDS.forEach((id, index) => {
      const section = document.getElementById(id);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => handleSectionEnter(id, index),
        onEnterBack: () => handleSectionEnter(id, index),
      });
    });
  }

  /**
   * handleSectionEnter — Fall down off screen, and drop onto the new section's element.
   */
  function handleSectionEnter(sectionId, sectionIndex) {
    if (sectionIndex === activeSectionIndex && LuffyController.state.currentSectionId === sectionId) return;

    activeSectionIndex = sectionIndex;

    const section = document.getElementById(sectionId);
    LuffyController.state.currentSection = section;
    LuffyController.state.currentSectionId = sectionId;
    LuffyController.state.isScrollAnimating = true;

    // Find the primary landing element for this section
    const landingSelector = SECTION_LANDING[sectionId];
    const landingEl = document.querySelector(landingSelector);
    if (!landingEl) {
      LuffyController.state.isScrollAnimating = false;
      return;
    }

    // Trigger the fall-and-respawn animation
    LuffyController.fallAndRespawn(landingEl, {
      onComplete: () => {
        LuffyController.state.isScrollAnimating = false;
      },
    });
  }

  function init() {
    initParallaxBackgrounds();
    initScrollPopups();
    initSectionTriggers();

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getActiveSectionIndex: () => activeSectionIndex,
    refresh: () => ScrollTrigger.refresh(),
  };
})();

/* ============================================================
   PARTICLE ENGINE — Global Particle Spawner
   ============================================================ */
const ParticleEngine = (() => {
  'use strict';

  function spawnGoldCoin(x, y) {
    const coin = document.createElement('div');
    coin.className = 'gold-coin';
    document.body.appendChild(coin);

    // Initial position at cursor
    gsap.set(coin, {
      left: x - 6, // center the 12px coin
      top: y - 6,
    });

    // Physics animation
    gsap.to(coin, {
      x: (Math.random() - 0.5) * 60, // explode left/right
      y: 80 + Math.random() * 50,    // fall down
      rotationY: Math.random() * 360 + 360, // flip coin
      opacity: 0,
      duration: 0.8 + Math.random() * 0.4,
      ease: 'power1.out',
      onComplete: () => {
        coin.remove(); // Cleanup DOM
      }
    });
  }

  /**
   * Bind coin spawning to elements on mousemove with throttle.
   */
  function bindCoinsToElements(elements) {
    elements.forEach(el => {
      let lastSpawnTime = 0;
      el.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSpawnTime > 80) { // Throttle: spawn every 80ms
          // Use absolute coordinates
          spawnGoldCoin(e.clientX + window.scrollX, e.clientY + window.scrollY);
          lastSpawnTime = now;
        }
      });
    });
  }

  return { spawnGoldCoin, bindCoinsToElements };
})();
