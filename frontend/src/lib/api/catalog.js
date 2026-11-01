import { cache } from 'react';
import api from './client';
import safe from './safe';

const decode = (value) => {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
};

const seg = (slug) => encodeURIComponent(decode(String(slug || '')));

export const getCatalogTree = cache((maxDepth = 3) =>
    safe(() => api.get('/public/catalog/tree', { params: { maxDepth } }), [])
);

export const getCategories = cache(() => safe(() => api.get('/public/catalog/categories'), []));

export const getCategory = cache((slug) =>
    safe(() => api.get(`/public/catalog/categories/${seg(slug)}`), null)
);

export const getProduct = cache((slug) =>
    safe(() => api.get(`/public/catalog/products/${seg(slug)}`), null)
);

export const getFeaturedProducts = cache((limit = 8) =>
    safe(() => api.get('/public/catalog/featured', { params: { limit } }), [])
);

export const getCatalogSitemap = () => safe(() => api.get('/public/catalog/sitemap'), []);

export const searchCatalog = (query) => {
    const term = String(query || '').trim();
    if (term.length < 2) return Promise.resolve([]);
    return safe(() => api.get('/public/catalog/search', { params: { q: term } }), []);
};

export const getCategoryProducts = async (slug, params = {}) => {
    try {
        const res = await api.get(`/public/catalog/categories/${seg(slug)}/products`, { params });
        return { items: res.data || [], meta: res.meta || null };
    } catch (error) {
        if ((!error.status || error.status >= 500) && typeof window === 'undefined') throw error;
        return { items: [], meta: null };
    }
};