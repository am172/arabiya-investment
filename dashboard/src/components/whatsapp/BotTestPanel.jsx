import { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import whatsappService from '../../services/whatsapp.service';
import { useToast } from '../../context/ToastContext';
import { t } from '../../i18n';

export default function BotTestPanel() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  const send = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || busy) return;

    const history = messages.slice(-10);
    setMessages([...messages, { role: 'user', text: value }]);
    setText('');
    setBusy(true);
    try {
      const res = await whatsappService.preview({ text: value, history });
      setMessages((current) => [...current, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card flex h-[32rem] flex-col overflow-hidden">
      <p className="px-5 py-3 text-sm border-b border-slate-100 text-slate-500">
        {t('Try the bot here. Nothing is sent to WhatsApp and nothing is saved.')}
      </p>
      <div className="flex-1 p-5 space-y-3 overflow-y-auto">
        {messages.map((item, index) => (
          <div key={index} className={`flex ${item.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <p
              dir="auto"
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                item.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-brand-600 text-white'
              }`}
            >
              {item.text}
            </p>
          </div>
        ))}
        {busy && (
          <div className="flex justify-end">
            <Loader2 size={18} className="animate-spin text-slate-400" />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-3 p-4 border-t border-slate-100">
        <input
          dir="auto"
          className="input"
          value={text}
          maxLength={1000}
          placeholder={t('Type a question a parent might ask')}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={busy || !text.trim()}>
          <Send size={16} className="rtl:-scale-x-100" />
        </button>
      </form>
    </div>
  );
}