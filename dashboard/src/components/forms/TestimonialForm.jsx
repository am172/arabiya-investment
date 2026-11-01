import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import FormInput, { FormActions, FormToggle } from './FormInput';
import FormTextarea from './FormTextarea';
import ImageUploader from '../common/ImageUploader';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const EMPTY_AVATAR = { url: '', publicId: '' };
const ROLE_SUGGESTIONS = ['Parent', 'Student', 'Teacher', 'Client', 'Customer', 'Partner'];

const toForm = (data) => ({
  name: data ? data.name || '' : '',
  role: data ? data.role || '' : '',
  content: data ? data.content || '' : '',
  rating: data ? Number(data.rating) || 5 : 5,
  avatar:
    data && data.avatar
      ? { url: data.avatar.url || '', publicId: data.avatar.publicId || '' }
      : EMPTY_AVATAR,
  order: data ? String(data.order ?? 0) : '0',
  isActive: data ? data.isActive !== false : true
});

function StarInput({ value, onChange }) {
  return (
    <div>
      <span className="label">{t('Rating')}</span>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={t('Rating')} dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={String(star)}
            onClick={() => onChange(star)}
            className="p-1 transition rounded-md hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Star
              size={26}
              className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
            />
          </button>
        ))}
        <span className="text-sm font-medium ms-2 text-slate-500">{value} / 5</span>
      </div>
    </div>
  );
}

export default function TestimonialForm({ initialData, onSubmit, onCancel, submitting, serverErrors }) {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    const content = form.content.trim();

    if (!form.name.trim()) found.name = 'Name is required';
    if (content.length < 10) found.content = 'The review must be at least 10 characters';
    else if (content.length > 600) found.content = 'The review must be under 600 characters';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      role: form.role.trim(),
      content,
      rating: form.rating,
      avatar: { url: form.avatar.url, publicId: form.avatar.publicId },
      order: Number(form.order) || 0,
      isActive: form.isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="Name" {...bind('name')} />
        <FormInput label="Role" list="testimonial-roles" {...bind('role')} />
        <datalist id="testimonial-roles">
          {ROLE_SUGGESTIONS.map((role) => (
            <option key={role} value={t(role)} />
          ))}
        </datalist>
      </div>

      <FormTextarea label="Review" rows={5} hint={`${form.content.length}/600`} {...bind('content')} />

      <StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />

      <ImageUploader
        label="Avatar (optional)"
        folder="avatars"
        value={form.avatar}
        error={errors.avatar || errors['avatar.url']}
        onChange={(asset) => setForm({ ...form, avatar: { url: asset.url, publicId: asset.publicId } })}
        onRemove={() => setForm({ ...form, avatar: EMPTY_AVATAR })}
        hint="Square image works best, up to 5 MB"
      />

      <FormInput label="Display order" type="number" {...bind('order')} />

      <FormToggle
        label="Active"
        hint="Inactive reviews are hidden from the website"
        checked={form.isActive}
        onChange={(value) => setForm({ ...form, isActive: value })}
      />

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t('Cancel')}
        </button>
        <FormActions submitting={submitting} submitLabel="Save review" />
      </div>
    </form>
  );
}