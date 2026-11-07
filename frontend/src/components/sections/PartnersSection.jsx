import SectionTitle from '@/components/ui/SectionTitle';
import PartnerCard from '@/components/sections/PartnerCard';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const MIN_TOTAL_ITEMS = 30;
const SECONDS_PER_CARD = 2.5;

const hostOf = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
        return '';
    }
};

export default async function PartnersSection({ partners }) {
    if (!partners || partners.length === 0) return null;

    const t = await getT();
    const heading = getHeadings(t).partners;

    const repeat = Math.max(1, Math.ceil(MIN_TOTAL_ITEMS / partners.length));
    const group = Array.from({ length: repeat }, () => partners).flat();
    const duration = Math.max(20, Math.round(group.length * SECONDS_PER_CARD));

    const labelOf = (partner) =>
        t('partners_visit', { name: (partner.name || '').trim() || hostOf(partner.url) || '' });

    const renderList = (keyPrefix, isHidden = false) =>
        group.map((partner, index) => (
            <PartnerCard
                key={`${keyPrefix}-${partner._id || index}-${index}`}
                partner={partner}
                label={labelOf(partner)}
                hidden={isHidden}
            />
        ));

    return (
        <section id="partners" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle {...heading} />
            </div>

            <div
                role="region"
                aria-label={t('partners_list')}
                dir="ltr"
                className="partners-marquee relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]"
            >
                <div className="flex partners-track w-max" style={{ '--partners-duration': `${duration}s` }}>
                    <ul className="flex gap-5 shrink-0 pe-5 sm:gap-6 sm:pe-6">{renderList('track-a')}</ul>
                    <ul aria-hidden="true" className="flex gap-5 shrink-0 pe-5 motion-reduce:hidden sm:gap-6 sm:pe-6">
                        {renderList('track-b', true)}
                    </ul>
                </div>
            </div>
        </section>
    );
}