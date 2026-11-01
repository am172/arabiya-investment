import { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import contentService from '../../services/content.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ContentListEditor from '../../components/content/ContentListEditor';
import StoryEditor from '../../components/content/StoryEditor';
import HeroEditor from '../../components/content/HeroEditor';
import { isValidLink, mapServerErrors } from '../../utils/validators';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const SECTIONS = {
  features: {
    max: 12,
    summaryKey: 'title',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet',
    newLabel: 'New feature',
    description:
      'Why choose us. Shown as a scrolling marquee on the home page and as a grid on the Learn more page.',
    create: () => ({ _uid: uid(), icon: 'sparkles', title: '', text: '' }),
    fields: [
      { key: 'icon', type: 'icon', label: 'Icon' },
      { key: 'title', type: 'text', label: 'Title', max: 80 },
      { key: 'text', type: 'textarea', label: 'Description', max: 300, full: true }
    ]
  },
  steps: {
    max: 8,
    summaryKey: 'title',
    addLabel: 'Add step',
    emptyLabel: 'No steps yet',
    newLabel: 'New step',
    description: 'How it works. Shown as a vertical timeline on the home page, in the order below.',
    create: () => ({ _uid: uid(), icon: 'sparkles', title: '', text: '' }),
    fields: [
      { key: 'icon', type: 'icon', label: 'Icon' },
      { key: 'title', type: 'text', label: 'Title', max: 80 },
      { key: 'text', type: 'textarea', label: 'Description', max: 300, full: true }
    ]
  },
  subjects: {
    max: 24,
    summaryKey: 'name',
    addLabel: 'Add subject',
    emptyLabel: 'No subjects yet',
    newLabel: 'New subject',
    description:
      'Shown as a grid on the home page, followed by a button that lets visitors request a new subject.',
    create: () => ({ _uid: uid(), icon: 'sparkles', name: '' }),
    fields: [
      { key: 'icon', type: 'icon', label: 'Icon' },
      { key: 'name', type: 'text', label: 'Subject name', max: 60 }
    ]
  },
  faqs: {
    max: 40,
    summaryKey: 'question',
    addLabel: 'Add question',
    emptyLabel: 'No questions yet',
    newLabel: 'New question',
    description: 'The first four appear on the home page. All of them appear on the Learn more page.',
    create: () => ({ _uid: uid(), question: '', answer: '' }),
    fields: [
      { key: 'question', type: 'text', label: 'Question', max: 200, full: true },
      { key: 'answer', type: 'textarea', label: 'Answer', max: 1000, rows: 4, full: true }
    ]
  }
};

const REQUIRED = {
  features: ['title', 'text'],
  steps: ['title', 'text'],
  subjects: ['name'],
  faqs: ['question', 'answer']
};

const TABS = [
  { id: 'hero', label: 'Hero' },
  { id: 'features', label: 'Features' },
  { id: 'steps', label: 'How it works' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'faqs', label: 'FAQ' },
  { id: 'story', label: 'Our story' }
];

const VARIANT_IDS = ['split', 'banner', 'features', 'centered', 'aurora', 'bento'];
const EMPTY_IMAGE = { url: '', publicId: '' };

const asset = (value) =>
  value ? { url: value.url || '', publicId: value.publicId || '' } : EMPTY_IMAGE;

const cta = (value) => ({
  label: (value && value.label) || '',
  href: (value && value.href) || ''
});

const withUids = (list) => (list || []).map((item) => ({ ...item, _uid: uid() }));

const stripUid = (list) => list.map(({ _uid, ...rest }) => rest);

const toDraft = (data) => {
  const story = data.story || {};
  const hero = data.hero || {};
  const overlay = Number(hero.bannerOverlay);
  return {
    hero: {
      variant: VARIANT_IDS.includes(hero.variant) ? hero.variant : 'split',
      eyebrow: hero.eyebrow || '',
      title: hero.title || '',
      description: hero.description || '',
      image: asset(hero.image),
      bannerImage: asset(hero.bannerImage),
      bannerOverlay: Number.isFinite(overlay) ? overlay : 55,
      badges: withUids(hero.badges),
      primaryCta: cta(hero.primaryCta),
      secondaryCta: cta(hero.secondaryCta)
    },
    features: withUids(data.features),
    steps: withUids(data.steps),
    subjects: withUids(data.subjects),
    faqs: withUids(data.faqs),
    story: {
      eyebrow: story.eyebrow || '',
      title: story.title || '',
      highlight: story.highlight || '',
      paragraphs: (story.paragraphs || []).map((text) => ({ _uid: uid(), text }))
    }
  };
};

const toPayload = (draft) => ({
  hero: {
    variant: draft.hero.variant,
    eyebrow: draft.hero.eyebrow.trim(),
    title: draft.hero.title.trim(),
    description: draft.hero.description.trim(),
    image: { url: draft.hero.image.url, publicId: draft.hero.image.publicId },
    bannerImage: { url: draft.hero.bannerImage.url, publicId: draft.hero.bannerImage.publicId },
    bannerOverlay: Number(draft.hero.bannerOverlay),
    badges: stripUid(draft.hero.badges),
    primaryCta: {
      label: draft.hero.primaryCta.label.trim(),
      href: draft.hero.primaryCta.href.trim()
    },
    secondaryCta: {
      label: draft.hero.secondaryCta.label.trim(),
      href: draft.hero.secondaryCta.href.trim()
    }
  },
  features: stripUid(draft.features),
  steps: stripUid(draft.steps),
  subjects: stripUid(draft.subjects),
  faqs: stripUid(draft.faqs),
  story: {
    eyebrow: draft.story.eyebrow,
    title: draft.story.title,
    highlight: draft.story.highlight,
    paragraphs: draft.story.paragraphs.map((paragraph) => paragraph.text).filter((text) => text.trim())
  }
});

const validate = (draft) => {
  const errors = {};

  if (!draft.hero.title.trim()) errors['hero.title'] = 'The title is required';
  if (!draft.hero.description.trim()) errors['hero.description'] = 'The description is required';

  draft.hero.badges.forEach((badge, index) => {
    if (!String(badge.text || '').trim()) errors[`hero.badges[${index}].text`] = 'This field is required';
  });

  ['primaryCta', 'secondaryCta'].forEach((key) => {
    const label = draft.hero[key].label.trim();
    const href = draft.hero[key].href.trim();
    if (label && !href) errors[`hero.${key}.href`] = 'Add a link, or clear the label to hide the button';
    if (href && !label) errors[`hero.${key}.label`] = 'Add a label, or clear the link to hide the button';
    if (href && !isValidLink(href)) errors[`hero.${key}.href`] = 'Use /path, #section or a full https:// link';
  });

  Object.entries(REQUIRED).forEach(([field, keys]) => {
    draft[field].forEach((item, index) => {
      keys.forEach((key) => {
        if (!String(item[key] || '').trim()) errors[`${field}[${index}].${key}`] = 'This field is required';
      });
    });
  });

  return errors;
};

const hasErrors = (errors, tab) => Object.keys(errors).some((key) => key.startsWith(tab));

const countOf = (draft, id) => {
  if (id === 'hero') return null;
  return id === 'story' ? draft.story.paragraphs.length : draft[id].length;
};

export default function ContentPage() {
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();
  const { data, loading, error } = useFetch(() => contentService.get(), []);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState('');
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('hero');
  const [saving, setSaving] = useState(false);

  const applyServer = (next) => {
    const fresh = toDraft(next);
    setDraft(fresh);
    setSaved(JSON.stringify(toPayload(fresh)));
    setErrors({});
  };

  useEffect(() => {
    if (data) applyServer(data);
  }, [data]);

  const dirty = useMemo(
    () => Boolean(draft) && JSON.stringify(toPayload(draft)) !== saved,
    [draft, saved]
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const handleSave = async () => {
    const found = validate(draft);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      const first = TABS.find((item) => hasErrors(found, item.id));
      if (first) setTab(first.id);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSaving(true);
    try {
      const res = await contentService.update(toPayload(draft));
      applyServer(res.data);
      toast.success('Content saved. The website will update shortly.');
    } catch (err) {
      const mapped = mapServerErrors(err.errors);
      setErrors(mapped);
      const first = TABS.find((item) => hasErrors(mapped, item.id));
      if (first) setTab(first.id);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset all content',
      message:
        'Every section on this page returns to the default content. Your edits will be lost. Uploaded hero images are kept.',
      confirmLabel: 'Reset'
    });
    if (!ok) return;
    try {
      const res = await contentService.reset();
      applyServer(res.data);
      toast.success('Content reset to defaults');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading && !draft) return <Loader />;
  if (!draft) return <EmptyState title="Could not load content" description={error} />;

  return (
    <div>
      <PageHeader
        title="Page content"
        description="Manage the hero, features, steps, subjects, FAQ and story shown on the website."
        action={
          <div className="flex items-center gap-3">
            {dirty && (
              <span className="hidden text-sm font-medium text-amber-600 sm:inline">{t('Unsaved changes')}</span>
            )}
            <button type="button" className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              {t('Reset')}
            </button>
            <button type="button" className="btn-primary" disabled={saving || !dirty} onClick={handleSave}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {t('Save changes')}
            </button>
          </div>
        }
      />

      <div
        role="tablist"
        aria-label={t('Content sections')}
        className="flex gap-2 px-1 pb-2 mb-5 -mx-1 overflow-x-auto"
      >
        {TABS.map((item) => {
          const selected = item.id === tab;
          const count = countOf(draft, item.id);
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={`relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${selected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
            >
              {t(item.label)}
              {count !== null && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {count}
                </span>
              )}
              {hasErrors(errors, item.id) && (
                <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>

      {tab === 'hero' && (
        <HeroEditor hero={draft.hero} errors={errors} onChange={(hero) => setDraft({ ...draft, hero })} />
      )}

      {tab === 'story' && (
        <StoryEditor story={draft.story} errors={errors} onChange={(story) => setDraft({ ...draft, story })} />
      )}

      {tab !== 'hero' && tab !== 'story' && (
        <div>
          <p className="mb-4 text-sm text-slate-500">{t(SECTIONS[tab].description)}</p>
          <ContentListEditor
            key={tab}
            field={tab}
            items={draft[tab]}
            errors={errors}
            config={SECTIONS[tab]}
            onChange={(items) => setDraft({ ...draft, [tab]: items })}
          />
        </div>
      )}
      <ConfirmDialog {...confirmProps} />
    </div>
  );
}