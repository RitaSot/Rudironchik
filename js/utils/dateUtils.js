const DateUtils = {
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    },

    formatDisplayDate(date) {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    formatDateTime(date) {
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatHour(date) {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatMonth(date) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        const year = date.getFullYear();
        return `${months[date.getMonth()]} ${year}`;
    },

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    addHours(date, hours) {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    },

    addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    },

    getDaysDiff(startDate, endDate) {
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    getHoursDiff(startDate, endDate) {
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60));
    },

    isValidDateRange(startDate, endDate) {
        return startDate <= endDate;
    },

    getChartLabels(startDate, endDate) {
        const days = this.getDaysDiff(startDate, endDate);
        const labels = [];

        for (let i = 0; i <= days; i++) {
            const currentDate = this.addDays(startDate, i);
            labels.push(this.formatDisplayDate(currentDate));
        }

        return labels;
    }
};

window.DateUtils = DateUtils;