'use client';

import { createContext, useContext, useMemo } from 'react';

const SectionsContext = createContext(new Set());

export function SectionsProvider({ hidden, children }) {
    const key = hidden.join('|');
    const value = useMemo(() => new Set(key ? key.split('|') : []), [key]);
    return <SectionsContext.Provider value={value}>{children}</SectionsContext.Provider>;
}

export const useHiddenSections = () => useContext(SectionsContext);