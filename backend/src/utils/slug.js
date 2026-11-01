const slugify = (value) =>
    String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
        .replace(/-+$/g, '');

const uniqueSlug = async (Model, scope, base, { taken = new Set(), excludeId = null } = {}) => {
    const root = slugify(base) || 'item';

    for (let attempt = 1; attempt < 1000; attempt += 1) {
        const candidate = attempt === 1 ? root : `${root}-${attempt}`;
        if (!taken.has(candidate)) {
            const filter = { ...scope, slug: candidate };
            if (excludeId) filter._id = { $ne: excludeId };
            if (!(await Model.exists(filter))) {
                taken.add(candidate);
                return candidate;
            }
        }
    }

    return `${root}-${Date.now()}`;
};

module.exports = { slugify, uniqueSlug };