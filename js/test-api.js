// ==================== ТЕСТИРОВАНИЕ API ====================
class ApiTester {
    constructor(baseUrl = 'http://127.0.0.1:8000') {
        this.baseUrl = baseUrl;
    }

    async runAllTests() {
        console.log('🔍 Запуск тестов API...');

        const tests = [
            { name: 'Базовое подключение', test: this.testBasicConnection.bind(this) },
            { name: 'Эндпоинт /telemetry', test: this.testTelemetryEndpoint.bind(this) },
            { name: 'Эндпоинт /filtered', test: this.testFilteredEndpoint.bind(this) },
            { name: 'Фильтры по дате', test: this.testFilteredWithParams.bind(this) }
        ];

        let results = [];
        let passed = 0;

        for (let i = 0; i < tests.length; i++) {
            const result = await tests[i].test();
            results.push({
                name: tests[i].name,
                passed: result.passed,
                message: result.message
            });

            if (result.passed) {
                passed++;
                console.log(`✅ ${tests[i].name}: ${result.message}`);
            } else {
                console.error(`❌ ${tests[i].name}: ${result.message}`);
            }

            // Небольшая задержка между тестами
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`📊 Итог: ${passed}/${tests.length} тестов пройдено`);
        this.showResults(results);

        return results;
    }

    async testBasicConnection() {
        try {
            const startTime = Date.now();
            const response = await fetch(this.baseUrl);
            const endTime = Date.now();
            const time = endTime - startTime;

            return {
                passed: response.ok,
                message: `HTTP ${response.status} (${time}мс)`
            };
        } catch (error) {
            return {
                passed: false,
                message: `${error.message}`
            };
        }
    }

    async testTelemetryEndpoint() {
        try {
            const response = await fetch(`${this.baseUrl}/telemetry`);
            if (!response.ok) {
                return {
                    passed: false,
                    message: `HTTP ${response.status}`
                };
            }

            const data = await response.json();
            const fields = ['pressure', 'insolation', 'humidity', 'temperature'];
            const missingFields = fields.filter(field => !(field in data));

            return {
                passed: missingFields.length === 0,
                message: missingFields.length === 0 ?
                    `Все поля присутствуют` :
                    `Отсутствуют поля: ${missingFields.join(', ')}`
            };
        } catch (error) {
            return {
                passed: false,
                message: `${error.message}`
            };
        }
    }

    async testFilteredEndpoint() {
        try {
            const response = await fetch(`${this.baseUrl}/filtered`);
            if (!response.ok) {
                return {
                    passed: false,
                    message: `HTTP ${response.status}`
                };
            }

            const data = await response.json();
            const hasData = Object.values(data).some(val => val !== null);

            return {
                passed: hasData,
                message: hasData ?
                    `Данные получены` :
                    `Нет данных (все значения null)`
            };
        } catch (error) {
            return {
                passed: false,
                message: `${error.message}`
            };
        }
    }

    async testFilteredWithParams() {
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const params = new URLSearchParams({
                required_telemetry: 'temperature',
                start_date: yesterday.toISOString().split('T')[0] + 'T00:00:00',
                end_date: today.toISOString().split('T')[0] + 'T23:59:59'
            });

            const response = await fetch(`${this.baseUrl}/filtered?${params}`);
            if (!response.ok) {
                return {
                    passed: false,
                    message: `HTTP ${response.status}`
                };
            }

            const data = await response.json();

            return {
                passed: data.temperature !== null,
                message: data.temperature !== null ?
                    `Температура: ${data.temperature}` :
                    `Нет данных о температуре`
            };
        } catch (error) {
            return {
                passed: false,
                message: `${error.message}`
            };
        }
    }

    showResults(results) {
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const percentage = Math.round((passedCount / totalCount) * 100);

    const resultDiv = document.createElement('div');
    resultDiv.id = 'api-test-results';
    resultDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${percentage === 100 ? '#28a745' : percentage >= 50 ? '#ffc107' : '#dc3545'};
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-family: 'Segoe UI', sans-serif;
        max-width: 350px;
        animation: slideInRight 0.3s ease;
    `;

    let html = `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span style="font-size: 1.5em;">${percentage === 100 ? '✅' : percentage >= 50 ? '⚠️' : '❌'}</span>
        <div>
            <strong style="display: block; margin-bottom: 5px;">Тест API завершен</strong>
            <span style="font-size: 0.9em;">${passedCount}/${totalCount} тестов пройдено (${percentage}%)</span>
        </div>
    </div>`;

    results.forEach((test, index) => {
        html += `<div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${index + 1}. ${test.name}</span>
                <span style="font-weight: bold;">${test.passed ? '✅' : '❌'}</span>
            </div>
            <div style="font-size: 0.8em; margin-top: 4px; opacity: 0.9;">${test.message}</div>
        </div>`;
    });

    resultDiv.innerHTML = html;
    document.body.appendChild(resultDiv);

    // Автоматическое закрытие через 15 секунд (без кнопки закрытия)
    setTimeout(() => {
        if (document.getElementById('api-test-results')) {
            resultDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => resultDiv.remove(), 300);
        }
    }, 15000);

    // Добавить стили анимации
    if (!document.querySelector('#api-test-animations')) {
        const style = document.createElement('style');
        style.id = 'api-test-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Автоматический запуск тестов при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    console.log('Запуск автоматического тестирования API...');

    // Создаем кнопку для ручного запуска тестов
    const testButton = document.createElement('button');
    testButton.textContent = '🔍 Тест API';
    testButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #45AEAC;
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;

    testButton.onmouseover = () => {
        testButton.style.transform = 'translateY(-2px)';
        testButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    };

    testButton.onmouseout = () => {
        testButton.style.transform = 'translateY(0)';
        testButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    };

    testButton.onclick = async () => {
        testButton.disabled = true;
        testButton.textContent = '⏳ Тестируем...';

        const tester = new ApiTester();
        await tester.runAllTests();

        testButton.disabled = false;
        testButton.textContent = '🔍 Тест API';
    };

    document.body.appendChild(testButton);

    // Автоматический тест при загрузке (только на localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(async () => {
            console.log('Запуск автоматического теста API...');
            const tester = new ApiTester();
            await tester.runAllTests();
        }, 2000);
    }
});

window.ApiTester = ApiTester;