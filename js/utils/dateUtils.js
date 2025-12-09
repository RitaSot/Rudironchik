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

    getStartOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    getEndOfWeek(date) {
        const start = this.getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return end;
    },

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    getDaysDiff(startDate, endDate) {
        return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    },

    getMonthName(date) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[date.getMonth()];
    },

    getChartLabels(startDate, endDate) {
        const daysDiff = this.getDaysDiff(startDate, endDate);

        if (daysDiff > 60) {
            return this.getMonthLabels(startDate, endDate);
        }

        if (daysDiff > 14) {
            return this.getWeekLabels(startDate, endDate, daysDiff);
        }

        return this.getDayLabels(startDate, endDate, daysDiff);
    },

    getMonthLabels(startDate, endDate) {
        const monthLabels = [];
        let current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const monthYear = this.getMonthName(current);
            if (!monthLabels.includes(monthYear)) {
                monthLabels.push(monthYear);
            }
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }
        return monthLabels;
    },

    getWeekLabels(startDate, endDate, daysDiff) {
        const weekLabels = [];
        const step = Math.ceil(daysDiff / 8);

        for (let i = 0; i < daysDiff; i += step) {
            const date = this.addDays(startDate, i);
            weekLabels.push(`${date.getDate()} ${this.getMonthName(date).substring(0, 3)}`);
        }
        return weekLabels;
    },

    getDayLabels(startDate, endDate, daysDiff) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const dayLabels = [];

        for (let i = 0; i < daysDiff; i++) {
            const date = this.addDays(startDate, i);
            dayLabels.push(`${days[date.getDay()]} ${date.getDate()}`);
        }
        return dayLabels;
    },

    isValidDateRange(startDate, endDate) {
        return startDate <= endDate;
    }
};

window.DateUtils = DateUtils;