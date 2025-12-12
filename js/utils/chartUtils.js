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