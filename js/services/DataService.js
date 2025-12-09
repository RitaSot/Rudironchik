class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
    }

    async getChartData(filters) {
        const cacheKey = this.getCacheKey(filters);
        const cached = this.cache.get(cacheKey);

        if (cached && this.isCacheValid(cached.timestamp)) {
            return cached.data;
        }

        try {
            const data = await this.fetchData(filters);
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('DataService error:', error);
            throw error;
        }
    }

    getCacheKey(filters) {
        const startDate = filters.startDate.toISOString().split('T')[0];
        const endDate = filters.endDate.toISOString().split('T')[0];
        return `chart-${filters.region}-${startDate}-${endDate}`;
    }

    async fetchData(filters) {
        await this.delay(500);
        const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);
        const types = ['temperature', 'humidity', 'pressure', 'insolation'];
        const data = {};

        types.forEach(type => {
            data[type] = ChartUtils.generateMockData(filters.region, daysDiff, type);
        });

        return {
            ...data,
            metadata: this.createMetadata(filters)
        };
    }

    createMetadata(filters) {
        return {
            region: filters.region,
            period: this.formatPeriod(filters.startDate, filters.endDate),
            generatedAt: new Date().toISOString()
        };
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
}

window.DataService = new DataService();