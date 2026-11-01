import { Link } from 'react-router-dom';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { t } from '../../i18n';

export default function RowActions({ editTo, onEdit, isActive, onToggle, onDelete, children }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {children}
      {editTo && (
        <Link to={editTo} className="icon-btn" title={t('Edit')}>
          <Pencil size={16} />
        </Link>
      )}
      {onEdit && (
        <button type="button" className="icon-btn" title={t('Edit')} onClick={onEdit}>
          <Pencil size={16} />
        </button>
      )}
      {onToggle && (
        <button
          type="button"
          className="icon-btn"
          title={isActive ? t('Deactivate') : t('Activate')}
          onClick={onToggle}
        >
          <Power size={16} className={isActive ? 'text-emerald-600' : ''} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="icon-btn hover:bg-red-50 hover:text-red-600"
          title={t('Delete')}
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}