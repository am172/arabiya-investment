import { useEffect, useState } from 'react';
import { CalendarDays, Check } from 'lucide-react';
import { PRESETS, daysAgoInput, todayInput, validateCustomRange } from '../../utils/analytics';
import { t } from '../../i18n';

export default function DateRangePicker({ value, onChange }) {
  const [draft, setDraft] = useState({ startDate: value.startDate, endDate: value.endDate });
  const [error, setError] = useState('');
  const custom = value.preset === 'custom';

  useEffect(() => {
    setDraft({ startDate: value.startDate, endDate: value.endDate });
    setError('');
  }, [value.startDate, value.endDate]);

  const selectPreset = (preset) => {
    if (preset === 'custom') {
      const invalid = validateCustomRange(draft.startDate, draft.endDate);
      onChange({
        preset,
        startDate: invalid ? daysAgoInput(6) : draft.startDate,
        endDate: invalid ? todayInput() : draft.endDate
      });
      return;
    }
    onChange({ ...value, preset });
  };

  const apply = () => {
    const message = validateCustomRange(draft.startDate, draft.endDate);
    setError(message);
    if (!message) {
      onChange({ preset: 'custom', startDate: draft.startDate, endDate: draft.endDate });
    }
  };

  return (
    <div className="p-3 card sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="items-center hidden gap-2 text-sm font-medium me-1 text-slate-500 sm:inline-flex">
          <CalendarDays size={16} />
          {t('Period')}
        </span>
        {PRESETS.map((preset) => {
          const active = value.preset === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              aria-pressed={active}
              onClick={() => selectPreset(preset.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t(preset.label)}
            </button>
          );
        })}
      </div>

      {custom && (
        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="range-from" className="label">
                {t('From')}
              </label>
              <input
                id="range-from"
                type="date"
                dir="ltr"
                className="input"
                value={draft.startDate}
                max={draft.endDate || todayInput()}
                onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="range-to" className="label">
                {t('To')}
              </label>
              <input
                id="range-to"
                type="date"
                dir="ltr"
                className="input"
                value={draft.endDate}
                min={draft.startDate}
                max={todayInput()}
                onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
              />
            </div>
            <button type="button" className="btn-primary" onClick={apply}>
              <Check size={16} />
              {t('Apply')}
            </button>
          </div>
          {error && <p className="error-text">{t(error)}</p>}
        </div>
      )}
    </div>
  );
}