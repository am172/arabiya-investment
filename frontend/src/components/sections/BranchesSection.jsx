import SectionTitle from '@/components/ui/SectionTitle';
import BranchesExplorer from '@/components/sections/BranchesExplorer';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

export default async function BranchesSection({ groups }) {
    if (!groups || groups.length === 0) return null;

    const t = await getT();
    const labels = { map: t('branches_map'), open: t('branches_open'), all: t('branches_all') };
    const contact = { label: t('branches_contact'), href: '#contact' };

    return (
        <section id="branches" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div className="relative px-6 mx-auto max-w-[1388px] sm:px-10 lg:px-[3.125rem]">
                <SectionTitle {...getHeadings(t).branches} />
                <div className="mt-14">
                    <BranchesExplorer groups={groups} labels={labels} contact={contact} />
                </div>
            </div>
        </section>
    );
}