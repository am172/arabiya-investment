import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import FormInput, { FormActions, FormSection, FormToggle } from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import currencyService from '../../services/currency.service';
import useFetch from '../../hooks/useFetch';
import { ROUTES } from '../../constants/routes';
import { currencyName } from '../../constants/currencies';
import { buildRates, convert } from '../../utils/pricing';
import { formatCurrency } from '../../utils/formatters';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' }
];

const toForm = (data) => ({
  name: data ? data.name || '' : '',
  description: data ? data.description || '' : '',
  price: data ? String(data.price ?? '') : '',
  discountPrice:
    data && data.discountPrice !== null && data.discountPrice !== undefined ? String(data.discountPrice) : '',
  currency: data ? data.currency || 'USD' : '',
  prices: data
    ? (data.prices || []).map((item) => ({
        currency: item.currency,
        price: String(item.price),
        discountPrice:
          item.discountPrice !== null && item.discountPrice !== undefined ? String(item.discountPrice) : ''
      }))
    : [],
  billingPeriod: data ? data.billingPeriod || 'monthly' : 'monthly',
  sessionsPerMonth: data ? String(data.sessionsPerMonth ?? 0) : '0',
  sessionDuration: data ? String(data.sessionDuration ?? 45) : '45',
  features: data ? (data.features || []).join('\n') : '',
  badge: data ? data.badge || '' : '',
  isPopular: data ? Boolean(data.isPopular) : false,
  ctaLabel: data ? data.ctaLabel || '' : '',
  ctaLink: data ? data.ctaLink || '' : '',
  order: data ? String(data.order ?? 0) : '0',
  isActive: data ? data.isActive !== false : true
});

export default function PackageForm({ initialData, onSubmit, submitting, serverErrors }) {
  const [form, setForm] = useState(() => toForm(initialData));
  const [errors, setErrors] = useState({});
  const { data: currencies } = useFetch(() => currencyService.get(), []);

  useEffect(() => {
    setErrors(mapServerErrors(serverErrors));
  }, [serverErrors]);

  useEffect(() => {
    if (currencies && !form.currency) setForm((current) => ({ ...current, currency: currencies.primary }));
  }, [currencies]);

  const table = useMemo(
    () => (currencies ? buildRates(currencies) : { rates: {}, round: {} }),
    [currencies]
  );

  const base = form.currency.trim().toUpperCase();

  const codes = useMemo(() => {
    const set = new Set();
    if (currencies) {
      set.add(currencies.primary);
      currencies.secondary.forEach((item) => set.add(item.code));
    }
    form.prices.forEach((item) => set.add(item.currency));
    set.delete(base);
    return [...set];
  }, [currencies, form.prices, base]);

  const bind = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
    error: errors[name]
  });

  const manualOf = (code) => form.prices.find((item) => item.currency === code);

  const auto = (value, code) => (value === '' ? null : convert(value, base, code, table));

  const autoEntry = (code) => {
    const price = auto(form.price, code);
    const discount = auto(form.discountPrice, code);
    return {
      currency: code,
      price: price !== null ? String(price) : '',
      discountPrice: discount !== null ? String(discount) : ''
    };
  };

  const setMode = (code, manual) => {
    if (manual === Boolean(manualOf(code))) return;
    setForm({
      ...form,
      prices: manual
        ? [...form.prices, autoEntry(code)]
        : form.prices.filter((item) => item.currency !== code)
    });
  };

  const fillFromAuto = (code) =>
    setForm({
      ...form,
      prices: form.prices.map((item) => (item.currency === code ? autoEntry(code) : item))
    });

  const setPrice = (code, patch) =>
    setForm({
      ...form,
      prices: form.prices.map((item) => (item.currency === code ? { ...item, ...patch } : item))
    });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    const price = Number(form.price);
    const discount = Number(form.discountPrice);

    if (!form.name.trim()) found.name = 'Name is required';
    if (form.price === '' || price < 0) found.price = 'Enter a valid price';
    if (form.discountPrice !== '' && (discount < 0 || discount >= price)) {
      found.discountPrice = 'Discount must be lower than the price';
    }
    if (!/^[A-Za-z]{3}$/.test(form.currency.trim())) found.currency = 'Use a 3-letter code';

    form.prices.forEach((item, index) => {
      const own = Number(item.price);
      if (item.price === '' || own < 0) found[`prices[${index}].price`] = 'Enter a valid price';
      if (item.discountPrice !== '' && Number(item.discountPrice) >= own) {
        found[`prices[${index}].discountPrice`] = 'Discount must be lower than the price';
      }
    });

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      discountPrice: form.discountPrice === '' ? null : discount,
      currency: base,
      prices: form.prices.map((item) => ({
        currency: item.currency,
        price: Number(item.price),
        discountPrice: item.discountPrice === '' ? null : Number(item.discountPrice)
      })),
      billingPeriod: form.billingPeriod,
      sessionsPerMonth: Number(form.sessionsPerMonth) || 0,
      sessionDuration: Number(form.sessionDuration) || 0,
      features: form.features
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      badge: form.badge.trim(),
      isPopular: form.isPopular,
      ctaLabel: form.ctaLabel.trim(),
      ctaLink: form.ctaLink.trim(),
      order: Number(form.order) || 0,
      isActive: form.isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Package details">
        <FormInput label="Name" {...bind('name')} />
        <FormInput label="Badge" placeholder={t('Most Popular')} {...bind('badge')} />
        <FormTextarea label="Description" className="sm:col-span-2" rows={3} {...bind('description')} />
      </FormSection>

      <FormSection title="Pricing">
        <FormInput label="Price" type="number" min="0" step="0.01" {...bind('price')} />
        <FormInput
          label="Discount price"
          type="number"
          min="0"
          step="0.01"
          hint="Leave empty for no discount"
          {...bind('discountPrice')}
        />
        <FormInput
          label="Currency"
          maxLength={3}
          hint="Use the main currency set in Currencies"
          {...bind('currency')}
        />
        <FormSelect label="Billing period" options={PERIODS} {...bind('billingPeriod')} />
        <FormInput label="Sessions per month" type="number" min="0" {...bind('sessionsPerMonth')} />
        <FormInput label="Session duration (min)" type="number" min="0" {...bind('sessionDuration')} />
      </FormSection>

      <section className="p-6 card">
        <h3 className="text-base font-semibold text-slate-900">{t('Prices per currency')}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('For each currency, let the system calculate the price automatically, or type your own fixed price. Automatic prices show an approximate sign on the website.')}
        </p>

        {codes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {t('Add extra currencies first in')}{' '}
            <Link to={ROUTES.CURRENCIES} className="font-medium text-brand-600 hover:underline">
              {t('Currencies')}
            </Link>
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {codes.map((code) => {
              const manual = manualOf(code);
              const index = form.prices.findIndex((item) => item.currency === code);
              const autoPrice = auto(form.price, code);
              const autoDiscount = auto(form.discountPrice, code);

              return (
                <div key={code} className="p-4 border rounded-xl border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p dir="ltr" className="font-semibold text-start text-slate-900">
                        {code}
                      </p>
                      <p className="text-xs text-slate-500">{currencyName(code)}</p>
                    </div>
                    <div role="group" className="inline-flex p-1 rounded-xl bg-slate-100">
                      {[false, true].map((isManual) => (
                        <button
                          key={String(isManual)}
                          type="button"
                          aria-pressed={Boolean(manual) === isManual}
                          onClick={() => setMode(code, isManual)}
                          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                            Boolean(manual) === isManual
                              ? 'bg-card text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {t(isManual ? 'Manual' : 'Automatic')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {manual ? (
                    <div className="mt-4 grid items-start gap-4 sm:grid-cols-[1fr_1fr_auto]">
                      <FormInput
                        label="Price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={manual.price}
                        error={errors[`prices[${index}].price`]}
                        onChange={(event) => setPrice(code, { price: event.target.value })}
                      />
                      <FormInput
                        label="Discount price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={manual.discountPrice}
                        error={errors[`prices[${index}].discountPrice`]}
                        onChange={(event) => setPrice(code, { discountPrice: event.target.value })}
                      />
                      <button
                        type="button"
                        className="btn-secondary sm:mt-7"
                        onClick={() => fillFromAuto(code)}
                      >
                        <Wand2 size={16} />
                        {t('Fill from automatic')}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">
                      {autoPrice !== null ? (
                        <>
                          <span className="font-semibold text-slate-900">≈ {formatCurrency(autoPrice, code)}</span>
                          {autoDiscount !== null && (
                            <span className="ms-2 text-slate-500">
                              ({t('Discount price')}: ≈ {formatCurrency(autoDiscount, code)})
                            </span>
                          )}
                        </>
                      ) : (
                        t('Rate not available yet')
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <FormSection title="Features and call to action">
        <FormTextarea
          label="Features"
          className="sm:col-span-2"
          rows={6}
          hint="One feature per line"
          {...bind('features')}
        />
        <FormInput label="Button label" {...bind('ctaLabel')} />
        <FormInput label="Button link" placeholder="/#contact" {...bind('ctaLink')} />
        <FormInput label="Display order" type="number" {...bind('order')} />
      </FormSection>

      <div className="p-6 space-y-4 card">
        <FormToggle
          label="Popular"
          hint="Only one package can be popular; others are cleared automatically"
          checked={form.isPopular}
          onChange={(value) => setForm({ ...form, isPopular: value })}
        />
        <FormToggle
          label="Active"
          hint="Inactive packages are hidden from the website"
          checked={form.isActive}
          onChange={(value) => setForm({ ...form, isActive: value })}
        />
      </div>

      <FormActions cancelTo={ROUTES.PACKAGES} submitting={submitting} submitLabel="Save package" />
    </form>
  );
}