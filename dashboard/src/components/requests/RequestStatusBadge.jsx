import { REQUEST_STATUSES } from '../../constants/catalog';
import { t } from '../../i18n';

export default function RequestStatusBadge({ status }) {
    const item = REQUEST_STATUSES.find((entry) => entry.id === status) || REQUEST_STATUSES[0];
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${item.tone}`}>
            {t(item.label)}
        </span>
    );
}