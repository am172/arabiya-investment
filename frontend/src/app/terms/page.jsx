import LegalPage from '@/components/ui/LegalPage';
import { getLegal } from '@/lib/api/legal';
import { getT } from '@/lib/serverTexts';
import { resolveLegal } from '@/lib/legal';

export const revalidate = 60;

export async function generateMetadata() {
  const [data, t] = await Promise.all([getLegal('terms'), getT()]);
  return { title: resolveLegal(data, 'terms', t).title };
}

export default async function TermsPage() {
  const [data, t] = await Promise.all([getLegal('terms'), getT()]);
  return <LegalPage {...resolveLegal(data, 'terms', t)} />;
}