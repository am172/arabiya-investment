'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const RequestModal = dynamic(() => import('@/components/catalog/RequestModal'), { ssr: false });

const RequestContext = createContext({ open: () => { }, close: () => { } });

export function RequestProvider({ children }) {
    const [product, setProduct] = useState(null);

    const open = useCallback((item) => setProduct(item), []);
    const close = useCallback(() => setProduct(null), []);
    const value = useMemo(() => ({ open, close }), [open, close]);

    return (
        <RequestContext.Provider value={value}>
            {children}
            {product && <RequestModal key={product._id} product={product} onClose={close} />}
        </RequestContext.Provider>
    );
}

export const useRequest = () => useContext(RequestContext);