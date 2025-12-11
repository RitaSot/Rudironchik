const TeamCarousel = () => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
    const [loadedImages, setLoadedImages] = React.useState({});

    const teamMembers = React.useMemo(() => [
        {
            name: "Искрин Артем",
            role: "Разработчик бекэнда и аппаратной части",
            photo: "Artem.jpg"
        },
        {
            name: "Сотникова Маргарита",
            role: "3D моделирование, сборка, работа с фронтендом",
            photo: "Rita.jpg"
        },
        {
            name: "Шушкевич Агата",
            role: "Фронтенд, 3D дизайн, оформление презентации и документации",
            photo: "Agata.jpg"
        }
    ], []);

    const getImagePath = React.useCallback((filename) => {
        const basePath = window.IMAGE_BASE_PATH || './assets/images/';
        return `${basePath}${filename}`;
    }, []);

    React.useEffect(() => {
        teamMembers.forEach(member => {
            const img = new Image();
            img.src = getImagePath(member.photo);
            img.onload = () => {
                setLoadedImages(prev => ({
                    ...prev,
                    [member.photo]: true
                }));
            };
            img.onerror = () => {
                setLoadedImages(prev => ({
                    ...prev,
                    [member.photo]: false
                }));
            };
        });
    }, [teamMembers, getImagePath]);

    React.useEffect(() => {
        const handleResize = DomUtils.createResizeHandler(() => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setCurrentIndex(0);
        });

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = React.useCallback(() => {
        if (isMobile) {
            setCurrentIndex(prev => (prev + 1) % teamMembers.length);
        }
    }, [isMobile, teamMembers.length]);

    const prevSlide = React.useCallback(() => {
        if (isMobile) {
            setCurrentIndex(prev => (prev - 1 + teamMembers.length) % teamMembers.length);
        }
    }, [isMobile, teamMembers.length]);

    const goToSlide = React.useCallback((index) => {
        if (isMobile) {
            setCurrentIndex(index);
        }
    }, [isMobile]);

    const renderMemberPhoto = React.useCallback((member) => {
        const imageLoaded = loadedImages[member.photo];
        const imagePath = getImagePath(member.photo);

        if (imageLoaded === false) {
            return DomUtils.createElement('div', {
                className: 'carousel__photo image-fallback'
            },
                DomUtils.createElement('span', null, member.name.split(' ')[0])
            );
        }

        return DomUtils.createElement('div', { className: 'carousel__photo' },
            DomUtils.createElement('img', {
                src: imagePath,
                alt: member.name,
                className: 'carousel__image',
                loading: 'lazy',
                onError: (e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.image-fallback')
                        || DomUtils.createElement('div', {
                            className: 'image-fallback'
                        }, member.name.split(' ')[0]);

                    if (!e.target.parentElement.querySelector('.image-fallback')) {
                        e.target.parentElement.appendChild(fallback);
                    }
                }
            })
        );
    }, [loadedImages, getImagePath]);

    return DomUtils.createElement('div', { className: 'carousel' },
        DomUtils.createElement('div', {
            className: 'carousel__track',
            style: isMobile ? { transform: `translateX(-${currentIndex * 100}%)` } : {}
        },
            teamMembers.map((member, index) =>
                DomUtils.createElement('div', {
                    key: index,
                    className: 'carousel__item slide-in-left'
                },
                    renderMemberPhoto(member),
                    DomUtils.createElement('h3', { className: 'carousel__name' }, member.name),
                    DomUtils.createElement('p', { className: 'carousel__role' }, member.role)
                )
            )
        ),

        isMobile && teamMembers.length > 1 && [
            DomUtils.createElement('button', {
                key: 'prev',
                className: 'carousel__btn carousel__btn--prev',
                onClick: prevSlide,
                'aria-label': 'Предыдущий участник'
            }, '‹'),

            DomUtils.createElement('button', {
                key: 'next',
                className: 'carousel__btn carousel__btn--next',
                onClick: nextSlide,
                'aria-label': 'Следующий участник'
            }, '›'),

            DomUtils.createElement('div', { key: 'indicators', className: 'carousel__indicators' },
                teamMembers.map((_, index) =>
                    DomUtils.createElement('button', {
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