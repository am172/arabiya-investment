import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import ConnectionPanel from '../../components/whatsapp/ConnectionPanel';
import BotSettingsPanel from '../../components/whatsapp/BotSettingsPanel';
import BotTestPanel from '../../components/whatsapp/BotTestPanel';
import ChatsPanel from '../../components/whatsapp/ChatsPanel';
import { t } from '../../i18n';

const TABS = [
    { id: 'connection', label: 'Connection', Panel: ConnectionPanel },
    { id: 'settings', label: 'Bot settings', Panel: BotSettingsPanel },
    { id: 'test', label: 'Test the bot', Panel: BotTestPanel },
    { id: 'chats', label: 'Conversations', Panel: ChatsPanel }
];

export default function WhatsAppPage() {
    const [tab, setTab] = useState('connection');
    const { Panel } = TABS.find((item) => item.id === tab);

    return (
        <div>
            <PageHeader
                title="WhatsApp bot"
                description="Link a WhatsApp number and let the AI assistant answer parents and students."
            />
            <div role="tablist" className="flex gap-2 px-1 pb-2 mb-5 -mx-1 overflow-x-auto">
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={item.id === tab}
                        onClick={() => setTab(item.id)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${item.id === tab
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {t(item.label)}
                    </button>
                ))}
            </div>
            <Panel />
        </div>
    );
}