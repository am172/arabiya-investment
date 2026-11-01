import { useLayoutEffect, useRef, useState } from 'react';
import { CERT_HEIGHT, CERT_WIDTH } from '../../utils/certificatePdf';

export default function ScaledCertificate({ children, className = '' }) {
    const ref = useRef(null);
    const [scale, setScale] = useState(0.2);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        const update = () => setScale(element.clientWidth / CERT_WIDTH);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            dir="ltr"
            className={`relative w-full overflow-hidden ${className}`}
            style={{ height: CERT_HEIGHT * scale }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: CERT_WIDTH,
                    height: CERT_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left'
                }}
            >
                {children}
            </div>
        </div>
    );
}