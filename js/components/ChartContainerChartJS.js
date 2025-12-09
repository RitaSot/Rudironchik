const ChartContainerChartJS = () => {
    const [currentChartIndex, setCurrentChartIndex] = React.useState(0);
    const [chartData, setChartData] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const chartRefs = React.useRef([]);

    // Состояния для фильтров (как в оригинале)
    const [filters, setFilters] = React.useState({
        startDate: DateUtils.getStartOfMonth(new Date()),
        endDate: new Date(),
        region: 'moscow'
    });

    // Регионы (как в оригинале)
    const availableRegions = React.useMemo(() => [
        { value: 'moscow', label: 'Москва' },
        { value: 'saint-petersburg', label: 'Санкт-Петербург' },
        { value: 'sevastopol', label: 'Севастополь' },
        { value: 'adygea', label: 'Республика Адыгея (Адыгея)' },
        { value: 'bashkortostan', label: 'Республика Башкортостан' },
        { value: 'buryatia', label: 'Республика Бурятия' },
        { value: 'altai-republic', label: 'Республика Алтай' },
        { value: 'dagestan', label: 'Республика Дагестан' },
        { value: 'ingushetia', label: 'Республика Ингушетия' },
        { value: 'kabardino-balkaria', label: 'Кабардино-Балкарская Республика' },
        { value: 'kalmykia', label: 'Республика Калмыкия' },
        { value: 'karachay-cherkessia', label: 'Карачаево-Черкесская Республика' },
        { value: 'karelia', label: 'Республика Карелия' },
        { value: 'komi', label: 'Республика Коми' },
        { value: 'mari-el', label: 'Республика Марий Эл' },
        { value: 'mordovia', label: 'Республика Мордовия' },
        { value: 'sakha', label: 'Республика Саха (Якутия)' },
        { value: 'north-ossetia', label: 'Республика Северная Осетия - Алания' },
        { value: 'tatarstan', label: 'Республика Татарстан (Татарстан)' },
        { value: 'tuva', label: 'Республика Тыва' },
        { value: 'udmurtia', label: 'Удмуртская Республика' },
        { value: 'khakassia', label: 'Республика Хакасия' },
        { value: 'chechnya', label: 'Чеченская Республика' },
        { value: 'chuvashia', label: 'Чувашская Республика - Чувашия' },
        { value: 'altai-krai', label: 'Алтайский край' },
        { value: 'krasnodar', label: 'Краснодарский край' },
        { value: 'krasnoyarsk', label: 'Красноярский край' }
    ], []);

    // Типы графиков с цветами
    const chartTypes = [
        {
            id: 'temperature',
            label: 'Температура воздуха, °C',
            color: '#FF6B6B',
            gradient: ['#FF6B6B', '#FF8E8E']
        },
        {
            id: 'humidity',
            label: 'Относительная влажность, %',
            color: '#4ECDC4',
            gradient: ['#4ECDC4', '#6ED9D2']
        },
        {
            id: 'pressure',
            label: 'Атмосферное давление, гПа',
            color: '#45B7D1',
            gradient: ['#45B7D1', '#65C7E1']
        },
        {
            id: 'insolation',
            label: 'Уровень освещенности, лк',
            color: '#FFD166',
            gradient: ['#FFD166', '#FFDF99']
        }
    ];

    // Загрузка данных при изменении фильтров
    React.useEffect(() => {
        loadChartData();
    }, [filters]);

    // Загрузка данных
    const loadChartData = React.useCallback(async () => {
        setLoading(true);
        try {
            // Пока используем мок-данные
            const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);
            const data = {
                temperature: ChartUtils.generateMockData(filters.region, daysDiff, 'temperature'),
                humidity: ChartUtils.generateMockData(filters.region, daysDiff, 'humidity'),
                pressure: ChartUtils.generateMockData(filters.region, daysDiff, 'pressure'),
                insolation: ChartUtils.generateMockData(filters.region, daysDiff, 'insolation')
            };
            setChartData(data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Fallback на простые данные
            const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);
            setChartData({
                temperature: Array(daysDiff).fill().map(() => 20 + Math.random() * 10),
                humidity: Array(daysDiff).fill().map(() => 60 + Math.random() * 20),
                pressure: Array(daysDiff).fill().map(() => 1010 + Math.random() * 10),
                insolation: Array(daysDiff).fill().map(() => 5000 + Math.random() * 3000)
            });
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    }, [filters]);

    // Создание графика
    React.useEffect(() => {
        if (!loading && chartRefs.current[currentChartIndex]) {
            renderChart();
        }
    }, [currentChartIndex, loading, chartData]);

    // Функция рендера графика
    const renderChart = () => {
        const canvas = chartRefs.current[currentChartIndex];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chartType = chartTypes[currentChartIndex];
        const data = chartData[chartType.id] || [];

        // Подписи по оси X (используем существующую функцию)
        const labels = DateUtils.getChartLabels(filters.startDate, filters.endDate);

        // Удаляем старый график если есть
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        // Создаем градиент
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, chartType.gradient[0] + '80');
        gradient.addColorStop(1, chartType.gradient[1] + '20');

        // Создаем новый график
        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: chartType.label,
                    data: data,
                    borderColor: chartType.color,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: chartType.color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#1a1a1a',
                            font: {
                                size: 14,
                                family: "'Segoe UI', sans-serif"
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            },
                            padding: 10
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.03)'
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            }
        });
    };

    // ---------- ОБРАБОТЧИКИ ФИЛЬТРОВ (как в оригинале) ----------

    const handleStartDateChange = React.useCallback((e) => {
        const newDate = new Date(e.target.value);
        if (DateUtils.isValidDateRange(newDate, filters.endDate)) {
            setFilters(prev => ({ ...prev, startDate: newDate }));
        }
    }, [filters.endDate]);

    const handleEndDateChange = React.useCallback((e) => {
        const newDate = new Date(e.target.value);
        if (DateUtils.isValidDateRange(filters.startDate, newDate)) {
            setFilters(prev => ({ ...prev, endDate: newDate }));
        }
    }, [filters.startDate]);

    const handleRegionChange = React.useCallback((e) => {
        setFilters(prev => ({ ...prev, region: e.target.value }));
    }, []);

    // Быстрые фильтры по датам
    const setDateRange = React.useCallback((days) => {
        const end = new Date();
        const start = DateUtils.addDays(end, -days + 1);
        setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
    }, []);

    // Навигация по графикам
    const nextChart = React.useCallback(() => {
        setCurrentChartIndex(prev => (prev + 1) % chartTypes.length);
    }, [chartTypes.length]);

    const prevChart = React.useCallback(() => {
        setCurrentChartIndex(prev => (prev - 1 + chartTypes.length) % chartTypes.length);
    }, [chartTypes.length]);

    const goToChart = React.useCallback((index) => {
        setCurrentChartIndex(index);
    }, []);

    return DomUtils.createElement('div', { className: 'charts-chartjs fade-in' },
        // Заголовок
        DomUtils.createElement('h2', { className: 'section-title' },
            '📊 Мониторинг экологических показателей'
        ),

        // ---------- ФИЛЬТРЫ (как в оригинале) ----------
        DomUtils.createElement('div', { className: 'filters' },
            // Быстрые фильтры
            DomUtils.createElement('div', { className: 'filters__quick' },
                DomUtils.createElement('button', {
                    className: 'filters__quick-btn',
                    onClick: () => setDateRange(7)
                }, 'Неделя'),
                DomUtils.createElement('button', {
                    className: 'filters__quick-btn',
                    onClick: () => setDateRange(30)
                }, 'Месяц'),
                DomUtils.createElement('button', {
                    className: 'filters__quick-btn',
                    onClick: () => setDateRange(90)
                }, 'Квартал')
            ),

            // Основные фильтры
            DomUtils.createElement('div', { className: 'filters__main' },
                DomUtils.createElement('div', { className: 'filters__group' },
                    DomUtils.createElement('label', {
                        htmlFor: 'start-date',
                        className: 'filters__label'
                    }, 'Дата начала:'),
                    DomUtils.createElement('input', {
                        id: 'start-date',
                        type: 'date',
                        className: 'filters__input',
                        value: DateUtils.formatDateForInput(filters.startDate),
                        onChange: handleStartDateChange,
                        max: DateUtils.formatDateForInput(filters.endDate)
                    })
                ),

                DomUtils.createElement('div', { className: 'filters__group' },
                    DomUtils.createElement('label', {
                        htmlFor: 'end-date',
                        className: 'filters__label'
                    }, 'Дата окончания:'),
                    DomUtils.createElement('input', {
                        id: 'end-date',
                        type: 'date',
                        className: 'filters__input',
                        value: DateUtils.formatDateForInput(filters.endDate),
                        onChange: handleEndDateChange,
                        min: DateUtils.formatDateForInput(filters.startDate)
                    })
                ),

                DomUtils.createElement('div', { className: 'filters__group' },
                    DomUtils.createElement('label', {
                        htmlFor: 'region',
                        className: 'filters__label'
                    }, 'Регион:'),
                    DomUtils.createElement('select', {
                        id: 'region',
                        className: 'filters__select',
                        value: filters.region,
                        onChange: handleRegionChange
                    },
                        availableRegions.map(region =>
                            DomUtils.createElement('option', {
                                key: region.value,
                                value: region.value
                            }, region.label)
                        )
                    )
                )
            ),

            // Информация
            DomUtils.createElement('div', { className: 'filters__info' },
                `Данные с ${DateUtils.formatDisplayDate(filters.startDate)} по ${DateUtils.formatDisplayDate(filters.endDate)} | Регион: ${availableRegions.find(r => r.value === filters.region)?.label || filters.region}`
            )
        ),

        // ---------- УПРАВЛЕНИЕ ГРАФИКАМИ ----------
        DomUtils.createElement('div', { className: 'charts__controls' },
            DomUtils.createElement('button', {
                className: 'charts__nav-btn',
                onClick: prevChart,
                disabled: loading
            }, '‹'),

            DomUtils.createElement('div', { className: 'charts__title' },
                loading ? '⏳ Загрузка данных...' : chartTypes[currentChartIndex].label
            ),

            DomUtils.createElement('button', {
                className: 'charts__nav-btn',
                onClick: nextChart,
                disabled: loading
            }, '›')
        ),

        // ---------- КОНТЕЙНЕР ДЛЯ ГРАФИКА ----------
        DomUtils.createElement('div', { className: 'chartjs-container' },
            loading ?
                DomUtils.createElement('div', { className: 'charts__loading' },
                    DomUtils.createElement('div', { className: 'loading-spinner' }),
                    DomUtils.createElement('div', null, 'Загрузка данных...')
                ) :
                DomUtils.createElement('canvas', {
                    ref: el => chartRefs.current[currentChartIndex] = el,
                    className: 'chartjs-canvas'
                })
        ),

        // ---------- ИНДИКАТОРЫ ГРАФИКОВ ----------
        DomUtils.createElement('div', { className: 'charts__indicators' },
            chartTypes.map((_, index) =>
                DomUtils.createElement('button', {
                    key: index,
                    className: `charts__indicator ${index === currentChartIndex ? 'charts__indicator--active' : ''}`,
                    onClick: () => goToChart(index),
                    disabled: loading
                })
            )
        )
    );
};

window.ChartContainerChartJS = ChartContainerChartJS;