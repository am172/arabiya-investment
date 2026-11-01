import LegalPage from '@/components/ui/LegalPage';
import { getLegal } from '@/lib/api/legal';
import { getT } from '@/lib/serverTexts';
import { resolveLegal } from '@/lib/legal';

export const revalidate = 60;

export async function generateMetadata() {
  const [data, t] = await Promise.all([getLegal('privacy'), getT()]);
  return { title: resolveLegal(data, 'privacy', t).title };
}

export default async function PrivacyPolicyPage() {
  const [data, t] = await Promise.all([getLegal('privacy'), getT()]);
  return <LegalPage {...resolveLegal(data, 'privacy', t)} />;
}