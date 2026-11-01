import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function useQr(text) {
    const [qr, setQr] = useState('');

    useEffect(() => {
        let active = true;
        if (!text) {
            setQr('');
            return undefined;
        }
        QRCode.toDataURL(text, {
            margin: 1,
            width: 360,
            errorCorrectionLevel: 'M',
            color: { dark: '#0f172a', light: '#ffffff' }
        })
            .then((url) => active && setQr(url))
            .catch(() => { });
        return () => {
            active = false;
        };
    }, [text]);

    return qr;
}