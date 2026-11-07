import { ar } from './ar';
import { arPages } from './ar.pages';
import { arFeatures } from './ar.features';
import { arUpdates } from './ar.updates';
import { arThemes } from './ar.themes';
import { arLayouts } from './ar.layouts';
import { arNav } from './ar.nav';
import { arAlerts } from './ar.alerts';
import { arSeo } from './ar.seo';
import { arCatalog } from './ar.catalog';
import { arHero } from './ar.hero';
import { arPartners } from './ar.partners';
import { arBranches } from './ar.branches';
const dictionary = { ...ar, ...arPages, ...arCatalog, ...arHero, ...arPartners, ...arBranches, ...arFeatures, ...arUpdates, ...arThemes, ...arLayouts, ...arNav, ...arAlerts, ...arSeo };

export const t = (key, vars) => {
  const raw = Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : key;
  if (!vars) return raw;
  return String(raw).replace(/\{(\w+)\}/g, (match, name) =>
    vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : match
  );
};