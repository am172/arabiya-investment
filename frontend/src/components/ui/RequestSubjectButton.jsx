'use client';

import { PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useT } from '@/components/providers/TextsProvider';
import { useContactStore } from '@/store/useContactStore';
import { NEW_SUBJECT_PARAM } from '@/lib/utils/contactTopics';

export default function RequestSubjectButton() {
    const t = useT();
    const setSubject = useContactStore((state) => state.setSubject);

    return (
        <Button
            href={`/?topic=${NEW_SUBJECT_PARAM}#contact`}
            variant="outline"
            size="lg"
            data-track="request-new-subject"
            onClick={() => setSubject(t('contact_subjectNew'))}
        >
            <PlusCircle size={18} />
            {t('subjects_request')}
        </Button>
    );
}