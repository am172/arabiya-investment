import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import optionTemplateService from '../../services/optionTemplate.service';
import useFetch from '../../hooks/useFetch';
import { t } from '../../i18n';

export default function TemplatePickerModal({ onApply, onClose }) {
    const { data, loading } = useFetch(() => optionTemplateService.list(), []);
    const [mode, setMode] = useState('append');
    const items = data || [];

    return (
        <Modal open onClose={onClose} title="Apply an option template" size="md">
            <div role="group" className="inline-flex p-1 mb-4 rounded-xl bg-slate-100">
                {[
                    ['append', 'Add to the current options'],
                    ['replace', 'Replace the current options']
                ].map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        aria-pressed={mode === id}
                        onClick={() => setMode(id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${mode === id ? 'bg-card text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        {t(label)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-brand-600" />
                </div>
            ) : items.length === 0 ? (
                <p className="py-8 text-sm text-center text-slate-500">
                    {t('No templates yet. Save your options as a template first.')}
                </p>
            ) : (
                <ul className="space-y-2 overflow-y-auto max-h-80">
                    {items.map((template) => (
                        <li key={template._id}>
                            <button
                                type="button"
                                onClick={() => onApply(template, mode)}
                                className="w-full p-3 transition border rounded-xl border-slate-200 text-start hover:border-brand-400 hover:bg-brand-50"
                            >
                                <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                                <p className="text-xs text-slate-500">
                                    {template.options.length} {t('options')}
                                    {template.description ? ` · ${template.description}` : ''}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {template.options.slice(0, 6).map((option) => (
                                        <span key={option.key} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                                            {option.title}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
}