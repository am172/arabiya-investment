import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';
import { t } from '../../i18n';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      description="The page you are looking for does not exist or was moved."
      action={
        <Link to={ROUTES.OVERVIEW} className="btn-primary">
          {t('Back to overview')}
        </Link>
      }
    />
  );
}