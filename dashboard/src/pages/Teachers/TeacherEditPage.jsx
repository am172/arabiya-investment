import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import TeacherForm from '../../components/forms/TeacherForm';
import teacherService from '../../services/teacher.service';
import useFetch from '../../hooks/useFetch';
import useFormSubmit from '../../hooks/useFormSubmit';
import { ROUTES } from '../../constants/routes';
import { t } from '../../i18n';

export default function TeacherEditPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => teacherService.get(id), [id]);
  const { submit, submitting, serverErrors } = useFormSubmit(
    (payload) => teacherService.update(id, payload),
    { successMessage: 'Teacher updated successfully', redirectTo: ROUTES.TEACHERS }
  );

  if (loading) return <Loader />;
  if (error || !data) return <EmptyState title="Teacher not found" description={error} />;

  return (
    <div>
      <PageHeader title={t('Edit {name}', { name: data.name })} backTo={ROUTES.TEACHERS} />
      <TeacherForm initialData={data} onSubmit={submit} submitting={submitting} serverErrors={serverErrors} />
    </div>
  );
}