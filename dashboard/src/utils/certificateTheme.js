import { buildPalette } from './color';

export const resolveBrand = (settings, site) => {
    const custom = Boolean(settings && settings.useBrandColors === false && settings.primaryColor);
    const primary = custom ? settings.primaryColor : site && site.primary;
    const secondary = custom && settings.secondaryColor ? settings.secondaryColor : site && site.secondary;
    return buildPalette(primary, secondary);
};

export const resolveTemplate = (cert, settings) =>
    (cert && cert.template) || (settings && settings.defaultTemplate) || 'classic';

export const sampleCertificate = () => ({
    studentName: 'اسم الطالب',
    courseName: 'اسم الدورة التدريبية',
    hours: 40,
    grade: 'ممتاز',
    issueDate: new Date().toISOString(),
    completionDate: null,
    serial: 'CERT-2026-00001',
    code: 'XXXX-XXXX-XXXX'
});