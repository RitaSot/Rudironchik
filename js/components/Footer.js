const Footer = () => React.createElement('footer', { className: 'footer' },
    React.createElement('div', { className: 'container' },
        React.createElement('p', { className: 'footer__text' },
            `Rudironchiki © ${new Date().getFullYear()} | Проект разработан для кейс-чемпионата "КАПЧА"`
        )
    )
);

window.Footer = Footer;