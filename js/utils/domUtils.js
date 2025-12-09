/* ==================== ОСНОВНЫЕ ФУНКЦИИ ==================== */
const DomUtils = {
    createElement(type, props, ...children) {
        try {
            return React.createElement(type, props, ...children);
        } catch (error) {
            console.error('Error creating element:', error);
            return React.createElement('div', null, 'Ошибка отображения');
        }
    },

    scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    },

    createResizeHandler(callback, delay = 100) {
        let timeoutId;
        return function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(callback, delay);
        };
    },

    /* ==================== ИЗОБРАЖЕНИЯ ==================== */
    supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = function() {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    },

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    /* ==================== УТИЛИТЫ ==================== */
    setElementVisibility(element, visible) {
        if (element) {
            element.style.display = visible ? '' : 'none';
        }
    },

    addClass(element, className) {
        if (element) {
            element.classList.add(`app-${className}`);
        }
    }
};

window.DomUtils = DomUtils;