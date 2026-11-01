import { Search } from 'lucide-react';
import { t } from '../../i18n';

export default function ListToolbar({ search, onSearch, placeholder = 'Search...', filter, children }) {
  return (
    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input ps-10"
          placeholder={t(placeholder)}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      {filter && (
        <select
          className="input sm:w-44"
          value={filter.value}
          onChange={(event) => filter.onChange(event.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      )}
      {children}
    </div>
  );
}