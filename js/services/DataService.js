class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;

        this.sources = {
            THINGSPEAK: 'thingspeak',
            DEMO: 'demo'
        };

        this.currentSource = this.sources.THINGSPEAK;

        this.thingSpeakConfig = {
            channelId: 3200572,
            apiKey: '',
            baseUrl: 'https://api.thingspeak.com'
        };

        this.fieldMapping = {
            temperature: 'field1',
            humidity: 'field2',
            pressure: 'field3',
            insolation: 'field4'
        };

        this.MIN_POINTS = 5;
    }

    async getChartData(filters, interval = 'days') {
        const cacheKey = this.getCacheKey(filters, interval);
        const cached = this.cache.get(cacheKey);

        if (cached && this.isCacheValid(cached.timestamp)) {
            console.log('📦 Используем кэшированные данные');
            return cached.data;
        }

        try {
            let data;
            if (this.currentSource === this.sources.THINGSPEAK) {
                console.log('📡 Загрузка данных из ThingSpeak...');
                data = await this.fetchThingSpeakData(filters, interval);

                if (!this.hasEnoughData(data)) {
                    console.log('⚠️ Данных из ThingSpeak недостаточно, используем демо-данные');
                    data = await this.fetchDemoData(filters, interval);
                    data.metadata.note = 'Используются демо-данные (ThingSpeak данных недостаточно)';
                }
            } else {
                console.log('🔄 Используем демо-данные...');
                data = await this.fetchDemoData(filters, interval);
            }

            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('❌ DataService error:', error);
            return this.fetchDemoData(filters, interval);
        }
    }

    hasEnoughData(data) {
        if (!data || !data.temperature) return false;

        const fields = ['temperature', 'humidity', 'pressure', 'insolation'];
        let hasValidData = false;

        for (const field of fields) {
            const fieldData = data[field] || [];
            const validPoints = fieldData.filter(v => v !== null && v !== undefined).length;

            if (validPoints >= this.MIN_POINTS) {
                hasValidData = true;
            }
        }

        return hasValidData;
    }

    async fetchThingSpeakData(filters, interval) {
        try {
            const results = 8000;
            const params = new URLSearchParams({ results: results });

            if (filters.startDate) {
                const startStr = filters.startDate.toISOString().replace('T', ' ');
                params.append('start', startStr);
            }

            if (filters.endDate) {
                const endStr = filters.endDate.toISOString().replace('T', ' ');
                params.append('end', endStr);
            }

            const url = `${this.thingSpeakConfig.baseUrl}/channels/${this.thingSpeakConfig.channelId}/feeds.json?${params}`;

            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`ThingSpeak error: ${response.status}`);
            }

            const apiData = await response.json();

            if (!apiData.feeds || apiData.feeds.length === 0) {
                throw new Error('Нет данных от ThingSpeak');
            }

            return this.transformThingSpeakData(apiData, filters, interval);
        } catch (error) {
            console.error('❌ Ошибка получения данных из ThingSpeak:', error.message);
            throw error;
        }
    }

    transformThingSpeakData(apiData, filters, interval) {
        const feeds = apiData.feeds || [];
        const sortedFeeds = [...feeds].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        const result = {
            temperature: [],
            humidity: [],
            pressure: [],
            insolation: [],
            timestamps: [],
            metadata: {
                period: this.formatPeriod(filters.startDate, filters.endDate),
                generatedAt: new Date().toISOString(),
                source: 'thingspeak',
                totalRecords: feeds.length,
                interval: interval,
                firstDate: sortedFeeds[0]?.created_at,
                lastDate: sortedFeeds[sortedFeeds.length - 1]?.created_at,
                channelName: apiData.channel?.name || 'Экологический мониторинг',
                note: 'Данные из ThingSpeak'
            }
        };

        for (const feed of sortedFeeds) {
            result.timestamps.push(feed.created_at);
            result.temperature.push(this.parseField(feed[this.fieldMapping.temperature]));
            result.humidity.push(this.parseField(feed[this.fieldMapping.humidity]));
            result.pressure.push(this.parseField(feed[this.fieldMapping.pressure]));
            result.insolation.push(this.parseField(feed[this.fieldMapping.insolation]));
        }

        result.labels = this.generateLabelsFromTimestamps(result.timestamps, interval);

        return result;
    }

    async fetchDemoData(filters, interval = 'days') {
        const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);
        const hoursDiff = DateUtils.getHoursDiff(filters.startDate, filters.endDate);

        let points;
        switch (interval) {
            case 'hours':
                points = Math.min(Math.max(24, hoursDiff), 168);
                break;
            case 'months':
                points = Math.min(Math.max(6, Math.ceil(daysDiff / 30)), 24);
                break;
            default:
                points = Math.min(Math.max(30, daysDiff), 90);
        }

        const { labels, timestamps } = this.generateTimestamps(filters.startDate, points, interval);

        return {
            temperature: this.generateRealisticData(points, 'temperature', interval, timestamps),
            humidity: this.generateRealisticData(points, 'humidity', interval, timestamps),
            pressure: this.generateRealisticData(points, 'pressure', interval, timestamps),
            insolation: this.generateRealisticData(points, 'insolation', interval, timestamps),
            labels: labels,
            timestamps: timestamps,
            metadata: {
                source: 'demo',
                interval: interval,
                totalRecords: points,
                period: `${DateUtils.formatDisplayDate(filters.startDate)} - ${DateUtils.formatDisplayDate(filters.endDate)}`,
                note: 'Демо-данные',
                generatedAt: new Date().toISOString()
            }
        };
    }

    generateTimestamps(startDate, points, interval) {
        const labels = [];
        const timestamps = [];
        let current = new Date(startDate);

        switch (interval) {
            case 'hours':
                current.setMinutes(0, 0, 0);
                for (let i = 0; i < points; i++) {
                    const date = new Date(current);
                    timestamps.push(date.toISOString());
                    labels.push(DateUtils.formatHour(date));
                    current = DateUtils.addHours(current, 1);
                }
                break;

            case 'months':
                current.setDate(15);
                current.setHours(12, 0, 0, 0);
                for (let i = 0; i < points; i++) {
                    const date = new Date(current);
                    timestamps.push(date.toISOString());
                    labels.push(DateUtils.formatMonth(date));
                    current = DateUtils.addMonths(current, 1);
                }
                break;

            default:
                current.setHours(12, 0, 0, 0);
                for (let i = 0; i < points; i++) {
                    const date = new Date(current);
                    timestamps.push(date.toISOString());
                    labels.push(DateUtils.formatDisplayDate(date));
                    current = DateUtils.addDays(current, 1);
                }
        }

        return { labels, timestamps };
    }

    generateLabelsFromTimestamps(timestamps, interval) {
        if (!timestamps || timestamps.length === 0) {
            return [];
        }

        return timestamps.map(timestamp => {
            const date = new Date(timestamp);
            switch (interval) {
                case 'hours':
                    return DateUtils.formatHour(date);
                case 'months':
                    return DateUtils.formatMonth(date);
                default:
                    return DateUtils.formatDisplayDate(date);
            }
        });
    }

    generateRealisticData(points, type, interval, timestamps) {
        const data = [];
        const configs = {
            temperature: { base: 18, dailyAmplitude: 8, seasonalAmplitude: 12, trend: 0.02, noise: 0.5 },
            humidity: { base: 65, dailyAmplitude: 15, seasonalAmplitude: 10, trend: -0.01, noise: 2 },
            pressure: { base: 1013, dailyAmplitude: 5, seasonalAmplitude: 8, trend: 0.005, noise: 0.3 },
            insolation: { base: 0.4, dailyAmplitude: 0.3, seasonalAmplitude: 0.2, trend: 0.001, noise: 0.05 }
        };

        const config = configs[type] || configs.temperature;

        for (let i = 0; i < points; i++) {
            const timestamp = new Date(timestamps[i]);
            let value = config.base;

            const month = timestamp.getMonth();
            const seasonal = Math.sin((month - 3) * Math.PI / 6) * config.seasonalAmplitude;

            const hour = timestamp.getHours();
            const daily = Math.sin((hour - 12) * Math.PI / 12) * config.dailyAmplitude;

            const dayOfWeek = timestamp.getDay();
            const weekly = Math.sin(dayOfWeek * Math.PI / 3.5) * config.dailyAmplitude * 0.3;

            const trend = i * config.trend;
            const noise = (Math.random() - 0.5) * 2 * config.noise;

            value += seasonal + daily + weekly + trend + noise;

            if (type === 'insolation') {
                if (hour < 6 || hour > 20) {
                    value = Math.max(0, value * 0.1);
                }
                if (hour >= 10 && hour <= 16) {
                    value = Math.min(1.0, value * 1.2);
                }
                value = Math.max(0, Math.min(1.2, value));
            } else {
                switch(type) {
                    case 'temperature':
                        value = Math.max(-30, Math.min(35, value));
                        break;
                    case 'humidity':
                        value = Math.max(20, Math.min(100, value));
                        break;
                    case 'pressure':
                        value = Math.max(950, Math.min(1050, value));
                        break;
                }
            }

            if (type === 'insolation') {
                data.push(parseFloat(value.toFixed(3)));
            } else {
                data.push(parseFloat(value.toFixed(2)));
            }
        }

        console.log(`DataService: ${type} сгенерировано (первые 3)`, data.slice(0, 3));
        return data;
    }

    parseField(value) {
        if (value === null || value === undefined || value === '' || value === 'null') {
            return null;
        }
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    formatPeriod(startDate, endDate) {
        const startStr = DateUtils.formatDisplayDate(startDate);
        const endStr = DateUtils.formatDisplayDate(endDate);
        return `${startStr} - ${endStr}`;
    }

    getCacheKey(filters, interval) {
        const startDate = DateUtils.formatDateForInput(filters.startDate);
        const endDate = DateUtils.formatDateForInput(filters.endDate);
        return `${this.currentSource}-${interval}-${startDate}-${endDate}`;
    }

    isCacheValid(timestamp) {
        return Date.now() - timestamp < this.cacheTimeout;
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Кэш очищен');
    }

    setDataSource(source) {
        if (source === 'thingspeak' || source === 'demo') {
            this.currentSource = source;
            this.clearCache();
            console.log(`🔄 Источник данных изменен: ${source}`);
            return true;
        }
        console.warn(`⚠️ Неизвестный источник данных: ${source}`);
        return false;
    }

    getDataSource() {
        return this.currentSource;
    }

    async testThingSpeakConnection() {
        try {
            const url = `${this.thingSpeakConfig.baseUrl}/channels/${this.thingSpeakConfig.channelId}/feeds.json?results=5`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                const channelName = data.channel?.name || 'Неизвестный канал';
                const feeds = data.feeds || [];
                const insolationValues = feeds.map(feed => feed.field4).filter(val => val);
                console.log('ThingSpeak данные инсоляции:', insolationValues);

                return {
                    success: true,
                    channelName: channelName,
                    lastUpdate: feeds[feeds.length - 1]?.created_at,
                    totalRecords: feeds.length,
                    insolationValues: insolationValues.slice(0, 3),
                    message: 'ThingSpeak доступен'
                };
            } else {
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getThingSpeakChannelInfo() {
        try {
            const url = `${this.thingSpeakConfig.baseUrl}/channels/${this.thingSpeakConfig.channelId}.json`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                return { success: true, channel: data };
            } else {
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

window.DataService = new DataService();