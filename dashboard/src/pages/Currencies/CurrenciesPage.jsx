import { useEffect, useMemo, useState } from 'react';
import { Info, Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import currencyService from '../../services/currency.service';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import FormInput, { FormToggle } from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import { currencyOptions } from '../../constants/currencies';
import { formatDateTime } from '../../utils/formatters';
import { mapServerErrors } from '../../utils/validators';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const MODES = [
  { value: 'auto', label: 'Automatic rate' },
  { value: 'manual', label: 'Fixed rate' }
];

const ROUNDING = [
  { value: '0', label: 'No rounding' },
  { value: '1', label: 'Nearest 1' },
  { value: '5', label: 'Nearest 5' },
  { value: '10', label: 'Nearest 10' },
  { value: '50', label: 'Nearest 50' },
  { value: '100', label: 'Nearest 100' }
];

const toDraft = (data) => ({
  primary: data.primary,
  autoDetect: data.autoDetect,
  secondary: data.secondary.map((item) => ({
    _uid: uid(),
    code: item.code,
    rateMode: item.rateMode,
    manualRate: item.manualRate ? String(item.manualRate) : '',
    roundTo: String(item.roundTo)
  }))
});

const toPayload = (draft) => ({
  primary: draft.primary,
  autoDetect: draft.autoDetect,
  secondary: draft.secondary.map((item) => ({
    code: item.code,
    rateMode: item.rateMode,
    manualRate: item.rateMode === 'manual' ? Number(item.manualRate) : null,
    roundTo: Number(item.roundTo)
  }))
});

export default function CurrenciesPage() {
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch(() => currencyService.get(), []);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!data) return;
    const fresh = toDraft(data);
    setDraft(fresh);
    setSaved(JSON.stringify(toPayload(fresh)));
  }, [data]);

  const dirty = useMemo(() => Boolean(draft) && JSON.stringify(toPayload(draft)) !== saved, [draft, saved]);

  if (loading && !draft) return <Loader />;
  if (!draft) return <EmptyState title="Could not load currencies" description={error} />;

  const used = [draft.primary, ...draft.secondary.map((item) => item.code)];

  const setItem = (uidValue, patch) =>
    setDraft({
      ...draft,
      secondary: draft.secondary.map((item) => (item._uid === uidValue ? { ...item, ...patch } : item))
    });

  const addCurrency = () => {
    const next = currencyOptions(used)[0];
    if (!next) return;
    setDraft({
      ...draft,
      secondary: [
        ...draft.secondary,
        { _uid: uid(), code: next.value, rateMode: 'auto', manualRate: '', roundTo: '0' }
      ]
    });
  };

  const handleSave = async () => {
    const found = {};
    draft.secondary.forEach((item, index) => {
      if (item.rateMode === 'manual' && !(Number(item.manualRate) > 0)) {
        found[`secondary[${index}].manualRate`] = 'Enter a rate greater than zero';
      }
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const res = await currencyService.update(toPayload(draft));
      const fresh = toDraft(res.data);
      setDraft(fresh);
      setSaved(JSON.stringify(toPayload(fresh)));
      toast.success('Currencies saved successfully');
      refetch();
    } catch (err) {
      setErrors(mapServerErrors(err.errors));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await currencyService.refresh();
      toast.success('Rates refreshed');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Currencies"
        description="Set the main currency and let visitors see prices in their own."
        action={
          <button type="button" className="btn-primary" disabled={saving || !dirty} onClick={handleSave}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t('Save changes')}
          </button>
        }
      />

      <section className="flex gap-3 p-5 mb-5 card border-brand-100 bg-brand-50/40">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-600" />
        <p className="text-sm text-slate-600">
          {t('Enter package prices in the main currency. Other currencies are converted automatically. To set an exact price for one currency, use the Custom prices section inside the package. Automatic rates are indicative and update every 12 hours.')}
        </p>
      </section>

      <section className="grid gap-5 p-6 mb-5 card sm:grid-cols-2">
        <FormSelect
          label="Main currency"
          options={currencyOptions()}
          value={draft.primary}
          onChange={(event) => setDraft({ ...draft, primary: event.target.value })}
          hint="Changing it affects fixed rates, which are entered per 1 unit of the main currency."
        />
        <div className="flex items-center">
          <FormToggle
            label="Detect the visitor's currency automatically"
            hint="Uses the visitor's country, timezone and language"
            checked={draft.autoDetect}
            onChange={(value) => setDraft({ ...draft, autoDetect: value })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{t('Other currencies')}</h3>
          <div className="flex items-center gap-3">
            {data.ratesUpdatedAt && (
              <span className="text-xs text-slate-500">
                {t('Rates updated')}: {formatDateTime(data.ratesUpdatedAt)}
              </span>
            )}
            <button type="button" className="btn-secondary" disabled={refreshing} onClick={handleRefresh}>
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {t('Refresh rates')}
            </button>
          </div>
        </div>

        {draft.secondary.length === 0 && (
          <EmptyState
            title="No extra currencies"
            description="Visitors will see prices in the main currency only."
          />
        )}

        {draft.secondary.map((item, index) => {
          const rate = data.effective[item.code];
          return (
            <div key={item._uid} className="p-5 card">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormSelect
                  label="Currency"
                  options={currencyOptions(used.filter((code) => code !== item.code))}
                  value={item.code}
                  onChange={(event) => setItem(item._uid, { code: event.target.value })}
                />
                <FormSelect
                  label="Rate"
                  options={MODES}
                  value={item.rateMode}
                  onChange={(event) => setItem(item._uid, { rateMode: event.target.value })}
                />
                {item.rateMode === 'manual' ? (
                  <FormInput
                    label={`1 ${draft.primary} =`}
                    type="number"
                    min="0"
                    step="any"
                    value={item.manualRate}
                    error={errors[`secondary[${index}].manualRate`]}
                    onChange={(event) => setItem(item._uid, { manualRate: event.target.value })}
                  />
                ) : (
                  <div>
                    <span className="label">{t('Current rate')}</span>
                    <p dir="ltr" className="flex items-center input bg-slate-50 text-start text-slate-600">
                      {rate ? `1 ${draft.primary} = ${rate.toFixed(4)} ${item.code}` : t('Not available yet')}
                    </p>
                  </div>
                )}
                <FormSelect
                  label="Rounding"
                  options={ROUNDING}
                  value={item.roundTo}
                  onChange={(event) => setItem(item._uid, { roundTo: event.target.value })}
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="icon-btn hover:bg-red-50 hover:text-red-600"
                  title={t('Delete')}
                  onClick={() =>
                    setDraft({ ...draft, secondary: draft.secondary.filter((row) => row._uid !== item._uid) })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="btn-secondary"
          disabled={draft.secondary.length >= 10}
          onClick={addCurrency}
        >
          <Plus size={16} />
          {t('Add currency')}
        </button>
      </section>
    </div>
  );
}