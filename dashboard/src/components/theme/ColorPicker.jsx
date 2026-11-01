import { useEffect, useState } from 'react';
import { HEX_COLOR } from '../../utils/validators';
import { t } from '../../i18n';

const toSixDigit = (value) => {
  if (/^#[0-9a-f]{6}/i.test(value)) return value.slice(0, 7);
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return '#000000';
};

export default function ColorPicker({ label, value, onChange }) {
  const [text, setText] = useState(value);
  const valid = HEX_COLOR.test(text);

  useEffect(() => {
    setText(value);
  }, [value]);

  const commit = (next) => {
    setText(next);
    if (HEX_COLOR.test(next)) onChange(next.toUpperCase());
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={toSixDigit(value)}
        onChange={(event) => commit(event.target.value)}
        className="w-12 h-10 p-1 border rounded-lg cursor-pointer border-slate-200 bg-card"
      />
      <div className="flex-1">
        <label className="label">{t(label)}</label>
        <input
          dir="ltr"
          className={`input font-mono uppercase ${valid ? '' : 'input-error'}`}
          value={text}
          maxLength={9}
          onChange={(event) => commit(event.target.value)}
        />
      </div>
    </div>
  );
}