export default async function safe(request, fallback) {
  try {
    const res = await request();
    return res && res.data !== undefined && res.data !== null ? res.data : fallback;
  } catch (error) {
    const unreachable = !error.status || error.status >= 500;
    if (unreachable && typeof window === 'undefined') throw error;
    return fallback;
  }
}