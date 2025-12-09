/* ==================== СВЕТЛАЯ ТЕМА ==================== */
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.style.colorScheme = 'light';
document.body.classList.add('light-theme');

function enforceLightTheme() {
    document.documentElement.style.colorScheme = 'light';
    document.body.classList.remove('dark', 'dark-theme', 'dark-mode');
    document.body.classList.add('light-theme');

    const themeColorMeta = document.querySelector('meta[name="theme-color"]') ||
        (() => {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
            return meta;
        })();
    themeColorMeta.content = '#45AEAC';
}

/* ==================== ПРИЛОЖЕНИЕ ==================== */
const App = () => {
    const scrollToSection = React.useCallback((sectionId) => {
        DomUtils.scrollToElement(sectionId, 80);
    }, []);

    return DomUtils.createElement('div', { className: 'app' },
        DomUtils.createElement(Header),

        DomUtils.createElement('main', { className: 'app__main' },
            DomUtils.createElement('div', { className: 'container' },
                DomUtils.createElement('button', {
                    className: 'btn btn--primary btn--full mb-4',
                    onClick: () => scrollToSection('graphics')
                }, 'К графикам'),

                DomUtils.createElement('button', {
                    className: 'btn btn--secondary btn--full mb-6',
                    onClick: () => scrollToSection('team')
                }, 'О нас'),

                DomUtils.createElement('hr', { className: 'divider' }),

                DomUtils.createElement('section', { id: 'graphics' },
                    DomUtils.createElement(ChartContainerChartJS)
                ),

                DomUtils.createElement('hr', { className: 'divider' }),

                DomUtils.createElement('section', { id: 'team' },
                    DomUtils.createElement('h2', { className: 'section-title' },
                        'Участники проекта'
                    ),
                    DomUtils.createElement(TeamCarousel)
                )
            )
        ),

        DomUtils.createElement(Footer)
    );
};

/* ==================== ИНИЦИАЛИЗАЦИЯ ==================== */
const initApp = () => {
    try {
        enforceLightTheme();
        DomUtils.setupLazyLoading();

        ReactDOM.render(
            DomUtils.createElement(App),
            document.getElementById('root')
        );

        console.log('Приложение запущено');

    } catch (error) {
        console.error('Ошибка инициализации:', error);

        document.getElementById('root').innerHTML = `
            <div style="padding: 3rem; text-align: center; background: white; color: #1a1a1a;">
                <h2 style="margin-bottom: 1rem;">⚠️ Ошибка</h2>
                <p style="margin-bottom: 1.5rem;">При загрузке приложения возникла проблема.</p>
                <button onclick="window.location.reload()"
                        style="padding: 0.75rem 1.5rem; background: #45AEAC; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                    Обновить страницу
                </button>
            </div>
        `;
    }
};

/* ==================== ЗАПУСК ==================== */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/* ==================== ПЕРИОДИЧЕСКАЯ ПРОВЕРКА ==================== */
setInterval(enforceLightTheme, 1000);