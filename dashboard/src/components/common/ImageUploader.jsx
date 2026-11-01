import { useRef, useState } from 'react';
import { Film, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import uploadService from '../../services/upload.service';
import { useToast } from '../../context/ToastContext';
import { t } from '../../i18n';

const ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/gif,image/x-icon',
  video: 'video/mp4,video/webm,video/quicktime'
};

export default function ImageUploader({
  label,
  value,
  onChange,
  onRemove,
  folder = 'general',
  kind = 'image',
  hint,
  error,
  className = ''
}) {
  const inputRef = useRef(null);
  const toast = useToast();
  const [progress, setProgress] = useState(null);
  const uploading = progress !== null;
  const isVideo = kind === 'video';

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;

    setProgress(0);
    try {
      const upload = isVideo ? uploadService.uploadVideo : uploadService.uploadImage;
      const res = await upload(file, folder, setProgress);
      onChange(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className={className}>
      {label && <label className="label">{t(label)}</label>}
      <div
        className={`flex items-center gap-4 rounded-xl border border-dashed p-4 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
      >
        <div className="flex items-center justify-center w-24 h-24 overflow-hidden shrink-0 rounded-xl bg-slate-100 text-slate-400">
          {value && value.url ? (
            isVideo ? (
              <video src={value.url} className="object-cover w-full h-full" muted />
            ) : (
              <img src={value.url} alt="" className="object-cover w-full h-full" />
            )
          ) : isVideo ? (
            <Film size={28} />
          ) : (
            <ImagePlus size={28} />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={uploading}
              onClick={() => inputRef.current && inputRef.current.click()}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {progress}%
                </>
              ) : value && value.url ? (
                t('Replace')
              ) : (
                t('Upload')
              )}
            </button>
            {value && value.url && !uploading && onRemove && (
              <button type="button" className="text-red-600 btn-secondary" onClick={onRemove}>
                <Trash2 size={16} />
                {t('Remove')}
              </button>
            )}
          </div>
          {hint && <p className="hint">{t(hint)}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT[kind]} className="hidden" onChange={handleFile} />
      {error && <p className="error-text">{t(error)}</p>}
    </div>
  );
}