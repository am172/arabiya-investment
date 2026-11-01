import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ListPlus, Plus, Trash2 } from 'lucide-react';
import { LIMITS } from '../../constants/catalog';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const parseBulk = (input) => {
    let group = '';
    const rows = [];
    input.split(/\r?\n/).forEach((line) => {
        const clean = line.trim();
        if (!clean) return;
        if (clean.startsWith('#')) {
            group = clean.replace(/^#+\s*/, '');
            return;
        }
        const match = clean.match(/^(.+?)\s*[:=\t]\s*(.*)$/);
        rows.push({ _uid: uid(), group, label: match ? match[1].trim() : clean, value: match ? match[2].trim() : '' });
    });
    return rows;
};

export default function SpecsEditor({ items, onChange, errors = {} }) {
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulk, setBulk] = useState('');
    const groups = useMemo(() => [...new Set(items.map((item) => item.group.trim()).filter(Boolean))], [items]);

    const patch = (id, change) => onChange(items.map((item) => (item._uid === id ? { ...item, ...change } : item)));

    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    const addBulk = () => {
        const rows = parseBulk(bulk);
        if (rows.length === 0) return;
        const kept = items.filter((item) => item.label.trim() || item.value.trim());
        onChange([...kept, ...rows].slice(0, LIMITS.specs));
        setBulk('');
        setBulkOpen(false);
    };

    return (
        <div>
            <datalist id="spec-groups">
                {groups.map((group) => (
                    <option key={group} value={group} />
                ))}
            </datalist>

            {items.length === 0 && <p className="mb-3 text-sm text-slate-400">{t('No specifications yet')}</p>}

            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={item._uid} className="grid items-start gap-2 sm:grid-cols-[1fr_1.2fr_1.6fr_auto]">
                        <input
                            dir="auto"
                            list="spec-groups"
                            className="py-2 input"
                            placeholder={t('Group (optional)')}
                            maxLength={80}
                            value={item.group}
                            onChange={(event) => patch(item._uid, { group: event.target.value })}
                        />
                        <div>
                            <input
                                dir="auto"
                                className={`input py-2 ${errors[`specs[${index}].label`] ? 'input-error' : ''}`}
                                placeholder={t('Name')}
                                maxLength={120}
                                value={item.label}
                                onChange={(event) => patch(item._uid, { label: event.target.value })}
                            />
                            {errors[`specs[${index}].label`] && <p className="error-text">{t(errors[`specs[${index}].label`])}</p>}
                        </div>
                        <input
                            dir="auto"
                            className="py-2 input"
                            placeholder={t('Value')}
                            maxLength={300}
                            value={item.value}
                            onChange={(event) => patch(item._uid, { value: event.target.value })}
                        />
                        <div className="flex items-center">
                            <button type="button" className="icon-btn disabled:opacity-30" disabled={index === 0} title={t('Move up')} onClick={() => move(index, -1)}>
                                <ArrowUp size={15} />
                            </button>
                            <button
                                type="button"
                                className="icon-btn disabled:opacity-30"
                                disabled={index === items.length - 1}
                                title={t('Move down')}
                                onClick={() => move(index, 1)}
                            >
                                <ArrowDown size={15} />
                            </button>
                            <button
                                type="button"
                                className="icon-btn hover:bg-red-50 hover:text-red-600"
                                title={t('Delete')}
                                onClick={() => onChange(items.filter((row) => row._uid !== item._uid))}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex flex-wrap gap-2 mt-3">
                <button
                    type="button"
                    className="btn-secondary"
                    disabled={items.length >= LIMITS.specs}
                    onClick={() => onChange([...items, { _uid: uid(), group: '', label: '', value: '' }])}
                >
                    <Plus size={16} />
                    {t('Add row')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setBulkOpen((value) => !value)}>
                    <ListPlus size={16} />
                    {t('Paste a list')}
                </button>
            </div>

            {bulkOpen && (
                <div className="mt-3 space-y-2">
                    <textarea
                        dir="auto"
                        rows={6}
                        className="resize-y input"
                        placeholder={'# General\nColor: White\nForm: Fine powder'}
                        value={bulk}
                        onChange={(event) => setBulk(event.target.value)}
                    />
                    <p className="hint">
                        {t('One row per line as Name: Value. A line starting with # sets the group for the lines below.')}
                    </p>
                    <button type="button" className="btn-primary px-3 py-1.5 text-xs" onClick={addBulk}>
                        {t('Add rows')}
                    </button>
                </div>
            )}
        </div>
    );
}