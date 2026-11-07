import { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { flattenTree } from '../../utils/catalog';
import { t } from '../../i18n';

export default function AddProductModal({ tree, defaultParent = '', onConfirm, onClose }) {
    const [parent, setParent] = useState(defaultParent);

    const categories = useMemo(() => flattenTree(tree).filter((row) => row.node.kind === 'category'), [tree]);

    return (
        <Modal open onClose={onClose} title="Add product" size="md">
            <label htmlFor="add-product-category" className="block mb-1.5 text-sm font-semibold text-foreground">
                {t('Category')}
            </label>
            <select
                id="add-product-category"
                className="input"
                value={parent}
                onChange={(event) => setParent(event.target.value)}
            >
                <option value="">{t('Top level')}</option>
                {categories.map(({ node, depth }) => (
                    <option key={node._id} value={node._id}>
                        {'\u00A0\u00A0\u00A0'.repeat(depth)}
                        {depth > 0 ? '› ' : ''}
                        {node.name}
                    </option>
                ))}
            </select>
            <p className="mt-2 text-xs text-muted">{t('Choose the category this product belongs to.')}</p>

            <div className="flex justify-end gap-3 mt-5">
                <button type="button" className="btn-secondary" onClick={onClose}>
                    {t('Cancel')}
                </button>
                <button type="button" className="btn-primary" onClick={() => onConfirm(parent || null)}>
                    {t('Continue')}
                </button>
            </div>
        </Modal>
    );
}