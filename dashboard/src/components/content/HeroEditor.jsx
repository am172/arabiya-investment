import { Check } from 'lucide-react';
import FormInput from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';
import ImageUploader from '../common/ImageUploader';
import ContentListEditor from './ContentListEditor';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const EMPTY_IMAGE = { url: '', publicId: '' };

const CHECKERBOARD = {
  backgroundImage: 'repeating-conic-gradient(#94a3b8 0% 25%, #cbd5e1 0% 50%)',
  backgroundSize: '20px 20px'
};

const VARIANTS = [
  { id: 'split', label: 'Split', text: 'Text beside an image' },
  { id: 'banner', label: 'Banner', text: 'Full-width background image' },
  { id: 'features', label: 'Feature grid', text: 'Badges and live stats' },
  { id: 'centered', label: 'Centered', text: 'Blur effects and pills' },
  { id: 'aurora', label: 'Aurora', text: 'Animated glow and glass chips' },
  { id: 'bento', label: 'Bento', text: 'Modern tile grid' }
];

const CTA_FIELDS = [
  { key: 'primaryCta', title: 'Primary button' },
  { key: 'secondaryCta', title: 'Secondary button' }
];

const BADGE_CONFIG = {
  max: 6,
  summaryKey: 'text',
  addLabel: 'Add badge',
  emptyLabel: 'No badges yet',
  newLabel: 'New badge',
  create: () => ({ _uid: uid(), icon: 'sparkles', text: '' }),
  fields: [
    { key: 'icon', type: 'icon', label: 'Icon' },
    { key: 'text', type: 'text', label: 'Text', max: 40 }
  ]
};

const bar = 'rounded-full bg-slate-300';

function Wireframe({ id }) {
  if (id === 'aurora') {
    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-1.5 overflow-hidden bg-slate-900 p-2.5">
        <div className="absolute w-12 h-12 rounded-full -left-3 -top-3 bg-brand-500/70 blur-xl" />
        <div className="absolute w-12 h-12 rounded-full -bottom-3 -right-3 bg-pink-500/60 blur-xl" />
        <div className="relative h-1.5 w-2/3 rounded-full bg-white/80" />
        <div className="relative h-1.5 w-1/2 rounded-full bg-white/40" />
        <div className="relative mt-1.5 h-3 w-1/4 rounded-full bg-white/70" />
      </div>
    );
  }
  if (id === 'bento') {
    return (
      <div className="grid h-full grid-cols-4 grid-rows-3 gap-1 p-2">
        <div className="col-span-2 row-span-2 rounded bg-brand-300" />
        <div className="col-span-2 row-span-2 rounded bg-brand-500" />
        <div className="rounded bg-slate-300" />
        <div className="rounded bg-slate-200" />
        <div className="rounded bg-slate-300" />
        <div className="rounded bg-slate-200" />
      </div>
    );
  }
  if (id === 'split') {
    return (
      <div className="flex h-full items-center gap-2 p-2.5">
        <div className="flex-1 space-y-1.5">
          <div className={`h-1.5 w-3/4 ${bar}`} />
          <div className={`h-1.5 w-full ${bar}`} />
          <div className={`h-1.5 w-1/2 ${bar}`} />
          <div className="w-1/3 h-3 mt-2 rounded-full bg-brand-400" />
        </div>
        <div className="w-2/5 h-full rounded-lg bg-brand-200" />
      </div>
    );
  }
  if (id === 'banner') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-slate-700 p-2.5">
        <div className="h-1.5 w-2/3 rounded-full bg-white/80" />
        <div className="h-1.5 w-1/2 rounded-full bg-white/50" />
        <div className="mt-1.5 h-3 w-1/4 rounded-full bg-brand-400" />
      </div>
    );
  }
  if (id === 'features') {
    return (
      <div className="flex h-full flex-col gap-1.5 p-2.5">
        <div className="flex flex-1 gap-2">
          <div className="flex-1 space-y-1.5 pt-1">
            <div className={`h-1.5 w-3/4 ${bar}`} />
            <div className={`h-1.5 w-full ${bar}`} />
            <div className="w-1/3 h-3 mt-2 rounded-full bg-brand-400" />
          </div>
          <div className="grid w-2/5 grid-cols-2 gap-1">
            <div className="rounded bg-brand-200" />
            <div className="rounded bg-brand-100" />
            <div className="rounded bg-brand-100" />
            <div className="rounded bg-brand-200" />
          </div>
        </div>
        <div className="h-3 rounded bg-slate-200" />
      </div>
    );
  }
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-1.5 overflow-hidden p-2.5">
      <div className="absolute w-12 h-12 rounded-full -left-4 -top-4 bg-brand-200 blur-xl" />
      <div className="absolute w-12 h-12 bg-pink-200 rounded-full -bottom-4 -right-4 blur-xl" />
      <div className="relative h-1.5 w-2/3 rounded-full bg-slate-400" />
      <div className={`relative h-1.5 w-1/2 ${bar}`} />
      <div className="relative mt-1.5 flex gap-1">
        <div className="h-2.5 w-6 rounded-full bg-brand-300" />
        <div className="h-2.5 w-6 rounded-full bg-brand-300" />
        <div className="h-2.5 w-6 rounded-full bg-brand-300" />
      </div>
    </div>
  );
}

function ImagePreview({ url, overlay = 0, cover = false }) {
  return (
    <div className="mt-5">
      <p className="label">{t('Preview')}</p>
      <div
        className="relative p-4 overflow-hidden border rounded-xl border-slate-200"
        style={cover ? undefined : CHECKERBOARD}
      >
        <img
          src={url}
          alt=""
          className={`mx-auto h-56 w-full ${cover ? 'absolute inset-0 h-full object-cover' : 'object-contain'}`}
        />
        {cover && (
          <>
            <div className="absolute inset-0 bg-black" style={{ opacity: overlay / 100 }} />
            <div className="relative flex items-center justify-center h-48">
              <span className="text-lg font-bold text-white">{t('Heading preview')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HeroEditor({ hero, onChange, errors }) {
  const set = (key, value) => onChange({ ...hero, [key]: value });

  const setCta = (key, field, value) =>
    onChange({ ...hero, [key]: { ...hero[key], [field]: value } });

  const usesImage = ['split', 'centered', 'aurora', 'bento'].includes(hero.variant);
  const usesBanner = hero.variant === 'banner';
  const usesBadges = ['features', 'centered', 'aurora', 'bento'].includes(hero.variant);

  return (
    <div className="space-y-5">
      <section className="p-6 card">
        <h3 className="text-base font-semibold text-slate-900">{t('Layout style')}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('Choose how the top of the home page looks. The texts below are shared by every style.')}
        </p>
        <div className="grid gap-4 mt-5 sm:grid-cols-2 xl:grid-cols-3">
          {VARIANTS.map((variant) => {
            const selected = hero.variant === variant.id;
            return (
              <button
                key={variant.id}
                type="button"
                aria-pressed={selected}
                onClick={() => set('variant', variant.id)}
                className={`relative overflow-hidden rounded-2xl border text-start transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                }`}
              >
                <div dir="ltr" className="h-24 bg-slate-50">
                  <Wireframe id={variant.id} />
                </div>
                <div className="px-4 py-3 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{t(variant.label)}</p>
                  <p className="text-xs text-slate-500">{t(variant.text)}</p>
                </div>
                {selected && (
                  <span className="absolute end-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white shadow">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="p-6 card">
        <h3 className="text-base font-semibold text-slate-900">{t('Texts')}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('Type in Arabic; the fields switch direction automatically.')}
        </p>
        <div className="mt-5 space-y-5">
          <FormInput
            label="Small label (above the title)"
            dir="auto"
            maxLength={80}
            value={hero.eyebrow}
            error={errors['hero.eyebrow']}
            onChange={(event) => set('eyebrow', event.target.value)}
            hint="Optional. Leave empty to hide it."
          />
          <FormTextarea
            label="Title"
            dir="auto"
            rows={2}
            maxLength={160}
            value={hero.title}
            error={errors['hero.title']}
            hint={`${hero.title.length}/160 · ${t(
              'Press Enter to start a new line. In the centered style the last line is highlighted.'
            )}`}
            onChange={(event) => set('title', event.target.value)}
          />
          <FormTextarea
            label="Description"
            dir="auto"
            rows={4}
            maxLength={500}
            value={hero.description}
            error={errors['hero.description']}
            hint={`${hero.description.length}/500`}
            onChange={(event) => set('description', event.target.value)}
          />
        </div>
      </section>

      <section className="p-6 card">
        <h3 className="text-base font-semibold text-slate-900">{t('Buttons')}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {t(
            'Use /#contact for a section of the home page, /learn-more for another page, or a full https:// link. Leave a button empty to hide it.'
          )}
        </p>
        <div className="grid gap-5 mt-5 lg:grid-cols-2">
          {CTA_FIELDS.map(({ key, title }) => (
            <div key={key} className="p-4 space-y-4 border rounded-xl border-slate-200">
              <p className="text-sm font-semibold text-slate-800">{t(title)}</p>
              <FormInput
                label="Label"
                dir="auto"
                maxLength={40}
                value={hero[key].label}
                error={errors[`hero.${key}.label`]}
                onChange={(event) => setCta(key, 'label', event.target.value)}
              />
              <FormInput
                label="Link"
                dir="ltr"
                maxLength={300}
                placeholder="/#contact"
                value={hero[key].href}
                error={errors[`hero.${key}.href`]}
                onChange={(event) => setCta(key, 'href', event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {usesBanner && (
        <section className="p-6 card">
          <h3 className="text-base font-semibold text-slate-900">{t('Banner background')}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('A wide photo that fills the section. Without one, a gradient from your theme colors is used.')}
          </p>
          <div className="mt-5">
            <ImageUploader
              label="Background image"
              folder="branding"
              value={hero.bannerImage}
              error={errors['hero.bannerImage'] || errors['hero.bannerImage.url']}
              onChange={(asset) => set('bannerImage', { url: asset.url, publicId: asset.publicId })}
              onRemove={() => set('bannerImage', EMPTY_IMAGE)}
              hint="JPG, PNG or WebP, up to 5 MB. 1920 x 1000 px or wider works best."
            />
          </div>
          <div className="mt-5">
            <label htmlFor="banner-overlay" className="label">
              {t('Dark overlay: {n}%', { n: hero.bannerOverlay })}
            </label>
            <input
              id="banner-overlay"
              type="range"
              min="0"
              max="90"
              step="5"
              value={hero.bannerOverlay}
              onChange={(event) => set('bannerOverlay', Number(event.target.value))}
              className="w-full accent-brand-600"
            />
            <p className="hint">{t('Increase it if the heading is hard to read over a bright photo.')}</p>
          </div>
          {hero.bannerImage.url && (
            <ImagePreview url={hero.bannerImage.url} overlay={hero.bannerOverlay} cover />
          )}
        </section>
      )}

      {usesImage && (
        <section className="p-6 card">
          <h3 className="text-base font-semibold text-slate-900">
            {hero.variant === 'split' ? t('Hero image') : t('Showcase image (optional)')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t(
              'Upload one finished, transparent PNG that already contains every graphic element. It is shown as is, with nothing added behind it.'
            )}{' '}
            {hero.variant === 'split' ? t('Without an image, the text is centered.') : t('It appears below the buttons.')}
          </p>
          <div className="mt-5">
            <ImageUploader
              label="Image"
              folder="branding"
              value={hero.image}
              error={errors['hero.image'] || errors['hero.image.url']}
              onChange={(asset) => set('image', { url: asset.url, publicId: asset.publicId })}
              onRemove={() => set('image', EMPTY_IMAGE)}
              hint="Transparent PNG, up to 5 MB. About 1400 px wide works best."
            />
          </div>
          {hero.image.url && <ImagePreview url={hero.image.url} />}
        </section>
      )}

      {['features', 'aurora', 'bento'].includes(hero.variant) && (
        <section className="p-5 card border-brand-100 bg-brand-50/40">
          <p className="text-sm text-slate-600">
            {t(
              'The numbers in this style come from the Stats page, so edit them there. The badges below appear as feature cards beside the heading.'
            )}
          </p>
        </section>
      )}

      {usesBadges && (
        <section>
          <h3 className="mb-1 text-base font-semibold text-slate-900">
            {hero.variant === 'features' ? t('Feature badges') : t('Pill badges')}
          </h3>
          <p className="mb-4 text-sm text-slate-500">{t('Up to 6 short highlights with an icon.')}</p>
          <ContentListEditor
            field="hero.badges"
            items={hero.badges}
            errors={errors}
            config={BADGE_CONFIG}
            onChange={(badges) => set('badges', badges)}
          />
        </section>
      )}
    </div>
  );
}