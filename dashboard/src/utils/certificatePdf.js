export const CERT_WIDTH = 1123;
export const CERT_HEIGHT = 794;

const buildPdf = async (node) => {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [CERT_WIDTH, CERT_HEIGHT],
    compress: true
  });
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, CERT_WIDTH, CERT_HEIGHT);
  return pdf;
};

export const downloadCertificatePdf = async (node, filename) => {
  const pdf = await buildPdf(node);
  pdf.save(filename);
};

export const certificatePdfBlob = async (node) => {
  const pdf = await buildPdf(node);
  return pdf.output('blob');
};

export const formatCertDate = (value) =>
  value
    ? new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value))
    : '';