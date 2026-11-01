import ImageUploader from '../../common/ImageUploader';
import GalleryEditor from '../GalleryEditor';
import DocumentsEditor from '../DocumentsEditor';
import { t } from '../../../i18n';

export default function MediaTab({ form, update, errors }) {
    return (
        <div className="space-y-5">
            <section className="p-6 card">
                <ImageUploader
                    label="Banner image"
                    folder="banners"
                    value={form.banner}
                    error={errors.banner}
                    onChange={(asset) => update('banner', { url: asset.url, publicId: asset.publicId })}
                    onRemove={() => update('banner', { url: '', publicId: '' })}
                    hint="Wide image shown at the top of the page. 1600 x 600 px works best."
                />
            </section>

            <section className="p-6 card">
                <h3 className="text-base font-semibold text-slate-900">{t('Image gallery')}</h3>
                <p className="mt-1 mb-4 text-sm text-slate-500">
                    {t('The starred image is the cover. Drag images to reorder them.')}
                </p>
                <GalleryEditor items={form.gallery} onChange={(value) => update('gallery', value)} />
                {errors.gallery && <p className="error-text">{t(errors.gallery)}</p>}
            </section>

            <section className="p-6 card">
                <h3 className="text-base font-semibold text-slate-900">{t('Documents')}</h3>
                <p className="mt-1 mb-4 text-sm text-slate-500">
                    {t('Datasheets and brochures customers can download (PDF, up to 10 MB).')}
                </p>
                <DocumentsEditor items={form.documents} errors={errors} onChange={(value) => update('documents', value)} />
            </section>
        </div>
    );
}