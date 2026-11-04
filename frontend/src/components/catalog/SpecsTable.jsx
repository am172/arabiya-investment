import { Download, FileText } from 'lucide-react';
import Icon from '@/components/ui/Icon';

const sizeOf = (bytes) => {
    const value = Number(bytes) || 0;
    if (value <= 0) return '';
    return value >= 1048576 ? `${(value / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(value / 1024))} KB`;
};

export function RichText({ text, className = '' }) {
    const blocks = String(text || '')
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);

    if (blocks.length === 0) return null;

    return (
        <div className={`space-y-5 text-base leading-8 text-muted sm:text-lg sm:leading-9 ${className}`}>
            {blocks.map((block, index) => {
                const lines = block
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);

                if (lines.length > 0 && lines.every((line) => /^[-•*]\s+/.test(line))) {
                    return (
                        <ul key={index} className="space-y-2">
                            {lines.map((line, position) => (
                                <li key={position} className="flex items-start gap-3">
                                    <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <span>{line.replace(/^[-•*]\s+/, '')}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }

                return (
                    <p key={index} className="whitespace-pre-line">
                        {block}
                    </p>
                );
            })}
        </div>
    );
}

export function FeatureGrid({ features }) {
    if (!features || features.length === 0) return null;

    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
                <li key={`${feature.title}-${index}`} className="flex gap-4 p-5 border rounded-theme border-border bg-surface">
                    <span className="flex items-center justify-center h-11 w-11 shrink-0 rounded-xl bg-primary/10 text-primary">
                        <Icon name={feature.icon} size={20} />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-bold leading-snug">{feature.title}</h3>
                        {feature.text && <p className="mt-1 text-sm leading-7 text-muted">{feature.text}</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function DocumentsList({ documents, label }) {
    if (!documents || documents.length === 0) return null;

    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {documents.map((doc, index) => (
                <li key={`${doc.url}-${index}`}>
                    <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 transition border group rounded-theme border-border bg-surface hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                    >
                        <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-error/10 text-error">
                            <FileText size={22} aria-hidden="true" />
                        </span>
                        <span className="flex-1 min-w-0">
                            <span dir="auto" className="block font-bold truncate">
                                {doc.title}
                            </span>
                            <span dir="ltr" className="block text-xs text-start text-muted">
                                PDF{sizeOf(doc.bytes) ? ` · ${sizeOf(doc.bytes)}` : ''}
                            </span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                            <Download size={16} aria-hidden="true" />
                            {label}
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

export default function SpecsTable({ specs, caption }) {
    if (!specs || specs.length === 0) return null;

    const groups = [];
    specs.forEach((spec) => {
        const name = (spec.group || '').trim();
        let group = groups.find((item) => item.name === name);
        if (!group) {
            group = { name, rows: [] };
            groups.push(group);
        }
        group.rows.push(spec);
    });

    return (
        <div className="overflow-hidden border divide-y divide-border rounded-theme border-border">
            {groups.map((group, index) => (
                <table key={`${group.name}-${index}`} className="w-full text-sm">
                    {index === 0 && !group.name ? (
                        <caption className="sr-only">{caption}</caption>
                    ) : (
                        <caption className="px-5 py-3 text-sm font-bold caption-top bg-primary/10 text-start text-primary">
                            {group.name || caption}
                        </caption>
                    )}
                    <tbody className="divide-y divide-border">
                        {group.rows.map((row, position) => (
                            <tr key={`${row.label}-${position}`} className="odd:bg-surface">
                                <th scope="row" className="w-2/5 px-5 py-3.5 text-start align-top font-semibold text-muted">
                                    {row.label}
                                </th>
                                <td dir="auto" className="px-5 py-3.5 text-start font-medium">
                                    {row.value || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}
        </div>
    );
}