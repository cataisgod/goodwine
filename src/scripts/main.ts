// Goodwine — page interactions: reveal, parallax, hero scroll, tagline, nav, carousel, FAQ, booking form.

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE_QUERY = window.matchMedia('(max-width: 859.98px)');

/* ---------------- Scroll reveal ---------------- */
function initReveal() {
  const items = $$('[data-reveal]');
  const show = (el: HTMLElement) => el.classList.add('is-revealed');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(show);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        show(e.target as HTMLElement);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  items.forEach((el) => {
    const d = el.dataset.delay;
    if (d) el.style.transitionDelay = `${d}ms`;
    io.observe(el);
  });
  // Fail-safe for anything already on screen.
  setTimeout(() => {
    const vh = window.innerHeight;
    items.forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.top < vh && b.bottom > 0) show(el);
    });
  }, 1500);
}

/* ---------------- Scroll-driven effects ---------------- */
const hero = $('[data-hero]');
const heroImg = $('[data-hero-img]');
const heroText = $('[data-hero-text]');
const parallaxEls = $$('[data-parallax]');
const tagline = $('[data-tagline]');
const words = tagline ? $$('[data-w]', tagline) : [];
const navLinks = $$<HTMLAnchorElement>('[data-nav-link]');
const sections = navLinks.map((a) => document.getElementById(a.dataset.navLink!)).filter(Boolean) as HTMLElement[];
let activeId = 'acasa';

function update() {
  const vh = window.innerHeight;

  if (!reduceMotion) {
    if (hero) {
      const hr = hero.getBoundingClientRect();
      const t = clamp(-hr.top / hr.height);
      if (heroImg) heroImg.style.transform = `translate3d(0,${(t * 140).toFixed(1)}px,0) scale(${(1.15 - t * 0.05).toFixed(4)})`;
      if (heroText) {
        heroText.style.transform = `translate3d(0,${(-t * 120).toFixed(1)}px,0)`;
        heroText.style.opacity = String(Math.max(0, 1 - t * 1.8));
      }
    }
    parallaxEls.forEach((el) => {
      const f = parseFloat(el.dataset.parallax || '0');
      const rc = el.parentElement!.getBoundingClientRect();
      if (rc.bottom < -200 || rc.top > vh + 200) return;
      const c = rc.top + rc.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(c * f).toFixed(1)}px,0)${el.dataset.scale ? ` scale(${el.dataset.scale})` : ''}`;
    });
  }

  if (tagline && words.length) {
    const tr = tagline.getBoundingClientRect();
    const p = (vh * 0.8 - tr.top) / (tr.height * 0.75);
    const lit = Math.floor(clamp(p) * (words.length + 0.5));
    words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
  }

  let active = 'acasa';
  sections.forEach((s) => {
    if (s.getBoundingClientRect().top < vh * 0.4) active = s.id;
  });
  if (active !== activeId) {
    activeId = active;
    navLinks.forEach((a) => {
      const on = a.dataset.navLink === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    update();
  });
}

/* ---------------- Mobile menu ---------------- */
function initMenu() {
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  if (!toggle) return;
  const root = document.documentElement;
  const set = (open: boolean) => {
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => set(!root.classList.contains('menu-open')));
  $$('[data-menu-link]').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) {
      set(false);
      toggle.focus();
    }
  });
  MOBILE_QUERY.addEventListener('change', (e) => {
    if (!e.matches) set(false);
  });
}

/* ---------------- Sommelier carousel ---------------- */
type Wine = { name: string; region: string; year: string; notes: string; aging: string; serve: string; pair: string; price: string };

function initCarousel() {
  const section = $('[data-featured]');
  const dataEl = $('#wines-data');
  if (!section || !dataEl) return;
  const wines: Wine[] = JSON.parse(dataEl.textContent || '[]');
  const imgs = $$('[data-feat-img]', section);
  const dots = $$('[data-feat-dot]', section);
  const fields = $$('[data-f]', section);
  const pad = (n: number) => String(n).padStart(2, '0');
  let idx = 0;
  let switching = false;

  const render = () => {
    const w = wines[idx];
    fields.forEach((el) => {
      const k = el.dataset.f as keyof Wine | 'counter';
      el.textContent = k === 'counter' ? `${pad(idx + 1)} / ${pad(wines.length)}` : w[k];
    });
    imgs.forEach((img, i) => {
      img.classList.toggle('is-active', i === idx);
      if (i === idx) img.removeAttribute('aria-hidden');
      else img.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
      if (i === idx) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  };

  const go = (to: number) => {
    const next = (to + wines.length) % wines.length;
    if (switching || next === idx) return;
    if (reduceMotion) {
      idx = next;
      render();
      return;
    }
    switching = true;
    section.classList.add('is-switching');
    setTimeout(() => {
      idx = next;
      render();
    }, 420);
    setTimeout(() => {
      section.classList.remove('is-switching');
      switching = false;
    }, 470);
  };

  $('[data-feat-prev]', section)?.addEventListener('click', () => go(idx - 1));
  $('[data-feat-next]', section)?.addEventListener('click', () => go(idx + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
}

/* ---------------- FAQ accordion (one open at a time) ---------------- */
function initFaq() {
  const list = $('[data-faq]');
  if (!list) return;
  const items = $$('.faq__item', list);
  items.forEach((item) => {
    const btn = $<HTMLButtonElement>('.faq__q', item)!;
    btn.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach((other) => {
        other.classList.remove('is-open');
        $('.faq__q', other)!.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ---------------- Booking form ---------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function validate(f: { name: string; email: string; date: string }) {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = 'Spune-ne cum te numești.';
  if (!f.email.trim()) e.email = 'Avem nevoie de adresa de email.';
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Adresa de email nu pare corectă.';
  if (!f.date) e.date = 'Alege o dată.';
  else {
    const day = new Date(`${f.date}T12:00`).getDay();
    if (![0, 4, 5, 6].includes(day)) e.date = 'Primim vizite de joi până duminică.';
  }
  return e;
}

function initBooking() {
  const form = $<HTMLFormElement>('[data-booking-form]');
  const sent = $('[data-booking-sent]');
  if (!form || !sent) return;
  const submit = $<HTMLButtonElement>('[data-booking-submit]', form)!;
  const dateInput = form.elements.namedItem('date') as HTMLInputElement;
  dateInput.min = localToday();

  const setError = (name: string, msg = '') => {
    const field = $(`[data-field="${name}"]`, form);
    if (!field) return;
    field.classList.toggle('has-error', !!msg);
    $('.field__error', field)!.textContent = msg;
    const input = $('input', field)!;
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name) setError(t.name);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      date: dateInput.value,
      guests: (form.elements.namedItem('guests') as HTMLSelectElement).value,
    };
    const errors = validate(data);
    ['name', 'email', 'date'].forEach((k) => setError(k, errors[k]));
    const first = Object.keys(errors)[0];
    if (first) {
      (form.elements.namedItem(first) as HTMLElement).focus();
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Se trimite rezervarea…';
    // TODO: connect to a real endpoint (email / CRM / Google Sheets).
    setTimeout(() => {
      $('[data-sent-name]', sent)!.textContent = data.name.trim();
      $('[data-sent-email]', sent)!.textContent = data.email.trim();
      form.hidden = true;
      sent.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Trimite rezervarea';
    }, 1300);
  });

  $('[data-booking-reset]', sent)?.addEventListener('click', () => {
    form.reset();
    sent.hidden = true;
    form.hidden = false;
    (form.elements.namedItem('name') as HTMLInputElement).focus();
  });
}

/* ---------------- Boot ---------------- */
initReveal();
initMenu();
initCarousel();
initFaq();
initBooking();
update();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
