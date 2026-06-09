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

// ===== Behaviour-based auto open (once per session) =====
const SEEN_KEY = 'sg_lead_shown';
const maybeAutoOpen = () => {
  if (sessionStorage.getItem(SEEN_KEY)) return;
  sessionStorage.setItem(SEEN_KEY, '1');
  openModal();
};
// 1) Exit intent (desktop): mouse leaves toward the top
document.addEventListener('mouseout', e => {
  if (e.clientY <= 0 && !e.relatedTarget) maybeAutoOpen();
});
// 2) Engaged scroll (mobile + desktop): user scrolls past 55% of the page
let scrollArmed = true;
window.addEventListener('scroll', () => {
  if (!scrollArmed) return;
  const pct = (window.scrollY + window.innerHeight) /
              document.documentElement.scrollHeight;
  if (pct > 0.40) { scrollArmed = false; maybeAutoOpen(); }
}, { passive: true });
