import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import VideoForm from '../../components/forms/VideoForm';
import videoService from '../../services/video.service';
import useFetch from '../../hooks/useFetch';
import useFormSubmit from '../../hooks/useFormSubmit';
import { ROUTES } from '../../constants/routes';

export default function VideoEditPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => videoService.get(id), [id]);
  const { submit, submitting, serverErrors } = useFormSubmit(
    (payload) => videoService.update(id, payload),
    { successMessage: 'Video updated successfully', redirectTo: ROUTES.VIDEOS }
  );

  if (loading) return <Loader />;
  if (error || !data) return <EmptyState title="Video not found" description={error} />;

  return (
    <div>
      <PageHeader title="Edit video" backTo={ROUTES.VIDEOS} />
      <VideoForm initialData={data} onSubmit={submit} submitting={submitting} serverErrors={serverErrors} />
    </div>
  );
}