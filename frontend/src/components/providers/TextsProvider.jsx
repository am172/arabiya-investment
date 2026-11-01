'use client';

import { createContext, useContext, useMemo } from 'react';
import { buildT } from '@/lib/texts';

const TextsContext = createContext(buildT({}));

export function TextsProvider({ values, children }) {
  const t = useMemo(() => buildT(values), [values]);
  return <TextsContext.Provider value={t}>{children}</TextsContext.Provider>;
}

export const useT = () => useContext(TextsContext);