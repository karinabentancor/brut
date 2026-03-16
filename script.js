// ─── CURSOR PERSONALIZADO ───────────────────────────────────────────────────
const cursorEl = document.createElement('div');
cursorEl.className = 'custom-cursor';
document.body.appendChild(cursorEl);

let cursorX = -100, cursorY = -100;
let cursorTargetX = -100, cursorTargetY = -100;

document.addEventListener('mousemove', e => {
    cursorTargetX = e.clientX;
    cursorTargetY = e.clientY;
});

function animateCursor() {
    cursorX += (cursorTargetX - cursorX) * 0.12;
    cursorY += (cursorTargetY - cursorY) * 0.12;
    cursorEl.style.left = cursorX + 'px';
    cursorEl.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// ─── NAV LINE (CUERDA) ──────────────────────────────────────────────────────
const navSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
navSvg.setAttribute('width','100%');
navSvg.setAttribute('height','20');
navSvg.style.cssText = 'position:absolute;bottom:-19px;left:0;overflow:visible;z-index:100;pointer-events:none;';
const ropePathEl = document.createElementNS('http://www.w3.org/2000/svg','path');
ropePathEl.setAttribute('fill','none');
ropePathEl.setAttribute('stroke','#000');
ropePathEl.setAttribute('stroke-width','1');
navSvg.appendChild(ropePathEl);
document.querySelector('nav').appendChild(navSvg);

let ropeT = 0;
let ropeW = window.innerWidth;
window.addEventListener('resize', () => ropeW = window.innerWidth);

function animateRope() {
    ropeT += 0.012;
    const pts = [];
    const segs = 12;
    for (let i = 0; i <= segs; i++) {
        const x = (i / segs) * ropeW;
        const p = i / segs;
        const sag = 6 * Math.sin(p * Math.PI);
        const wobble =
            Math.sin(ropeT * 1.1 + p * 3.7) * 2.2 +
            Math.sin(ropeT * 0.7 + p * 6.1) * 1.1 +
            Math.sin(ropeT * 1.8 + p * 2.3) * 0.8;
        pts.push([x, sag + wobble]);
    }
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i+1][0]) / 2;
        const my = (pts[i][1] + pts[i+1][1]) / 2;
        d += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
    }
    d += ` L ${pts[pts.length-1][0]} ${pts[pts.length-1][1]}`;
    ropePathEl.setAttribute('d', d);
    requestAnimationFrame(animateRope);
}
animateRope();

// ─── HERO CANVAS: SWIM + LADRILLO ───────────────────────────────────────────
const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
    const hctx = heroCanvas.getContext('2d');
    let HW, HH;
    let mouse = { x: -999, y: -999 };
    let swimParticles = [];
    let dustParticles = [];
    let brickCracks = [];

    function heroResize() {
        HW = heroCanvas.width = heroCanvas.offsetWidth;
        HH = heroCanvas.height = heroCanvas.offsetHeight;
        initBricks();
    }

    // Grietas de ladrillo — líneas horizontales y verticales de fondo
    function initBricks() {
        brickCracks = [];
        const bH = 28, bW = 72;
        for (let row = 0; row < Math.ceil(HH / bH) + 1; row++) {
            const offset = (row % 2) * (bW / 2);
            // línea horizontal
            brickCracks.push({ type: 'h', y: row * bH, x1: 0, x2: HW, opacity: 0.04 + Math.random() * 0.03 });
            for (let col = 0; col < Math.ceil(HW / bW) + 1; col++) {
                const x = col * bW + offset;
                brickCracks.push({ type: 'v', x, y1: row * bH, y2: (row + 1) * bH, opacity: 0.04 + Math.random() * 0.03 });
            }
        }
    }

    // Partículas de desgrane — caen desde arriba como polvo de ladrillo viejo
    function spawnDust() {
        if (dustParticles.length < 120 && Math.random() < 0.55) {
            dustParticles.push({
                x: Math.random() * HW,
                y: -5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: 0.3 + Math.random() * 0.8,
                size: 1.5 + Math.random() * 3.5,
                opacity: 0.3 + Math.random() * 0.4,
                life: 1,
                decay: 0.002 + Math.random() * 0.004,
                color: Math.random() > 0.5 ? '#8B4513' : '#A0522D'
            });
        }
    }

    // Partículas swim — siguen el mouse con inercia, nadan suavemente
    function initSwim() {
        swimParticles = [];
        for (let i = 0; i < 35; i++) {
            swimParticles.push({
                x: Math.random() * HW,
                y: Math.random() * HH,
                vx: 0, vy: 0,
                size: 2.5 + Math.random() * 5,
                opacity: 0.18 + Math.random() * 0.38,
                phase: Math.random() * Math.PI * 2,
                speed: 0.004 + Math.random() * 0.008,
                radius: 60 + Math.random() * 140,
                baseX: Math.random() * HW,
                baseY: Math.random() * HH,
            });
        }
    }

    heroCanvas.closest('section').addEventListener('mousemove', e => {
        const rect = heroCanvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    heroCanvas.closest('section').addEventListener('mouseleave', () => {
        mouse.x = -999; mouse.y = -999;
    });

    let heroT = 0;
    function heroLoop() {
        heroT += 0.016;
        hctx.clearRect(0, 0, HW, HH);

        // Fondo blanco
        hctx.fillStyle = '#fff';
        hctx.fillRect(0, 0, HW, HH);

        // Ladrillo de fondo — grilla muy sutil
        brickCracks.forEach(c => {
            hctx.beginPath();
            hctx.strokeStyle = `rgba(0,0,0,${c.opacity})`;
            hctx.lineWidth = 0.5;
            if (c.type === 'h') {
                hctx.moveTo(c.x1, c.y);
                hctx.lineTo(c.x2, c.y);
            } else {
                hctx.moveTo(c.x, c.y1);
                hctx.lineTo(c.x, c.y2);
            }
            hctx.stroke();
        });

        // Partículas swim
        swimParticles.forEach(p => {
            p.phase += p.speed;
            // base drift circular
            const targetX = p.baseX + Math.cos(p.phase) * p.radius * 0.3;
            const targetY = p.baseY + Math.sin(p.phase * 0.7) * p.radius * 0.2;

            // atracción suave al mouse
            if (mouse.x > 0) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const pull = Math.max(0, 1 - dist / 280) * 0.025;
                p.vx += dx * pull;
                p.vy += dy * pull;
            }

            // hacia base
            p.vx += (targetX - p.x) * 0.003;
            p.vy += (targetY - p.y) * 0.003;

            // fricción
            p.vx *= 0.94;
            p.vy *= 0.94;

            p.x += p.vx;
            p.y += p.vy;

            const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
            const stretch = 1 + speed * 0.6;
            const angle = Math.atan2(p.vy, p.vx);

            hctx.save();
            hctx.translate(p.x, p.y);
            hctx.rotate(angle);
            hctx.globalAlpha = p.opacity;
            hctx.fillStyle = '#000';
            hctx.beginPath();
            hctx.ellipse(0, 0, p.size * stretch, p.size / stretch, 0, 0, Math.PI * 2);
            hctx.fill();
            hctx.restore();
        });

        // Desgrane de ladrillo
        spawnDust();
        dustParticles = dustParticles.filter(d => d.life > 0);
        dustParticles.forEach(d => {
            d.x += d.vx;
            d.y += d.vy;
            d.vy += 0.015;
            d.life -= d.decay;
            hctx.beginPath();
            hctx.globalAlpha = d.opacity * d.life;
            hctx.fillStyle = d.color;
            hctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            hctx.fill();
        });

        hctx.globalAlpha = 1;
        requestAnimationFrame(heroLoop);
    }

    window.addEventListener('resize', () => {
        heroResize();
        initSwim();
    });

    heroResize();
    initSwim();
    heroLoop();
}

// ─── SMOOTH SCROLL ──────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ─── ACTIVE NAV ─────────────────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const id = section.getAttribute('id');
        if (scrollY > top && scrollY <= top + section.offsetHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
            });
        }
    });
}
window.addEventListener('scroll', updateActiveNav);

// ─── CARD ENTRANCE ──────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            entry.target.style.opacity = '1';
        }
    });
}, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.card, .event-item, .exhibition-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ─── SLIDER ─────────────────────────────────────────────────────────────────
class Slider {
    constructor(sliderId) {
        this.track = document.getElementById(sliderId);
        if (!this.track) return;
        this.slides = this.track.querySelectorAll('.slider-item');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.dotsContainer = document.getElementById(sliderId.replace('slider', 'dots'));
        this.createDots();
        this.prevBtn = document.querySelector(`[data-slider="${sliderId}"].prev`);
        this.nextBtn = document.querySelector(`[data-slider="${sliderId}"].next`);
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
        this.startX = 0;
        this.track.addEventListener('touchstart', e => { this.startX = e.touches[0].clientX; });
        this.track.addEventListener('touchend', e => {
            const diff = this.startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
        });
        window.addEventListener('resize', () => this.updateSlider());
    }
    createDots() {
        if (!this.dotsContainer) return;
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    updateDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }
    updateSlider() {
        this.track.style.transform = `translateX(${-this.currentIndex * 100}%)`;
        this.updateDots();
    }
    next() { this.currentIndex = (this.currentIndex + 1) % this.totalSlides; this.updateSlider(); }
    prev() { this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides; this.updateSlider(); }
    goToSlide(i) { this.currentIndex = i; this.updateSlider(); }
}

// ─── CALENDAR ───────────────────────────────────────────────────────────────
const calendarSchedule = {
    lunes: [{ time: '9-13', available: false }, { time: '13-17', available: true }, { time: '17-21', available: true }],
    martes: [{ time: '9-21', available: true, fullDay: true }],
    miercoles: [{ time: '9-13', available: true }, { time: '13-17', available: true }, { time: '17-21', available: false }],
    jueves: [{ time: '9-13', available: false }, { time: '13-17', available: true }, { time: '17-21', available: true }],
    viernes: [{ time: '9-13', available: false }, { time: '13-17', available: true }, { time: '17-21', available: false }],
    sabado: [{ time: '9-13', available: false }, { time: '13-17', available: false }, { time: '17-21', available: false }],
    domingo: [{ time: '9-13', available: false }, { time: '13-17', available: false }, { time: '17-21', available: false }]
};

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    const daysOfWeek = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const daysDisplay = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
    let html = '';
    let currentDay = 0;
    for (let day = 1; day <= 31; day++) {
        const dayName = daysOfWeek[currentDay];
        const schedule = calendarSchedule[dayName];
        html += `<div class="calendar-day"><div class="calendar-day-header">${day} MAR — ${daysDisplay[currentDay]}</div><div class="calendar-slots">`;
        schedule.forEach(slot => {
            const price = slot.fullDay ? '$8000' : '$3000';
            const text = slot.fullDay ? `TODO EL DÍA ${slot.time} — ${price}` : `${slot.time}HS — ${price}`;
            html += `<div class="calendar-slot ${slot.available ? 'available' : 'occupied'} ${slot.fullDay ? 'full-day' : ''}" data-day="${day}" data-month="MARZO" data-time="${slot.time}" data-price="${price}" data-full-day="${slot.fullDay || false}">${text}</div>`;
        });
        html += `</div></div>`;
        currentDay = (currentDay + 1) % 7;
    }
    calendar.innerHTML = html;
    document.querySelectorAll('.calendar-slot.available').forEach(slot => {
        slot.addEventListener('click', () => openBookingModal(slot));
    });
}

// ─── BOOKING MODAL ──────────────────────────────────────────────────────────
const bookingModal = document.getElementById('bookingModal');
const modalClose = document.getElementById('modalClose');
const bookingForm = document.getElementById('bookingForm');
let selectedSlot = null;

function openBookingModal(slot) {
    selectedSlot = { day: slot.dataset.day, month: slot.dataset.month, time: slot.dataset.time, price: slot.dataset.price, fullDay: slot.dataset.fullDay === 'true' };
    document.getElementById('bookingInfo').innerHTML = `<strong>RESERVA SELECCIONADA:</strong>${selectedSlot.day} DE ${selectedSlot.month}<br>HORARIO: ${selectedSlot.time}HS<br>TIPO: ${selectedSlot.fullDay ? 'ESTUDIO COMPLETO' : 'ESTUDIO I'}<br>PRECIO: ${selectedSlot.price}`;
    bookingModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    bookingModal.classList.remove('show');
    document.body.style.overflow = '';
    bookingForm.reset();
    clearBookingErrors();
    document.getElementById('bookingSuccess').classList.remove('show');
}

modalClose.addEventListener('click', closeBookingModal);
bookingModal.addEventListener('click', e => { if (e.target === bookingModal) closeBookingModal(); });

function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function showBookingError(input, errorId, message) {
    input.classList.add('error');
    const el = document.getElementById(errorId);
    el.textContent = message;
    el.classList.add('show');
}

function clearBookingError(input, errorId) {
    input.classList.remove('error');
    const el = document.getElementById(errorId);
    if (el) el.classList.remove('show');
}

function clearBookingErrors() {
    ['bookingNombre','bookingEmail','bookingCelular'].forEach(id => {
        const input = document.getElementById(id);
        if (input) clearBookingError(input, id + 'Error');
    });
}

const bookingNombre = document.getElementById('bookingNombre');
const bookingEmail = document.getElementById('bookingEmail');
const bookingCelular = document.getElementById('bookingCelular');

if (bookingNombre) bookingNombre.addEventListener('input', () => clearBookingError(bookingNombre, 'bookingNombreError'));
if (bookingEmail) bookingEmail.addEventListener('input', () => clearBookingError(bookingEmail, 'bookingEmailError'));
if (bookingCelular) bookingCelular.addEventListener('input', () => clearBookingError(bookingCelular, 'bookingCelularError'));

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;
    clearBookingErrors();
    if (!bookingNombre.value.trim()) { showBookingError(bookingNombre, 'bookingNombreError', 'Ingresá tu nombre'); isValid = false; }
    if (!bookingEmail.value.trim()) { showBookingError(bookingEmail, 'bookingEmailError', 'Ingresá tu email'); isValid = false; }
    else if (!validateEmail(bookingEmail.value.trim())) { showBookingError(bookingEmail, 'bookingEmailError', 'Ingresá un email válido'); isValid = false; }
    if (!bookingCelular.value.trim()) { showBookingError(bookingCelular, 'bookingCelularError', 'Ingresá tu celular'); isValid = false; }
    if (isValid && selectedSlot) {
        const btn = bookingForm.querySelector('.submit-btn');
        btn.disabled = true; btn.textContent = 'ENVIANDO...';
        const s = encodeURIComponent(`RESERVA ESTUDIO - ${selectedSlot.day} DE ${selectedSlot.month}`);
        const b = encodeURIComponent(`NUEVA RESERVA\nNombre: ${bookingNombre.value.trim()}\nEmail: ${bookingEmail.value.trim()}\nCelular: ${bookingCelular.value.trim()}\nFecha: ${selectedSlot.day} DE ${selectedSlot.month}\nHorario: ${selectedSlot.time}HS\nTipo: ${selectedSlot.fullDay ? 'ESTUDIO COMPLETO' : 'ESTUDIO I'}\nPrecio: ${selectedSlot.price}`);
        window.location.href = `mailto:HOLA@DELAGRANPUTA.STUDIO?subject=${s}&body=${b}`;
        setTimeout(() => {
            bookingForm.reset();
            document.getElementById('bookingSuccess').classList.add('show');
            btn.disabled = false; btn.textContent = 'CONFIRMAR RESERVA';
            setTimeout(closeBookingModal, 3000);
        }, 500);
    }
});

// ─── CONTACT FORM ───────────────────────────────────────────────────────────
const form = document.getElementById('contactForm');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const mensajeInput = document.getElementById('mensaje');
const submitBtn = document.querySelector('#contactForm .submit-btn');
const successMessage = document.getElementById('successMessage');

function showError(input, errorId, message) {
    input.classList.add('error');
    const el = document.getElementById(errorId);
    el.textContent = message;
    el.classList.add('show');
}

function clearError(input, errorId) {
    input.classList.remove('error');
    document.getElementById(errorId).classList.remove('show');
}

if (nombreInput) nombreInput.addEventListener('input', () => clearError(nombreInput, 'nombreError'));
if (emailInput) emailInput.addEventListener('input', () => clearError(emailInput, 'emailError'));
if (mensajeInput) mensajeInput.addEventListener('input', () => clearError(mensajeInput, 'mensajeError'));

if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    let isValid = true;
    clearError(nombreInput, 'nombreError');
    clearError(emailInput, 'emailError');
    clearError(mensajeInput, 'mensajeError');
    if (!nombreInput.value.trim()) { showError(nombreInput, 'nombreError', 'Por favor ingresá tu nombre'); isValid = false; }
    if (!emailInput.value.trim()) { showError(emailInput, 'emailError', 'Por favor ingresá tu email'); isValid = false; }
    else if (!validateEmail(emailInput.value.trim())) { showError(emailInput, 'emailError', 'Por favor ingresá un email válido'); isValid = false; }
    if (!mensajeInput.value.trim()) { showError(mensajeInput, 'mensajeError', 'Por favor ingresá tu mensaje'); isValid = false; }
    if (isValid) {
        submitBtn.disabled = true; submitBtn.textContent = 'ENVIANDO...';
        const s = encodeURIComponent('CONTACTO DESDE DELAGRANPUTA.STUDIO');
        const b = encodeURIComponent(`Nombre: ${nombreInput.value.trim()}\nEmail: ${emailInput.value.trim()}\n\nMensaje:\n${mensajeInput.value.trim()}`);
        window.location.href = `mailto:HOLA@DELAGRANPUTA.STUDIO?subject=${s}&body=${b}`;
        setTimeout(() => {
            form.reset();
            successMessage.classList.add('show');
            submitBtn.disabled = false; submitBtn.textContent = 'ENVIAR';
            setTimeout(() => successMessage.classList.remove('show'), 5000);
        }, 1000);
    }
});

// ─── SCROLL INDICATOR ───────────────────────────────────────────────────────
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    window.addEventListener('scroll', () => {
        scrollIndicator.style.opacity = window.pageYOffset > 100 ? '0' : '1';
    });
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    new Slider('slider1');
    new Slider('slider2');
    generateCalendar();
});