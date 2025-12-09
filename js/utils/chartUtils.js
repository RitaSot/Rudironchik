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

    generateMockData(region, days, type) {
        const regionProfiles = {
            'Москва': { // Было 'moscow'
                temperature: { base: 18, range: 15, trend: 0.1, seasonal: 0.3 },
                humidity: { base: 65, range: 20, trend: -0.05, seasonal: 0.2 },
                pressure: { base: 1013, range: 10, trend: 0.02, seasonal: 0.1 },
                insolation: { base: 5000, range: 3000, trend: 0.15, seasonal: 0.4 }
            },
            'Санкт-Петербург': { // Было 'saint-petersburg'
                temperature: { base: 15, range: 12, trend: 0.08, seasonal: 0.25 },
                humidity: { base: 75, range: 15, trend: -0.03, seasonal: 0.15 },
                pressure: { base: 1010, range: 12, trend: 0.01, seasonal: 0.08 },
                insolation: { base: 3500, range: 2500, trend: 0.12, seasonal: 0.35 }
            },
            'Краснодарский край': { // Было 'krasnodar'
                temperature: { base: 22, range: 10, trend: 0.12, seasonal: 0.35 },
                humidity: { base: 60, range: 25, trend: -0.08, seasonal: 0.25 },
                pressure: { base: 1015, range: 8, trend: 0.03, seasonal: 0.12 },
                insolation: { base: 7000, range: 2000, trend: 0.18, seasonal: 0.45 }
            }
        };

        const profile = regionProfiles[region] || regionProfiles['Москва'];
        const config = profile[type] || profile.temperature;
        const data = [];

        for (let i = 0; i < days; i++) {
            const seasonal = Math.sin(i / 30 * Math.PI * 2) * (config.range * config.seasonal);
            const random = (Math.random() - 0.5) * (config.range * 0.3);
            const trend = i * config.trend;
            const daily = Math.sin(i * 0.5) * (config.range * 0.1);

            const value = config.base + seasonal + random + trend + daily;
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
    }
};

window.ChartUtils = ChartUtils;