import { cache } from 'react';
import { getTexts } from '@/lib/api/texts';
import { buildT } from '@/lib/texts';

export const getT = cache(async () => buildT(await getTexts()));