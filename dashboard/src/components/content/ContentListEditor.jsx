import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import FormInput from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';
import IconPicker from '../common/IconPicker';
import EmptyState from '../common/EmptyState';
import { t } from '../../i18n';

export default function ContentListEditor({ field, items, onChange, errors, config }) {
  const { fields, max, create, summaryKey, addLabel, emptyLabel, newLabel } = config;

  const update = (index, key, value) =>
    onChange(items.map((item, position) => (position === index ? { ...item, [key]: value } : item)));

  const remove = (index) => onChange(items.filter((_, position) => position !== index));

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => onChange([...items, create()]);

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <EmptyState
          title={emptyLabel}
          description="This section stays hidden on the website until you add at least one."
        />
      )}

      {items.map((item, index) => (
        <div key={item._uid} className="p-5 card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center min-w-0 gap-3">
              <span className="flex items-center justify-center text-xs font-bold rounded-full h-7 w-7 shrink-0 bg-slate-100 text-slate-600">
                {index + 1}
              </span>
              <p className="text-sm font-semibold truncate text-slate-800">
                {item[summaryKey] || t(newLabel)}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="icon-btn disabled:opacity-30"
                title={t('Move up')}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                className="icon-btn disabled:opacity-30"
                title={t('Move down')}
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                className="icon-btn hover:bg-red-50 hover:text-red-600"
                title={t('Delete')}
                onClick={() => remove(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((definition) => {
              const error = errors[`${field}[${index}].${definition.key}`];
              const className = definition.full ? 'sm:col-span-2' : '';
              const value = item[definition.key] || '';

              if (definition.type === 'icon') {
                return (
                  <IconPicker
                    key={definition.key}
                    label={definition.label}
                    value={value}
                    error={error}
                    onChange={(next) => update(index, definition.key, next)}
                  />
                );
              }

              if (definition.type === 'textarea') {
                return (
                  <FormTextarea
                    key={definition.key}
                    dir="auto"
                    className={className}
                    label={definition.label}
                    rows={definition.rows || 3}
                    maxLength={definition.max}
                    value={value}
                    error={error}
                    hint={`${value.length}/${definition.max}`}
                    onChange={(event) => update(index, definition.key, event.target.value)}
                  />
                );
              }

              return (
                <FormInput
                  key={definition.key}
                  dir="auto"
                  className={className}
                  label={definition.label}
                  maxLength={definition.max}
                  value={value}
                  error={error}
                  onChange={(event) => update(index, definition.key, event.target.value)}
                />
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {items.length} / {max}
        </p>
        <button type="button" className="btn-secondary" disabled={items.length >= max} onClick={add}>
          <Plus size={16} />
          {t(addLabel)}
        </button>
      </div>
    </div>
  );
}