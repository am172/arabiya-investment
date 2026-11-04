import ContactSection from '@/components/sections/ContactSection';
import { getSettings } from '@/lib/api/settings';
import { getT } from '@/lib/serverTexts';

export const revalidate = 60;

export async function generateMetadata() {
    const t = await getT();
    return { title: t('meta_contact') };
}

export default async function ContactPage() {
    const settings = await getSettings();

    return (
        <main className="pt-16 lg:pt-20">
            <ContactSection packages={[]} contact={(settings && settings.contact) || {}} />
        </main>
    );
}