import PageHeader from '../../components/common/PageHeader';
import PackageForm from '../../components/forms/PackageForm';
import packageService from '../../services/package.service';
import useFormSubmit from '../../hooks/useFormSubmit';
import { ROUTES } from '../../constants/routes';

export default function PackageCreatePage() {
  const { submit, submitting, serverErrors } = useFormSubmit(packageService.create, {
    successMessage: 'Package created successfully',
    redirectTo: ROUTES.PACKAGES
  });

  return (
    <div>
      <PageHeader title="Add package" backTo={ROUTES.PACKAGES} />
      <PackageForm onSubmit={submit} submitting={submitting} serverErrors={serverErrors} />
    </div>
  );
}