const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function getPublicSubsidiaries() {
    try {
        const res = await fetch(`${API_BASE}/public/subsidiaries`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
    } catch {
        return [];
    }
}