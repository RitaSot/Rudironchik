const DomUtils = {
    createElement: (type, props, ...children) => {
        try {
            return React.createElement(type, props, ...children);
        } catch (error) {
            console.error('Error creating element:', error);
            return React.createElement('div', null, 'Ошибка отображения');
        }
    }
};

window.DomUtils = DomUtils;