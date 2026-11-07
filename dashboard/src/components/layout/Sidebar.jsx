import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Boxes,
  ChevronDown,
  ClipboardList,
  Cog,
  ExternalLink,
  Factory,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LayoutList,
  LayoutTemplate,
  Mail,
  MessageSquareQuote,
  PanelsTopLeft,
  Palette,
  Scale,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Type,
  UserCircle,
  Video,
  X,
  Briefcase,
  Users,
  MapPin

} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { APP_NAME, ROLES, SITE_URL } from '../../constants/config';
import useAuth from '../../hooks/useAuth';
import messageService from '../../services/message.service';
import requestService from '../../services/request.service';
import { t } from '../../i18n';

const STORE = 'dashboard_nav_closed';

const NAV = [
  {
    id: 'general',
    label: 'General',
    icon: LayoutDashboard,
    items: [
      { to: ROUTES.OVERVIEW, label: 'Overview', icon: LayoutDashboard, end: true },
      { to: ROUTES.ANALYTICS, label: 'Analytics', icon: Activity }
    ]
  },
  {
    id: 'catalog',
    label: 'Product catalog',
    icon: Boxes,
    items: [
      { to: ROUTES.CATALOG, label: 'Products & categories', icon: FolderTree },
      { to: ROUTES.OPTION_TEMPLATES, label: 'Option templates', icon: SlidersHorizontal }
    ]
  },
  {
    id: 'leads',
    label: 'Requests & leads',
    icon: Inbox,
    items: [
      { to: ROUTES.REQUESTS, label: 'Product requests', icon: ClipboardList, badge: 'requests' },
      { to: ROUTES.MESSAGES, label: 'Messages', icon: Mail, badge: 'messages' }
    ]
  },
  {
    id: 'website',
    label: 'محتوى الموقع',
    icon: PanelsTopLeft,
    items: [
      { to: ROUTES.THEME, label: 'Colors & fonts', icon: Palette },
      { to: ROUTES.HOME_LAYOUT, label: 'Sections & layouts', icon: LayoutList },
      { to: ROUTES.CONTENT, label: 'Page content', icon: LayoutTemplate },
      { to: ROUTES.STATS, label: 'Company stats', icon: BarChart3 },
      { to: ROUTES.TEXTS, label: 'Site texts', icon: Type },
      { to: ROUTES.TESTIMONIALS, label: 'Client reviews', icon: MessageSquareQuote },
      { to: ROUTES.VIDEOS, label: 'Company videos', icon: Video },
      { to: ROUTES.LEGAL, label: 'Legal pages', icon: Scale },
      { to: '/subsidiaries', label: 'الشركات التابعة', icon: Briefcase },
      { to: ROUTES.PARTNERS, label: 'Success partners', icon: Users },
      { to: ROUTES.BRANCHES, label: 'Our branches', icon: MapPin },
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: Cog,
    items: [
      { to: ROUTES.SETTINGS, label: 'Site settings', icon: Settings },
      { to: ROUTES.ADMINS, label: 'Admins', icon: ShieldCheck, roles: [ROLES.SUPER_ADMIN] },
      { to: ROUTES.PROFILE, label: 'Profile', icon: UserCircle }
    ]
  }
];

const matches = (to, pathname, end) => (end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`));

const readClosed = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {};
  } catch (error) {
    return {};
  }
};

function NavItem({ item, badges }) {
  const Icon = item.icon;
  const count = item.badge ? badges[item.badge] : 0;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition ${isActive
          ? 'bg-brand-600 font-semibold text-white shadow-sm'
          : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
          <span className="flex-1 truncate">{t(item.label)}</span>
          {count > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-white text-brand-600' : 'bg-rose-500 text-white'
                }`}
            >
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function NavSection({ group, open, active, badges, onToggle, items }) {
  const Icon = group.icon;

  return (
    <div className="border rounded-2xl border-slate-200 bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition hover:bg-slate-100 ${open ? 'rounded-b-none border-b border-slate-100' : ''
          }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
        >
          <Icon size={17} />
        </span>
        <span className="flex-1 text-sm font-bold truncate text-slate-900">
          {t(group.label)}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <ul className="overflow-hidden" aria-hidden={!open}>
          <li className="ms-5 me-2 my-2 space-y-1 border-s-2 border-slate-200 ps-2.5">
            {items.map((item) => (
              <div key={item.to} className={open ? '' : 'pointer-events-none'}>
                <NavItem item={item} badges={badges} />
              </div>
            ))}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const { admin } = useAuth();
  const { pathname } = useLocation();
  const [badges, setBadges] = useState({ messages: 0, requests: 0 });
  const [closed, setClosed] = useState(readClosed);

  useEffect(() => {
    let active = true;
    const load = () => {
      messageService
        .unreadCount()
        .then((res) => active && setBadges((current) => ({ ...current, messages: res.data.count })))
        .catch(() => { });
      requestService
        .unreadCount()
        .then((res) => active && setBadges((current) => ({ ...current, requests: res.data.count })))
        .catch(() => { });
    };

    load();
    const timer = setInterval(load, 60000);
    window.addEventListener('messages:changed', load);
    window.addEventListener('requests:changed', load);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('messages:changed', load);
      window.removeEventListener('requests:changed', load);
    };
  }, []);

  useEffect(() => {
    const group = NAV.find((entry) => entry.items.some((item) => matches(item.to, pathname, item.end)));
    if (group) setClosed((current) => (current[group.id] ? { ...current, [group.id]: false } : current));
  }, [pathname]);

  const toggle = (id) =>
    setClosed((current) => {
      const next = { ...current, [id]: !current[id] };
      try {
        localStorage.setItem(STORE, JSON.stringify(next));
      } catch (error) {
        return next;
      }
      return next;
    });

  const allowed = (item) => !item.roles || item.roles.includes(admin.role);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-slate-200 bg-card transition-transform duration-300 lg:static lg:z-auto ${open ? '' : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b shrink-0 border-slate-100">
          <div className="flex items-center min-w-0 gap-3">
            <div className="flex items-center justify-center text-white h-9 w-9 shrink-0 rounded-xl bg-brand-600">
              <Factory size={20} />
            </div>
            <span className="text-base font-bold truncate text-slate-900">{APP_NAME}</span>
          </div>
          <button type="button" className="icon-btn lg:hidden" aria-label={t('Close menu')} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
          {NAV.map((group) => {
            const items = group.items.filter(allowed);
            if (items.length === 0) return null;
            return (
              <NavSection
                key={group.id}
                group={group}
                items={items}
                badges={badges}
                active={items.some((item) => matches(item.to, pathname, item.end))}
                open={!closed[group.id]}
                onToggle={() => toggle(group.id)}
              />
            );
          })}
        </nav>

        {SITE_URL && (
          <div className="p-3 border-t shrink-0 border-slate-100">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ExternalLink size={18} />
              {t('View website')}
            </a>
          </div>
        )}
      </aside>
    </>
  );
}