import EmptyState from './EmptyState';
import { t } from '../../i18n';

const align = (value) => (value ? value.replace('text-right', 'text-end').replace('text-left', 'text-start') : '');

export default function DataTable({
  columns,
  rows,
  loading = false,
  selectable = false,
  selected = [],
  onSelectionChange,
  onRowClick,
  empty
}) {
  const showSkeleton = loading && rows.length === 0;
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row._id));

  const toggleAll = () => onSelectionChange(allSelected ? [] : rows.map((row) => row._id));
  const toggleOne = (id) =>
    onSelectionChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);

  if (!loading && rows.length === 0) {
    return (
      empty || (
        <EmptyState title="No records found" description="Nothing to show here yet." />
      )
    );
  }

  return (
    <div className="overflow-hidden card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-start">
          <thead className="text-xs bg-slate-50 text-slate-500">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-start font-semibold ${align(column.className)}`}
                >
                  {column.header ? t(column.header) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showSkeleton
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    {selectable && <td className="px-4 py-4" />}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={row._id}
                    className={`hover:bg-slate-50/60 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(row._id)}
                          onChange={() => toggleOne(row._id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-slate-700 ${align(column.className)}`}
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}