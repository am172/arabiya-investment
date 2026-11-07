'use client';

import { useMemo, useState } from 'react';
import BranchesMap from './BranchesMap';

const has = (point) => typeof point.lat === 'number' && typeof point.lng === 'number';

export default function BranchesExplorer({ groups, labels, contact }) {
    const [active, setActive] = useState(null);

    const contactLabel = contact && contact.label ? contact.label : '';
    const contactHref = contact && contact.href ? contact.href : '#contact';

    const focus = useMemo(() => {
        if (!active) return null;
        const group = groups[active.g];
        if (active.o !== null) {
            const office = group.offices[active.o];
            if (has(office)) return { key: `${active.g}-${active.o}`, lat: office.lat, lng: office.lng, zoom: 15 };
        }
        return { key: `${active.g}`, lat: group.lat, lng: group.lng, zoom: 11 };
    }, [active, groups]);

    const isActive = (g, o) => active && active.g === g && active.o === o;

    return (
        <div className="relative">
            <div
                aria-hidden="true"
                className="absolute top-7 -bottom-10 -end-12 hidden w-[37%] bg-primary lg:block"
            />

            <div className="relative z-10 grid overflow-hidden rounded-2xl bg-foreground/[0.07] lg:h-[39rem] lg:grid-cols-[45fr_55fr]">
                <div className="flex flex-col p-6 sm:p-8 lg:min-h-0 lg:p-11">
                    <div className="space-y-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pe-2">
                        {groups.map((group, g) => (
                            <div key={group._id}>
                                <button
                                    type="button"
                                    aria-current={isActive(g, null) ? 'true' : undefined}
                                    onClick={() => setActive({ g, o: null })}
                                    className={`block w-full py-1 text-start text-2xl leading-8 text-primary transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${isActive(g, null) ? 'font-semibold' : 'font-normal'
                                        }`}
                                >
                                    <span dir="auto">{group.title}</span>
                                </button>

                                {group.offices.length > 0 && (
                                    <ul className="mt-1">
                                        {group.offices.map((office, o) => (
                                            <li key={`${office.name}-${o}`}>
                                                <button
                                                    type="button"
                                                    aria-current={isActive(g, o) ? 'true' : undefined}
                                                    onClick={() => setActive({ g, o })}
                                                    className={`flex w-full items-start gap-3 py-1.5 ps-2 text-start text-base leading-6 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${isActive(g, o)
                                                            ? 'font-semibold text-primary'
                                                            : 'text-foreground hover:text-primary'
                                                        }`}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`mt-[0.55rem] h-1.5 w-1.5 shrink-0 ${isActive(g, o) ? 'bg-primary' : 'bg-foreground'
                                                            }`}
                                                    />
                                                    <span dir="auto">{office.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                        {contactLabel && (
                            <a
                                href={contactHref}
                                className="inline-flex items-center justify-center px-8 text-sm font-medium transition h-14 min-w-44 rounded-xl bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                            >
                                {contactLabel}
                            </a>
                        )}

                        {active && (
                            <button
                                type="button"
                                onClick={() => setActive(null)}
                                className="text-sm font-semibold underline transition text-primary underline-offset-4 hover:opacity-75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                            >
                                {labels.all}
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative isolate z-0 h-[22rem] lg:h-full lg:min-h-0">
                    <BranchesMap groups={groups} focus={focus} labels={labels} onSelect={(g, o) => setActive({ g, o })} />
                </div>
            </div>
        </div>
    );
}