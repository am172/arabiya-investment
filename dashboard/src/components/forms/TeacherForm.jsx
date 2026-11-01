import { useEffect, useState } from 'react';
import FormInput, { FormActions, FormSection, FormToggle } from './FormInput';
import FormTextarea from './FormTextarea';
import ImageUploader from '../common/ImageUploader';
import { ROUTES } from '../../constants/routes';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const EMPTY_IMAGE = { url: '', publicId: '' };

const toForm = (data) => ({
  name: data ? data.name || '' : '',
  title: data ? data.title || '' : '',
  bio: data ? data.bio || '' : '',
  image: data && data.image ? { url: data.image.url, publicId: data.image.publicId || '' } : EMPTY_IMAGE,
  subjects: data ? (data.subjects || []).join(', ') : '',
  experienceYears: data ? String(data.experienceYears ?? '') : '',
  rating: data ? String(data.rating ?? '5') : '5',
  studentsCount: data ? String(data.studentsCount ?? '') : '',
  socialLinks: {
    facebook: (data && data.socialLinks && data.socialLinks.facebook) || '',
    instagram: (data && data.socialLinks && data.socialLinks.instagram) || '',
    linkedin: (data && data.socialLinks && data.socialLinks.linkedin) || ''
  },
  order: data ? String(data.order ?? 0) : '0',
  isActive: data ? data.isActive !== false : true
});

export default function TeacherForm({ initialData, onSubmit, submitting, serverErrors }) {
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

  const bindSocial = (name) => ({
    value: form.socialLinks[name],
    onChange: (event) =>
      setForm({ ...form, socialLinks: { ...form.socialLinks, [name]: event.target.value } }),
    error: errors[`socialLinks.${name}`]
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    const rating = Number(form.rating);

    if (!form.name.trim()) found.name = 'Name is required';
    if (!form.title.trim()) found.title = 'Title is required';
    if (!form.image.url) found.image = 'Photo is required';
    if (form.rating === '' || rating < 0 || rating > 5) found.rating = 'Rating must be between 0 and 5';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      title: form.title.trim(),
      bio: form.bio.trim(),
      image: { url: form.image.url, publicId: form.image.publicId || '' },
      subjects: form.subjects
        .split(/[,،]/)
        .map((item) => item.trim())
        .filter(Boolean),
      experienceYears: Number(form.experienceYears) || 0,
      rating,
      studentsCount: Number(form.studentsCount) || 0,
      socialLinks: {
        facebook: form.socialLinks.facebook.trim(),
        instagram: form.socialLinks.instagram.trim(),
        linkedin: form.socialLinks.linkedin.trim()
      },
      order: Number(form.order) || 0,
      isActive: form.isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Basic information">
        <FormInput label="Full name" {...bind('name')} />
        <FormInput label="Job title" placeholder={t('Math Teacher')} {...bind('title')} />
        <FormTextarea label="Bio" className="sm:col-span-2" {...bind('bio')} />
        <ImageUploader
          label="Photo"
          folder="teachers"
          className="sm:col-span-2"
          value={form.image}
          error={errors.image}
          onChange={(asset) => setForm({ ...form, image: { url: asset.url, publicId: asset.publicId } })}
          onRemove={() => setForm({ ...form, image: EMPTY_IMAGE })}
          hint="JPG, PNG or WebP, up to 5 MB"
        />
      </FormSection>

      <FormSection title="Teaching details">
        <FormInput
          label="Subjects"
          className="sm:col-span-2"
          hint="Separate with commas"
          placeholder={t('Math, Science, English')}
          {...bind('subjects')}
        />
        <FormInput label="Years of experience" type="number" min="0" {...bind('experienceYears')} />
        <FormInput label="Rating (0-5)" type="number" min="0" max="5" step="0.1" {...bind('rating')} />
        <FormInput label="Students taught" type="number" min="0" {...bind('studentsCount')} />
        <FormInput label="Display order" type="number" {...bind('order')} />
      </FormSection>

      <FormSection title="Social links">
        <FormInput label="Facebook" placeholder="https://" {...bindSocial('facebook')} />
        <FormInput label="Instagram" placeholder="https://" {...bindSocial('instagram')} />
        <FormInput label="LinkedIn" placeholder="https://" {...bindSocial('linkedin')} />
      </FormSection>

      <div className="p-6 card">
        <FormToggle
          label="Active"
          hint="Inactive teachers are hidden from the website"
          checked={form.isActive}
          onChange={(value) => setForm({ ...form, isActive: value })}
        />
      </div>

      <FormActions cancelTo={ROUTES.TEACHERS} submitting={submitting} submitLabel="Save teacher" />
    </form>
  );
}