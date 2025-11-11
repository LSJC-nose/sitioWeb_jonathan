// Script principal para interactividad del sitio web

// Función para agregar efecto de scroll suave
document.addEventListener('DOMContentLoaded', function() {
    // Agregar animación de fade-in a las tarjetas
    const cards = document.querySelectorAll('.info-card, .exercise-card, .chart-section, .member-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(card);
    });

    // Agregar funcionalidad a los detalles/desplegables
    const details = document.querySelectorAll('details');
    details.forEach(detail => {
        detail.addEventListener('toggle', function() {
            if (this.open) {
                // Animación cuando se abre
                const codeBlock = this.querySelector('pre');
                if (codeBlock) {
                    codeBlock.style.animation = 'fadeIn 0.3s ease';
                }
            }
        });
    });
});

/* Carrusel de imágenes: inicializador */
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const indicators = carousel.querySelector('.carousel-indicators');
        if (!track || slides.length === 0) return;

        let current = 0;
        let intervalId = null;
        const autoplay = carousel.dataset.autoplay === 'true';
        const interval = parseInt(carousel.dataset.interval, 10) || 4000;

        // Crear indicadores
        slides.forEach((_, idx) => {
            const btn = document.createElement('button');
            btn.setAttribute('aria-label', `Ir a la diapositiva ${idx + 1}`);
            btn.setAttribute('role', 'tab');
            btn.dataset.index = idx;
            if (idx === 0) btn.setAttribute('aria-selected', 'true');
            indicators.appendChild(btn);
            btn.addEventListener('click', () => {
                goToSlide(idx);
            });
        });

        function update() {
            const offset = -current * carousel.clientWidth;
            track.style.transform = `translateX(${offset}px)`;
            // actualizar indicadores
            Array.from(indicators.children).forEach((b, i) => {
                b.setAttribute('aria-selected', i === current ? 'true' : 'false');
            });
        }

        function goToSlide(index) {
            current = (index + slides.length) % slides.length;
            update();
            resetAutoplay();
        }

        function next() { goToSlide(current + 1); }
        function prev() { goToSlide(current - 1); }

        if (nextBtn) nextBtn.addEventListener('click', next);
        if (prevBtn) prevBtn.addEventListener('click', prev);

        // Autoplay
        function startAutoplay() {
            if (!autoplay) return;
            stopAutoplay();
            intervalId = setInterval(next, interval);
        }

        function stopAutoplay() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Pausar al hover/foco
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        carousel.addEventListener('focusin', stopAutoplay);
        carousel.addEventListener('focusout', startAutoplay);

        // Soporte teclado: flechas
        carousel.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });

        // Ajustar al redimensionar
        window.addEventListener('resize', function() {
            update();
        });

        // Habilitar swipe simple para móviles
        let startX = 0;
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        }, {passive: true});
        carousel.addEventListener('touchend', function(e) {
            const dx = (e.changedTouches[0].clientX - startX);
            if (Math.abs(dx) > 40) {
                if (dx < 0) next(); else prev();
            }
        });

        // Inicializar
        update();
        startAutoplay();
    });
});

// Función para resaltar código al hacer clic
document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        block.addEventListener('click', function() {
            // Seleccionar texto al hacer doble clic
            if (window.getSelection) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(this);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });

        // Agregar efecto visual
        block.style.cursor = 'text';
        block.title = 'Doble clic para seleccionar todo el código';
    });
});

// Enlaces dinámicos para botones "Ver en Drive"
document.addEventListener('DOMContentLoaded', function() {
    const driveButtons = document.querySelectorAll('a.drive-btn');

    // Mapeo de enlaces directos (pegar aquí los enlaces que quieras que estén embebidos)
    // Edita las claves para que coincidan con los atributos `data-key` de tus enlaces en el HTML.
    // Ejemplo:
    //   <a class="drive-btn" data-key="ejercicio1">Ver en Drive</a>
    //   y en el mapeo: 'ejercicio1': 'https://drive.google.com/...'
    const DRIVE_LINKS = {
        // Rellena con tus enlaces directos:
        // 'ejercicio1': 'https://drive.google.com/file/d/ID/view?usp=sharing',
        // 'ejercicio2': 'https://drive.google.com/drive/folders/ID',
    };

    // Inicializar botones: preferir override en localStorage, luego enlace embebido en DRIVE_LINKS, si no existe dejar '#'.
    // Añadimos soporte de edición/borrado: Shift+clic abre un prompt para reemplazar o borrar el enlace (BORRAR elimina el override local).
    driveButtons.forEach(btn => {
        const key = btn.getAttribute('data-key');
        if (!key) return;

        const hasEmbedded = DRIVE_LINKS.hasOwnProperty(key) && DRIVE_LINKS[key];
        const savedUrl = localStorage.getItem(`drive-url:${key}`);

        if (savedUrl) {
            btn.setAttribute('href', savedUrl);
            btn.dataset.linkSource = 'local';
        } else if (hasEmbedded) {
            btn.setAttribute('href', DRIVE_LINKS[key]);
            btn.dataset.linkSource = 'embedded';
        } else {
            btn.setAttribute('href', '#');
            btn.dataset.linkSource = 'none';
        }
        btn.setAttribute('target', '_blank');

        // Indicar al usuario cómo editar
        btn.title = 'Shift+clic para editar/eliminar el enlace; clic normal para abrir (si existe)';

        btn.addEventListener('click', function(event) {
            // Shift+clic => editar o borrar
            if (event.shiftKey) {
                event.preventDefault();
                const currentSource = btn.dataset.linkSource;
                const currentHref = btn.getAttribute('href');

                let promptMsg = 'Pega el nuevo enlace (https://...) o escribe BORRAR para eliminarlo:';
                if (currentSource === 'embedded') {
                    promptMsg = 'ATENCIÓN: Este enlace está embebido en el código y no puede borrarse desde aquí. Pega un nuevo enlace para sobreescribir localmente, o escribe BORRAR para eliminar cualquier override local.';
                }

                const input = prompt(promptMsg, (currentHref && currentHref !== '#') ? currentHref : '');
                if (input === null) return; // cancelado

                const normalized = input.trim();
                if (/^https?:\/\//i.test(normalized)) {
                    // Guardar override en localStorage
                    localStorage.setItem(`drive-url:${key}`, normalized);
                    btn.setAttribute('href', normalized);
                    btn.dataset.linkSource = 'local';
                    btn.setAttribute('target', '_blank');
                    // Abrir el enlace nuevo
                    window.open(normalized, '_blank');
                } else if (normalized.toUpperCase() === 'BORRAR' || normalized === '') {
                    // Eliminar override local
                    localStorage.removeItem(`drive-url:${key}`);
                    if (hasEmbedded) {
                        btn.setAttribute('href', DRIVE_LINKS[key]);
                        btn.dataset.linkSource = 'embedded';
                    } else {
                        btn.setAttribute('href', '#');
                        btn.dataset.linkSource = 'none';
                    }
                    alert('Se eliminó el enlace guardado localmente. Si el enlace está embebido en el código, para borrarlo debes editar `script.js`.');
                } else {
                    alert('Por favor ingresa un enlace válido (https://...) o escribe BORRAR para eliminar.');
                }
                return;
            }

            // Clic normal: si no hay enlace, pedirla al usuario y guardarla
            const cur = btn.getAttribute('href');
            if (!cur || cur === '#') {
                event.preventDefault();
                const inputs = prompt('Pega el enlace de Google Drive para este ejercicio:');
                if (inputs && /^https?:\/\//i.test(inputs)) {
                    localStorage.setItem(`drive-url:${key}`, inputs);
                    btn.setAttribute('href', inputs);
                    btn.dataset.linkSource = 'local';
                    btn.setAttribute('target', '_blank');
                    window.open(inputs, '_blank');
                } else if (inputs !== null) {
                    alert('Por favor ingresa un enlace válido (https://...)');
                }
            }
            // Si hay href válido, dejar que el enlace abra en nueva pestaña (target='_blank')
        });
    });
});

// Animación CSS adicional (para ser agregada dinámicamente si es necesario)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Animación para los badges */
    .badge {
        animation: pulse 6s ease-in-out infinite;
        opacity: 0.95;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.92;
        }
    }

    /* Hover effect mejorado para tarjetas */
    .info-card:hover,
    .exercise-card:hover,
    .member-card:hover {
        transform: translateY(-3px);
    }
`;
document.head.appendChild(style);

// Funcionalidad adicional para mejorar la experiencia del usuario
console.log('Sitio web de Pentaho cargado correctamente');

// Toggle del menú en móviles (hamburguesa)
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Asegurar que el menú se cierre al redimensionar a escritorio
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

