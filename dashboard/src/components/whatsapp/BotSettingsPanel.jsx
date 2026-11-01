import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import whatsappService from '../../services/whatsapp.service';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import Loader from '../common/Loader';
import FormInput, { FormToggle } from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import FormTextarea from '../forms/FormTextarea';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const PROVIDERS = [
  { value: 'groq', label: 'Groq (fast)' },
  { value: 'gemini', label: 'Google Gemini' }
];

export default function BotSettingsPanel() {
  const toast = useToast();
  const { data, loading } = useFetch(() => whatsappService.getSettings(), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      enabled: data.enabled,
      provider: data.provider,
      instructions: data.instructions || '',
      fallbackMessage: data.fallbackMessage || '',
      handoffKeywords: (data.handoffKeywords || []).join('، '),
      handoffMessage: data.handoffMessage || '',
      maxRepliesPerHour: String(data.maxRepliesPerHour)
    });
  }, [data]);

  if (loading || !form) return <Loader />;

  const bind = (name) => ({
    value: form[name],
    error: errors[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value })
  });

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await whatsappService.updateSettings({
        enabled: form.enabled,
        provider: form.provider,
        instructions: form.instructions.trim(),
        fallbackMessage: form.fallbackMessage.trim(),
        handoffKeywords: form.handoffKeywords
          .split(/[,،]/)
          .map((item) => item.trim())
          .filter(Boolean),
        handoffMessage: form.handoffMessage.trim(),
        maxRepliesPerHour: Number(form.maxRepliesPerHour) || 15
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      setErrors(mapServerErrors(err.errors));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-6 space-y-5 card">
      <FormToggle
        label="Bot is active"
        hint="When off, incoming messages are not answered"
        checked={form.enabled}
        onChange={(value) => setForm({ ...form, enabled: value })}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormSelect label="AI provider" options={PROVIDERS} {...bind('provider')} />
        <FormInput
          label="Max replies per person per hour"
          type="number"
          min="1"
          max="100"
          {...bind('maxRepliesPerHour')}
        />
      </div>
      <FormTextarea
        label="Extra instructions for the bot"
        dir="auto"
        rows={4}
        hint="For example: working hours, tone, or things the bot must never promise"
        {...bind('instructions')}
      />
      <FormTextarea label="Message when the AI cannot answer" dir="auto" rows={2} {...bind('fallbackMessage')} />
      <FormInput
        label="Words that hand the chat to a human"
        dir="auto"
        hint="Separate with commas. The bot pauses for that chat for 12 hours."
        {...bind('handoffKeywords')}
      />
      <FormTextarea label="Message sent on handoff" dir="auto" rows={2} {...bind('handoffMessage')} />
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {t('Save changes')}
        </button>
      </div>
    </form>
  );
}