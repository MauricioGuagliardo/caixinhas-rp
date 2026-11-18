(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── NAV ─────────────────────────────────────── */
  const nav = document.querySelector('nav');
  if (nav) {
    let ticking = false;
    const update = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ─── REVEAL ON SCROLL ────────────────────────── */
  const REVEAL = [
    '.sec .eyebrow', '.sec h2.sh', '.sec .lead',
    '.benefit', '.aud-card', '.step', '.kit-card',
    '.custom-kit-item', '.custom-kit-cta', '.diff-feat',
    '.sustain-stat', '.mdf-item', '.clients-logos', '.testimonial',
    'details.faq'
  ].join(',');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const siblingIndex = new Map();
    document.querySelectorAll(REVEAL).forEach((el) => {
      // Already on screen at load: leave it alone to avoid a flash.
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      const i = siblingIndex.get(el.parentElement) || 0;
      siblingIndex.set(el.parentElement, i + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 80}ms`);
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ─── FAQ ACCORDION ───────────────────────────── */
  const faqs = [...document.querySelectorAll('details.faq')];
  const duration = reduceMotion ? 0 : 280;

  const animateHeight = (details, from, to, onDone) => {
    details._anim?.cancel();
    details.style.overflow = 'hidden';
    const anim = details.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration, easing: 'cubic-bezier(.2,.7,.3,1)' }
    );
    details._anim = anim;
    anim.onfinish = () => {
      details._anim = null;
      details.style.overflow = '';
      onDone?.();
    };
  };

  const collapse = (details) => {
    const summary = details.querySelector('summary');
    details.classList.add('is-closing');
    animateHeight(details, details.offsetHeight, summary.offsetHeight, () => {
      details.open = false;
      details.classList.remove('is-closing');
    });
  };

  const expand = (details) => {
    const from = details.offsetHeight;
    details.classList.remove('is-closing');
    details.open = true;
    animateHeight(details, from, details.offsetHeight);
  };

  faqs.forEach((details) => {
    details.querySelector('summary').addEventListener('click', (event) => {
      event.preventDefault();
      if (details.open && !details.classList.contains('is-closing')) {
        collapse(details);
        return;
      }
      faqs.forEach((other) => {
        if (other !== details && other.open) collapse(other);
      });
      expand(details);
    });
  });
})();
