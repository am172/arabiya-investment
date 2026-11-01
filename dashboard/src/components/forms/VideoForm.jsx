import { useEffect, useState } from 'react';
import FormInput, { FormActions, FormSection, FormToggle } from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import ImageUploader from '../common/ImageUploader';
import { ROUTES } from '../../constants/routes';
import { isUrl, mapServerErrors } from '../../utils/validators';

const EMPTY_THUMB = { url: '', publicId: '' };
const SOURCES = [
  { value: 'upload', label: 'Upload a file' },
  { value: 'youtube', label: 'YouTube link' },
  { value: 'vimeo', label: 'Vimeo link' }
];

const toForm = (data) => ({
  title: data ? data.title || '' : '',
  description: data ? data.description || '' : '',
  studentName: data ? data.studentName || '' : '',
  studentAge: data && data.studentAge ? String(data.studentAge) : '',
  source: data ? data.source || 'upload' : 'upload',
  videoUrl: data ? data.videoUrl || '' : '',
  videoPublicId: data ? data.videoPublicId || '' : '',
  thumbnail:
    data && data.thumbnail
      ? { url: data.thumbnail.url || '', publicId: data.thumbnail.publicId || '' }
      : EMPTY_THUMB,
  duration: data ? String(data.duration ?? 0) : '0',
  isFeatured: data ? Boolean(data.isFeatured) : false,
  order: data ? String(data.order ?? 0) : '0',
  isActive: data ? data.isActive !== false : true
});

export default function VideoForm({ initialData, onSubmit, submitting, serverErrors }) {
  const [form, setForm] = useState(() => toForm(initialData));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors(mapServerErrors(serverErrors));
  }, [serverErrors]);

  const bind = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
    error: errors[name]
  });

  const handleSourceChange = (event) =>
    setForm({ ...form, source: event.target.value, videoUrl: '', videoPublicId: '', duration: '0' });

  const handleVideoUpload = (asset) =>
    setForm({
      ...form,
      videoUrl: asset.url,
      videoPublicId: asset.publicId,
      duration: String(asset.duration || 0),
      thumbnail: form.thumbnail.url ? form.thumbnail : { url: asset.thumbnailUrl || '', publicId: '' }
    });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    const age = Number(form.studentAge);

    if (!form.title.trim()) found.title = 'Title is required';
    if (!form.videoUrl.trim()) found.videoUrl = 'A video is required';
    else if (form.source !== 'upload' && !isUrl(form.videoUrl.trim())) found.videoUrl = 'Enter a valid link';
    if (form.studentAge !== '' && (!Number.isInteger(age) || age < 3 || age > 18)) {
      found.studentAge = 'Age must be between 3 and 18';
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      studentName: form.studentName.trim(),
      source: form.source,
      videoUrl: form.videoUrl.trim(),
      videoPublicId: form.source === 'upload' ? form.videoPublicId : '',
      thumbnail: { url: form.thumbnail.url, publicId: form.thumbnail.publicId },
      duration: Number(form.duration) || 0,
      isFeatured: form.isFeatured,
      order: Number(form.order) || 0,
      isActive: form.isActive
    };
    if (form.studentAge !== '') payload.studentAge = age;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Video details">
        <FormInput label="Title" className="sm:col-span-2" {...bind('title')} />
        <FormTextarea label="Description" className="sm:col-span-2" rows={3} {...bind('description')} />
        <FormInput label="Student name" {...bind('studentName')} />
        <FormInput label="Student age" type="number" min="3" max="18" {...bind('studentAge')} />
      </FormSection>

      <FormSection title="Video source">
        <FormSelect
          label="Source"
          className="sm:col-span-2"
          options={SOURCES}
          value={form.source}
          onChange={handleSourceChange}
        />
        {form.source === 'upload' ? (
          <ImageUploader
            kind="video"
            label="Video file"
            folder="videos"
            className="sm:col-span-2"
            value={form.videoUrl ? { url: form.videoUrl } : null}
            error={errors.videoUrl}
            onChange={handleVideoUpload}
            onRemove={() => setForm({ ...form, videoUrl: '', videoPublicId: '', duration: '0' })}
            hint="MP4, WebM or MOV, up to 100 MB"
          />
        ) : (
          <FormInput
            label="Video link"
            className="sm:col-span-2"
            placeholder="https://"
            {...bind('videoUrl')}
          />
        )}
        <ImageUploader
          label="Thumbnail"
          folder="thumbnails"
          className="sm:col-span-2"
          value={form.thumbnail}
          onChange={(asset) => setForm({ ...form, thumbnail: { url: asset.url, publicId: asset.publicId } })}
          onRemove={() => setForm({ ...form, thumbnail: EMPTY_THUMB })}
        />
        <FormInput label="Duration (seconds)" type="number" min="0" {...bind('duration')} />
        <FormInput label="Display order" type="number" {...bind('order')} />
      </FormSection>

      <div className="p-6 space-y-4 card">
        <FormToggle
          label="Featured"
          hint="Highlight this video on the landing page"
          checked={form.isFeatured}
          onChange={(value) => setForm({ ...form, isFeatured: value })}
        />
        <FormToggle
          label="Active"
          hint="Inactive videos are hidden from the website"
          checked={form.isActive}
          onChange={(value) => setForm({ ...form, isActive: value })}
        />
      </div>

      <FormActions cancelTo={ROUTES.VIDEOS} submitting={submitting} submitLabel="Save video" />
    </form>
  );
}