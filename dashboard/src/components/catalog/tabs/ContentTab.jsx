import ContentListEditor from '../../content/ContentListEditor';
import SpecsEditor from '../SpecsEditor';
import uid from '../../../utils/uid';
import { t } from '../../../i18n';

const FEATURES = {
  max: 40,
  summaryKey: 'title',
  addLabel: 'Add feature',
  emptyLabel: 'No features yet',
  newLabel: 'New feature',
  create: () => ({ _uid: uid(), icon: 'sparkles', title: '', text: '' }),
  fields: [
    { key: 'icon', type: 'icon', label: 'Icon' },
    { key: 'title', type: 'text', label: 'Title', max: 120 },
    { key: 'text', type: 'textarea', label: 'Description', max: 500, full: true }
  ]
};

export default function ContentTab({ form, update, errors }) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-base font-semibold text-slate-900">{t('Key features')}</h3>
        <p className="mt-1 mb-4 text-sm text-slate-500">
          {t('Short selling points shown with an icon on the product page.')}
        </p>
        <ContentListEditor
          field="features"
          items={form.features}
          errors={errors}
          config={FEATURES}
          onChange={(value) => update('features', value)}
        />
      </section>

      <section className="p-6 card">
        <h3 className="text-base font-semibold text-slate-900">{t('Technical specifications')}</h3>
        <p className="mt-1 mb-4 text-sm text-slate-500">
          {t('Key-value table such as Purity: 99%. Group rows to create sections.')}
        </p>
        <SpecsEditor items={form.specs} errors={errors} onChange={(value) => update('specs', value)} />
      </section>
    </div>
  );
}