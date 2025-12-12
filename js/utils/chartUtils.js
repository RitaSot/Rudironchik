const ChartUtils = {
    colors: {
        temperature: {
            line: '#FF6B6B',
            area: 'rgba(255, 107, 107, 0.3)',
            gradient: ['#FF6B6B', '#FF8E8E']
        },
        humidity: {
            line: '#4ECDC4',
            area: 'rgba(78, 205, 196, 0.3)',
            gradient: ['#4ECDC4', '#6ED9D2']
        },
        pressure: {
            line: '#45B7D1',
            area: 'rgba(69, 183, 209, 0.3)',
            gradient: ['#45B7D1', '#65C7E1']
        },
        insolation: {
            line: '#FFD166',
            area: 'rgba(255, 209, 102, 0.3)',
            gradient: ['#FFD166', '#FFDF99']
        }
    },

    getColors(type) {
        return this.colors[type] || {
            line: '#45AEAC',
            area: 'rgba(69, 174, 172, 0.3)',
            gradient: ['#45AEAC', '#65BEBC']
        };
    },

    createLinePath(data) {
        if (!data.length || data.length === 1) return '';
        return `M${this.calculatePoints(data).join(' L')}`;
    },

    createAreaPath(data) {
        if (!data.length || data.length === 1) return '';
        const points = this.calculatePoints(data);
        return `M${points.join(' L')} L100,60 L0,60 Z`;
    },

    calculatePoints(data) {
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;
        const lastIndex = data.length - 1;

        return data.map((value, index) => {
            const x = (index / lastIndex) * 100;
            const y = 60 - ((value - minValue) / range) * 50;
            return `${x},${y}`;
        });
    },

    generateMockData(region, points, type, interval = 'days') {
        const regionProfiles = {
            'Москва': {
                temperature: { base: 18, range: 15, trend: 0.1, seasonal: 0.3 },
                humidity: { base: 65, range: 20, trend: -0.05, seasonal: 0.2 },
                pressure: { base: 1013, range: 10, trend: 0.02, seasonal: 0.1 },
                insolation: { base: 400, range: 300, trend: 0.15, seasonal: 0.4 }
            },
            'Санкт-Петербург': {
                temperature: { base: 15, range: 12, trend: 0.08, seasonal: 0.25 },
                humidity: { base: 75, range: 15, trend: -0.03, seasonal: 0.15 },
                pressure: { base: 1010, range: 12, trend: 0.01, seasonal: 0.08 },
                insolation: { base: 300, range: 250, trend: 0.12, seasonal: 0.35 }
            },
            'Краснодарский край': {
                temperature: { base: 22, range: 10, trend: 0.12, seasonal: 0.35 },
                humidity: { base: 60, range: 25, trend: -0.08, seasonal: 0.25 },
                pressure: { base: 1015, range: 8, trend: 0.03, seasonal: 0.12 },
                insolation: { base: 700, range: 300, trend: 0.18, seasonal: 0.45 }
            }
        };

        const profile = regionProfiles[region] || regionProfiles['Москва'];
        const config = profile[type] || profile.temperature;
        const data = [];

        for (let i = 0; i < points; i++) {
            let value;

            if (interval === 'hours') {
                const hour = i % 24;
                const dailyCycle = Math.sin((hour - 6) * Math.PI / 12);
                value = config.base + (dailyCycle * config.range) + (Math.random() - 0.5) * config.range * 0.1;

                if (type === 'insolation') {
                    if (hour < 6 || hour > 20) {
                        value = Math.max(0, value * 0.1);
                    }
                }
            } else if (interval === 'months') {
                const month = i % 12;
                const seasonalCycle = Math.sin((month - 3) * Math.PI / 6);
                value = config.base + (seasonalCycle * config.range * config.seasonal) + (Math.random() - 0.5) * config.range * 0.05;
            } else {
                const dayCycle = Math.sin(i * 0.5) * (config.range * 0.1);
                const season = Math.sin(i / 30 * Math.PI * 2) * (config.range * config.seasonal);
                value = config.base + season + dayCycle + (Math.random() - 0.5) * (config.range * 0.3);
            }

            switch (type) {
                case 'temperature':
                    value = Math.min(Math.max(value, -20), 40);
                    break;
                case 'humidity':
                    value = Math.min(Math.max(value, 30), 95);
                    break;
                case 'pressure':
                    value = Math.min(Math.max(value, 950), 1050);
                    break;
                case 'insolation':
                    value = Math.max(0, Math.min(value, 1200));
                    break;
            }

            data.push(Math.round(value * 10) / 10);
        }

        return data;
    },

    createGradient(id, colors) {
        return React.createElement('linearGradient', {
            id: id,
            x1: "0%", y1: "0%", x2: "0%", y2: "100%"
        }, [
            React.createElement('stop', {
                key: 'start',
                offset: "0%",
                stopColor: colors[0],
                stopOpacity: "0.4"
            }),
            React.createElement('stop', {
                key: 'end',
                offset: "100%",
                stopColor: colors[1],
                stopOpacity: "0.1"
            })
        ]);
    },

    createGrid(data) {
        const gridLines = [];
        const lastIndex = data.length - 1;

        [10, 30, 50].forEach(y => {
            gridLines.push(React.createElement('line', {
                key: `h${y}`,
                x1: "0", y1: y,
                x2: "100", y2: y,
                stroke: "rgba(0,0,0,0.08)",
                strokeWidth: "0.3"
            }));
        });

        const step = Math.max(1, Math.floor(data.length / 8));

        data.forEach((_, index) => {
            if (index % step === 0) {
                const x = (index / lastIndex) * 100;
                gridLines.push(React.createElement('line', {
                    key: `v${index}`,
                    x1: x, y1: "0",
                    x2: x, y2: "60",
                    stroke: "rgba(0,0,0,0.05)",
                    strokeWidth: "0.2"
                }));
            }
        });

        return gridLines;
    },

    getChartLabel(type) {
        const labels = {
            temperature: 'Температура воздуха, °C',
            humidity: 'Относительная влажность, %',
            pressure: 'Атмосферное давление, гПа',
            insolation: 'Коэффициент солнечной инсоляции, Вт/м²'
        };
        return labels[type] || 'Неизвестный параметр';
    },

    getChartUnit(type) {
        const units = {
            temperature: '°C',
            humidity: '%',
            pressure: 'гПа',
            insolation: 'Вт/м²'
        };
        return units[type] || '';
    },

    formatValue(value, type) {
        switch (type) {
            case 'temperature':
            case 'insolation':
                return `${value.toFixed(1)} ${this.getChartUnit(type)}`;
            case 'humidity':
            case 'pressure':
                return `${Math.round(value)} ${this.getChartUnit(type)}`;
            default:
                return value.toFixed(1);
        }
    },

    getRealisticValueRange(type, region = 'Москва') {
        const ranges = {
            'Москва': {
                temperature: { min: -15, max: 30, typical: 18 },
                humidity: { min: 40, max: 90, typical: 65 },
                pressure: { min: 980, max: 1030, typical: 1013 },
                insolation: { min: 50, max: 900, typical: 400 }
            },
            'Санкт-Петербург': {
                temperature: { min: -20, max: 25, typical: 15 },
                humidity: { min: 50, max: 95, typical: 75 },
                pressure: { min: 975, max: 1025, typical: 1010 },
                insolation: { min: 30, max: 700, typical: 300 }
            },
            'Краснодарский край': {
                temperature: { min: -5, max: 35, typical: 22 },
                humidity: { min: 35, max: 85, typical: 60 },
                pressure: { min: 990, max: 1040, typical: 1015 },
                insolation: { min: 100, max: 1100, typical: 700 }
            }
        };

        const regionRanges = ranges[region] || ranges['Москва'];
        return regionRanges[type] || { min: 0, max: 100, typical: 50 };
    },

    createTooltipContent(value, type, timestamp = null) {
        const label = this.getChartLabel(type);
        const formattedValue = this.formatValue(value, type);

        let content = `<strong>${label}</strong><br>`;
        content += `Значение: <strong>${formattedValue}</strong>`;

        if (timestamp) {
            const date = new Date(timestamp);
            const timeStr = date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const dateStr = date.toLocaleDateString('ru-RU');
            content += `<br>Время: ${timeStr}<br>Дата: ${dateStr}`;
        }

        return content;
    },

    getChartColors(type) {
        return this.colors[type] || {
            line: '#45AEAC',
            area: 'rgba(69, 174, 172, 0.3)',
            gradient: ['#45AEAC', '#65BEBC']
        };
    },

    isValidInsolationValue(value) {
        return !isNaN(value) && value >= 0 && value <= 2000;
    },

    normalizeInsolationValue(value, hour = 12) {
        let normalized = parseFloat(value);

        if (isNaN(normalized)) {
            return 0;
        }

        if (hour < 6 || hour > 20) {
            normalized = Math.max(0, normalized * 0.1);
        }

        return Math.min(1200, normalized);
    },

    clearCache() {
        if (this.mockDataCache) {
            this.mockDataCache.clear();
        }
    }
};

ChartUtils.mockDataCache = new Map();

window.ChartUtils = ChartUtils;