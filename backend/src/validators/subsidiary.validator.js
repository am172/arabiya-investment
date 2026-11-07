const isValidUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

const validateCreateSubsidiary = (body = {}) => {
    const errors = [];

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
        errors.push({ field: 'name', message: 'اسم الشركة مطلوب' });
    } else if (body.name.trim().length > 150) {
        errors.push({ field: 'name', message: 'اسم الشركة يجب ألا يتجاوز 150 حرفًا' });
    }

    if (body.description !== undefined && body.description !== null && body.description !== '') {
        if (typeof body.description !== 'string' || body.description.trim().length > 1000) {
            errors.push({ field: 'description', message: 'الوصف يجب ألا يتجاوز 1000 حرف' });
        }
    }

    if (!body.image || typeof body.image !== 'object' || !body.image.url || !String(body.image.url).trim()) {
        errors.push({ field: 'image', message: 'صورة الغلاف مطلوبة' });
    }

    if (body.link !== undefined && body.link !== null && String(body.link).trim() !== '') {
        const cleanLink = String(body.link).trim();
        if (cleanLink.length > 300 || !isValidUrl(cleanLink)) {
            errors.push({ field: 'link', message: 'يرجى إدخال رابط صحيح يبدأ بـ http أو https' });
        }
    }

    if (body.order !== undefined && (!Number.isFinite(Number(body.order)) || Number(body.order) < 0)) {
        errors.push({ field: 'order', message: 'الترتيب يجب أن يكون رقمًا صحيحًا' });
    }

    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
        errors.push({ field: 'isActive', message: 'حالة التفعيل غير صحيحة' });
    }

    return errors;
};

const validateUpdateSubsidiary = (body = {}) => {
    const errors = [];

    if (body.name !== undefined) {
        if (typeof body.name !== 'string' || !body.name.trim()) {
            errors.push({ field: 'name', message: 'اسم الشركة مطلوب' });
        } else if (body.name.trim().length > 150) {
            errors.push({ field: 'name', message: 'اسم الشركة يجب ألا يتجاوز 150 حرفًا' });
        }
    }

    if (body.description !== undefined && body.description !== null && body.description !== '') {
        if (typeof body.description !== 'string' || body.description.trim().length > 1000) {
            errors.push({ field: 'description', message: 'الوصف يجب ألا يتجاوز 1000 حرف' });
        }
    }

    if (body.image !== undefined) {
        if (!body.image || typeof body.image !== 'object' || !body.image.url || !String(body.image.url).trim()) {
            errors.push({ field: 'image', message: 'صورة الغلاف مطلوبة' });
        }
    }

    if (body.link !== undefined && body.link !== null && String(body.link).trim() !== '') {
        const cleanLink = String(body.link).trim();
        if (cleanLink.length > 300 || !isValidUrl(cleanLink)) {
            errors.push({ field: 'link', message: 'يرجى إدخال رابط صحيح يبدأ بـ http أو https' });
        }
    }

    if (body.order !== undefined && (!Number.isFinite(Number(body.order)) || Number(body.order) < 0)) {
        errors.push({ field: 'order', message: 'الترتيب يجب أن يكون رقمًا صحيحًا' });
    }

    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
        errors.push({ field: 'isActive', message: 'حالة التفعيل غير صحيحة' });
    }

    return errors;
};

module.exports = {
    validateCreateSubsidiary,
    validateUpdateSubsidiary
};