import { TEXT_GROUPS } from '@/content/textRegistry';

const DEFAULTS = Object.fromEntries(
    TEXT_GROUPS.flatMap((group) => group.fields.map(([key, , value]) => [key, value]))
);

export const buildT = (overrides) => {
    const source = overrides && typeof overrides === 'object' ? overrides : {};

    return (key, vars) => {
        const custom = source[key];
        const raw = typeof custom === 'string' && custom.trim() ? custom : DEFAULTS[key] ?? '';
        if (!vars) return raw;
        return raw.replace(/\{(\w+)\}/g, (match, name) =>
            vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : match
        );
    };
};