import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { FormToggle } from '../forms/FormInput';
import { t } from '../../i18n';

export default function DuplicateDialog({ hasChildren, busy = false, onConfirm, onClose }) {
    const [includeChildren, setIncludeChildren] = useState(false);
    const [publish, setPublish] = useState(false);

    return (
        <Modal open onClose={onClose} title="Duplicate item" size="sm">
            <p className="mb-5 text-sm text-slate-500">
                {t('A copy is created with all its options, specifications and content.')}
            </p>
            <div className="space-y-4">
                {hasChildren && (
                    <FormToggle label="Also copy everything inside it" checked={includeChildren} onChange={setIncludeChildren} />
                )}
                <FormToggle
                    label="Publish the copy immediately"
                    hint="By default the copy is saved as a draft."
                    checked={publish}
                    onChange={setPublish}
                />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn-secondary" onClick={onClose}>
                    {t('Cancel')}
                </button>
                <button type="button" className="btn-primary" disabled={busy} onClick={() => onConfirm({ includeChildren, publish })}>
                    {busy && <Loader2 size={16} className="animate-spin" />}
                    {t('Create copy')}
                </button>
            </div>
        </Modal>
    );
}