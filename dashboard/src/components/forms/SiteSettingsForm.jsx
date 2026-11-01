import { useEffect, useState } from 'react';
import FormInput, { FormActions, FormSection } from './FormInput';
import FormTextarea from './FormTextarea';
import ImageUploader from '../common/ImageUploader';
import { isEmail, mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';
const TOKEN = /^[A-Za-z0-9_-]{20,120}$/;

const extractToken = (value) => {
  const text = String(value || '').trim();
  const tag = text.match(/content\s*=\s*["']([^"']+)["']/i);
  return (tag ? tag[1] : text.replace(/^google-site-verification\s*[=:]\s*/i, '')).trim();
};

const EMPTY_ASSET = { url: '', publicId: '' };
const SOCIALS = ['facebook', 'instagram', 'youtube', 'tiktok', 'twitter'];
const SOCIAL_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'Twitter'
};

const COUNTRIES = [
  { code: '+20', label: '🇪🇬 +20' },
  { code: '+966', label: '🇸🇦 +966' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+965', label: '🇰🇼 +965' },
  { code: '+974', label: '🇶🇦 +974' },
  { code: '+973', label: '🇧🇭 +973' },
  { code: '+968', label: '🇴🇲 +968' },
  { code: '+962', label: '🇯🇴 +962' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' }
];

const BY_LENGTH = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);

const findCountry = (value) => BY_LENGTH.find((item) => String(value || '').startsWith(item.code));

const cleanNumber = (value) => String(value || '').replace(/\D/g, '').replace(/^0+/, '');

function CountryPhoneInput({ label, value, onChange, error, hint, placeholder }) {
  const [chosen, setChosen] = useState('+20');

  const matched = findCountry(value);
  const activeCode = matched ? matched.code : chosen;
  const number = matched
    ? String(value).slice(matched.code.length)
    : String(value || '').replace(/\D/g, '');

  const emit = (code, digits) => onChange({ target: { value: digits ? `${code}${digits}` : '' } });

  const handleCode = (event) => {
    setChosen(event.target.value);
    emit(event.target.value, cleanNumber(number));
  };

  const handleNumber = (event) => emit(activeCode, cleanNumber(event.target.value));

  return (
    <div>
      {label && <label className="label">{t(label)}</label>}
      <div dir="ltr" className="flex">
        <select
          aria-label={t(label)}
          value={activeCode}
          onChange={handleCode}
          className="w-32 cursor-pointer input shrink-0 rounded-e-none border-e-0"
        >
          {COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumber}
          placeholder={placeholder}
          className={`input min-w-0 flex-1 rounded-s-none ${error ? 'input-error' : ''}`}
        />
      </div>
      {hint && !error && <p className="hint">{t(hint)}</p>}
      {error && <p className="error-text">{t(error)}</p>}
    </div>
  );
}

const asset = (value) => (value ? { url: value.url || '', publicId: value.publicId || '' } : EMPTY_ASSET);

const toForm = (data = {}) => ({
  siteName: data.siteName || '',
  tagline: data.tagline || '',
  logo: asset(data.logo),
  favicon: asset(data.favicon),
  contact: {
    email: (data.contact && data.contact.email) || '',
    phone: (data.contact && data.contact.phone) || '',
    whatsapp: (data.contact && data.contact.whatsapp) || '',
    address: (data.contact && data.contact.address) || ''
  },
  socialLinks: SOCIALS.reduce(
    (acc, key) => ({ ...acc, [key]: (data.socialLinks && data.socialLinks[key]) || '' }),
    {}
  ),
  seo: {
    title: (data.seo && data.seo.title) || '',
    description: (data.seo && data.seo.description) || '',
    keywords: ((data.seo && data.seo.keywords) || []).join(', '),
    googleVerification: (data.seo && data.seo.googleVerification) || ''
  }
});

export default function SiteSettingsForm({ initialData, onSubmit, submitting, serverErrors }) {
  const [form, setForm] = useState(() => toForm(initialData));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors(mapServerErrors(serverErrors));
  }, [serverErrors]);

  const bind = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
    error: errors[name]
  });

  const bindIn = (group, name) => ({
    value: form[group][name],
    onChange: (event) =>
      setForm({ ...form, [group]: { ...form[group], [name]: event.target.value } }),
    error: errors[`${group}.${name}`]
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    const token = extractToken(form.seo.googleVerification);
    if (token && !TOKEN.test(token)) {
      found['seo.googleVerification'] = 'Paste only the Google verification code';
    }
    if (!form.siteName.trim()) found.siteName = 'Site name is required';
    if (form.contact.email.trim() && !isEmail(form.contact.email)) {
      found['contact.email'] = 'Enter a valid email';
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      siteName: form.siteName.trim(),
      tagline: form.tagline.trim(),
      logo: form.logo,
      favicon: form.favicon,
      contact: {
        email: form.contact.email.trim(),
        phone: form.contact.phone.trim(),
        whatsapp: form.contact.whatsapp.trim(),
        address: form.contact.address.trim()
      },
      socialLinks: SOCIALS.reduce(
        (acc, key) => ({ ...acc, [key]: form.socialLinks[key].trim() }),
        {}
      ),
      seo: {
        title: form.seo.title.trim(),
        description: form.seo.description.trim(),
        keywords: form.seo.keywords
          .split(/[,،]/)
          .map((item) => item.trim())
          .filter(Boolean),
        googleVerification: token
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Branding">
        <FormInput label="Site name" dir="auto" {...bind('siteName')} />
        <FormInput label="Tagline" dir="auto" {...bind('tagline')} />
        <ImageUploader
          label="Logo"
          folder="branding"
          value={form.logo}
          onChange={(value) => setForm({ ...form, logo: { url: value.url, publicId: value.publicId } })}
          onRemove={() => setForm({ ...form, logo: EMPTY_ASSET })}
        />
        <ImageUploader
          label="Favicon"
          folder="branding"
          value={form.favicon}
          onChange={(value) => setForm({ ...form, favicon: { url: value.url, publicId: value.publicId } })}
          onRemove={() => setForm({ ...form, favicon: EMPTY_ASSET })}
        />
      </FormSection>

      <FormSection title="Contact information">
        <FormInput label="Email" type="email" {...bindIn('contact', 'email')} />
        <CountryPhoneInput label="Phone" placeholder="10xxxxxxxx" {...bindIn('contact', 'phone')} />
        <CountryPhoneInput
          label="WhatsApp"
          placeholder="10xxxxxxxx"
          hint="Type the number only. The country code is added automatically."
          {...bindIn('contact', 'whatsapp')}
        />
        <FormInput label="Address" dir="auto" {...bindIn('contact', 'address')} />
      </FormSection>

      <FormSection title="Social links">
        {SOCIALS.map((key) => (
          <FormInput
            key={key}
            label={SOCIAL_LABELS[key]}
            type="url"
            placeholder="https://"
            {...bindIn('socialLinks', key)}
          />
        ))}
      </FormSection>

      <FormSection title="SEO">
        <FormInput
          label="Meta title"
          dir="auto"
          className="sm:col-span-2"
          hint={`${form.seo.title.length} / 60 · ${t('Shown as the blue title in Google results')}`}
          {...bindIn('seo', 'title')}
        />
        <FormTextarea
          label="Meta description"
          dir="auto"
          className="sm:col-span-2"
          rows={3}
          hint={`${form.seo.description.length} / 160 · ${t('Shown under the title in Google results')}`}
          {...bindIn('seo', 'description')}
        />
        <FormInput
          label="Keywords"
          dir="auto"
          className="sm:col-span-2"
          hint="Separate with commas"
          {...bindIn('seo', 'keywords')}
        />
        <FormInput
          label="Google verification code"
          dir="ltr"
          className="sm:col-span-2"
          placeholder="abc123...XYZ"
          hint="From Google Search Console, HTML tag method. Paste the whole tag or only the code."
          {...bindIn('seo', 'googleVerification')}
        />
      </FormSection>

      <FormActions submitting={submitting} submitLabel="Save settings" />
    </form>
  );
}