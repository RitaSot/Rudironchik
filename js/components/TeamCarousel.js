const TeamCarousel = () => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const teamMembers = [
        { name: "Искрин Артем", role: "Разработчик бекэнда и аппаратной части", photo: "Artem.jpg" },
        { name: "Сотникова Маргарита", role: "3D моделирование, сборка, работа с фронтендом", photo: "Rita.jpg" },
        { name: "Шушкевич Агата", role: "Фронтенд, 3D дизайн, оформление презентации и документации", photo: "Agata.jpg" }
    ];

    const nextSlide = () => setCurrentIndex(prev => (prev + 1) % teamMembers.length);
    const prevSlide = () => setCurrentIndex(prev => (prev - 1 + teamMembers.length) % teamMembers.length);
    const goToSlide = (index) => setCurrentIndex(index);

    return React.createElement('div', { className: 'carousel' },
        React.createElement('div', {
            className: 'carousel__track',
            style: isMobile ? { transform: `translateX(-${currentIndex * 100}%)` } : {}
        },
            teamMembers.map((member, index) =>
                React.createElement('div', {
                    key: index,
                    className: 'carousel__item slide-in-left'
                },
                    React.createElement('div', { className: 'carousel__photo' },
                        React.createElement('img', {
                            src: `assets/images/${member.photo}`,
                            alt: member.name,
                            className: 'carousel__image',
                            loading: 'lazy',
                            onLoad: (e) => e.target.classList.add('loaded')
                        })
                    ),
                    React.createElement('h3', { className: 'carousel__name' }, member.name),
                    React.createElement('p', { className: 'carousel__role' }, member.role)
                )
            )
        ),
        isMobile && teamMembers.length > 1 && [
            React.createElement('button', {
                key: 'prev',
                className: 'carousel__btn carousel__btn--prev',
                onClick: prevSlide,
                'aria-label': 'Предыдущий участник'
            }, '‹'),
            React.createElement('button', {
                key: 'next',
                className: 'carousel__btn carousel__btn--next',
                onClick: nextSlide,
                'aria-label': 'Следующий участник'
            }, '›'),
            React.createElement('div', { key: 'indicators', className: 'carousel__indicators' },
                teamMembers.map((_, index) =>
                    React.createElement('button', {
                        key: index,
                        className: `carousel__indicator ${index === currentIndex ? 'carousel__indicator--active' : ''}`,
                        onClick: () => goToSlide(index),
                        'aria-label': `Перейти к участнику ${index + 1}`
                    })
                )
            )
        ]
    );
};

window.TeamCarousel = TeamCarousel;