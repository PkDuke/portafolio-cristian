/**
 * Cristian Villota Vega — Portfolio Interactive Script
 * High-performance, zero-bloat micro-interactions & 3D background
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.innerHTML = isOpen
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Close menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }

  // 2. Mouse Spotlight on Interactive Cards
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 3. Image Lightbox for High-Res Screenshots
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.zoomable-image').forEach(img => {
    img.addEventListener('click', () => {
      if (lightbox && lightboxImg) {
        lightboxImg.src = img.getAttribute('data-full') || img.src;
        lightboxImg.alt = img.alt || 'Vista previa ampliada';
        if (lightboxCaption) {
          lightboxCaption.textContent = img.alt || '';
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose && lightbox) {
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // 4. Copy Email with Toast Feedback
  const copyBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toastNotification');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email') || 'cfvv88@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        showToast('✓ Correo copiado al portapapeles');
      } catch {
        showToast(`Correo: ${email}`);
      }
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 5. High-Performance Geometric Background Canvas
  initHeroCanvas();

  // 6. Mini Galleries / Project Sliders with autoplay and arrows
  initProjectSliders();
});

/**
 * Mini Galleries / Project Sliders (Autoplay, arrows, dots, touch swipe)
 */
function initProjectSliders() {
  const sliders = document.querySelectorAll('.project-slider');

  sliders.forEach(slider => {
    const slides = slider.querySelectorAll('.slider-slide');
    const dotsContainer = slider.querySelector('.slider-dots');
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    const interval = parseInt(slider.getAttribute('data-interval') || '4200', 10);

    // Create dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Ir a imagen ${idx + 1}`);
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          goToSlide(idx);
          resetAutoplay();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const updateDots = () => {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    };

    const goToSlide = (newIndex) => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (newIndex + slides.length) % slides.length;
      slides[currentIndex].classList.add('active');
      updateDots();
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentIndex - 1);
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentIndex + 1);
        resetAutoplay();
      });
    }

    // Touch Swipe for mobile
    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goToSlide(currentIndex + 1);
        else goToSlide(currentIndex - 1);
        resetAutoplay();
      }
    }, { passive: true });

    // Autoplay
    const startAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, interval);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  });
}

/**
 * Procedural 3D Constellation / Polyhedron Wireframe
 * Optimized zero-alloc render loop; auto-pauses when offscreen
 */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
  let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;
  let isVisible = true;

  // Window resize handler
  const onResize = () => {
    width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  };
  window.addEventListener('resize', onResize);

  // Mouse move tracking
  window.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      targetMouseX = (e.clientX - rect.left) * window.devicePixelRatio;
      targetMouseY = (e.clientY - rect.top) * window.devicePixelRatio;
    }
  });

  // Pause when offscreen
  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(canvas);

  // 3D Nodes Simulation
  const NODE_COUNT = 36;
  const nodes = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: (Math.random() - 0.5) * 480,
      y: (Math.random() - 0.5) * 480,
      z: (Math.random() - 0.5) * 480,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.4,
    });
  }

  let angleX = 0;
  let angleY = 0;

  function render() {
    if (isVisible) {
      // Lerp mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      angleX += 0.002 + (mouseY - height / 2) * 0.000003;
      angleY += 0.003 + (mouseX - width / 2) * 0.000003;

      ctx.clearRect(0, 0, width, height);

      const fov = 340;
      const centerX = width / 2;
      const centerY = height / 2;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Projected points
      const projected = [];

      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        // Bounce inside bounding sphere
        if (Math.abs(n.x) > 240) n.vx *= -1;
        if (Math.abs(n.y) > 240) n.vy *= -1;
        if (Math.abs(n.z) > 240) n.vz *= -1;

        // 3D rotation
        let x1 = cosY * n.x + sinY * n.z;
        let z1 = -sinY * n.x + cosY * n.z;
        let y1 = cosX * n.y - sinX * z1;
        let z2 = sinX * n.y + cosX * z1 + 400;

        const scale = fov / z2;
        projected.push({
          x: centerX + x1 * scale,
          y: centerY + y1 * scale,
          scale: Math.max(0.1, scale),
          z: z2,
        });
      }

      // Draw lines between nearby nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 13000) {
            const alpha = (1 - distSq / 13000) * 0.28;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw node points
      for (let i = 0; i < NODE_COUNT; i++) {
        const p = projected[i];
        const radius = Math.max(1.2, p.scale * 2.2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
