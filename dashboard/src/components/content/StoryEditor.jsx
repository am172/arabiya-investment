import { Plus, Trash2 } from 'lucide-react';
import FormInput from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const MAX_PARAGRAPHS = 8;

export default function StoryEditor({ story, onChange, errors }) {
  const set = (key, value) => onChange({ ...story, [key]: value });

  const setParagraphs = (paragraphs) => set('paragraphs', paragraphs);

  const updateParagraph = (index, text) =>
    setParagraphs(
      story.paragraphs.map((paragraph, position) =>
        position === index ? { ...paragraph, text } : paragraph
      )
    );

  const removeParagraph = (index) =>
    setParagraphs(story.paragraphs.filter((_, position) => position !== index));

  const addParagraph = () => setParagraphs([...story.paragraphs, { _uid: uid(), text: '' }]);

  return (
    <div className="space-y-5">
      <section className="p-6 card">
        <h3 className="text-base font-semibold text-slate-900">{t('Heading')}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('The title is shown in two parts. The highlighted part uses the gradient.')}
        </p>
        <div className="grid gap-5 mt-5 sm:grid-cols-3">
          <FormInput
            label="Small label"
            dir="auto"
            maxLength={60}
            value={story.eyebrow}
            error={errors['story.eyebrow']}
            onChange={(event) => set('eyebrow', event.target.value)}
          />
          <FormInput
            label="Title"
            dir="auto"
            maxLength={120}
            value={story.title}
            error={errors['story.title']}
            onChange={(event) => set('title', event.target.value)}
          />
          <FormInput
            label="Highlighted words"
            dir="auto"
            maxLength={80}
            value={story.highlight}
            error={errors['story.highlight']}
            onChange={(event) => set('highlight', event.target.value)}
          />
        </div>
      </section>

      <section className="p-6 card">
        <h3 className="text-base font-semibold text-slate-900">{t('Paragraphs')}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('The first paragraph is shown larger as an introduction.')}
        </p>
        <div className="mt-5 space-y-4">
          {story.paragraphs.map((paragraph, index) => (
            <div key={paragraph._uid} className="flex items-start gap-3">
              <FormTextarea
                className="flex-1"
                dir="auto"
                label={t('Paragraph {n}', { n: index + 1 })}
                rows={4}
                maxLength={1500}
                value={paragraph.text}
                error={errors[`story.paragraphs[${index}]`]}
                hint={`${paragraph.text.length}/1500`}
                onChange={(event) => updateParagraph(index, event.target.value)}
              />
              <button
                type="button"
                className="icon-btn mt-7 hover:bg-red-50 hover:text-red-600"
                title={t('Delete paragraph')}
                onClick={() => removeParagraph(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-slate-500">
            {story.paragraphs.length} / {MAX_PARAGRAPHS}
          </p>
          <button
            type="button"
            className="btn-secondary"
            disabled={story.paragraphs.length >= MAX_PARAGRAPHS}
            onClick={addParagraph}
          >
            <Plus size={16} />
            {t('Add paragraph')}
          </button>
        </div>
      </section>
    </div>
  );
}