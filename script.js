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

// Form validation and submission
const form = document.getElementById('contactForm');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const mensajeInput = document.getElementById('mensaje');
const submitBtn = document.querySelector('.submit-btn');
const successMessage = document.getElementById('successMessage');

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

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

        // Simulate form submission (replace with actual form submission)
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