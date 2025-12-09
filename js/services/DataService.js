class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
        this.baseUrl = 'http://127.0.0.1:8000';
        this.USE_REAL_API = true;
    }

    async getChartData(filters) {
        const cacheKey = this.getCacheKey(filters);
        const cached = this.cache.get(cacheKey);

        if (cached && this.isCacheValid(cached.timestamp)) {
            console.log('Используем кэшированные данные');
            return cached.data;
        }

        try {
            let data;
            if (this.USE_REAL_API) {
                console.log('Запрос к реальному API...');
                data = await this.fetchRealData(filters);
            } else {
                console.log('Используем демо-данные...');
                data = await this.fetchMockData(filters);
            }

            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('DataService error:', error);
            console.log('Переключаемся на демо-данные из-за ошибки API');
            return this.fetchMockData(filters);
        }
    }

    async fetchRealData(filters) {
        const params = new URLSearchParams();

        if (filters.startDate) {
            params.append('start_date', this.formatDateForAPI(filters.startDate));
        }
        if (filters.endDate) {
            params.append('end_date', this.formatDateForAPI(filters.endDate));
        }
        if (filters.region && filters.region !== 'all') {
            // Теперь отправляем русское название напрямую
            params.append('region', filters.region);
        }

        const metrics = ['pressure', 'insolation', 'humidity', 'temperature'];
        metrics.forEach(metric => {
            params.append('required_telemetry', metric);
        });

        const url = `${this.baseUrl}/filtered?${params.toString()}`;
        console.log('API запрос:', url);

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const apiData = await response.json();
        console.log('API ответ получен:', apiData);

        return this.transformApiData(apiData, filters);
    }

    formatDateForAPI(date) {
        return date.toISOString().split('T')[0] + 'T00:00:00';
    }

    transformApiData(apiData, filters) {
        const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);

        return {
            temperature: this.generateDataFromApi(apiData.temperature, daysDiff, 'temperature'),
            humidity: this.generateDataFromApi(apiData.humidity, daysDiff, 'humidity'),
            pressure: this.generateDataFromApi(apiData.pressure, daysDiff, 'pressure'),
            insolation: this.generateDataFromApi(apiData.insolation, daysDiff, 'insolation'),
            metadata: {
                region: filters.region,
                period: this.formatPeriod(filters.startDate, filters.endDate),
                generatedAt: new Date().toISOString(),
                source: 'api',
                apiData: apiData
            }
        };
    }

    generateDataFromApi(apiValue, days, type) {
        if (apiValue === null || apiValue === undefined) {
            console.log(`API не вернуло данные для ${type}, используем демо-данные`);
            return ChartUtils.generateMockData('Москва', days, type);
        }

        const avgValue = apiValue / days;
        const data = [];

        for (let i = 0; i < days; i++) {
            const fluctuation = (Math.random() - 0.5) * (avgValue * 0.1);
            const dailyValue = avgValue + fluctuation;
            data.push(Number(dailyValue.toFixed(1)));
        }

        console.log(`Сгенерировано ${days} точек для ${type} на основе API (среднее: ${avgValue.toFixed(1)})`);
        return data;
    }

    async fetchMockData(filters) {
        await this.delay(300);
        const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);

        return {
            temperature: ChartUtils.generateMockData(filters.region, daysDiff, 'temperature'),
            humidity: ChartUtils.generateMockData(filters.region, daysDiff, 'humidity'),
            pressure: ChartUtils.generateMockData(filters.region, daysDiff, 'pressure'),
            insolation: ChartUtils.generateMockData(filters.region, daysDiff, 'insolation'),
            metadata: this.createMetadata(filters, 'demo')
        };
    }

    createMetadata(filters, source = 'demo') {
        return {
            region: filters.region,
            period: this.formatPeriod(filters.startDate, filters.endDate),
            generatedAt: new Date().toISOString(),
            source: source
        };
    }

    getCacheKey(filters) {
        const startDate = filters.startDate.toISOString().split('T')[0];
        const endDate = filters.endDate.toISOString().split('T')[0];
        return `chart-${filters.region}-${startDate}-${endDate}`;
    }

    formatPeriod(startDate, endDate) {
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        return `${startStr} - ${endStr}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isCacheValid(timestamp) {
        return Date.now() - timestamp < this.cacheTimeout;
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    setApiMode(useRealApi) {
        this.USE_REAL_API = useRealApi;
        this.clearCache();
        console.log(`Режим API изменен: ${useRealApi ? 'реальный API' : 'демо-данные'}`);
    }
}

window.DataService = new DataService();