import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Copy, ListPlus, Plus, Trash2 } from 'lucide-react';
import FormInput from '../forms/FormInput';
import Switch from '../common/Switch';
import { CHOICE_TYPES, LIMITS, OPTION_TYPES } from '../../constants/catalog';
import { emptyOption, emptyValue } from '../../utils/catalog';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const typeOf = (id) => OPTION_TYPES.find((item) => item.id === id) || OPTION_TYPES[0];

function TypePicker({ value, onChange }) {
    return (
        <div role="radiogroup" aria-label={t('Input type')} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {OPTION_TYPES.map((item) => {
                const Icon = item.icon;
                const selected = item.id === value;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(item.id)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-start transition ${selected
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <Icon size={16} className="shrink-0" />
                        <span className="min-w-0">
                            <span className="block text-xs font-semibold truncate">{t(item.label)}</span>
                            <span className="block truncate text-[11px] opacity-70">{t(item.hint)}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function ValuesEditor({ option, path, errors, onChange }) {
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulk, setBulk] = useState('');
    const values = option.values;
    const setValues = (next) => onChange({ values: next });

    const patch = (id, change) => setValues(values.map((value) => (value._uid === id ? { ...value, ...change } : value)));

    const toggleDefault = (id) =>
        setValues(
            values.map((value) => {
                if (value._uid === id) return { ...value, isDefault: !value.isDefault };
                return option.type === 'checkbox' ? value : { ...value, isDefault: false };
            })
        );

    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= values.length) return;
        const next = [...values];
        [next[index], next[target]] = [next[target], next[index]];
        setValues(next);
    };

    const addBulk = () => {
        const lines = bulk
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
        if (lines.length === 0) return;
        const kept = values.filter((value) => value.label.trim());
        const room = LIMITS.values - kept.length;
        setValues([...kept, ...lines.slice(0, Math.max(0, room)).map((label) => ({ ...emptyValue(), label }))]);
        setBulk('');
        setBulkOpen(false);
    };

    return (
        <div>
            <p className="label">{t('Choices')}</p>
            <ul className="space-y-2">
                {values.map((value, index) => (
                    <li key={value._uid} className="rounded-xl border border-slate-200 p-2.5">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                title={t('Default')}
                                aria-pressed={value.isDefault}
                                onClick={() => toggleDefault(value._uid)}
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${value.isDefault ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {t('Default')}
                            </button>
                            <input
                                dir="auto"
                                className={`input py-2 ${errors[`${path}.values[${index}].label`] ? 'input-error' : ''}`}
                                placeholder={t('Choice')}
                                maxLength={120}
                                value={value.label}
                                onChange={(event) => patch(value._uid, { label: event.target.value })}
                            />
                            <button type="button" className="icon-btn disabled:opacity-30" disabled={index === 0} title={t('Move up')} onClick={() => move(index, -1)}>
                                <ArrowUp size={15} />
                            </button>
                            <button
                                type="button"
                                className="icon-btn disabled:opacity-30"
                                disabled={index === values.length - 1}
                                title={t('Move down')}
                                onClick={() => move(index, 1)}
                            >
                                <ArrowDown size={15} />
                            </button>
                            <button
                                type="button"
                                className="icon-btn hover:bg-red-50 hover:text-red-600"
                                title={t('Delete')}
                                onClick={() => setValues(values.filter((item) => item._uid !== value._uid))}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <input
                            dir="auto"
                            className="input mt-2 py-1.5 text-xs"
                            placeholder={t('Description (optional)')}
                            maxLength={200}
                            value={value.description}
                            onChange={(event) => patch(value._uid, { description: event.target.value })}
                        />
                        {errors[`${path}.values[${index}].label`] && (
                            <p className="error-text">{t(errors[`${path}.values[${index}].label`])}</p>
                        )}
                    </li>
                ))}
            </ul>
            {errors[`${path}.values`] && <p className="error-text">{t(errors[`${path}.values`])}</p>}

            <div className="flex flex-wrap gap-2 mt-3">
                <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    disabled={values.length >= LIMITS.values}
                    onClick={() => setValues([...values, emptyValue()])}
                >
                    <Plus size={14} />
                    {t('Add choice')}
                </button>
                <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setBulkOpen((value) => !value)}>
                    <ListPlus size={14} />
                    {t('Paste a list of choices')}
                </button>
            </div>

            {bulkOpen && (
                <div className="mt-3 space-y-2">
                    <textarea
                        dir="auto"
                        rows={4}
                        className="resize-y input"
                        placeholder={t('One choice per line')}
                        value={bulk}
                        onChange={(event) => setBulk(event.target.value)}
                    />
                    <button type="button" className="btn-primary px-3 py-1.5 text-xs" onClick={addBulk}>
                        {t('Add choices')}
                    </button>
                </div>
            )}
        </div>
    );
}

function OptionCard({ option, index, total, open, errors, onToggle, onPatch, onMove, onDuplicate, onRemove }) {
    const path = `options[${index}]`;
    const meta = typeOf(option.type);
    const Icon = meta.icon;
    const choice = CHOICE_TYPES.includes(option.type);
    const invalid = Object.keys(errors).some((key) => key.startsWith(path));
    const filled = option.values.filter((value) => value.label.trim()).length;

    const switchType = (type) =>
        onPatch({
            type,
            values: CHOICE_TYPES.includes(type) && option.values.length === 0 ? [emptyValue(), emptyValue()] : option.values
        });

    return (
        <div className={`card overflow-hidden ${invalid ? 'border-red-300' : ''}`}>
            <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={onToggle} aria-expanded={open} className="flex items-center flex-1 min-w-0 gap-3 text-start">
                    <span className="flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full shrink-0 bg-brand-50 text-brand-700">
                        {index + 1}
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-semibold truncate text-slate-900">
                            {option.title.trim() || t('Option {n}', { n: index + 1 })}
                        </span>
                        <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                                <Icon size={12} />
                                {t(meta.label)}
                            </span>
                            {choice && <span>{t('{n} choices', { n: filled })}</span>}
                            {option.isRequired && (
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">{t('Required')}</span>
                            )}
                        </span>
                    </span>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                    <button type="button" className="icon-btn disabled:opacity-30" disabled={index === 0} title={t('Move up')} onClick={() => onMove(-1)}>
                        <ArrowUp size={15} />
                    </button>
                    <button
                        type="button"
                        className="icon-btn disabled:opacity-30"
                        disabled={index === total - 1}
                        title={t('Move down')}
                        onClick={() => onMove(1)}
                    >
                        <ArrowDown size={15} />
                    </button>
                    <button type="button" className="icon-btn" title={t('Duplicate option')} onClick={onDuplicate}>
                        <Copy size={15} />
                    </button>
                    <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" title={t('Delete option')} onClick={onRemove}>
                        <Trash2 size={15} />
                    </button>
                    <button type="button" className="icon-btn" aria-label={t('Expand')} onClick={onToggle}>
                        <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {open && (
                <div className="p-5 space-y-5 border-t border-slate-100">
                    <FormInput
                        label="Option title"
                        dir="auto"
                        maxLength={120}
                        placeholder={t('e.g. Bag weight')}
                        value={option.title}
                        error={errors[`${path}.title`]}
                        onChange={(event) => onPatch({ title: event.target.value })}
                    />

                    <div>
                        <p className="label">{t('Input type')}</p>
                        <TypePicker value={option.type} onChange={switchType} />
                        {errors[`${path}.type`] && <p className="error-text">{t(errors[`${path}.type`])}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-4 p-3 border rounded-xl border-slate-200">
                        <div>
                            <p className="text-sm font-medium text-slate-800">{t('Required')}</p>
                            <p className="text-xs text-slate-500">{t('The customer must fill this option')}</p>
                        </div>
                        <Switch checked={option.isRequired} label={t('Required')} onChange={(value) => onPatch({ isRequired: value })} />
                    </div>

                    <FormInput
                        label="Help text (optional)"
                        dir="auto"
                        maxLength={300}
                        value={option.helpText}
                        error={errors[`${path}.helpText`]}
                        onChange={(event) => onPatch({ helpText: event.target.value })}
                    />

                    {['text', 'textarea', 'number'].includes(option.type) && (
                        <FormInput
                            label="Placeholder (optional)"
                            dir="auto"
                            maxLength={120}
                            value={option.placeholder}
                            onChange={(event) => onPatch({ placeholder: event.target.value })}
                        />
                    )}

                    {choice && <ValuesEditor option={option} path={path} errors={errors} onChange={onPatch} />}

                    {option.type === 'number' && (
                        <div className="grid gap-4 sm:grid-cols-3">
                            <FormInput
                                label="Minimum"
                                type="number"
                                step="any"
                                value={option.min}
                                error={errors[`${path}.min`]}
                                onChange={(event) => onPatch({ min: event.target.value })}
                            />
                            <FormInput
                                label="Maximum"
                                type="number"
                                step="any"
                                value={option.max}
                                error={errors[`${path}.max`]}
                                onChange={(event) => onPatch({ max: event.target.value })}
                            />
                            <FormInput
                                label="Step"
                                type="number"
                                step="any"
                                value={option.step}
                                error={errors[`${path}.step`]}
                                onChange={(event) => onPatch({ step: event.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                dir="auto"
                                maxLength={30}
                                placeholder={t('e.g. ton')}
                                value={option.unit}
                                onChange={(event) => onPatch({ unit: event.target.value })}
                            />
                            <FormInput
                                label="Default value"
                                type="number"
                                step="any"
                                value={option.defaultNumber}
                                error={errors[`${path}.defaultNumber`]}
                                onChange={(event) => onPatch({ defaultNumber: event.target.value })}
                            />
                        </div>
                    )}

                    {(option.type === 'text' || option.type === 'textarea') && (
                        <FormInput
                            label="Maximum length"
                            type="number"
                            min="1"
                            max="5000"
                            value={option.maxLength}
                            error={errors[`${path}.maxLength`]}
                            onChange={(event) => onPatch({ maxLength: event.target.value })}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default function OptionsBuilder({ options, onChange, errors = {} }) {
    const [open, setOpen] = useState(() => new Set(options.length <= 3 ? options.map((option) => option._uid) : []));

    const toggle = (id) =>
        setOpen((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const patch = (id, change) =>
        onChange((current) => current.map((option) => (option._uid === id ? { ...option, ...change } : option)));

    const move = (index, delta) =>
        onChange((current) => {
            const target = index + delta;
            if (target < 0 || target >= current.length) return current;
            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });

    const add = () => {
        const option = emptyOption();
        onChange((current) => [...current, option]);
        setOpen((current) => new Set(current).add(option._uid));
    };

    const duplicate = (option) => {
        const copy = {
            ...option,
            _uid: uid(),
            key: '',
            title: t('{name} (copy)', { name: option.title }),
            values: option.values.map((value) => ({ ...value, _uid: uid(), key: '' }))
        };
        onChange((current) => {
            const index = current.findIndex((item) => item._uid === option._uid);
            const next = [...current];
            next.splice(index + 1, 0, copy);
            return next;
        });
        setOpen((current) => new Set(current).add(copy._uid));
    };

    return (
        <div className="space-y-3">
            {options.length === 0 && (
                <div className="px-6 py-10 text-center border border-dashed rounded-2xl border-slate-300">
                    <p className="text-sm font-semibold text-slate-700">{t('No options yet')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('Add the first option, for example "Bag weight" or "Quantity".')}</p>
                </div>
            )}

            {options.map((option, index) => (
                <OptionCard
                    key={option._uid}
                    option={option}
                    index={index}
                    total={options.length}
                    open={open.has(option._uid)}
                    errors={errors}
                    onToggle={() => toggle(option._uid)}
                    onPatch={(change) => patch(option._uid, change)}
                    onMove={(delta) => move(index, delta)}
                    onDuplicate={() => duplicate(option)}
                    onRemove={() => onChange((current) => current.filter((item) => item._uid !== option._uid))}
                />
            ))}

            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    {options.length} / {LIMITS.options}
                </p>
                <button type="button" className="btn-secondary" disabled={options.length >= LIMITS.options} onClick={add}>
                    <Plus size={16} />
                    {t('Add option')}
                </button>
            </div>
        </div>
    );
}