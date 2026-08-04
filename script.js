// Scroll-reveal: fade/slide elements in as they enter the viewport
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// Count-up stat numbers when they scroll into view
const statEls = document.querySelectorAll('.stat-count');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * progress);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.4 });
statEls.forEach((el) => statObserver.observe(el));

// Process steps: vertical scrollytelling. Each step is blurred/small by
// default, and becomes sharp/slightly enlarged only while it's the one
// closest to the vertical center of the viewport. Scrolling to the next
// step un-focuses the previous one automatically. Hovering also focuses
// a step directly, regardless of scroll position.
const focusSteps = document.querySelectorAll('[data-focus-step]');

if (focusSteps.length) {
  let ticking = false;

  function updateFocusStep() {
    const centerY = window.innerHeight / 2;
    let closest = null;
    let closestDist = Infinity;
    focusSteps.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - centerY);
      if (dist < closestDist) { closestDist = dist; closest = el; }
    });
    focusSteps.forEach((el) => el.classList.toggle('is-focused', el === closest));
    ticking = false;
  }

  function onScrollOrResize() {
    if (!ticking) {
      requestAnimationFrame(updateFocusStep);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  updateFocusStep();
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
  });
}

// City-clarity hover-to-focus effect
const cityClarity = document.getElementById('cityClarity');
if (cityClarity) {
  cityClarity.addEventListener('mousemove', (e) => {
    const rect = cityClarity.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cityClarity.style.setProperty('--mx', x + '%');
    cityClarity.style.setProperty('--my', y + '%');
  });
}

// Frame gallery slideshow(s): auto-advance every 3 seconds, crossfading
// between slides, continuously (never pauses on hover/focus). Respects
// reduced-motion. Dots are clickable to jump directly to a slide.
// Scrolling the mouse wheel while hovering also changes the slide, but
// releases back to normal page scrolling at the first/last slide so
// the user is never trapped.
function initSlideshow(container) {
  const slides = Array.from(container.querySelectorAll('.frame-slideshow__slide'));
  const dots = Array.from(container.querySelectorAll('.frame-slideshow__dots button'));
  if (slides.length < 2) return;

  let index = slides.findIndex((s) => s.classList.contains('is-active'));
  if (index < 0) index = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intervalMs = 3000;
  let timer = null;

  function show(i) {
    slides[index].classList.remove('is-active');
    if (dots[index]) dots[index].classList.remove('is-active');
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('is-active');
    if (dots[index]) dots[index].classList.add('is-active');
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }

  function start() {
    if (prefersReducedMotion) return;
    stop();
    timer = setInterval(next, intervalMs);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      start();
    });
  });

  let wheelLocked = false;
  container.addEventListener('wheel', (e) => {
    const atLast = index === slides.length - 1;
    const atFirst = index === 0;
    if ((e.deltaY > 0 && atLast) || (e.deltaY < 0 && atFirst)) {
      return; // let the page scroll normally
    }
    e.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    if (e.deltaY > 0) next(); else prev();
    start();
    setTimeout(() => { wheelLocked = false; }, 500);
  }, { passive: false });

  start();
}

document.querySelectorAll('.frame-slideshow').forEach(initSlideshow);

// Contact form: submits to a Google Apps Script Web App endpoint, which
// appends the message to a Google Sheet and emails the shop with
// reply-to set to the customer's address. See README.md for setup.
// Falls back to a plain form POST (still works, just leaves the page)
// if JavaScript is unavailable.
const CONTACT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwMBsJplNvrefQQmo0AbC4akMxp0vDPzF06Rb_p_mgRaulYhNBwKIXFZHV7YDySy_dS/exec';

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    const note = contactForm.querySelector('.form__note');
    const btn = contactForm.querySelector('button[type="submit"]');

    if (CONTACT_ENDPOINT.includes('YOUR_DEPLOYMENT_ID')) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: new FormData(contactForm)
      });
      contactForm.reset();
      if (note) {
        note.textContent = "Thanks — we've got your message and will reply by email soon.";
        note.style.color = '';
      }
    } catch (err) {
      if (note) {
        note.textContent = 'Something went wrong sending that — please call us instead at (416) 638-2439.';
      }
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}
