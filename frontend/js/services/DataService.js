// Data service with caching
class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Получение данных с кэшированием
    async getChartData(filters) {
        const cacheKey = this.getCacheKey(filters);

        // Проверка кэша
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const data = await this.fetchData(filters);

            // Сохранение в кэш
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('DataService error:', error);
            throw error;
        }
    }

    // Генерация ключа для кэша
    getCacheKey(filters) {
        return `chart-${filters.region}-${filters.startDate}-${filters.endDate}`;
    }

    // Запрос данных (заглушка для демо)
    async fetchData(filters) {
        // Имитация загрузки
        await new Promise(resolve => setTimeout(resolve, 500));

        const daysDiff = DateUtils.getDaysDiff(filters.startDate, filters.endDate);

        return {
            temperature: ChartUtils.generateMockData(filters.region, daysDiff, 'temperature'),
            humidity: ChartUtils.generateMockData(filters.region, daysDiff, 'humidity'),
            pressure: ChartUtils.generateMockData(filters.region, daysDiff, 'pressure'),
            insolation: ChartUtils.generateMockData(filters.region, daysDiff, 'insolation'),
            metadata: {
                region: filters.region,
                period: `${filters.startDate.toISOString().split('T')[0]} - ${filters.endDate.toISOString().split('T')[0]}`,
                generatedAt: new Date().toISOString()
            }
        };
    }

    // Очистка кэша
    clearCache() {
        this.cache.clear();
    }

    // Получение статистики кэша
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
window.DataService = new DataService();