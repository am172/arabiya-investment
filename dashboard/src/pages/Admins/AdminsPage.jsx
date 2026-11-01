import { useState } from 'react';
import { KeyRound, Loader2, Plus } from 'lucide-react';
import adminService from '../../services/admin.service';
import useAuth from '../../hooks/useAuth';
import useResourceList from '../../hooks/useResourceList';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import ListToolbar from '../../components/common/ListToolbar';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import RowActions from '../../components/common/RowActions';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import { ROLES } from '../../constants/config';
import { formatDate } from '../../utils/formatters';
import { isEmail, mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const EMPTY = { name: '', email: '', password: '', role: ROLES.ADMIN };
const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.SUPER_ADMIN, label: 'Super admin' }
];

export default function AdminsPage() {
  const { admin: me } = useAuth();
  const list = useResourceList(adminService);
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(EMPTY);
    setErrors({});
    setEditing('new');
  };

  const openEdit = (item) => {
    setForm({ name: item.name, email: item.email, password: '', role: item.role });
    setErrors({});
    setEditing(item);
  };

  const bind = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
    error: errors[name]
  });

  const handleSave = async (event) => {
    event.preventDefault();
    const isNew = editing === 'new';
    const found = {};

    if (!form.name.trim()) found.name = 'Name is required';
    if (!isEmail(form.email)) found.email = 'A valid email is required';
    if (isNew && form.password.length < 8) found.password = 'At least 8 characters';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const base = { name: form.name.trim(), email: form.email.trim(), role: form.role };
      if (isNew) await adminService.create({ ...base, password: form.password });
      else await adminService.update(editing._id, base);
      toast.success('Admin saved successfully');
      setEditing(null);
      list.refetch();
    } catch (err) {
      setErrors(mapServerErrors(err.errors));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      setErrors({ newPassword: 'At least 8 characters' });
      return;
    }
    setSaving(true);
    try {
      await adminService.resetPassword(resetting._id, password);
      toast.success('Password reset successfully');
      setResetting(null);
      setPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await adminService.toggleStatus(item._id);
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Delete admin',
      message: t('{name} will lose access permanently.', { name: item.name }),
      confirmLabel: 'Delete'
    });
    if (!ok) return;
    try {
      await adminService.remove(item._id);
      toast.success('Admin deleted');
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Admin',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.name}</p>
          <p dir="ltr" className="text-xs text-start text-slate-500">
            {item.email}
          </p>
        </div>
      )
    },
    { key: 'role', header: 'Role', render: (item) => <StatusBadge status={item.role} /> },
    { key: 'createdAt', header: 'Created', render: (item) => formatDate(item.createdAt) },
    { key: 'lastLoginAt', header: 'Last login', render: (item) => formatDate(item.lastLoginAt) },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
    },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      render: (item) => {
        const self = item._id === me._id;
        return (
          <RowActions
            onEdit={() => openEdit(item)}
            isActive={item.isActive}
            onToggle={self ? undefined : () => handleToggle(item)}
            onDelete={self ? undefined : () => handleDelete(item)}
          >
            <button
              type="button"
              className="icon-btn"
              title={t('Reset password')}
              onClick={() => {
                setErrors({});
                setPassword('');
                setResetting(item);
              }}
            >
              <KeyRound size={16} />
            </button>
          </RowActions>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Manage who can access this dashboard."
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} />
            {t('Add admin')}
          </button>
        }
      />
      <ListToolbar search={list.search} onSearch={list.setSearch} placeholder="Search by name or email" />
      <DataTable columns={columns} rows={list.items} loading={list.loading} />
      <Pagination meta={list.meta} onChange={list.setPage} />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add admin' : 'Edit admin'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput label="Name" {...bind('name')} />
          <FormInput label="Email" type="email" {...bind('email')} />
          {editing === 'new' && <FormInput label="Password" type="password" {...bind('password')} />}
          <FormSelect label="Role" options={ROLE_OPTIONS} {...bind('role')} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
              {t('Cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {t('Save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(resetting)} onClose={() => setResetting(null)} title="Reset password" size="sm">
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-slate-500">
            {t('Set a new password for {name}. Their current sessions will be signed out.', {
              name: resetting ? resetting.name : ''
            })}
          </p>
          <FormInput
            label="New password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.newPassword}
          />
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setResetting(null)}>
              {t('Cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {t('Reset')}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog {...confirmProps} />
    </div>
  );
}