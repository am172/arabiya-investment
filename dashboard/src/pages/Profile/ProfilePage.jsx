import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import authService from '../../services/auth.service';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/forms/FormInput';
import ImageUploader from '../../components/common/ImageUploader';
import { setToken } from '../../utils/storage';
import { isEmail, mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const EMPTY_AVATAR = { url: '', publicId: '' };

export default function ProfilePage() {
  const { admin, updateAdmin } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({
    name: admin.name,
    email: admin.email,
    avatar: admin.avatar ? { url: admin.avatar.url || '', publicId: admin.avatar.publicId || '' } : EMPTY_AVATAR
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfile = async (event) => {
    event.preventDefault();
    const found = {};
    if (!profile.name.trim()) found.name = 'Name is required';
    if (!isEmail(profile.email)) found.email = 'A valid email is required';

    setProfileErrors(found);
    if (Object.keys(found).length > 0) return;

    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        avatar: profile.avatar
      });
      updateAdmin(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      setProfileErrors(mapServerErrors(err.errors));
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    const found = {};
    if (!passwords.currentPassword) found.currentPassword = 'Current password is required';
    if (passwords.newPassword.length < 8) found.newPassword = 'At least 8 characters';
    if (passwords.confirmPassword !== passwords.newPassword) found.confirmPassword = 'Passwords do not match';

    setPasswordErrors(found);
    if (Object.keys(found).length > 0) return;

    setSavingPassword(true);
    try {
      const res = await authService.changePassword(passwords);
      setToken(res.data.token);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      setPasswordErrors(mapServerErrors(err.errors));
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account details and password." />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleProfile} className="p-6 space-y-5 card">
          <h3 className="text-base font-semibold text-slate-900">{t('Account details')}</h3>
          <ImageUploader
            label="Avatar"
            folder="avatars"
            value={profile.avatar}
            onChange={(asset) => setProfile({ ...profile, avatar: { url: asset.url, publicId: asset.publicId } })}
            onRemove={() => setProfile({ ...profile, avatar: EMPTY_AVATAR })}
          />
          <FormInput
            label="Name"
            value={profile.name}
            error={profileErrors.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />
          <FormInput
            label="Email"
            type="email"
            value={profile.email}
            error={profileErrors.email}
            onChange={(event) => setProfile({ ...profile, email: event.target.value })}
          />
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile && <Loader2 size={16} className="animate-spin" />}
              {t('Save changes')}
            </button>
          </div>
        </form>

        <form onSubmit={handlePassword} className="self-start p-6 space-y-5 card">
          <h3 className="text-base font-semibold text-slate-900">{t('Change password')}</h3>
          <FormInput
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            error={passwordErrors.currentPassword}
            onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
          />
          <FormInput
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            error={passwordErrors.newPassword}
            onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
          />
          <FormInput
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            error={passwordErrors.confirmPassword}
            onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })}
          />
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword && <Loader2 size={16} className="animate-spin" />}
              {t('Update password')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}