'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const TILES = process.env.NEXT_PUBLIC_MAP_TILES_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

const has = (point) => typeof point.lat === 'number' && typeof point.lng === 'number';

const pin = (L, kind, active) => {
    const scale = (kind === 'group' ? 1 : 0.76) * (active ? 1.25 : 1);
    const width = Math.round(36 * scale);
    const height = Math.round(44 * scale);
    const color = kind === 'group' ? 'text-primary' : 'text-accent';

    return L.divIcon({
        className: 'branch-pin',
        iconSize: [width, height],
        iconAnchor: [width / 2, height],
        popupAnchor: [0, -height + 6],
        html: `<svg viewBox="0 0 36 44" width="${width}" height="${height}" class="${color}" aria-hidden="true"><path d="M18 43C18 43 2 26.5 2 16C2 7.2 9.2 1 18 1s16 6.2 16 15C34 26.5 18 43 18 43Z" fill="currentColor" stroke="white" stroke-width="2"/><path d="M18 9v14m0 0l-5.5-5.5M18 23l5.5-5.5" stroke="white" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    });
};

export default function BranchesMap({ groups, focus, onSelect, labels }) {
    const holder = useRef(null);
    const store = useRef({ map: null, L: null, markers: new Map() });
    const latest = useRef({ focus, onSelect, labels });
    latest.current = { focus, onSelect, labels };

    const applyFocus = () => {
        const { map, markers } = store.current;
        const { focus: current } = latest.current;
        if (!map) return;

        markers.forEach((entry, key) => {
            entry.marker.setIcon(pin(store.current.L, entry.kind, current && current.key === key));
            entry.marker.setZIndexOffset(current && current.key === key ? 1000 : 0);
        });

        if (!current) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) map.setView([current.lat, current.lng], current.zoom);
        else map.flyTo([current.lat, current.lng], current.zoom, { duration: 1.1 });

        const entry = markers.get(current.key);
        if (entry) entry.marker.openPopup();
    };

    useEffect(() => {
        let cancelled = false;
        let map = null;
        let observer = null;

        (async () => {
            const L = (await import('leaflet')).default;
            if (cancelled || !holder.current) return;

            map = L.map(holder.current, { scrollWheelZoom: false, worldCopyJump: true });
            L.tileLayer(TILES, {
                maxZoom: 19,
                attribution: ATTRIBUTION,
                referrerPolicy: 'strict-origin-when-cross-origin'
            }).addTo(map);
            map.on('focus', () => map.scrollWheelZoom.enable());
            map.on('blur', () => map.scrollWheelZoom.disable());

            if (typeof ResizeObserver === 'function') {
                observer = new ResizeObserver(() => {
                    if (map) map.invalidateSize();
                });
                observer.observe(holder.current);
            }

            store.current = { map, L, markers: new Map() };
            const bounds = [];

            const add = (key, point, label, kind, g, o) => {
                const marker = L.marker([point.lat, point.lng], { icon: pin(L, kind, false), title: label, keyboard: true });
                const box = document.createElement('div');
                const strong = document.createElement('strong');
                strong.textContent = label;
                const link = document.createElement('a');
                link.href = `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=16/${point.lat}/${point.lng}`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = latest.current.labels.open;
                link.className = 'block mt-1 underline text-primary';
                box.append(strong, link);
                marker.bindPopup(box);
                marker.on('click', () => latest.current.onSelect(g, o));
                marker.addTo(map);
                store.current.markers.set(key, { marker, kind });
                bounds.push([point.lat, point.lng]);
            };

            groups.forEach((group, g) => {
                if (has(group)) add(`${g}`, group, group.title, 'group', g, null);
                group.offices.forEach((office, o) => {
                    if (has(office)) add(`${g}-${o}`, office, office.name, 'office', g, o);
                });
            });

            if (bounds.length === 0) map.setView([24.7136, 46.6753], 5);
            else if (bounds.length === 1) map.setView(bounds[0], 12);
            else map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });

            applyFocus();
        })();

        return () => {
            cancelled = true;
            if (observer) observer.disconnect();
            if (map) map.remove();
            store.current = { map: null, L: null, markers: new Map() };
        };
    }, [groups]);

    useEffect(() => {
        applyFocus();
    }, [focus]);

    return <div ref={holder} role="region" aria-label={labels.map} className="w-full h-full" />;
}