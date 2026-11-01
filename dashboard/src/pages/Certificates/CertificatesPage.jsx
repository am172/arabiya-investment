import { useMemo, useState } from 'react';
import { Ban, Download, Plus, Settings2, ShieldCheck } from 'lucide-react';
import certificateService from '../../services/certificate.service';
import settingsService from '../../services/settings.service';
import useFetch from '../../hooks/useFetch';
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
import CertificateForm from '../../components/certificates/CertificateForm';
import CertificatePreview from '../../components/certificates/CertificatePreview';
import CertificateSettingsModal from '../../components/certificates/CertificateSettingsModal';
import { formatDate } from '../../utils/formatters';
import { t } from '../../i18n';

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'valid', label: 'Valid' },
    { value: 'revoked', label: 'Revoked' }
];

export default function CertificatesPage() {
    const list = useResourceList(certificateService);
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const { data: certSettings, refetch: refetchSettings } = useFetch(() => certificateService.getSettings(), []);
    const { data: siteSettings } = useFetch(() => settingsService.get(), []);
    const [editing, setEditing] = useState(null);
    const [previewing, setPreviewing] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverErrors, setServerErrors] = useState([]);

    const site = useMemo(() => {
        if (!siteSettings) return null;
        const colors = (siteSettings.theme && siteSettings.theme.colors) || {};
        return {
            name: siteSettings.siteName,
            logo: siteSettings.logo && siteSettings.logo.url,
            primary: colors.primary,
            secondary: colors.secondary
        };
    }, [siteSettings]);

    const closeForm = () => {
        setEditing(null);
        setServerErrors([]);
    };

    const handleSave = async (payload) => {
        setSaving(true);
        setServerErrors([]);
        try {
            const res =
                editing === 'new'
                    ? await certificateService.create(payload)
                    : await certificateService.update(editing._id, payload);
            toast.success('Certificate saved successfully');
            closeForm();
            list.refetch();
            setPreviewing(res.data);
        } catch (err) {
            setServerErrors(err.errors || []);
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSettings = async (payload) => {
        setSaving(true);
        try {
            await certificateService.updateSettings(payload);
            toast.success('Settings saved successfully');
            setSettingsOpen(false);
            refetchSettings();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRevoke = async (item) => {
        const revoke = item.status === 'valid';
        const ok = await confirm({
            title: revoke ? 'Revoke certificate' : 'Restore certificate',
            message: revoke
                ? 'The verification page will show this certificate as revoked.'
                : 'The verification page will show this certificate as valid again.',
            confirmLabel: revoke ? 'Revoke' : 'Restore',
            danger: revoke
        });
        if (!ok) return;
        try {
            await certificateService.revoke(item._id, { revoked: revoke });
            toast.success('Certificate status updated successfully');
            list.refetch();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (item) => {
        const ok = await confirm({
            title: 'Delete certificate',
            message: 'The code will stop working. To keep a record, revoke it instead.',
            confirmLabel: 'Delete'
        });
        if (!ok) return;
        try {
            await certificateService.remove(item._id);
            toast.success('Certificate deleted successfully');
            list.refetch();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const columns = [
        {
            key: 'studentName',
            header: 'Student',
            render: (item) => (
                <div className="min-w-0">
                    <p className="font-medium truncate text-slate-900">{item.studentName}</p>
                    <p dir="ltr" className="text-xs text-start text-slate-500">
                        {item.serial}
                    </p>
                </div>
            )
        },
        { key: 'courseName', header: 'Course' },
        { key: 'issueDate', header: 'Issued', render: (item) => formatDate(item.issueDate) },
        {
            key: 'status',
            header: 'Status',
            render: (item) => (
                <StatusBadge
                    status={item.status === 'valid' ? 'active' : 'inactive'}
                    label={item.status === 'valid' ? 'Valid' : 'Revoked'}
                />
            )
        },
        {
            key: 'actions',
            header: '',
            className: 'text-end',
            render: (item) => (
                <RowActions onEdit={() => setEditing(item)} onDelete={() => handleDelete(item)}>
                    <button type="button" className="icon-btn" title={t('Download PDF')} onClick={() => setPreviewing(item)}>
                        <Download size={16} />
                    </button>
                    <button
                        type="button"
                        className="icon-btn"
                        title={item.status === 'valid' ? t('Revoke') : t('Restore')}
                        onClick={() => handleRevoke(item)}
                    >
                        {item.status === 'valid' ? <Ban size={16} /> : <ShieldCheck size={16} className="text-emerald-600" />}
                    </button>
                </RowActions>
            )
        }
    ];

    return (
        <div>
            <PageHeader
                title="Certificates"
                description="Issue branded certificates with a QR code that anyone can verify."
                action={
                    <div className="flex gap-3">
                        <button type="button" className="btn-secondary" onClick={() => setSettingsOpen(true)}>
                            <Settings2 size={16} />
                            {t('Certificate settings')}
                        </button>
                        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
                            <Plus size={16} />
                            {t('Issue certificate')}
                        </button>
                    </div>
                }
            />

            <ListToolbar
                search={list.search}
                onSearch={list.setSearch}
                placeholder="Search by name, course or serial"
                filter={{
                    value: list.filters.status || '',
                    onChange: (value) => list.setFilter('status', value),
                    options: STATUS_OPTIONS
                }}
            />
            <DataTable columns={columns} rows={list.items} loading={list.loading} />
            <Pagination meta={list.meta} onChange={list.setPage} />

            <Modal
                open={Boolean(editing) && Boolean(certSettings)}
                onClose={closeForm}
                title={editing === 'new' ? 'Issue certificate' : 'Edit certificate'}
                size="lg"
            >
                {editing && certSettings && (
                    <CertificateForm
                        key={editing === 'new' ? 'new' : editing._id}
                        initialData={editing === 'new' ? null : editing}
                        settings={certSettings}
                        site={site}
                        onSubmit={handleSave}
                        onCancel={closeForm}
                        submitting={saving}
                        serverErrors={serverErrors}
                    />
                )}
            </Modal>

            {certSettings && (
                <CertificatePreview
                    cert={previewing}
                    settings={certSettings}
                    site={site}
                    onClose={() => setPreviewing(null)}
                />
            )}

            <CertificateSettingsModal
                open={settingsOpen}
                settings={certSettings}
                site={site}
                saving={saving}
                onClose={() => setSettingsOpen(false)}
                onSave={handleSettings}
            />
            <ConfirmDialog {...confirmProps} />
        </div>
    );
}