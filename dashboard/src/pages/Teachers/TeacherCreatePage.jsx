import PageHeader from '../../components/common/PageHeader';
import TeacherForm from '../../components/forms/TeacherForm';
import teacherService from '../../services/teacher.service';
import useFormSubmit from '../../hooks/useFormSubmit';
import { ROUTES } from '../../constants/routes';

export default function TeacherCreatePage() {
  const { submit, submitting, serverErrors } = useFormSubmit(teacherService.create, {
    successMessage: 'Teacher created successfully',
    redirectTo: ROUTES.TEACHERS
  });

  return (
    <div>
      <PageHeader title="Add teacher" backTo={ROUTES.TEACHERS} />
      <TeacherForm onSubmit={submit} submitting={submitting} serverErrors={serverErrors} />
    </div>
  );
}