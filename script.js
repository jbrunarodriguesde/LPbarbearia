/* ================================================
   BARBEARIA PREMIUM — script.js
================================================ */

/* ---- Ano dinâmico no rodapé ---- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ================================================
   HEADER — scroll & mobile menu
================================================ */
const header    = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);

    const backTop = document.getElementById('back-top');
    if (backTop) backTop.classList.toggle('show', window.scrollY > 500);
}, { passive: true });

navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
});

/* Fecha o menu ao clicar em um link */
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

/* Fecha ao clicar fora */
document.addEventListener('click', e => {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});


/* ================================================
   BACK TO TOP
================================================ */
const backTop = document.getElementById('back-top');
if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


/* ================================================
   ACTIVE NAV LINK conforme scroll
================================================ */
const sections  = document.querySelectorAll('section[id], div[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const onScroll = () => {
    const pos = window.scrollY + 120;
    sections.forEach(sec => {
        const link = document.querySelector(`.nav__link[href="#${sec.id}"]`);
        if (!link) return;
        const inView = pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight;
        link.classList.toggle('active', inView);
    });
};
window.addEventListener('scroll', onScroll, { passive: true });


/* ================================================
   SMOOTH SCROLL para âncoras internas
================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});


/* ================================================
   SCROLL ANIMATIONS (data-aos)
================================================ */
const animateEls = document.querySelectorAll('[data-aos]');

const ioCallback = entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
};

const io = new IntersectionObserver(ioCallback, { threshold: 0.12 });
animateEls.forEach(el => io.observe(el));


/* ================================================
   GALLERY FILTER
================================================ */
const filterBtns  = document.querySelectorAll('.gal-filter');
const galItems    = document.querySelectorAll('.gal-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        galItems.forEach(item => {
            const show = filter === 'all' || item.dataset.cat === filter;
            item.style.display = show ? '' : 'none';

            /* re-anima ao exibir */
            if (show) {
                item.classList.remove('in-view');
                requestAnimationFrame(() => item.classList.add('in-view'));
            }
        });
    });
});


/* ================================================
   LIGHTBOX
================================================ */
const lightbox  = document.getElementById('lightbox');
const lbContent = document.getElementById('lb-content');
const lbClose   = document.getElementById('lb-close');
const lbPrev    = document.getElementById('lb-prev');
const lbNext    = document.getElementById('lb-next');

let lbIndex   = 0;
let lbVisible = [];

galItems.forEach(item => {
    item.addEventListener('click', () => {
        lbVisible = Array.from(galItems).filter(i => i.style.display !== 'none');
        lbIndex   = lbVisible.indexOf(item);
        openLightbox();
    });
});

function openLightbox() {
    const item  = lbVisible[lbIndex];
    const ph    = item.querySelector('.gal-ph');
    const icon  = ph.querySelector('i').className;
    const label = ph.querySelector('span').textContent;

    lbContent.innerHTML = `
        <div style="background:var(--dark-2);padding:3rem 4rem;border-radius:12px;border:1px solid rgba(201,168,76,.2);">
            <i class="${icon}" style="font-size:4.5rem;color:rgba(201,168,76,.35);display:block;margin-bottom:1.25rem;"></i>
            <p style="font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:.5rem;">${label}</p>
            <p style="color:var(--gray);font-size:.8rem;">Substitua pelos seus trabalhos reais</p>
        </div>`;

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lbPrev.addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + lbVisible.length) % lbVisible.length;
    openLightbox();
});

lbNext.addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % lbVisible.length;
    openLightbox();
});

document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
});


/* ================================================
   TESTIMONIALS CAROUSEL
================================================ */
const track      = document.getElementById('carousel-track');
const dotsWrap   = document.getElementById('carousel-dots');
const btnPrev    = document.getElementById('dep-prev');
const btnNext    = document.getElementById('dep-next');
const cards      = track ? Array.from(track.children) : [];

let current  = 0;
let perView  = calcPerView();
let autoplay = null;

function calcPerView() {
    if (window.innerWidth < 768)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
}

function maxSlide() { return Math.max(0, cards.length - perView); }

function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxSlide(); i++) {
        const dot = document.createElement('button');
        dot.className = 'c-dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    }
}

function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.c-dot').forEach((d, i) => d.classList.toggle('active', i === current));
}

function goTo(index) {
    current = Math.max(0, Math.min(index, maxSlide()));
    if (!cards.length) return;
    const gap    = 24; /* 1.5rem */
    const width  = cards[0].offsetWidth + gap;
    track.style.transform = `translateX(-${current * width}px)`;
    updateDots();
}

function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(() => goTo(current >= maxSlide() ? 0 : current + 1), 4500);
}

function stopAutoplay() {
    if (autoplay) { clearInterval(autoplay); autoplay = null; }
}

if (btnPrev) btnPrev.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
if (btnNext) btnNext.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

if (track) {
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    /* Swipe touch */
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 45) goTo(current + (diff > 0 ? 1 : -1));
    });
}

window.addEventListener('resize', () => {
    perView = calcPerView();
    if (current > maxSlide()) current = maxSlide();
    buildDots();
    goTo(current);
}, { passive: true });

/* Init */
if (cards.length) {
    buildDots();
    goTo(0);
    startAutoplay();
}
