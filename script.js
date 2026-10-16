const header = document.querySelector('.header');
const navLinks = document.querySelectorAll('.nav-links a');
const navList = document.querySelector('.nav-links');
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const backToTop = document.getElementById('backToTop');
const revealItems = document.querySelectorAll('.reveal');
const yearEl = document.getElementById('year');
const root = document.documentElement;
const counters = document.querySelectorAll('.counter');

const storedTheme = localStorage.getItem('theme');
if (storedTheme) {
  root.setAttribute('data-theme', storedTheme);
  updateThemeIcon(storedTheme);
}

yearEl.textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetSelector = link.getAttribute('href');
    const targetSection = document.querySelector(targetSelector);

    if (!targetSection) {
      return;
    }

    const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });

    navList.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

themeToggle.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme') || 'light';
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

  root.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);
  updateThemeIcon(nextTheme);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
  backToTop.classList.toggle('show', window.scrollY > 400);
  updateActiveNavLink();
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        if (entry.target.id === 'achievements') {
          animateCounters();
        }
      }
    });
  },
  {
    threshold: 0.15
  }
);

revealItems.forEach((item) => observer.observe(item));

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function updateActiveNavLink() {
  const offset = 160;

  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));

    if (!section) {
      return;
    }

    const sectionTop = section.offsetTop - offset;
    const sectionBottom = sectionTop + section.offsetHeight;
    const inView = window.scrollY >= sectionTop && window.scrollY < sectionBottom;
    link.classList.toggle('active', inView);
  });
}

function animateCounters() {
  counters.forEach((counter) => {
    if (counter.dataset.animated === 'true') {
      return;
    }

    const target = Number(counter.dataset.target);
    const duration = 1300;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      counter.textContent = String(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = String(target);
        counter.dataset.animated = 'true';
      }
    };

    requestAnimationFrame(step);
  });
}

// ─── Stagger card delays ───────────────────────────────────────────────────
document.querySelectorAll(
  '.skills-grid .skill-card, .achievements-grid .achievement-card, .project-grid .project-card'
).forEach((card, i) => {
  card.style.setProperty('--stagger', `${i * 70}ms`);
});

// ─── Boot ─────────────────────────────────────────────────────────────────
initParticles();
initTypewriter();
initCardTilt();

// ─── Timeline draw ────────────────────────────────────────────────────────
const timelineEl = document.querySelector('.timeline');
if (timelineEl) {
  const tlObs = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('drawn'); }),
    { threshold: 0.2 }
  );
  tlObs.observe(timelineEl);
}

// ─── Particle network ─────────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles, raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: 60 }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r:  Math.random() * 1.8 + 0.8
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = root.getAttribute('data-theme') === 'dark';
    const dotC = dark ? 'rgba(129,140,248,0.7)' : 'rgba(99,102,241,0.5)';
    const rgb  = dark ? '129,140,248' : '99,102,241';

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotC;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / 130) * 0.32})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); makeParticles(); draw(); });
}

// ─── Typewriter ───────────────────────────────────────────────────────────
function initTypewriter() {
  const el = document.querySelector('.hero-typewriter');
  if (!el) return;
  const lines = [
    'AUTOSAR | BSW – COM, DCM, DEM | RTE',
    'UDS Diagnostics | DIDs | Routines | DTCs',
    'CAN | CAN FD | FlexRay | Embedded C',
    'TESSY | CANoe | CANape | TRACE32 | GLIWA T1',
    'Python & CAPL Automation | vTestStudio'
  ];
  let l = 0, c = 0, del = false;
  function tick() {
    const cur = lines[l];
    el.textContent = del ? cur.slice(0, c - 1) : cur.slice(0, c + 1);
    del ? c-- : c++;
    if (!del && c === cur.length) { del = true; setTimeout(tick, 2000); return; }
    if (del  && c === 0)          { del = false; l = (l + 1) % lines.length; }
    setTimeout(tick, del ? 35 : 68);
  }
  tick();
}

// ─── Card 3D tilt ─────────────────────────────────────────────────────────
function initCardTilt() {
  document.querySelectorAll('.skill-card, .project-card, .counter-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left)  / r.width  - 0.5) * 14;
      const y = ((e.clientY - r.top)   / r.height - 0.5) * -14;
      card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

updateActiveNavLink();
