const Footer = () => {
    const [currentYear] = React.useState(new Date().getFullYear());

    return DomUtils.createElement('footer', { className: 'footer' },
        DomUtils.createElement('div', { className: 'container' },
            DomUtils.createElement('p', { className: 'footer__text' },
                `Rudironchiki © ${currentYear} | Проект разработан для кейс-чемпионата "КАПЧА"`
            )
        )
    );
};

window.Footer = Footer;