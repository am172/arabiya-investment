import { useEffect, useState } from 'react';
import FormInput, { FormActions, FormToggle } from './FormInput';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const toForm = (data) => ({
  label: data ? data.label || '' : '',
  value: data ? String(data.value ?? '') : '',
  prefix: data ? data.prefix || '' : '',
  suffix: data ? data.suffix || '' : '',
  icon: data ? data.icon || '' : '',
  description: data ? data.description || '' : '',
  order: data ? String(data.order ?? 0) : '0',
  isActive: data ? data.isActive !== false : true
});

export default function StatForm({ initialData, onSubmit, onCancel, submitting, serverErrors }) {
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
    if (!form.label.trim()) found.label = 'Label is required';
    if (form.value === '' || Number(form.value) < 0) found.value = 'Enter a non-negative number';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      label: form.label.trim(),
      value: Number(form.value),
      prefix: form.prefix.trim(),
      suffix: form.suffix.trim(),
      icon: form.icon.trim(),
      description: form.description.trim(),
      order: Number(form.order) || 0,
      isActive: form.isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Label" placeholder={t('Happy Students')} {...bind('label')} />
      <div className="grid grid-cols-3 gap-4">
        <FormInput label="Value" type="number" min="0" {...bind('value')} />
        <FormInput label="Prefix" maxLength={10} {...bind('prefix')} />
        <FormInput label="Suffix" maxLength={10} placeholder="+" {...bind('suffix')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Icon name" placeholder="users" {...bind('icon')} />
        <FormInput label="Display order" type="number" {...bind('order')} />
      </div>
      <FormInput label="Description" {...bind('description')} />
      <FormToggle
        label="Active"
        checked={form.isActive}
        onChange={(value) => setForm({ ...form, isActive: value })}
      />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t('Cancel')}
        </button>
        <FormActions submitting={submitting} submitLabel="Save stat" />
      </div>
    </form>
  );
}