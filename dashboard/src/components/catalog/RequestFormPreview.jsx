import { useState } from 'react';
import { t } from '../../i18n';

export default function RequestFormPreview({ options, ctaLabel }) {
    const [answers, setAnswers] = useState({});
    const set = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));

    const toggleCheck = (key, valueKey) => {
        const current = answers[key] || [];
        set(key, current.includes(valueKey) ? current.filter((item) => item !== valueKey) : [...current, valueKey]);
    };

    return (
        <div className="overflow-hidden card">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-900">{t('Customer preview')}</p>
                <p className="text-xs text-slate-500">{t('This is how the request form will look.')}</p>
            </div>

            <div className="p-5 space-y-4">
                {options.length === 0 && <p className="py-6 text-sm text-center text-slate-400">{t('No options yet')}</p>}

                {options.map((option) => (
                    <div key={option.key}>
                        <label className="label">
                            {option.title}
                            {option.isRequired && <span className="text-red-500 ms-1">*</span>}
                        </label>

                        {option.type === 'select' && (
                            <select
                                className="input"
                                dir="auto"
                                value={answers[option.key] ?? (option.values.find((value) => value.isDefault) || {}).key ?? ''}
                                onChange={(event) => set(option.key, event.target.value)}
                            >
                                <option value="">{t('Choose...')}</option>
                                {option.values.map((value) => (
                                    <option key={value.key} value={value.key}>
                                        {value.label}
                                    </option>
                                ))}
                            </select>
                        )}

                        {option.type === 'radio' && (
                            <div className="space-y-2">
                                {option.values.map((value) => {
                                    const current = answers[option.key] ?? (option.values.find((item) => item.isDefault) || {}).key;
                                    return (
                                        <label key={value.key} className="flex cursor-pointer items-center gap-2.5 text-sm" dir="auto">
                                            <input type="radio" name={option.key} checked={current === value.key} onChange={() => set(option.key, value.key)} />
                                            {value.label}
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {option.type === 'checkbox' && (
                            <div className="space-y-2">
                                {option.values.map((value) => {
                                    const current = answers[option.key] ?? option.values.filter((item) => item.isDefault).map((item) => item.key);
                                    return (
                                        <label key={value.key} className="flex cursor-pointer items-center gap-2.5 text-sm" dir="auto">
                                            <input
                                                type="checkbox"
                                                checked={current.includes(value.key)}
                                                onChange={() => {
                                                    if (answers[option.key] === undefined) set(option.key, [...current]);
                                                    toggleCheck(option.key, value.key);
                                                }}
                                            />
                                            {value.label}
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {option.type === 'number' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    dir="ltr"
                                    className="input"
                                    min={option.min ?? undefined}
                                    max={option.max ?? undefined}
                                    step={option.step ?? 'any'}
                                    placeholder={option.placeholder}
                                    value={answers[option.key] ?? option.defaultNumber ?? ''}
                                    onChange={(event) => set(option.key, event.target.value)}
                                />
                                {option.unit && <span className="text-sm shrink-0 text-slate-500">{option.unit}</span>}
                            </div>
                        )}

                        {option.type === 'text' && (
                            <input
                                dir="auto"
                                className="input"
                                placeholder={option.placeholder}
                                value={answers[option.key] || ''}
                                onChange={(event) => set(option.key, event.target.value)}
                            />
                        )}

                        {option.type === 'textarea' && (
                            <textarea
                                dir="auto"
                                rows={3}
                                className="resize-y input"
                                placeholder={option.placeholder}
                                value={answers[option.key] || ''}
                                onChange={(event) => set(option.key, event.target.value)}
                            />
                        )}

                        {option.helpText && <p className="hint">{option.helpText}</p>}
                    </div>
                ))}

                <p className="px-4 py-3 text-xs rounded-xl bg-slate-50 text-slate-500">
                    {t('Name, phone, email and a message are always requested after these options.')}
                </p>
                <button type="button" className="w-full btn-primary" disabled>
                    {ctaLabel || t('Request product')}
                </button>
            </div>
        </div>
    );
}