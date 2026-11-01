import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SiteSettingsForm from '../../components/forms/SiteSettingsForm';
import SearchConsolePanel from '../../components/settings/SearchConsolePanel';
import NotificationsPanel from '../../components/settings/NotificationsPanel';
import CloudinaryPanel from '../../components/settings/CloudinaryPanel';
import settingsService from '../../services/settings.service';
import useFetch from '../../hooks/useFetch';
import useFormSubmit from '../../hooks/useFormSubmit';
import { t } from '../../i18n';

function Section({ index, title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="mb-4 overflow-hidden border rounded-2xl border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex items-center w-full gap-3 px-5 py-4 transition-colors text-start hover:bg-foreground/5"
      >
        <span className="flex items-center justify-center text-sm font-bold h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary">
          {index}
        </span>
        <span className="flex-1 min-w-0 text-base font-bold text-foreground">{title}</span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div id={contentId} hidden={!open} className="p-5 border-t border-border">
        {children}
      </div>
    </section>
  );
}

export default function SiteSettingsPage() {
  const { data, loading, error, refetch } = useFetch(() => settingsService.get(), []);
  const { submit, submitting, serverErrors } = useFormSubmit(settingsService.update, {
    successMessage: 'Settings saved successfully',
    onSuccess: refetch
  });

  if (loading && !data) return <Loader />;
  if (error || !data) return <EmptyState title="Could not load settings" description={error} />;

  return (
    <div>
      <PageHeader title="Site settings" description="Branding, contact details, social links and SEO." />

      <Section index={1} title={t('General settings')}>
        <SiteSettingsForm
          key={data.updatedAt}
          initialData={data}
          onSubmit={submit}
          submitting={submitting}
          serverErrors={serverErrors}
        />
      </Section>

      <Section index={2} title={t('Search Console')} defaultOpen={false}>
        <SearchConsolePanel settings={data} />
      </Section>

      <Section index={3} title={t('Notifications')} defaultOpen={false}>
        <NotificationsPanel />
      </Section>

      <Section index={4} title={t('Cloudinary')} defaultOpen={false}>
        <CloudinaryPanel />
      </Section>
    </div>
  );
}