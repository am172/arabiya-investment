let deferred = null;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event;
    window.dispatchEvent(new Event('install:change'));
});

window.addEventListener('appinstalled', () => {
    deferred = null;
    window.dispatchEvent(new Event('install:change'));
});

export const getInstallPrompt = () => deferred;
export const clearInstallPrompt = () => {
    deferred = null;
};

export const registerServiceWorker = () => {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => { });
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'push') window.dispatchEvent(new Event('messages:changed'));
    });
};