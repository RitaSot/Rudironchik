const Header = () => React.createElement('header', { className: 'header fade-in' },
    React.createElement('div', { className: 'container' },
        React.createElement('h1', { className: 'header__title' },
            'Станция мониторинга Экологической обстановки'
        ),
        React.createElement('p', { className: 'header__subtitle' },
            'Проект команды "Рудирончики" для кейс-чемпионата "КАПЧА"'
        )
    )
);

window.Header = Header;