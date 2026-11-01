import { CERT_HEIGHT, CERT_WIDTH, formatCertDate } from '../../utils/certificatePdf';
import { resolveBrand, resolveTemplate } from '../../utils/certificateTheme';

const FONT = "'Cairo', 'Tahoma', sans-serif";

const page = {
    width: CERT_WIDTH,
    height: CERT_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: FONT,
    color: '#0f172a'
};

const fill = (size) => ({ position: 'absolute', top: size, right: size, bottom: size, left: size });

const buildMeta = (cert) =>
    [
        { label: 'تاريخ الإصدار', value: formatCertDate(cert.issueDate) },
        cert.completionDate ? { label: 'تاريخ الإتمام', value: formatCertDate(cert.completionDate) } : null,
        cert.hours ? { label: 'عدد الساعات', value: `${cert.hours} ساعة` } : null,
        cert.grade ? { label: 'التقدير', value: cert.grade } : null
    ].filter(Boolean);

function Brand({ site, color, height = 72 }) {
    if (site && site.logo) {
        return (
            <img
                src={site.logo}
                alt=""
                crossOrigin="anonymous"
                style={{ maxHeight: height, maxWidth: 260, objectFit: 'contain' }}
            />
        );
    }
    return <div style={{ fontSize: 32, fontWeight: 700, color }}>{site ? site.name : ''}</div>;
}

function Meta({ items, p, gap = 40 }) {
    return (
        <div style={{ display: 'flex', gap, justifyContent: 'center' }}>
            {items.map((item) => (
                <div key={item.label} style={{ minWidth: 110, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: p.muted }}>{item.label}</div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: p.ink }}>{item.value}</div>
                </div>
            ))}
        </div>
    );
}

function Signature({ settings, p, width = 260 }) {
    const hasImage = Boolean(settings.signature && settings.signature.url);
    if (!hasImage && !settings.signerName && !settings.signerTitle) return <div style={{ width }} />;

    return (
        <div style={{ width, textAlign: 'center' }}>
            {hasImage && (
                <img
                    src={settings.signature.url}
                    alt=""
                    crossOrigin="anonymous"
                    style={{ maxHeight: 56, maxWidth: 200, objectFit: 'contain' }}
                />
            )}
            <div style={{ borderTop: `2px solid ${p.muted}`, paddingTop: 6, marginTop: 4 }}>
                <div style={{ fontSize: 19, fontWeight: 700 }}>{settings.signerName}</div>
                <div style={{ fontSize: 14, color: p.muted }}>{settings.signerTitle}</div>
            </div>
        </div>
    );
}

function Verify({ cert, qr, verifyUrl, p, size = 100 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, direction: 'ltr', width: 280 }}>
            {qr && <img src={qr} alt="" style={{ width: size, height: size, background: '#ffffff' }} />}
            <div style={{ textAlign: 'left', fontSize: 12, lineHeight: 1.6, color: p.muted }}>
                <div style={{ fontWeight: 700, color: p.ink }}>{cert.serial}</div>
                <div>{cert.code}</div>
                <div style={{ wordBreak: 'break-all', maxWidth: 150 }}>{verifyUrl}</div>
            </div>
        </div>
    );
}

function Recipient({ cert, settings, nameColor, nameSize = 56, courseSize = 32 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 22, color: '#475569' }}>{settings.intro}</div>
            <div style={{ fontSize: nameSize, fontWeight: 800, color: nameColor, lineHeight: 1.4 }}>
                {cert.studentName}
            </div>
            <div style={{ fontSize: 22, color: '#475569' }}>{settings.bodyLine}</div>
            <div style={{ fontSize: courseSize, fontWeight: 700, lineHeight: 1.5, maxWidth: 800 }}>
                {cert.courseName}
            </div>
        </div>
    );
}

function Classic({ cert, settings, site, qr, verifyUrl, p, items }) {
    return (
        <div dir="rtl" style={{ ...page, background: '#ffffff' }}>
            <div style={{ ...fill(26), border: `2px solid ${p.strong}` }} />
            <div style={{ ...fill(36), border: `1px solid ${p.tint}` }} />
            <div
                style={{
                    ...fill(64),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Brand site={site} color={p.strong} />
                    <div style={{ fontSize: 46, fontWeight: 800, marginTop: 6 }}>{settings.title}</div>
                    <div style={{ width: 90, height: 3, background: p.secondary }} />
                </div>
                <Recipient cert={cert} settings={settings} nameColor={p.strong} />
                <Meta items={items} p={p} />
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Signature settings={settings} p={p} />
                    <div style={{ flex: 1, padding: '0 20px', fontSize: 13, color: p.muted }}>{settings.footerNote}</div>
                    <Verify cert={cert} qr={qr} verifyUrl={verifyUrl} p={p} />
                </div>
            </div>
        </div>
    );
}

function Modern({ cert, settings, site, qr, verifyUrl, p, items }) {
    return (
        <div dir="rtl" style={{ ...page, background: '#ffffff', display: 'flex' }}>
            <div
                style={{
                    width: 300,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(160deg, ${p.strong} 0%, ${p.dark} 100%)`,
                    color: p.onStrong,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '48px 28px',
                    boxSizing: 'border-box',
                    textAlign: 'center'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: -70,
                        left: -70,
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)'
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -90,
                        right: -60,
                        width: 260,
                        height: 260,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)'
                    }}
                />
                <div style={{ position: 'relative', background: '#ffffff', borderRadius: 16, padding: '12px 18px' }}>
                    <Brand site={site} color={p.strong} height={64} />
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>الرقم التسلسلي</div>
                    <div style={{ fontSize: 20, fontWeight: 700, direction: 'ltr' }}>{cert.serial}</div>
                </div>
                <div style={{ position: 'relative', background: '#ffffff', padding: 10, borderRadius: 14 }}>
                    {qr && <img src={qr} alt="" style={{ width: 132, height: 132, display: 'block' }} />}
                    <div style={{ fontSize: 12, color: p.ink, direction: 'ltr', marginTop: 4, fontWeight: 700 }}>
                        {cert.code}
                    </div>
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    padding: '58px 56px 46px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 10,
                        background: `linear-gradient(90deg, ${p.strong}, ${p.secondary})`
                    }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 46, fontWeight: 800, color: p.strong }}>{settings.title}</div>
                    <div style={{ width: 90, height: 4, background: p.secondary, borderRadius: 4 }} />
                </div>
                <Recipient cert={cert} settings={settings} nameColor={p.ink} nameSize={52} courseSize={30} />
                <Meta items={items} p={p} gap={28} />
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Signature settings={settings} p={p} width={240} />
                    <div style={{ flex: 1, padding: '0 16px', fontSize: 13, color: p.muted }}>{settings.footerNote}</div>
                </div>
            </div>
        </div>
    );
}

function Corner({ color, style }) {
    return (
        <svg width="70" height="70" viewBox="0 0 70 70" style={{ position: 'absolute', ...style }}>
            <path d="M4 66V20C4 10 10 4 20 4H66" fill="none" stroke={color} strokeWidth="3" />
            <circle cx="14" cy="14" r="5" fill={color} />
        </svg>
    );
}

function Seal({ color }) {
    return (
        <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill={color} />
            <circle cx="48" cy="48" r="36" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M48 24l6.5 14 15 1.8-11 10.4 3 15L48 57.6 34.5 65.2l3-15-11-10.4 15-1.8z" fill="#ffffff" />
        </svg>
    );
}

function Divider({ color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 320 }}>
            <div style={{ flex: 1, height: 2, background: color }} />
            <div style={{ width: 12, height: 12, background: color, transform: 'rotate(45deg)' }} />
            <div style={{ flex: 1, height: 2, background: color }} />
        </div>
    );
}

function Elite({ cert, settings, site, qr, verifyUrl, p, items }) {
    return (
        <div dir="rtl" style={{ ...page, background: p.paper }}>
            <div style={{ ...fill(18), border: `5px solid ${p.strong}` }} />
            <div style={{ ...fill(32), border: `2px solid ${p.secondary}` }} />
            <Corner color={p.strong} style={{ top: 24, left: 24 }} />
            <Corner color={p.strong} style={{ top: 24, right: 24, transform: 'scaleX(-1)' }} />
            <Corner color={p.strong} style={{ bottom: 24, left: 24, transform: 'scaleY(-1)' }} />
            <Corner color={p.strong} style={{ bottom: 24, right: 24, transform: 'scale(-1, -1)' }} />
            <div
                style={{
                    ...fill(64),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Brand site={site} color={p.strong} height={64} />
                    <div style={{ fontSize: 48, fontWeight: 800, color: p.strong }}>{settings.title}</div>
                    <Divider color={p.secondary} />
                </div>
                <Recipient cert={cert} settings={settings} nameColor={p.strong} />
                <Meta items={items} p={p} />
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Signature settings={settings} p={p} width={240} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Seal color={p.secondary} />
                        <div style={{ fontSize: 12, color: p.muted, maxWidth: 220 }}>{settings.footerNote}</div>
                    </div>
                    <Verify cert={cert} qr={qr} verifyUrl={verifyUrl} p={p} size={96} />
                </div>
            </div>
        </div>
    );
}

export default function CertificateView({ cert, settings, site, qr, verifyUrl, template }) {
    const p = resolveBrand(settings, site);
    const kind = template || resolveTemplate(cert, settings);
    const props = { cert, settings, site, qr, verifyUrl, p, items: buildMeta(cert) };

    if (kind === 'modern') return <Modern {...props} />;
    if (kind === 'elite') return <Elite {...props} />;
    return <Classic {...props} />;
}