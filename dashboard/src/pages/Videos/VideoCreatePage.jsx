import PageHeader from '../../components/common/PageHeader';
import VideoForm from '../../components/forms/VideoForm';
import videoService from '../../services/video.service';
import useFormSubmit from '../../hooks/useFormSubmit';
import { ROUTES } from '../../constants/routes';

export default function VideoCreatePage() {
  const { submit, submitting, serverErrors } = useFormSubmit(videoService.create, {
    successMessage: 'Video created successfully',
    redirectTo: ROUTES.VIDEOS
  });

  return (
    <div>
      <PageHeader title="Add video" backTo={ROUTES.VIDEOS} />
      <VideoForm onSubmit={submit} submitting={submitting} serverErrors={serverErrors} />
    </div>
  );
}