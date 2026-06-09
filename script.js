// ===== Year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Sticky nav shadow =====
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Mobile menu =====
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  links.classList.toggle('open');
  toggle.classList.toggle('open');
});
links.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
  })
);

// ===== Reveal on scroll =====
const io = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.14 }
);
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 80 + 'ms';
  io.observe(el);
});

// ===== Animated counters =====
const fmt = n =>
  n >= 100000 ? (n / 1000).toFixed(0) + 'K' : n.toLocaleString('en-IN');

const runCount = el => {
  const target = +el.dataset.count;
  const dur = 1400;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.floor(eased * target));
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = fmt(target);
  };
  requestAnimationFrame(step);
};

const countIO = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      runCount(e.target);
      countIO.unobserve(e.target);
    }
  }),
  { threshold: 0.6 }
);
document.querySelectorAll('.stat__num').forEach(el => countIO.observe(el));

// ===== Lead Capture Modal =====
const WHATSAPP_NUMBER = '919923207407';        // Sunjjoy Gupta WhatsApp
const modal = document.getElementById('leadModal');
const leadForm = document.getElementById('leadForm');
const leadErr = document.getElementById('leadErr');
let lastFocus = null;

const openModal = () => {
  if (modal.classList.contains('open')) return;
  lastFocus = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => document.getElementById('lf-name').focus(), 260);
};
const closeModal = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastFocus) lastFocus.focus();
};

// Open on every "contact" CTA across the site
document.querySelectorAll('a[href="#contact"]').forEach(a =>
  a.addEventListener('click', e => { e.preventDefault(); openModal(); })
);
// Floating action button (always visible)
const fab = document.getElementById('fabBtn');
if (fab) fab.addEventListener('click', openModal);
// Also the direct "Message on WhatsApp" card row → use the rich form instead
const waRow = document.querySelector('.contact__cta-card .cta-row[href*="whatsapp"]');
if (waRow) waRow.addEventListener('click', e => { e.preventDefault(); openModal(); });

// Close handlers
modal.querySelectorAll('[data-close]').forEach(el =>
  el.addEventListener('click', closeModal)
);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

// Submit → build WhatsApp message
leadForm.addEventListener('submit', e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const name = v('lf-name'), phone = v('lf-phone'),
        email = v('lf-email'), company = v('lf-company'), desc = v('lf-desc');

  if (!name || !phone || !company) {
    leadErr.textContent = 'Please fill Name, Phone and Company / Factory Name.';
    return;
  }
  if (!/[0-9]{7,}/.test(phone.replace(/\D/g, ''))) {
    leadErr.textContent = 'Please enter a valid phone number.';
    return;
  }
  leadErr.textContent = '';

  const lines = [
    '*New Enquiry — Sunjjoy Gupta (Lean Consultant)*',
    '',
    '👤 Name: ' + name,
    '📞 Phone: ' + phone,
    email ? '✉️ Email: ' + email : '',
    '🏭 Company / Factory: ' + company,
    desc ? '📝 Challenges: ' + desc : ''
  ].filter(Boolean);

  const url = 'https://api.whatsapp.com/send?phone=' + WHATSAPP_NUMBER +
              '&text=' + encodeURIComponent(lines.join('\n'));
  window.open(url, '_blank');
  closeModal();
  leadForm.reset();
});

// ===== Behaviour-based auto open — DISABLED =====
// No automatic popup. The lead form opens only when the user clicks a
// CTA button or the floating "Free Consultation" widget.

// ===== Certificate lightbox =====
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = document.getElementById('lbImg');
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); };
  document.querySelectorAll('.cert[data-cert]').forEach(c => {
    c.addEventListener('click', () => {
      img.src = c.getAttribute('data-cert');
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });
  document.getElementById('lbClose').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
})();

// ===== Testimonials slider =====
(function () {
  const stage = document.getElementById('tStage');
  if (!stage) return;
  const slides = Array.from(stage.querySelectorAll('.tslide'));
  const dotsWrap = document.getElementById('tDots');
  const prev = document.getElementById('tPrev');
  const next = document.getElementById('tNext');
  const slider = document.querySelector('.tslider');
  let idx = 0, timer = null;

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    b.addEventListener('click', () => { go(i); restart(); });
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }
  const nextSlide = () => go(idx + 1);
  const prevSlide = () => go(idx - 1);
  const start = () => { timer = setInterval(nextSlide, 7000); };
  const restart = () => { clearInterval(timer); start(); };

  if (next) next.addEventListener('click', () => { nextSlide(); restart(); });
  if (prev) prev.addEventListener('click', () => { prevSlide(); restart(); });
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', start);

  // Touch swipe (mobile)
  let x0 = null;
  stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { dx < 0 ? nextSlide() : prevSlide(); restart(); }
    x0 = null;
  }, { passive: true });

  go(0);
  start();
})();
