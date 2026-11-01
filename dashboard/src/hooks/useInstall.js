import { useEffect, useState } from 'react';
import { clearInstallPrompt, getInstallPrompt } from '../pwa/register';

const standalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export default function useInstall() {
    const [, force] = useState(0);

    useEffect(() => {
        const update = () => force((value) => value + 1);
        window.addEventListener('install:change', update);
        return () => window.removeEventListener('install:change', update);
    }, []);

    const install = async () => {
        const prompt = getInstallPrompt();
        if (!prompt) return;
        prompt.prompt();
        await prompt.userChoice;
        clearInstallPrompt();
        force((value) => value + 1);
    };

    return { canInstall: Boolean(getInstallPrompt()), installed: standalone(), install };
}