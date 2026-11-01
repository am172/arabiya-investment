import { Check } from 'lucide-react';
import CertificateView from './CertificateView';
import ScaledCertificate from './ScaledCertificate';
import { TEMPLATES } from '../../constants/certificateTemplates';
import { t } from '../../i18n';

export default function TemplatePicker({ value, onChange, cert, settings, site, qr, verifyUrl }) {
    return (
        <div role="radiogroup" aria-label={t('Certificate theme')} className="grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((item) => {
                const selected = value === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(item.id)}
                        className={`overflow-hidden rounded-xl border bg-card text-start transition hover:-translate-y-0.5 hover:shadow-md ${selected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                            }`}
                    >
                        <div className="border-b pointer-events-none border-slate-100">
                            <ScaledCertificate>
                                <CertificateView
                                    cert={cert}
                                    settings={settings}
                                    site={site}
                                    qr={qr}
                                    verifyUrl={verifyUrl}
                                    template={item.id}
                                />
                            </ScaledCertificate>
                        </div>
                        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate text-slate-900">{t(item.label)}</p>
                                <p className="text-xs truncate text-slate-500">{t(item.text)}</p>
                            </div>
                            {selected && (
                                <span className="flex items-center justify-center w-6 h-6 text-white rounded-full shrink-0 bg-brand-600">
                                    <Check size={14} strokeWidth={3} />
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}