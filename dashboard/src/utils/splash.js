const BRAND_KEY = 'dashboard_brand';
const MIN_MS = 600;

export const rememberBrand = ({ name, logo, color }) => {
    try {
        localStorage.setItem(
            BRAND_KEY,
            JSON.stringify({ name: name || '', logo: logo || '', color: color || '' })
        );
    } catch (error) {
        return;
    }
};

export const readBrand = () => {
    try {
        return JSON.parse(localStorage.getItem(BRAND_KEY)) || {};
    } catch (error) {
        return {};
    }
};

export const hideSplash = () => {
    const element = document.getElementById('boot-splash');
    if (!element || element.dataset.leaving) return;
    element.dataset.leaving = '1';
    setTimeout(() => {
        element.classList.add('boot-out');
        setTimeout(() => element.remove(), 500);
    }, Math.max(0, MIN_MS - performance.now()));
};