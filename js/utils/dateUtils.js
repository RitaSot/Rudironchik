// Date utilities
const DateUtils = {
    // Форматирование даты для input[type="date"]
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    },

    // Форматирование даты для отображения
    formatDisplayDate(date) {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    // Получение начала месяца
    getStartOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    // Получение начала недели (понедельник)
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    // Получение конца недели
    getEndOfWeek(date) {
        const start = this.getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return end;
    },

    // Добавление дней к дате
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // Разница в днях между двумя датами
    getDaysDiff(startDate, endDate) {
        return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    },

    // Получение названия месяца
    getMonthName(date) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[date.getMonth()];
    },

    // Получение подписей для графика в зависимости от периода
    getChartLabels(startDate, endDate) {
        const daysDiff = this.getDaysDiff(startDate, endDate);

        // Для периодов больше месяца показываем месяцы
        if (daysDiff > 60) {
            const monthLabels = [];
            let current = new Date(startDate);

            while (current <= endDate) {
                const monthYear = `${this.getMonthName(current)}`;
                if (!monthLabels.includes(monthYear)) {
                    monthLabels.push(monthYear);
                }
                current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
            }
            return monthLabels;
        }

        // Для периодов 2-8 недель показываем недели
        if (daysDiff > 14) {
            const weekLabels = [];
            const step = Math.ceil(daysDiff / 8);
            for (let i = 0; i < daysDiff; i += step) {
                const date = this.addDays(startDate, i);
                weekLabels.push(`${date.getDate()} ${this.getMonthName(date).substring(0, 3)}`);
            }
            return weekLabels;
        }

        // Для коротких периодов показываем дни
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const dayLabels = [];
        for (let i = 0; i < daysDiff; i++) {
            const date = this.addDays(startDate, i);
            dayLabels.push(`${days[date.getDay()]} ${date.getDate()}`);
        }
        return dayLabels;
    },

    // Валидация дат
    isValidDateRange(startDate, endDate) {
        return startDate <= endDate;
    }
};

window.DateUtils = DateUtils;