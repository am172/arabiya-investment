import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { t } from '../../i18n';

const LABELS = {
  overview: 'Overview',
  analytics: 'Analytics',
  teachers: 'Teachers',
  videos: 'Student videos',
  packages: 'Packages',
  partners: 'Success partners',
  testimonials: 'Testimonials',
  stats: 'Stats',
  messages: 'Messages',
  settings: 'Site settings',
  admins: 'Admins',
  profile: 'Profile',
  content: 'Page content',
  legal: 'Legal pages',
  texts: 'Site texts',
  new: 'Create',
  edit: 'Edit',
  whatsapp: 'WhatsApp bot',
  currencies: 'Currencies',
  certificates: 'Certificates',
  theme: 'Colors & fonts',
  catalog: 'Products & categories',
  'option-templates': 'Option templates',
  requests: 'Product requests',
  branches: 'Our branches',
};

const OBJECT_ID = /^[a-f\d]{24}$/i;

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const scrollRef = useRef(null);

  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts
    .map((segment, index) => ({ segment, to: `/${parts.slice(0, index + 1).join('/')}` }))
    .filter(({ segment }) => !OBJECT_ID.test(segment));

  useEffect(() => {
    if (scrollRef.current) {
      const lastChild = scrollRef.current.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'auto', inline: 'end', block: 'nearest' });
      }
    }
  }, [pathname]);

  return (
    <nav
      ref={scrollRef}
      className="flex items-center gap-1.5 text-sm text-slate-500 overflow-x-auto scrollbar-none py-1 min-w-0"
    >
      <Link to={ROUTES.OVERVIEW} className="font-medium shrink-0 hover:text-slate-800">
        {t('Dashboard')}
      </Link>
      {crumbs.map(({ segment, to }, index) => {
        const last = index === crumbs.length - 1;
        const label = LABELS[segment] ? t(LABELS[segment]) : segment;
        return (
          <span key={to} className="flex items-center gap-1.5 shrink-0 min-w-0">
            <ChevronLeft size={14} className="shrink-0 text-slate-400" />
            {last ? (
              <span className="font-semibold truncate text-slate-800 max-w-[150px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link to={to} className="truncate hover:text-slate-800 max-w-[120px] sm:max-w-none">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}