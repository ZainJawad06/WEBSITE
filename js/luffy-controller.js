/* ============================================================
   LUFFY CONTROLLER — Central Sprite State Machine
   Manages: state classes, position tracking, idle behavior,
   and global animations.
   
   Uses getBoundingClientRect() + window.scrollY to map 
   coordinates to the absolute document stage.
   ============================================================ */

const LuffyController = (() => {
  'use strict';

  // ── DOM References ──
  const sprite = document.querySelector('#luffy-sprite');
  const stage  = document.querySelector('#luffy-stage');

  // ── State Tracking ──
  const state = {
    currentSection: null,        // Active section element
    currentSectionId: null,      // Active section ID string
    currentState: 'idle',        // idle | jumping | falling | landing | excited
    isScrollAnimating: false,    // True during scroll-triggered transitions
    position: { x: 0, y: 0 },   // Current absolute pixel position
    idleTimeline: null,          // GSAP timeline for ambient idle motion
  };

  const STATE_CLASSES = ['is-idle', 'is-jumping', 'is-falling', 'is-landing', 'is-excited'];

  /**
   * setState — Cleanly switch sprite state class.
   */
  function setState(newState) {
    STATE_CLASSES.forEach(cls => sprite.classList.remove(cls));
    sprite.classList.add(`is-${newState}`);
    state.currentState = newState;
  }

  /**
   * getElementTopCenter — Calculate absolute document coordinates 
   * to place Luffy ON TOP of any element.
   */
  function getElementTopCenter(el, overlapPx = 6) {
    const rect = el.getBoundingClientRect();
    const sw = sprite.offsetWidth || 46;
    const sh = sprite.offsetHeight || 42;
    return {
      x: rect.left + window.scrollX + rect.width / 2 - sw / 2,
      y: rect.top + window.scrollY - sh + overlapPx,
    };
  }

  /**
   * getElementCenter — Get the absolute center point of an element.
   */
  function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    const sw = sprite.offsetWidth || 46;
    const sh = sprite.offsetHeight || 42;
    return {
      x: rect.left + window.scrollX + rect.width / 2 - sw / 2,
      y: rect.top + window.scrollY + rect.height / 2 - sh / 2,
    };
  }

  /**
   * setPosition — Instantly set Luffy's position (no animation).
   */
  function setPosition(x, y) {
    gsap.set(sprite, { left: x, top: y });
    state.position = { x, y };
  }

  /**
   * startIdleBehavior — Continuous small hopping animation.
   */
  function startIdleBehavior() {
    stopIdleBehavior();

    state.idleTimeline = gsap.timeline({ repeat: -1 });
    state.idleTimeline
      .to(sprite, { y: '-=6', duration: 0.3, ease: 'power1.out' })
      .to(sprite, { y: '+=6', duration: 0.25, ease: 'power2.in' })
      .to(sprite, { duration: 0.6, ease: 'none' });
  }

  function stopIdleBehavior() {
    if (state.idleTimeline) {
      state.idleTimeline.kill();
      state.idleTimeline = null;
    }
  }

  /**
   * initialDrop — Page-load entrance animation.
   */
  function initialDrop() {
    const heroBox = document.querySelector('.hero-text-box h1') || document.querySelector('.hero-text-box');
    if (!heroBox) return;

    const landing = getElementTopCenter(heroBox);

    // Start above viewport, centered on landing X
    gsap.set(sprite, { left: landing.x, top: landing.y - window.innerHeight });
    setState('falling');

    gsap.to(sprite, {
      top: landing.y,
      duration: 0.6,
      ease: 'bounce.out',
      delay: 0.5,
      onComplete: () => {
        setState('landing');
        state.position = landing;
        state.currentSection = document.querySelector('#arc-intro');
        state.currentSectionId = 'arc-intro';
        setTimeout(() => {
          setState('idle');
          startIdleBehavior();
        }, 180);
      },
    });
  }

  /**
   * jumpToElement — Parabolic jump from current spot to new element.
   */
  function jumpToElement(targetEl, options = {}) {
    const { duration = 0.45, onComplete = null, arcPx = 40, overlapPx = 6 } = options;
    const target = getElementTopCenter(targetEl, overlapPx);

    gsap.killTweensOf(sprite);
    stopIdleBehavior();
    setState('jumping');

    const startY = parseFloat(gsap.getProperty(sprite, 'top')) || 0;
    const peakY = Math.min(startY, target.y) - arcPx;

    const jumpTL = gsap.timeline({
      onComplete: () => {
        setState('landing');
        state.position = target;
        setTimeout(() => {
          setState('idle');
          startIdleBehavior();
          if (onComplete) onComplete();
        }, 150);
      },
    });

    jumpTL.to(sprite, { left: target.x, top: peakY, duration: duration * 0.45, ease: 'power1.out' });
    jumpTL.to(sprite, { top: target.y, duration: duration * 0.55, ease: 'power2.in', onUpdate: function () {
      if (this.progress() > 0.3 && state.currentState === 'jumping') setState('falling');
    }});
  }

  /**
   * trackCursorOnElement — Makes Luffy walk horizontally along the top edge of an element.
   */
  function trackCursorOnElement(el, clientX, overlapPx = 6) {
    if (state.isScrollAnimating) return;
    if (state.currentState === 'jumping' || state.currentState === 'falling') return;

    const rect = el.getBoundingClientRect();
    const sw = sprite.offsetWidth || 46;
    const sh = sprite.offsetHeight || 42;
    
    const targetY = rect.top + window.scrollY - sh + overlapPx;
    
    const minX = rect.left + window.scrollX;
    const maxX = rect.right + window.scrollX - sw;
    const targetX = Math.max(minX, Math.min(clientX + window.scrollX - sw / 2, maxX));

    gsap.to(sprite, {
      left: targetX,
      top: targetY,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    
    state.position = { x: targetX, y: targetY };
  }

  /**
   * directDropToElement — Straight drop from top of screen to element.
   */
  function directDropToElement(targetEl, options = {}) {
    const { duration = 0.35, ease = 'power2.in', onComplete = null, overlapPx = 6 } = options;
    const target = getElementTopCenter(targetEl, overlapPx);

    gsap.killTweensOf(sprite);
    stopIdleBehavior();

    // Start above screen
    gsap.set(sprite, { left: target.x, top: target.y - window.innerHeight });
    setState('falling');

    gsap.to(sprite, {
      top: target.y, duration, ease, overwrite: 'auto',
      onComplete: () => {
        setState('landing');
        state.position = target;
        setTimeout(() => {
          setState('idle');
          startIdleBehavior();
          if (onComplete) onComplete();
        }, 150);
      },
    });
  }

  /**
   * fallAndRespawn — Section transition effect. Drops off bottom of screen,
   * then drops from top of screen onto the new target element.
   */
  function fallAndRespawn(targetEl, options = {}) {
    const target = getElementTopCenter(targetEl);
    
    gsap.killTweensOf(sprite);
    stopIdleBehavior();
    setState('falling');
    
    const currentY = parseFloat(gsap.getProperty(sprite, 'top')) || 0;
    
    const tl = gsap.timeline();
    
    // 1. Fall down off screen
    tl.to(sprite, {
      top: currentY + window.innerHeight,
      duration: 0.35,
      ease: 'power2.in'
    })
    // 2. Teleport to top of screen above new target
    .set(sprite, {
      left: target.x,
      top: target.y - window.innerHeight
    })
    // 3. Drop onto target
    .to(sprite, {
      top: target.y,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        setState('landing');
        state.position = target;
        setTimeout(() => {
          setState('idle');
          startIdleBehavior();
          if (options.onComplete) options.onComplete();
        }, 150);
      }
    });
  }

  /**
   * fallOffScreen — Drop Luffy below the viewport.
   */
  function fallOffScreen(options = {}) {
    const { duration = 0.4, ease = 'power1.in', onComplete = null } = options;

    gsap.killTweensOf(sprite);
    stopIdleBehavior();
    setState('falling');

    const currentY = parseFloat(gsap.getProperty(sprite, 'top')) || 0;

    gsap.to(sprite, {
      top: currentY + window.innerHeight,
      duration, ease, overwrite: 'auto',
      onComplete: () => {
        state.position.y = currentY + window.innerHeight;
        if (onComplete) onComplete();
      },
    });
  }

  // ── Initialize on DOM ready ──
  function init() {
    if (!sprite || !stage) {
      console.warn('[LuffyController] Sprite or stage element not found.');
      return;
    }
    initialDrop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ──
  return {
    sprite, state, setState, setPosition, 
    getElementTopCenter, getElementCenter, 
    jumpToElement, directDropToElement, fallAndRespawn, fallOffScreen, 
    startIdleBehavior, stopIdleBehavior, trackCursorOnElement
  };
})();
