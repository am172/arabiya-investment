import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';

const INITIAL_STATE = {
    name: '',
    description: '',
    link: '',
    image: { url: '', publicId: '' },
    order: 0,
    isActive: true
};

const SubsidiaryForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                link: initialData.link || '',
                image: initialData.image || { url: '', publicId: '' },
                order: initialData.order ?? 0,
                isActive: initialData.isActive ?? true
            });
        } else {
            setFormData(INITIAL_STATE);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('file', file);
        data.append('folder', 'branding');

        try {
            setUploading(true);
            setErrors((prev) => ({ ...prev, image: '' }));
            const res = await axiosInstance.post('/uploads/image', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const uploaded = res.data?.data || res.data;
            setFormData((prev) => ({
                ...prev,
                image: { url: uploaded.url, publicId: uploaded.publicId || '' }
            }));
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                image: error.response?.data?.message || 'فشل رفع الصورة، حاول مرة أخرى'
            }));
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'اسم الشركة مطلوب';
        }
        if (!formData.image?.url) {
            newErrors.image = 'صورة الغلاف مطلوبة';
        }
        if (formData.link && formData.link.trim() !== '') {
            try {
                const parsed = new URL(formData.link.trim());
                if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                    newErrors.link = 'يجب أن يبدأ الرابط بـ http أو https';
                }
            } catch {
                newErrors.link = 'يرجى إدخال رابط إلكتروني صحيح';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onSubmit({
            name: formData.name.trim(),
            description: formData.description.trim(),
            link: formData.link.trim(),
            image: formData.image,
            order: Number(formData.order) || 0,
            isActive: Boolean(formData.isActive)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    اسم الشركة <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسم الشركة التابعة"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    صورة الغلاف <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                    {formData.image?.url ? (
                        <div className="relative w-40 h-24 overflow-hidden border border-gray-200 rounded-xl dark:border-gray-700">
                            <img
                                src={formData.image.url}
                                alt={formData.name || 'Cover'}
                                className="object-cover w-full h-full"
                            />
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, image: { url: '', publicId: '' } }))}
                                className="absolute top-1 left-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700"
                            >
                                حذف
                            </button>
                        </div>
                    ) : null}
                    <label className="px-4 py-3 text-sm font-medium text-gray-600 border border-gray-300 border-dashed cursor-pointer rounded-xl dark:border-gray-600 dark:text-gray-300 hover:border-indigo-500">
                        {uploading ? 'جارٍ الرفع...' : formData.image?.url ? 'تغيير الصورة' : 'اختر صورة الغلاف'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>
                {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
            </div>

            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    الوصف <span className="text-xs text-gray-400">(اختياري)</span>
                </label>
                <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="نبذة مختصرة عن نشاط الشركة التابعة..."
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                        رابط الشركة <span className="text-xs text-gray-400">(اختياري)</span>
                    </label>
                    <input
                        type="url"
                        name="link"
                        dir="ltr"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    />
                    {errors.link && <p className="mt-1 text-xs text-red-500">{errors.link}</p>}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                        ترتيب العرض
                    </label>
                    <input
                        type="number"
                        name="order"
                        min="0"
                        value={formData.order}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-200">
                    إظهار الشركة في الموقع العام
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'جارٍ الحفظ...' : initialData ? 'حفظ التعديلات' : 'إضافة الشركة'}
                </button>
            </div>
        </form>
    );
};

export default SubsidiaryForm;