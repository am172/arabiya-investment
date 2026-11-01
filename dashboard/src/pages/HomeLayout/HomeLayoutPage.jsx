import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Boxes,
  BookText,
  Check,
  ChevronDown,
  Factory,
  GripVertical,
  HelpCircle,
  Info,
  LayoutGrid,
  ListOrdered,
  Loader2,
  Lock,
  Mail,
  MessageSquareQuote,
  RotateCcw,
  Save,
  Sparkles,
  Star,
  Video
} from 'lucide-react';
import contentService from '../../services/content.service';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import LayoutWireframe from '../../components/layout-picker/LayoutWireframe';
import { SECTION_VARIANTS } from '../../constants/sectionVariants';
import { ROUTES } from '../../constants/routes';
import { t } from '../../i18n';

const ORDER = [
  'stats',
  'categories',
  'featuredProducts',
  'features',
  'industries',
  'steps',
  'story',
  'showcase',
  'testimonials',
  'faq',
  'contact'
];

const META = {
  stats: { label: 'Stats', text: 'Counters from the Company stats page', icon: BarChart3 },
  categories: { label: 'Product categories', text: 'Top-level categories from Products & categories', icon: Boxes },
  featuredProducts: { label: 'Featured products', text: 'Products marked as featured', icon: Star },
  features: { label: 'Features', text: 'Cards from Page content', icon: Sparkles },
  industries: { label: 'Subjects', text: 'Sectors you serve, from Page content', icon: Factory },
  steps: { label: 'How it works', text: 'Steps from Page content', icon: ListOrdered },
  story: { label: 'Our story', text: 'Story from Page content', icon: BookText },
  showcase: { label: 'Student stories', text: 'Videos from the Company videos page', icon: Video },
  testimonials: { label: 'Testimonials', text: 'Reviews from the Client reviews page', icon: MessageSquareQuote },
  faq: { label: 'FAQ', text: 'First four questions from Page content', icon: HelpCircle },
  contact: { label: 'Contact', text: 'Request form and contact details', icon: Mail }
};

const firstVariant = (key) => (SECTION_VARIANTS[key] ? SECTION_VARIANTS[key][0].id : '');

const normalize = (list) => {
  const seen = new Set();
  const result = [];

  (Array.isArray(list) ? list : []).forEach((item) => {
    if (item && ORDER.includes(item.key) && !seen.has(item.key)) {
      seen.add(item.key);
      const valid = (SECTION_VARIANTS[item.key] || []).some((entry) => entry.id === item.variant);
      result.push({
        key: item.key,
        enabled: item.enabled !== false,
        variant: valid ? item.variant : firstVariant(item.key)
      });
    }
  });

  ORDER.forEach((key, index) => {
    if (seen.has(key)) return;
    let at = 0;
    for (let before = index - 1; before >= 0; before -= 1) {
      const position = result.findIndex((item) => item.key === ORDER[before]);
      if (position !== -1) {
        at = position + 1;
        break;
      }
    }
    result.splice(at, 0, { key, enabled: true, variant: firstVariant(key) });
  });

  return result;
};

const signature = (list) => list.map((item) => `${item.key}:${item.enabled ? 1 : 0}:${item.variant}`).join('|');

function FixedRow({ label, text, position, action }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
      <div className="flex items-start flex-1 min-w-0 gap-3 sm:items-center">
        <Lock size={18} className="mt-0.5 sm:mt-0 shrink-0 text-slate-400" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-700">{t(label)}</p>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 sm:hidden">
              {t(position)}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:truncate">{t(text)}</p>
        </div>
      </div>
      <div className={`flex items-center justify-end gap-2 shrink-0 ${action ? 'pt-2.5 border-t border-slate-200/80 sm:border-0 sm:pt-0' : 'hidden sm:flex'}`}>
        {action}
        <span className="hidden rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:inline-block">
          {t(position)}
        </span>
      </div>
    </div>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      dir="ltr"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.375rem]' : 'left-0.5'}`} />
    </button>
  );
}

function VariantPicker({ section, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={t('Layout style')} className="grid gap-3 pt-4 border-t border-slate-100 sm:grid-cols-3">
      {SECTION_VARIANTS[section].map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.id)}
            className={`relative overflow-hidden rounded-xl border text-start transition hover:-translate-y-0.5 hover:shadow-md ${selected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
              }`}
          >
            <div dir="ltr" className="h-24 p-2 bg-slate-50">
              <LayoutWireframe section={section} variant={item.id} />
            </div>
            <div className="border-t border-slate-100 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900">{t(item.label)}</p>
              <p className="text-xs text-slate-500">{t(item.text)}</p>
            </div>
            {selected && (
              <span className="absolute flex items-center justify-center w-6 h-6 text-white rounded-full shadow end-2 top-2 bg-brand-600">
                <Check size={14} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function HomeLayoutPage() {
  const toast = useToast();
  const { data, loading, error } = useFetch(() => contentService.get(), []);
  const [items, setItems] = useState(null);
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);
  const [drag, setDrag] = useState({ from: null, over: null });
  const [openKey, setOpenKey] = useState('');

  const apply = (doc) => {
    const fresh = normalize(doc.sections);
    setItems(fresh);
    setSaved(signature(fresh));
  };

  useEffect(() => {
    if (data) apply(data);
  }, [data]);

  const dirty = Boolean(items) && signature(items) !== saved;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const move = (from, to) => {
    if (from === null || to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  };

  const patch = (key, change) =>
    setItems(items.map((item) => (item.key === key ? { ...item, ...change } : item)));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await contentService.update({
        sections: items.map(({ key, enabled, variant }) => ({ key, enabled, variant }))
      });
      apply(res.data);
      toast.success('Layout saved. The website will update shortly.');
    } catch (err) {
      const first = err.errors && err.errors[0];
      toast.error(first ? `${err.message}: ${first.field} - ${first.message}` : err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !items) return <Loader />;
  if (!items) return <EmptyState title="Could not load the layout" description={error} />;

  const contactOff = items.some((item) => item.key === 'contact' && !item.enabled);
  const shown = items.filter((item) => item.enabled).length;

  return (
    <div className="min-w-0">
      <PageHeader
        title="Sections & layouts"
        description="Choose which sections appear on the home page, their order and their layout style."
        action={
          <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto sm:gap-3">
            {dirty && (
              <span className="w-full text-xs font-medium text-amber-600 sm:w-auto sm:text-sm">
                {t('Unsaved changes')}
              </span>
            )}
            <button
              type="button"
              className="justify-center flex-1 btn-secondary sm:flex-initial"
              onClick={() => setItems(normalize([]))}
            >
              <RotateCcw size={16} />
              {t('Default order')}
            </button>
            <button
              type="button"
              className="justify-center flex-1 btn-primary sm:flex-initial"
              disabled={saving || !dirty}
              onClick={handleSave}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {t('Save layout')}
            </button>
          </div>
        }
      />

      <section className="flex gap-3 p-4 mb-5 sm:p-5 card border-brand-100 bg-brand-50/40">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-600" />
        <p className="text-sm text-slate-600">
          {t('Drag a row or use the arrows to reorder. The switch hides a section without deleting its content. Use Layout to change how a section looks. Links to a hidden Teachers, Student stories, Packages or Contact section open that section\'s own page instead.')}
        </p>
      </section>

      {contactOff && (
        <div role="alert" className="flex items-start gap-3 px-4 py-3 mb-5 text-sm font-medium border rounded-xl border-amber-200 bg-amber-50 text-amber-800">
          <Info size={18} className="mt-0.5 shrink-0" />
          {t('The contact form is hidden on the home page. Visitors will reach it through the Contact page instead.')}
        </div>
      )}

      <div className="space-y-3">
        <FixedRow
          label="Hero"
          text="Top of the page. Six layouts are available in Page content."
          position="Always first"
          action={
            <Link to={ROUTES.CONTENT} className="btn-secondary px-3 py-1.5 text-xs shrink-0">
              <LayoutGrid size={14} />
              {t('Hero layout')}
            </Link>
          }
        />

        <ul className="space-y-3">
          {items.map((item, index) => {
            const meta = META[item.key];
            const Icon = meta.icon;
            const variants = SECTION_VARIANTS[item.key];
            const current = variants ? variants.find((entry) => entry.id === item.variant) : null;
            const open = openKey === item.key;
            const dragging = drag.from === index;
            const target = drag.from !== null && drag.over === index && drag.from !== index;
            return (
              <li
                key={item.key}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', String(index));
                  setDrag({ from: index, over: index });
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (drag.over !== index) setDrag((state) => ({ ...state, over: index }));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  move(drag.from, index);
                  setDrag({ from: null, over: null });
                }}
                onDragEnd={() => setDrag({ from: null, over: null })}
                className={`card px-3.5 py-3.5 sm:px-4 transition ${dragging ? 'opacity-40' : ''} ${target ? 'ring-2 ring-brand-500' : ''} ${item.enabled ? '' : 'bg-slate-50'
                  }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center flex-1 min-w-0 gap-2.5 sm:gap-3.5">
                    <GripVertical size={18} className="shrink-0 cursor-grab text-slate-400" />
                    <span className="flex items-center justify-center text-xs font-bold rounded-full h-7 w-7 shrink-0 bg-slate-100 text-slate-600">
                      {index + 1}
                    </span>
                    <span className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${item.enabled ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate text-sm font-semibold ${item.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                        {t(meta.label)}
                      </p>
                      <p className="text-xs truncate text-slate-500">
                        {current ? `${t('Layout')}: ${t(current.label)}` : t(meta.text)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 sm:border-0 sm:pt-0 sm:justify-end shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className="icon-btn disabled:opacity-30"
                          title={t('Move up')}
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn disabled:opacity-30"
                          title={t('Move down')}
                          disabled={index === items.length - 1}
                          onClick={() => move(index, index + 1)}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      {variants && (
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenKey(open ? '' : item.key)}
                          className="btn-secondary px-2.5 py-1.5 text-xs"
                        >
                          <LayoutGrid size={14} />
                          <span>{t('Layout')}</span>
                          <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    <Switch
                      checked={item.enabled}
                      label={t('Show {label}', { label: t(meta.label) })}
                      onChange={() => patch(item.key, { enabled: !item.enabled })}
                    />
                  </div>
                </div>

                {variants && open && (
                  <div className="mt-4">
                    <VariantPicker section={item.key} value={item.variant} onChange={(variant) => patch(item.key, { variant })} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <FixedRow label="Footer" text="Bottom of every page. Edit it in Site settings and Site texts." position="Always last" />
      </div>

      <p className="mt-4 text-sm text-slate-500">{t('{shown} of {total} sections are shown.', { shown, total: items.length })}</p>
    </div>
  );
}