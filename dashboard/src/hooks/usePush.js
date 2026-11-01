import { useCallback, useEffect, useState } from 'react';
import notificationService from '../services/notification.service';

const isSupported = () =>
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const toKey = (value) => {
    const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
    const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const currentSubscription = async () => {
    const registration = await navigator.serviceWorker.getRegistration('/');
    return registration ? registration.pushManager.getSubscription() : null;
};

export default function usePush(publicKey) {
    const supported = isSupported();
    const [permission, setPermission] = useState(supported ? Notification.permission : 'denied');
    const [subscribed, setSubscribed] = useState(false);
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(async () => {
        if (!supported) return;
        const subscription = await currentSubscription().catch(() => null);
        setPermission(Notification.permission);
        setSubscribed(Boolean(subscription));
    }, [supported]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const enable = useCallback(async () => {
        setBusy(true);
        try {
            const result = await Notification.requestPermission();
            if (result !== 'granted') return { ok: false, reason: 'denied' };

            const registration = await navigator.serviceWorker.ready;
            const options = { userVisibleOnly: true, applicationServerKey: toKey(publicKey) };
            let subscription;
            try {
                subscription = await registration.pushManager.subscribe(options);
            } catch (error) {
                const existing = await registration.pushManager.getSubscription();
                if (!existing) throw error;
                await existing.unsubscribe();
                subscription = await registration.pushManager.subscribe(options);
            }

            await notificationService.subscribe(subscription.toJSON());
            return { ok: true };
        } catch (error) {
            return { ok: false, reason: 'failed', message: error.message };
        } finally {
            await refresh();
            setBusy(false);
        }
    }, [publicKey, refresh]);

    const disable = useCallback(async () => {
        setBusy(true);
        try {
            const subscription = await currentSubscription();
            if (subscription) {
                await notificationService.unsubscribe(subscription.endpoint).catch(() => { });
                await subscription.unsubscribe();
            }
        } finally {
            await refresh();
            setBusy(false);
        }
    }, [refresh]);

    return { supported, permission, subscribed, busy, enable, disable };
}