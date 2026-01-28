// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Parallax effect for floating shapes
window.addEventListener('scroll', () => {
    const shapes = document.querySelectorAll('.shape');
    const scrolled = window.pageYOffset;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Card entrance animation
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .event-item, .exhibition-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// SLIDER FUNCTIONALITY
class Slider {
    constructor(sliderId) {
        this.track = document.getElementById(sliderId);
        if (!this.track) return;
        
        this.slides = this.track.querySelectorAll('.slider-item');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        
        // Get dots container
        this.dotsContainer = document.getElementById(sliderId.replace('slider', 'dots'));
        
        // Create dots
        this.createDots();
        
        // Get buttons
        this.prevBtn = document.querySelector(`[data-slider="${sliderId}"].prev`);
        this.nextBtn = document.querySelector(`[data-slider="${sliderId}"].next`);
        
        // Event listeners
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
        
        // Touch events for mobile swipe
        this.startX = 0;
        this.track.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = this.startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });
        
        // Auto update on window resize
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
        const dots = this.dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    updateSlider() {
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        this.updateDots();
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }
}

// Initialize sliders when DOM is loaded
let sliders = [];

// CALENDAR GENERATION
const calendarSchedule = {
    // Lunes: de 13 a 21
    lunes: [
        { time: '9-13', available: false },
        { time: '13-17', available: true },
        { time: '17-21', available: true }
    ],
    // Martes: Completo
    martes: [
        { time: '9-21', available: true, fullDay: true }
    ],
    // Miércoles: de 9 a 17
    miercoles: [
        { time: '9-13', available: true },
        { time: '13-17', available: true },
        { time: '17-21', available: false }
    ],
    // Jueves: de 13-21
    jueves: [
        { time: '9-13', available: false },
        { time: '13-17', available: true },
        { time: '17-21', available: true }
    ],
    // Viernes: de 13 a 17
    viernes: [
        { time: '9-13', available: false },
        { time: '13-17', available: true },
        { time: '17-21', available: false }
    ],
    // Sábado y Domingo: No disponibles
    sabado: [
        { time: '9-13', available: false },
        { time: '13-17', available: false },
        { time: '17-21', available: false }
    ],
    domingo: [
        { time: '9-13', available: false },
        { time: '13-17', available: false },
        { time: '17-21', available: false }
    ]
};

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;

    // March 2026 calendar - starts on Sunday
    const daysInMarch = 31;
    const firstDayOfWeek = 0; // Sunday (March 1, 2026 is a Sunday)
    const daysOfWeek = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const daysOfWeekDisplay = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    let html = '';
    let currentDay = firstDayOfWeek;

    for (let day = 1; day <= daysInMarch; day++) {
        const dayName = daysOfWeek[currentDay];
        const dayNameDisplay = daysOfWeekDisplay[currentDay];
        const schedule = calendarSchedule[dayName];

        html += `
            <div class="calendar-day">
                <div class="calendar-day-header">${day} MAR — ${dayNameDisplay}</div>
                <div class="calendar-slots">
        `;

        schedule.forEach(slot => {
            const availableClass = slot.available ? 'available' : 'occupied';
            const fullDayClass = slot.fullDay ? 'full-day' : '';
            const price = slot.fullDay ? '$8000' : '$3000';
            const text = slot.fullDay ? `TODO EL DÍA ${slot.time} — ${price}` : `${slot.time}HS — ${price}`;
            
            html += `
                <div class="calendar-slot ${availableClass} ${fullDayClass}" 
                     data-day="${day}" 
                     data-month="MARZO" 
                     data-time="${slot.time}"
                     data-price="${price}"
                     data-full-day="${slot.fullDay || false}">
                    ${text}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        currentDay = (currentDay + 1) % 7;
    }

    calendar.innerHTML = html;

    // Add click handlers to available slots
    document.querySelectorAll('.calendar-slot.available').forEach(slot => {
        slot.addEventListener('click', function() {
            openBookingModal(this);
        });
    });
}

// BOOKING MODAL
const bookingModal = document.getElementById('bookingModal');
const modalClose = document.getElementById('modalClose');
const bookingForm = document.getElementById('bookingForm');
let selectedSlot = null;

function openBookingModal(slot) {
    selectedSlot = {
        day: slot.dataset.day,
        month: slot.dataset.month,
        time: slot.dataset.time,
        price: slot.dataset.price,
        fullDay: slot.dataset.fullDay === 'true'
    };

    const bookingInfo = document.getElementById('bookingInfo');
    const type = selectedSlot.fullDay ? 'ESTUDIO COMPLETO' : 'ESTUDIO I';
    
    bookingInfo.innerHTML = `
        <strong>RESERVA SELECCIONADA:</strong>
        ${selectedSlot.day} DE ${selectedSlot.month}<br>
        HORARIO: ${selectedSlot.time}HS<br>
        TIPO: ${type}<br>
        PRECIO: ${selectedSlot.price}
    `;

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

bookingModal.addEventListener('click', function(e) {
    if (e.target === bookingModal) {
        closeBookingModal();
    }
});

// Booking form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showBookingError(input, errorId, message) {
    input.classList.add('error');
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearBookingError(input, errorId) {
    input.classList.remove('error');
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function clearBookingErrors() {
    const inputs = ['bookingNombre', 'bookingEmail', 'bookingCelular'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const errorId = inputId + 'Error';
        if (input) clearBookingError(input, errorId);
    });
}

// Add input listeners for booking form
const bookingNombre = document.getElementById('bookingNombre');
const bookingEmail = document.getElementById('bookingEmail');
const bookingCelular = document.getElementById('bookingCelular');

if (bookingNombre) bookingNombre.addEventListener('input', () => clearBookingError(bookingNombre, 'bookingNombreError'));
if (bookingEmail) bookingEmail.addEventListener('input', () => clearBookingError(bookingEmail, 'bookingEmailError'));
if (bookingCelular) bookingCelular.addEventListener('input', () => clearBookingError(bookingCelular, 'bookingCelularError'));

// Handle booking form submission
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    clearBookingErrors();

    // Validate nombre
    if (bookingNombre.value.trim() === '') {
        showBookingError(bookingNombre, 'bookingNombreError', 'Ingresá tu nombre');
        isValid = false;
    }

    // Validate email
    if (bookingEmail.value.trim() === '') {
        showBookingError(bookingEmail, 'bookingEmailError', 'Ingresá tu email');
        isValid = false;
    } else if (!validateEmail(bookingEmail.value.trim())) {
        showBookingError(bookingEmail, 'bookingEmailError', 'Ingresá un email válido');
        isValid = false;
    }

    // Validate celular
    if (bookingCelular.value.trim() === '') {
        showBookingError(bookingCelular, 'bookingCelularError', 'Ingresá tu celular');
        isValid = false;
    }

    if (isValid && selectedSlot) {
        const submitBtn = bookingForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'ENVIANDO...';

        // Prepare email data
        const bookingData = {
            nombre: bookingNombre.value.trim(),
            email: bookingEmail.value.trim(),
            celular: bookingCelular.value.trim(),
            fecha: `${selectedSlot.day} DE ${selectedSlot.month}`,
            horario: selectedSlot.time,
            tipo: selectedSlot.fullDay ? 'ESTUDIO COMPLETO' : 'ESTUDIO I',
            precio: selectedSlot.price
        };

        // Create email body
        const emailSubject = encodeURIComponent(`RESERVA ESTUDIO - ${bookingData.fecha}`);
        const emailBody = encodeURIComponent(`
NUEVA RESERVA DE ESTUDIO

DATOS DEL CLIENTE:
Nombre: ${bookingData.nombre}
Email: ${bookingData.email}
Celular: ${bookingData.celular}

DETALLES DE LA RESERVA:
Fecha: ${bookingData.fecha}
Horario: ${bookingData.horario}HS
Tipo: ${bookingData.tipo}
Precio: ${bookingData.precio}
        `);

        // Open email client (change HOLA@BRUT.STUDIO to your actual email)
        window.location.href = `mailto:HOLA@BRUT.STUDIO?subject=${emailSubject}&body=${emailBody}`;

        // Show success message
        setTimeout(() => {
            bookingForm.reset();
            document.getElementById('bookingSuccess').classList.add('show');
            submitBtn.disabled = false;
            submitBtn.textContent = 'CONFIRMAR RESERVA';

            // Close modal after 3 seconds
            setTimeout(() => {
                closeBookingModal();
            }, 3000);
        }, 500);
    }
});

// Form validation and submission (Contact form)
const form = document.getElementById('contactForm');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const mensajeInput = document.getElementById('mensaje');
const submitBtn = document.querySelector('#contactForm .submit-btn');
const successMessage = document.getElementById('successMessage');

function showError(input, errorId, message) {
    input.classList.add('error');
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearError(input, errorId) {
    input.classList.remove('error');
    document.getElementById(errorId).classList.remove('show');
}

nombreInput.addEventListener('input', () => clearError(nombreInput, 'nombreError'));
emailInput.addEventListener('input', () => clearError(emailInput, 'emailError'));
mensajeInput.addEventListener('input', () => clearError(mensajeInput, 'mensajeError'));

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;

    // Clear previous errors
    clearError(nombreInput, 'nombreError');
    clearError(emailInput, 'emailError');
    clearError(mensajeInput, 'mensajeError');

    // Validate nombre
    if (nombreInput.value.trim() === '') {
        showError(nombreInput, 'nombreError', 'Por favor ingresá tu nombre');
        isValid = false;
    }

    // Validate email
    if (emailInput.value.trim() === '') {
        showError(emailInput, 'emailError', 'Por favor ingresá tu email');
        isValid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
        showError(emailInput, 'emailError', 'Por favor ingresá un email válido');
        isValid = false;
    }

    // Validate mensaje
    if (mensajeInput.value.trim() === '') {
        showError(mensajeInput, 'mensajeError', 'Por favor ingresá tu mensaje');
        isValid = false;
    }

    if (isValid) {
        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'ENVIANDO...';

        // Create email
        const contactSubject = encodeURIComponent('CONTACTO DESDE BRUT.STUDIO');
        const contactBody = encodeURIComponent(`
Nombre: ${nombreInput.value.trim()}
Email: ${emailInput.value.trim()}

Mensaje:
${mensajeInput.value.trim()}
        `);

        window.location.href = `mailto:HOLA@BRUT.STUDIO?subject=${contactSubject}&body=${contactBody}`;

        // Simulate form submission
        setTimeout(() => {
            // Reset form
            form.reset();
            
            // Show success message
            successMessage.classList.add('show');
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = 'ENVIAR';

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
        }, 1000);
    }
});

// Hide scroll indicator on scroll
let scrollTimeout;
const scrollIndicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
});

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sliders
    sliders.push(new Slider('slider1'));
    sliders.push(new Slider('slider2'));
    
    // Generate calendar
    generateCalendar();
});