import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PackageForm from '../../components/forms/PackageForm';
import packageService from '../../services/package.service';
import useFetch from '../../hooks/useFetch';
import useFormSubmit from '../../hooks/useFormSubmit';
import { ROUTES } from '../../constants/routes';
import { t } from '../../i18n';

export default function PackageEditPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => packageService.get(id), [id]);
  const { submit, submitting, serverErrors } = useFormSubmit(
    (payload) => packageService.update(id, payload),
    { successMessage: 'Package updated successfully', redirectTo: ROUTES.PACKAGES }
  );

  if (loading) return <Loader />;
  if (error || !data) return <EmptyState title="Package not found" description={error} />;

  return (
    <div>
      <PageHeader title={t('Edit {name}', { name: data.name })} backTo={ROUTES.PACKAGES} />
      <PackageForm initialData={data} onSubmit={submit} submitting={submitting} serverErrors={serverErrors} />
    </div>
  );
}