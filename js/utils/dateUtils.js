const DateUtils = {
    formatDateForInput: date => date.toISOString().split('T')[0],

    formatDisplayDate: date => date.toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
    }),

    formatDateTime: date => date.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }),

    formatHour: date => date.toLocaleTimeString('ru-RU', {
        hour: '2-digit', minute: '2-digit'
    }),

    formatMonth: date => {
        const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    },

    addDays: (date, days) => new Date(date.getTime() + days * 86400000),
    addHours: (date, hours) => new Date(date.getTime() + hours * 3600000),
    addMonths: (date, months) => new Date(date.setMonth(date.getMonth() + months)),

    getDaysDiff: (start, end) => Math.ceil((end - start) / 86400000),
    getHoursDiff: (start, end) => Math.ceil((end - start) / 3600000)
};

window.DateUtils = DateUtils;