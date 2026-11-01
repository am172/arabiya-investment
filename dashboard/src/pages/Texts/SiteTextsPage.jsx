import { useEffect, useMemo, useState } from 'react';
import { Info, Loader2, RotateCcw, Save, Search, Undo2 } from 'lucide-react';
import textService from '../../services/text.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { t } from '../../i18n';

const filled = (values) =>
  Object.entries(values).reduce((acc, [key, value]) => {
    if (typeof value === 'string' && value.trim()) acc[key] = value.trim();
    return acc;
  }, {});

const signature = (values) =>
  JSON.stringify(Object.entries(filled(values)).sort(([a], [b]) => a.localeCompare(b)));

function TextField({ field, value, onChange }) {
  const [key, label, fallback, multiline] = field;
  const long = multiline || fallback.length > 70;
  const custom = Boolean(value && value.trim());
  const shared = {
    id: `text-${key}`,
    dir: 'rtl',
    value: value || '',
    placeholder: fallback,
    maxLength: 1000,
    onChange: (event) => onChange(key, event.target.value)
  };

  return (
    <div className="p-4 card">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={shared.id} dir="rtl" className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {custom && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-medium shrink-0 text-brand-600 hover:underline"
            onClick={() => onChange(key, '')}
          >
            <Undo2 size={12} />
            {t('Use default')}
          </button>
        )}
      </div>
      {long ? (
        <textarea rows={3} className="resize-y input" {...shared} />
      ) : (
        <input className="input" dir="rtl" {...shared} />
      )}
      <p dir="ltr" className="mt-1.5 text-start font-mono text-[11px] text-slate-400">
        {key}
      </p>
    </div>
  );
}

export default function SiteTextsPage() {
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();
  const { data, loading, error } = useFetch(() => textService.get(), []);
  const [values, setValues] = useState(null);
  const [saved, setSaved] = useState('');
  const [groupId, setGroupId] = useState('');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const apply = (next) => {
    const fresh = { ...(next.values || {}) };
    setValues(fresh);
    setSaved(signature(fresh));
  };

  useEffect(() => {
    if (!data) return;
    apply(data);
    setGroupId((current) => current || data.groups[0].id);
  }, [data]);

  const dirty = useMemo(() => Boolean(values) && signature(values) !== saved, [values, saved]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await textService.update({ values: filled(values) });
      apply(res.data);
      toast.success('Texts saved. The website will update shortly.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset all texts',
      message: 'Every text returns to the built-in default. Your customizations will be lost.',
      confirmLabel: 'Reset'
    });
    if (!ok) return;
    try {
      const res = await textService.reset();
      apply(res.data);
      toast.success('Texts reset to defaults');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading && !values) return <Loader />;
  if (!values || !data) return <EmptyState title="Could not load texts" description={error} />;

  const groups = data.groups;
  const group = groups.find((item) => item.id === groupId) || groups[0];
  const needle = query.trim().toLowerCase();

  const visible = needle
    ? groups
        .flatMap((item) => item.fields)
        .filter(
          (field) =>
            field[0].toLowerCase().includes(needle) ||
            field[1].toLowerCase().includes(needle) ||
            field[2].toLowerCase().includes(needle) ||
            String(values[field[0]] || '').toLowerCase().includes(needle)
        )
    : group.fields;

  const customized = (item) =>
    item.fields.filter((field) => String(values[field[0]] || '').trim()).length;

  return (
    <div>
      <PageHeader
        title="Site texts"
        description="Every label, heading and button on the public website. Leave a field empty to use the built-in default."
        action={
          <div className="flex items-center gap-3">
            {dirty && (
              <span className="hidden text-sm font-medium text-amber-600 sm:inline">{t('Unsaved changes')}</span>
            )}
            <button type="button" className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              {t('Reset')}
            </button>
            <button type="button" className="btn-primary" disabled={saving || !dirty} onClick={handleSave}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {t('Save changes')}
            </button>
          </div>
        }
      />

      <section className="flex gap-3 p-5 mb-5 card border-brand-100 bg-brand-50/40">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-600" />
        <p className="text-sm text-slate-600">
          {t(
            'Keep placeholders such as {n}, {shown}, {total}, {title} and {date} in the text. The website replaces them automatically. The hero, features, steps, subjects, FAQ, story and legal pages have their own editors.'
          )}
        </p>
      </section>

      <div className="relative mb-5">
        <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input ps-10"
          placeholder={t('Search every text by label, key or content')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {!needle && (
        <div
          role="tablist"
          aria-label={t('Text groups')}
          className="flex gap-2 px-1 pb-2 mb-5 -mx-1 overflow-x-auto"
        >
          {groups.map((item) => {
            const selected = item.id === group.id;
            const count = customized(item);
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setGroupId(item.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      selected ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title="No texts match your search" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((field) => (
            <TextField key={field[0]} field={field} value={values[field[0]]} onChange={setValue} />
          ))}
        </div>
      )}
      <ConfirmDialog {...confirmProps} />
    </div>
  );
}