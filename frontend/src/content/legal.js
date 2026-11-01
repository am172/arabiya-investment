export const buildLegalFallback = (t) => ({
  privacy: { title: t('legal_privacyTitle'), intro: t('legal_loadError'), sections: [] },
  terms: { title: t('legal_termsTitle'), intro: t('legal_loadError'), sections: [] }
});