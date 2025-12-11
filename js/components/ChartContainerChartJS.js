const ChartContainerChartJS = () => {
    const [currentChartIndex, setCurrentChartIndex] = React.useState(0);
    const [chartData, setChartData] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [dataSource, setDataSource] = React.useState('thingspeak');
    const [timeInterval, setTimeInterval] = React.useState('hours');
    const [useDemoData, setUseDemoData] = React.useState(false);
    const chartRefs = React.useRef([]);

    const [filters, setFilters] = React.useState({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date()
    });

    const chartTypes = React.useMemo(() => [
        { id: 'temperature', label: 'Температура воздуха, °C', color: '#FF6B6B', gradient: ['#FF6B6B', '#FF8E8E'], unit: '°C' },
        { id: 'humidity', label: 'Относительная влажность, %', color: '#4ECDC4', gradient: ['#4ECDC4', '#6ED9D2'], unit: '%' },
        { id: 'pressure', label: 'Атмосферное давление, гПа', color: '#45B7D1', gradient: ['#45B7D1', '#65C7E1'], unit: 'гПа' },
        { id: 'insolation', label: 'Уровень освещенности, лк', color: '#FFD166', gradient: ['#FFD166', '#FFDF99'], unit: 'лк' }
    ], []);

    React.useEffect(() => {
        loadChartData();
    }, [filters, timeInterval, useDemoData]);

    const loadChartData = React.useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let data;
            const actualSource = useDemoData ? 'demo' : 'thingspeak';

            if (window.DataService) {
                window.DataService.setDataSource(actualSource);

                try {
                    data = await window.DataService.getChartData(filters, timeInterval);
                    setDataSource(data.metadata?.source || actualSource);

                    if (timeInterval === 'hours' && data.labels) {
                        data.labels = fixHourLabels(data.labels, data.timestamps);
                    }
                } catch (serviceError) {
                    console.warn('Ошибка загрузки данных:', serviceError);
                    setError(`Ошибка загрузки данных: ${serviceError.message}. Проверьте подключение к ThingSpeak.`);
                    setDataSource('error');

                    window.DataService.setDataSource('demo');
                    data = await window.DataService.getChartData(filters, timeInterval);

                    if (timeInterval === 'hours' && data.labels) {
                        data.labels = fixHourLabels(data.labels, data.timestamps);
                    }
                }
            } else {
                setError('DataService не загружен');
                data = await generateLocalDemoData();
                setDataSource('local');
            }

            setChartData(data);
        } catch (error) {
            console.error('Критическая ошибка:', error);
            const fallbackData = await generateLocalDemoData();
            setChartData(fallbackData);
            setDataSource('emergency');
            setError('Критическая ошибка. Используем локальные данные.');
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    }, [filters, timeInterval, useDemoData]);

    const fixHourLabels = (labels, timestamps) => {
        if (timestamps && timestamps.length > 0) {
            return timestamps.map(ts => {
                try {
                    const date = new Date(ts);
                    return DateUtils.formatHour(date);
                } catch (e) {
                    return ts;
                }
            });
        }

        return labels.map(label => {
            if (typeof label === 'string' && label.match(/^\d{1,2}:\d{2}$/)) {
                return label;
            }

            try {
                const date = new Date(label);
                if (!isNaN(date.getTime())) {
                    return DateUtils.formatHour(date);
                }

                if (label.includes('декабря') || label.includes('января') || label.includes('февраля') ||
                    label.includes('марта') || label.includes('апреля') || label.includes('мая') ||
                    label.includes('июня') || label.includes('июля') || label.includes('августа') ||
                    label.includes('сентября') || label.includes('октября') || label.includes('ноября')) {

                    const today = new Date();
                    const timeParts = label.split(' ');
                    const day = parseInt(timeParts[0]);
                    const monthName = timeParts[1];
                    const monthNumber = getMonthNumber(monthName);

                    if (monthNumber) {
                        const dateStr = `${today.getFullYear()}-${monthNumber}-${day.toString().padStart(2, '0')}T12:00:00`;
                        const newDate = new Date(dateStr);
                        if (!isNaN(newDate.getTime())) {
                            return DateUtils.formatHour(newDate);
                        }
                    }
                }
            } catch (e) {
                console.warn('Не удалось преобразовать метку:', label, e);
            }

            return label;
        });
    };

    const getMonthNumber = (monthName) => {
        const months = {
            'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
            'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
            'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12'
        };
        return months[monthName.toLowerCase()] || null;
    };

    const generateLocalDemoData = async () => {
        const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);
        const hoursDiff = DateUtils.getHoursDiff(filters.startDate, filters.endDate);
        let points, labels;

        switch (timeInterval) {
            case 'hours':
                points = Math.min(24, Math.max(6, hoursDiff));
                labels = generateHourLabelsForDemo(points);
                break;
            case 'months':
                points = Math.min(12, Math.max(3, Math.ceil(daysDiff / 30)));
                labels = generateMonthLabelsForDemo(points);
                break;
            default:
                points = Math.min(30, Math.max(7, daysDiff));
                labels = generateDayLabelsForDemo(points);
        }

        return {
            temperature: generateRealisticSeries(points, 'temperature', timeInterval),
            humidity: generateRealisticSeries(points, 'humidity', timeInterval),
            pressure: generateRealisticSeries(points, 'pressure', timeInterval),
            insolation: generateRealisticSeries(points, 'insolation', timeInterval),
            labels: labels,
            metadata: {
                source: 'local_demo',
                period: `${DateUtils.formatDisplayDate(filters.startDate)} - ${DateUtils.formatDisplayDate(filters.endDate)}`,
                note: 'Локальные демо-данные',
                generatedAt: new Date().toISOString(),
                interval: timeInterval
            }
        };
    };

    const generateHourLabelsForDemo = (hours) => {
        const labels = [];
        const now = new Date();
        now.setMinutes(0, 0, 0);

        for (let i = 0; i < hours; i++) {
            const time = new Date(now);
            time.setHours(time.getHours() - (hours - 1) + i);
            labels.push(DateUtils.formatHour(time));
        }

        return labels;
    };

    const generateDayLabelsForDemo = (days) => {
        const labels = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(DateUtils.formatDisplayDate(date));
        }

        return labels;
    };

    const generateMonthLabelsForDemo = () => {
        const labels = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            labels.push(DateUtils.formatMonth(date));
        }

        return labels;
    };

    const generateRealisticSeries = (points, type, interval) => {
        const data = [];
        const baseValues = {
            temperature: { min: 15, max: 25, daily: true },
            humidity: { min: 50, max: 80, daily: true },
            pressure: { min: 1005, max: 1025, daily: false },
            insolation: { min: 1000, max: 7000, daily: true }
        };

        const config = baseValues[type] || baseValues.temperature;
        const range = config.max - config.min;

        for (let i = 0; i < points; i++) {
            let value;

            if (interval === 'hours') {
                const hour = i % 24;
                const dailyCycle = Math.sin((hour - 6) * Math.PI / 12) * 0.5 + 0.5;
                value = config.min + (dailyCycle * range);

                if (type === 'insolation') {
                    if (hour < 6 || hour > 20) {
                        value = config.min * 0.1;
                    } else if (hour >= 10 && hour <= 16) {
                        value = config.max * 0.9 + (config.max * 0.2 * Math.random());
                    }
                }
            } else if (interval === 'months') {
                const month = i % 12;
                const seasonalCycle = Math.sin((month - 3) * Math.PI / 6) * 0.3 + 0.7;
                value = config.min + (seasonalCycle * range);
            } else {
                const dailyCycle = Math.sin(i * 0.2) * 0.3 + 0.7;
                const noise = (Math.random() - 0.5) * range * 0.1;
                value = config.min + (dailyCycle * range) + noise;
            }

            value += (Math.random() - 0.5) * range * 0.05;

            switch(type) {
                case 'temperature':
                    value = Math.max(-10, Math.min(35, value));
                    break;
                case 'humidity':
                    value = Math.max(30, Math.min(95, value));
                    break;
                case 'pressure':
                    value = Math.max(980, Math.min(1040, value));
                    break;
                case 'insolation':
                    value = Math.max(0, Math.min(10000, value));
                    break;
            }

            data.push(parseFloat(value.toFixed(2)));
        }

        return data;
    };

    React.useEffect(() => {
        if (!loading && chartRefs.current[currentChartIndex] && chartData.labels) {
            renderChart();
        }
    }, [currentChartIndex, loading, chartData, timeInterval]);

    const renderChart = () => {
        const canvas = chartRefs.current[currentChartIndex];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chartType = chartTypes[currentChartIndex];
        const data = chartData[chartType.id] || [];
        let labels = chartData.labels || [];

        if (canvas.chart) {
            canvas.chart.destroy();
        }

        if (timeInterval === 'hours') {
            labels = ensureHourLabels(labels);
        }

        const displayData = data.length > 0 ? data : Array(labels.length).fill(0);
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, chartType.gradient[0] + '80');
        gradient.addColorStop(1, chartType.gradient[1] + '20');
        const isHourly = timeInterval === 'hours';

        const xAxisConfig = {
            grid: { color: 'rgba(0, 0, 0, 0.03)' },
            ticks: {
                color: '#666666',
                font: { size: isHourly ? 10 : 11, family: "'Segoe UI', sans-serif" },
                maxRotation: isHourly ? 45 : 0,
                minRotation: isHourly ? 45 : 0,
                autoSkip: true,
                maxTicksLimit: isHourly ? 12 : 8,
                callback: function(value, index) {
                    if (isHourly) return this.getLabelForValue(value);
                    const totalLabels = this.chart.data.labels.length;
                    if (totalLabels > 15 && index % Math.ceil(totalLabels / 8) !== 0) return '';
                    return this.getLabelForValue(value);
                }
            },
            title: {
                display: true,
                text: isHourly ? 'Время (часы)' : 'Дата',
                color: '#666666',
                font: { size: 12, weight: 'normal' }
            }
        };

        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${chartType.label}`,
                    data: displayData,
                    borderColor: chartType.color,
                    backgroundColor: gradient,
                    borderWidth: isHourly ? 2 : 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: chartType.color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: isHourly ? 3 : 4,
                    pointHoverRadius: isHourly ? 5 : 6,
                    pointHoverBorderWidth: 3
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
                            font: { size: 14, family: "'Segoe UI', sans-serif" },
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
                            label: (context) => `${context.parsed.y.toFixed(1)} ${chartType.unit}`,
                            title: (context) => {
                                const label = context[0].label;
                                if (timeInterval === 'hours' && chartData.timestamps && chartData.timestamps[context[0].dataIndex]) {
                                    try {
                                        const date = new Date(chartData.timestamps[context[0].dataIndex]);
                                        return DateUtils.formatDateTime(date);
                                    } catch (e) {
                                        return label;
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            color: '#666666',
                            font: { size: 12, family: "'Segoe UI', sans-serif" },
                            padding: 10,
                            callback: (value) => `${value.toFixed(1)} ${chartType.unit}`
                        },
                        title: {
                            display: true,
                            text: chartType.unit,
                            color: '#666666',
                            font: { size: 12, weight: 'normal' }
                        }
                    },
                    x: xAxisConfig
                },
                interaction: { intersect: false, mode: 'index' },
                animation: { duration: 1000, easing: 'easeInOutQuart' }
            }
        });
    };

    const ensureHourLabels = (labels) => {
        return labels.map(label => {
            if (typeof label === 'string' && /^\d{1,2}:\d{2}$/.test(label)) return label;

            if (typeof label === 'string' && label.includes(':')) {
                const timeMatch = label.match(/(\d{1,2}):(\d{2})/);
                if (timeMatch) return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
            }

            const index = labels.indexOf(label);
            const hour = (index % 24).toString().padStart(2, '0');
            return `${hour}:00`;
        });
    };

    const handleTimeIntervalChange = (e) => {
        const newInterval = e.target.value;
        setTimeInterval(newInterval);

        if (newInterval === 'hours') {
            const end = new Date();
            const start = new Date(end);
            start.setHours(end.getHours() - 23);
            setFilters({ startDate: start, endDate: end });
        }
    };

    const handleDataSourceToggle = () => setUseDemoData(!useDemoData);

    const handleStartDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setFilters(prev => ({ ...prev, startDate: newDate }));
    };

    const handleEndDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setFilters(prev => ({ ...prev, endDate: newDate }));
    };

    const setDateRange = (days) => {
        const end = new Date();
        const start = DateUtils.addDays(end, -days + 1);
        setFilters({ startDate: start, endDate: end });

        if (days <= 1) setTimeInterval('hours');
        else if (days <= 31) setTimeInterval('days');
        else setTimeInterval('months');
    };

    const setHourRange = (hours) => {
        const end = new Date();
        const start = DateUtils.addHours(end, -hours);
        setFilters({ startDate: start, endDate: end });
        setTimeInterval('hours');
    };

    const nextChart = () => setCurrentChartIndex(prev => (prev + 1) % chartTypes.length);
    const prevChart = () => setCurrentChartIndex(prev => (prev - 1 + chartTypes.length) % chartTypes.length);
    const goToChart = (index) => setCurrentChartIndex(index);

    const testThingSpeakConnection = async () => {
        setLoading(true);
        try {
            if (window.DataService) {
                const result = await window.DataService.testThingSpeakConnection();
                if (result.success) {
                    alert(`✅ ThingSpeak доступен!\nКанал: ${result.channelName}\nЗаписей: ${result.totalRecords}\nПоследнее обновление: ${result.lastUpdate || 'неизвестно'}`);
                } else {
                    alert(`❌ ThingSpeak недоступен: ${result.error}`);
                }
            } else {
                alert('⚠️ DataService не загружен');
            }
        } catch (error) {
            alert(`❌ Ошибка: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getDataSourceText = () => useDemoData ? 'Демо' : 'ThingSpeak';
    const getIntervalText = () => {
        switch(timeInterval) {
            case 'hours': return 'Почасовой';
            case 'days': return 'Дневной';
            case 'months': return 'Месячный';
            default: return 'Авто';
        }
    };

    const refreshData = () => loadChartData();

    return DomUtils.createElement('div', { className: 'charts-chartjs fade-in' },
        DomUtils.createElement('h2', { className: 'section-title' }, '📊 Мониторинг экологических показателей'),

        DomUtils.createElement('div', { className: 'data-control-panel' },
            DomUtils.createElement('div', { className: 'data-source-toggle' },
                DomUtils.createElement('span', { className: 'data-source-label' }, 'Источник данных:'),

                DomUtils.createElement('button', {
                    className: `source-btn ${!useDemoData ? 'source-btn-active' : ''}`,
                    onClick: () => setUseDemoData(false),
                    disabled: loading || !useDemoData
                },
                    DomUtils.createElement('span', { className: 'btn-icon' }, '📡'),
                    'ThingSpeak'
                ),

                DomUtils.createElement('button', {
                    className: `source-btn ${useDemoData ? 'source-btn-active' : ''}`,
                    onClick: () => setUseDemoData(true),
                    disabled: loading || useDemoData
                },
                    DomUtils.createElement('span', { className: 'btn-icon' }, '🔄'),
                    'Демо'
                ),

                DomUtils.createElement('div', { className: 'data-actions' },
                    // Десктопные кнопки
                    !useDemoData && DomUtils.createElement('button', {
                        className: 'action-btn test-connection-btn desktop-btn',
                        onClick: testThingSpeakConnection,
                        disabled: loading,
                        title: 'Проверить подключение к ThingSpeak'
                    },
                        DomUtils.createElement('span', { className: 'btn-icon' }, '🔍'),
                        'Проверить подключение'
                    ),

                    DomUtils.createElement('button', {
                        className: 'action-btn refresh-btn desktop-btn',
                        onClick: refreshData,
                        disabled: loading,
                        title: 'Обновить данные'
                    },
                        DomUtils.createElement('span', { className: 'btn-icon' }, '🔄'),
                        'Обновить'
                    ),

                    // Мобильные кнопки (иконки)
                    DomUtils.createElement('div', { className: 'mobile-actions' },
                        !useDemoData && DomUtils.createElement('button', {
                            className: 'mobile-action-btn test-btn',
                            onClick: testThingSpeakConnection,
                            disabled: loading,
                            title: 'Проверить подключение к ThingSpeak'
                        }, '🔍'),

                        DomUtils.createElement('button', {
                            className: 'mobile-action-btn refresh-btn-mobile',
                            onClick: refreshData,
                            disabled: loading,
                            title: 'Обновить данные'
                        }, '🔄')
                    )
                )
            ),

            DomUtils.createElement('div', { className: 'data-info' },
                DomUtils.createElement('div', { className: 'info-row' },
                    DomUtils.createElement('span', null,
                        DomUtils.createElement('strong', null, 'Источник: '),
                        getDataSourceText()
                    ),
                    DomUtils.createElement('span', null,
                        DomUtils.createElement('strong', null, 'Режим: '),
                        getIntervalText()
                    )
                ),
                chartData.metadata && DomUtils.createElement('div', { className: 'metadata-info' },
                    DomUtils.createElement('span', null, chartData.metadata.note || 'Данные загружены'),
                    chartData.metadata.period && DomUtils.createElement('span', { className: 'metadata-period' },
                        ` (${chartData.metadata.period})`
                    )
                )
            )
        ),

        DomUtils.createElement('div', { className: 'interval-filters' },
            DomUtils.createElement('div', { className: 'interval-selector' },
                DomUtils.createElement('label', {
                    htmlFor: 'time-interval',
                    className: 'filters__label'
                }, '📅 Интервал отображения:'),

                DomUtils.createElement('select', {
                    id: 'time-interval',
                    className: 'filters__input',
                    value: timeInterval,
                    onChange: handleTimeIntervalChange,
                    disabled: loading
                },
                    DomUtils.createElement('option', { value: 'hours' }, '⏰ По часам'),
                    DomUtils.createElement('option', { value: 'days' }, '📅 По дням'),
                    DomUtils.createElement('option', { value: 'months' }, '📆 По месяцам'),
                    DomUtils.createElement('option', { value: 'auto' }, '🔄 Авто')
                )
            ),

            DomUtils.createElement('div', { className: 'filters__quick' },
                DomUtils.createElement('button', {
                    className: `filters__quick-btn ${timeInterval === 'hours' ? 'active' : ''}`,
                    onClick: () => setHourRange(6),
                    disabled: loading
                }, '6 часов'),

                DomUtils.createElement('button', {
                    className: `filters__quick-btn ${timeInterval === 'hours' ? 'active' : ''}`,
                    onClick: () => setHourRange(12),
                    disabled: loading
                }, '12 часов'),

                DomUtils.createElement('button', {
                    className: `filters__quick-btn ${timeInterval === 'hours' ? 'active' : ''}`,
                    onClick: () => setHourRange(24),
                    disabled: loading
                }, '24 часа'),

                DomUtils.createElement('button', {
                    className: `filters__quick-btn ${timeInterval === 'days' ? 'active' : ''}`,
                    onClick: () => setDateRange(7),
                    disabled: loading
                }, '7 дней'),

                DomUtils.createElement('button', {
                    className: `filters__quick-btn ${timeInterval === 'days' ? 'active' : ''}`,
                    onClick: () => setDateRange(30),
                    disabled: loading
                }, '30 дней'),

                DomUtils.createElement('button', {
                    className: `filters__quick-btn ${timeInterval === 'days' ? 'active' : ''}`,
                    onClick: () => setDateRange(90),
                    disabled: loading
                }, '90 дней')
            ),

            DomUtils.createElement('div', { className: 'filters__main' },
                DomUtils.createElement('div', { className: 'filters__group' },
                    DomUtils.createElement('label', {
                        htmlFor: 'start-date',
                        className: 'filters__label'
                    }, 'Начало:'),

                    DomUtils.createElement('input', {
                        id: 'start-date',
                        type: timeInterval === 'hours' ? 'datetime-local' : 'date',
                        className: 'filters__input',
                        value: timeInterval === 'hours'
                            ? filters.startDate.toISOString().slice(0, 16)
                            : DateUtils.formatDateForInput(filters.startDate),
                        onChange: handleStartDateChange,
                        max: timeInterval === 'hours'
                            ? filters.endDate.toISOString().slice(0, 16)
                            : DateUtils.formatDateForInput(filters.endDate),
                        disabled: loading
                    })
                ),

                DomUtils.createElement('div', { className: 'filters__group' },
                    DomUtils.createElement('label', {
                        htmlFor: 'end-date',
                        className: 'filters__label'
                    }, 'Конец:'),

                    DomUtils.createElement('input', {
                        id: 'end-date',
                        type: timeInterval === 'hours' ? 'datetime-local' : 'date',
                        className: 'filters__input',
                        value: timeInterval === 'hours'
                            ? filters.endDate.toISOString().slice(0, 16)
                            : DateUtils.formatDateForInput(filters.endDate),
                        onChange: handleEndDateChange,
                        min: timeInterval === 'hours'
                            ? filters.startDate.toISOString().slice(0, 16)
                            : DateUtils.formatDateForInput(filters.startDate),
                        disabled: loading
                    })
                )
            )
        ),

        DomUtils.createElement('div', { className: 'charts__controls' },
            DomUtils.createElement('button', {
                className: 'charts__nav-btn',
                onClick: prevChart,
                disabled: loading,
                'aria-label': 'Предыдущий график'
            }, '‹'),

            DomUtils.createElement('div', { className: 'charts__title' },
                loading ? 'Загрузка данных...' : `${chartTypes[currentChartIndex].label}`
            ),

            DomUtils.createElement('button', {
                className: 'charts__nav-btn',
                onClick: nextChart,
                disabled: loading,
                'aria-label': 'Следующий график'
            }, '›')
        ),

        DomUtils.createElement('div', { className: 'chartjs-container' },
            loading ?
                DomUtils.createElement('div', { className: 'charts__loading' },
                    DomUtils.createElement('div', { className: 'loading-spinner' }),
                    `Загрузка ${getDataSourceText()} данных...`
                ) :
                DomUtils.createElement('canvas', {
                    ref: el => chartRefs.current[currentChartIndex] = el,
                    className: 'chartjs-canvas'
                })
        ),

        DomUtils.createElement('div', { className: 'charts__indicators' },
            chartTypes.map((_, index) =>
                DomUtils.createElement('button', {
                    key: index,
                    className: `charts__indicator ${index === currentChartIndex ? 'charts__indicator--active' : ''}`,
                    onClick: () => goToChart(index),
                    disabled: loading,
                    'aria-label': `Показать ${chartTypes[index].label}`
                })
            )
        ),

        error && DomUtils.createElement('div', { className: 'error-message' },
            `⚠️ ${error}`
        ),

        DomUtils.createElement('div', { className: 'chart-footer-info' },
            DomUtils.createElement('span', { className: 'axis-info' },
                timeInterval === 'hours' ? '⏰ На оси X отображается время (часы:минуты)' :
                timeInterval === 'days' ? '📅 На оси X отображаются даты' :
                '📆 На оси X отображаются месяцы'
            ),

            chartData.metadata && chartData.metadata.generatedAt && DomUtils.createElement('span', { className: 'update-time' },
                `Обновлено: ${new Date(chartData.metadata.generatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
            )
        )
    );
};

window.ChartContainerChartJS = ChartContainerChartJS;