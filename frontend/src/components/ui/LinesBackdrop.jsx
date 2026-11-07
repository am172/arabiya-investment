const LINES_IMAGE = '/images/lines-bg.png';

export default function LinesBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10 isolate bg-[#F8FAFC] dark:bg-[#111317]"
    >
      {/* طبقة صورة الخطوط مع عكس الإضاءة والتباين في الدارك مود لتظهر الخطوط فاتحة وواضحة */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover dark:invert dark:brightness-90 dark:contrast-125"
        style={{ backgroundImage: `url(${LINES_IMAGE})` }}
      />

      {/* طبقة تلوين كحلي خفيفة في الدارك مود فقط (بنفس أسلوب الهيرو) */}
      <div className="absolute inset-0 hidden mix-blend-color bg-gradient-to-br from-[#0D213B] via-[#09182C] to-[#06101E] dark:block" />

      <div className="absolute inset-0 bg-background/90 dark:bg-[#111317]/88" />
    </div>
  );
}