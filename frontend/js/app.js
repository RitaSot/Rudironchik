const App = () => {
    const scrollToSection = React.useCallback((sectionId) => {
        DomUtils.scrollToElement(sectionId, 80);
    }, []);

    return DomUtils.createElement('div', { className: 'app' },
        DomUtils.createElement(Header),

        DomUtils.createElement('main', { className: 'app__main' },
            DomUtils.createElement('div', { className: 'container' },
                // Навигационные кнопки
                DomUtils.createElement('button', {
                    className: 'btn btn--primary btn--full mb-4',
                    onClick: () => scrollToSection('graphics')
                }, 'К графикам'),

                DomUtils.createElement('button', {
                    className: 'btn btn--secondary btn--full mb-6',
                    onClick: () => scrollToSection('team')
                }, 'О нас'),

                DomUtils.createElement('hr', { className: 'divider' }),

                // Графики
                DomUtils.createElement('section', { id: 'graphics' },
                    DomUtils.createElement(ChartContainerChartJS)
                ),

                DomUtils.createElement('hr', { className: 'divider' }),

                // Команда
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

// Инициализация приложения
const initApp = () => {
    try {
        // Настройка ленивой загрузки изображений
        DomUtils.setupLazyLoading();

        // Рендеринг приложения
        ReactDOM.render(
            DomUtils.createElement(App),
            document.getElementById('root')
        );

        // Логирование успешной загрузки
        console.log('🚀 Приложение успешно запущено');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        
        // Fallback UI
        document.getElementById('root').innerHTML = `
            <div style="padding: 3rem; text-align: center; color: #666;">
                <h2>Произошла ошибка при загрузке приложения</h2>
                <p>Пожалуйста, обновите страницу или попробуйте позже</p>
                <button onclick="window.location.reload()" 
                        style="padding: 0.75rem 1.5rem; background: #45AEAC; color: white; border: none; border-radius: 0.5rem; cursor: pointer; margin-top: 1rem;">
                    Обновить страницу
                </button>
            </div>
        `;
    }
};

// Запуск приложения когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}