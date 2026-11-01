import { AlignLeft, CheckSquare, CircleDot, Hash, List, Type } from 'lucide-react';

export const CHOICE_TYPES = ['select', 'radio', 'checkbox'];

export const OPTION_TYPES = [
  { id: 'select', label: 'Dropdown', hint: 'Pick one from a list', icon: List },
  { id: 'radio', label: 'Radio buttons', hint: 'Pick one, all choices visible', icon: CircleDot },
  { id: 'checkbox', label: 'Checkboxes', hint: 'Pick one or more', icon: CheckSquare },
  { id: 'number', label: 'Number', hint: 'Quantity or any number', icon: Hash },
  { id: 'text', label: 'Short text', hint: 'One line of text', icon: Type },
  { id: 'textarea', label: 'Long text', hint: 'Several lines of text', icon: AlignLeft }
];

export const REQUEST_STATUSES = [
  { id: 'new', label: 'New', tone: 'bg-rose-50 text-rose-700' },
  { id: 'contacted', label: 'Contacted', tone: 'bg-sky-50 text-sky-700' },
  { id: 'quoted', label: 'Quoted', tone: 'bg-amber-50 text-amber-700' },
  { id: 'completed', label: 'Completed', tone: 'bg-emerald-50 text-emerald-700' },
  { id: 'cancelled', label: 'Cancelled', tone: 'bg-slate-100 text-slate-600' }
];

export const BADGE_TONES = [
  { id: 'primary', label: 'Primary', cls: 'bg-brand-50 text-brand-700' },
  { id: 'success', label: 'Green', cls: 'bg-emerald-50 text-emerald-700' },
  { id: 'warning', label: 'Amber', cls: 'bg-amber-50 text-amber-700' },
  { id: 'danger', label: 'Red', cls: 'bg-rose-50 text-rose-700' },
  { id: 'neutral', label: 'Neutral', cls: 'bg-slate-100 text-slate-600' }
];

export const LIMITS = { gallery: 30, badges: 8, features: 40, specs: 100, documents: 15, options: 40, values: 100 };
export const IMAGE_MAX = 5 * 1024 * 1024;
export const DOC_MAX = 10 * 1024 * 1024;