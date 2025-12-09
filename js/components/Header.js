const Header = () => {
    return DomUtils.createElement('header', { className: 'header fade-in' },
        DomUtils.createElement('div', { className: 'container' },
            DomUtils.createElement('h1', { className: 'header__title' },
                'Станция мониторинга Экологической обстановки'
            ),
            DomUtils.createElement('p', { className: 'header__subtitle' },
                'Проект команды "Рудирончики" для кейс-чемпионата "КАПЧА"'
            )
        )
    );
};

window.Header = Header;