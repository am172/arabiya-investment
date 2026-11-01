import { Plus, Trash2 } from 'lucide-react';
import { BADGE_TONES, LIMITS } from '../../constants/catalog';
import uid from '../../utils/uid';
import { t } from '../../i18n';

export default function BadgesEditor({ items, onChange }) {
    const patch = (id, change) => onChange(items.map((item) => (item._uid === id ? { ...item, ...change } : item)));

    return (
        <div>
            <ul className="space-y-2">
                {items.map((item) => {
                    const tone = BADGE_TONES.find((entry) => entry.id === item.tone) || BADGE_TONES[0];
                    return (
                        <li key={item._uid} className="flex items-center gap-2">
                            <input
                                dir="auto"
                                className="py-2 input"
                                placeholder={t('Badge text')}
                                maxLength={40}
                                value={item.text}
                                onChange={(event) => patch(item._uid, { text: event.target.value })}
                            />
                            <select
                                className="w-32 py-2 input"
                                aria-label={t('Color')}
                                value={item.tone}
                                onChange={(event) => patch(item._uid, { tone: event.target.value })}
                            >
                                {BADGE_TONES.map((entry) => (
                                    <option key={entry.id} value={entry.id}>
                                        {t(entry.label)}
                                    </option>
                                ))}
                            </select>
                            <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:inline ${tone.cls}`}>
                                {item.text || '—'}
                            </span>
                            <button
                                type="button"
                                className="icon-btn hover:bg-red-50 hover:text-red-600"
                                title={t('Delete')}
                                onClick={() => onChange(items.filter((badge) => badge._uid !== item._uid))}
                            >
                                <Trash2 size={15} />
                            </button>
                        </li>
                    );
                })}
            </ul>
            <button
                type="button"
                className="mt-3 btn-secondary"
                disabled={items.length >= LIMITS.badges}
                onClick={() => onChange([...items, { _uid: uid(), text: '', tone: 'primary' }])}
            >
                <Plus size={16} />
                {t('Add badge')}
            </button>
        </div>
    );
}