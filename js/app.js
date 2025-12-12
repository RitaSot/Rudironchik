const App = () => {
    return React.createElement('div', { className: 'app' },
        React.createElement(window.Header),
        React.createElement('main', { className: 'app__main' },
            React.createElement('div', { className: 'container' },
                React.createElement('a', {
                    className: 'btn btn--primary btn--full mb-4',
                    href: '#graphics'
                }, 'К графикам'),
                React.createElement('a', {
                    className: 'btn btn--secondary btn--full mb-6',
                    href: '#team'
                }, 'О нас'),
                React.createElement('hr', { className: 'divider' }),
                React.createElement('section', { id: 'graphics' },
                    React.createElement(window.ChartContainerChartJS)
                ),
                React.createElement('hr', { className: 'divider' }),
                React.createElement('section', { id: 'team' },
                    React.createElement('h2', { className: 'section-title' }, 'Участники проекта'),
                    React.createElement(window.TeamCarousel)
                )
            )
        ),
        React.createElement(window.Footer)
    );
};

const initApp = () => {
    try {
        ReactDOM.render(
            React.createElement(App),
            document.getElementById('root')
        );
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        document.getElementById('root').innerHTML = `
            <div style="padding:3rem;text-align:center">
                <h2 style="margin-bottom:1rem">⚠️ Ошибка загрузки</h2>
                <p style="margin-bottom:1.5rem">Пожалуйста, обновите страницу</p>
                <button onclick="window.location.reload()" style="padding:.75rem 1.5rem;background:#45AEAC;color:white;border:none;border-radius:.5rem;cursor:pointer">
                    Обновить
                </button>
            </div>
        `;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}