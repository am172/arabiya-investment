import React, { useState, useEffect, useCallback } from 'react';
import subsidiaryService from '../../services/subsidiary.service';
import SubsidiaryForm from '../../components/forms/SubsidiaryForm';

const SubsidiariesPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const res = await subsidiaryService.getAll({ search: search.trim() || undefined, limit: 100 });
            setItems(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error(error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchItems();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchItems]);

    const handleOpenCreate = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleFormSubmit = async (payload) => {
        try {
            setSubmitting(true);
            if (editingItem) {
                await subsidiaryService.update(editingItem._id, payload);
            } else {
                await subsidiaryService.create(payload);
            }
            handleCloseModal();
            fetchItems();
        } catch (error) {
            const details = error.errors?.map((e) => e.message).join('\n');
            alert(details || error.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await subsidiaryService.toggleStatus(id);
            fetchItems();
        } catch (error) {
            alert(error.message || 'تعذر تحديث الحالة');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الشركة؟')) return;
        try {
            await subsidiaryService.remove(id);
            fetchItems();
        } catch (error) {
            alert(error.message || 'تعذر الحذف');
        }
    };

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الشركات التابعة</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        إدارة الشركات التابعة المعروضة في الصفحة المخصصة بالموقع
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    + إضافة شركة تابعة
                </button>
            </div>

            <div className="flex items-center gap-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم الشركة أو الوصف..."
                    className="w-full max-w-md rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
            </div>

            {loading ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
            ) : items.length === 0 ? (
                <div className="p-12 text-center border border-gray-300 border-dashed rounded-2xl dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد شركات تابعة مضافة حتى الآن.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div
                            key={item._id}
                            className="flex flex-col overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-900">
                                {item.image?.url ? (
                                    <img
                                        src={item.image.url}
                                        alt={item.name}
                                        className="object-cover w-full h-full"
                                    />
                                ) : null}
                                <span
                                    className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {item.isActive ? 'نشط' : 'مخفي'}
                                </span>
                            </div>

                            <div className="flex flex-col justify-between flex-1 p-5 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                    {item.description ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                            {item.description}
                                        </p>
                                    ) : null}
                                    {item.link ? (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block max-w-full text-xs text-indigo-600 truncate dark:text-indigo-400 hover:underline"
                                            dir="ltr"
                                        >
                                            {item.link}
                                        </a>
                                    ) : null}
                                </div>

                                <div className="flex items-center justify-between pt-3 text-sm border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => handleToggleStatus(item._id)}
                                        className="text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    >
                                        {item.isActive ? 'إخفاء' : 'تفعيل'}
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="font-medium text-red-600 dark:text-red-400 hover:underline"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                            {editingItem ? 'تعديل الشركة التابعة' : 'إضافة شركة تابعة جديدة'}
                        </h2>
                        <SubsidiaryForm
                            initialData={editingItem}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseModal}
                            isSubmitting={submitting}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubsidiariesPage;