const webpush = require('web-push');
const Admin = require('../models/Admin.model');
const PushSubscription = require('../models/PushSubscription.model');
const NotificationSettings = require('../models/NotificationSettings.model');
const email = require('./email.service');
const logger = require('../utils/logger');

let pushReady = false;
try {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        pushReady = true;
    }
} catch (error) {
    logger.error(`Invalid VAPID configuration: ${error.message}`);
}

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ENTITIES[char]);
const oneLine = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
const dashboardLink = () => {
    const base = String(process.env.DASHBOARD_URL || '').replace(/\/$/, '');
    return base ? `${base}/messages` : '';
};

const sendPush = async (payload, filter) => {
    if (!pushReady) return { sent: 0 };
    const subscriptions = await PushSubscription.find(filter).lean();
    let sent = 0;

    await Promise.all(
        subscriptions.map(async (item) => {
            try {
                await webpush.sendNotification(
                    { endpoint: item.endpoint, keys: item.keys },
                    JSON.stringify(payload),
                    { TTL: 60 * 60 * 24, urgency: 'high' }
                );
                sent += 1;
            } catch (error) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await PushSubscription.deleteOne({ _id: item._id });
                } else {
                    logger.warn(`Push failed (${error.statusCode || 'network'}): ${error.message}`);
                }
            }
        })
    );

    return { sent };
};

const row = (label, value) =>
    value
        ? `<tr><td style="padding:8px 14px;color:#64748b;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 14px;color:#0f172a;font-weight:600">${escape(value)}</td></tr>`
        : '';

const buildHtml = (message) => {
    const link = dashboardLink();
    return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f8fafc;padding:24px">
<div style="max-width:560px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
<div style="background:#4f46e5;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:700">رسالة جديدة من الموقع</div>
<table style="width:100%;border-collapse:collapse;font-size:14px">
${row('الاسم', message.name)}${row('البريد الإلكتروني', message.email)}${row('الهاتف', message.phone)}${row('الموضوع', message.subject)}${row('عمر الطفل', message.childAge)}${row('الباقة المطلوبة', message.packageInterest)}
</table>
<div style="padding:16px 24px;border-top:1px solid #e2e8f0">
<p style="margin:0 0 6px;color:#64748b;font-size:13px">الرسالة</p>
<p style="margin:0;color:#0f172a;line-height:1.9;white-space:pre-wrap">${escape(message.message)}</p>
</div>
${link ? `<div style="padding:0 24px 24px"><a href="${escape(link)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:700">فتح لوحة التحكم</a></div>` : ''}
</div></div>`;
};

const notifyNewMessage = async (message) => {
    try {
        const [settings, admins] = await Promise.all([
            NotificationSettings.getSettings(),
            Admin.find({ isActive: true }).select('_id email').lean()
        ]);
        const tasks = [];

        if (settings.pushEnabled) {
            tasks.push(
                sendPush(
                    {
                        title: `رسالة جديدة من ${oneLine(message.name, 60)}`,
                        body: oneLine(message.subject || message.message, 120),
                        url: '/messages',
                        tag: `message-${message._id}`
                    },
                    { admin: { $in: admins.map((item) => item._id) } }
                )
            );
        }

        if (settings.emailEnabled && email.isConfigured()) {
            const recipients = [
                ...new Set([
                    ...(settings.notifyAllAdmins ? admins.map((item) => item.email) : []),
                    ...settings.extraRecipients
                ])
            ].filter(Boolean);
            const subject = `رسالة جديدة من ${oneLine(message.name, 60)}`;
            const html = buildHtml(message);

            recipients.forEach((to) => {
                tasks.push(
                    email
                        .send({ to, subject, html, replyTo: message.email })
                        .catch((error) => logger.warn(`Alert email failed: ${error.message}`))
                );
            });
        }

        await Promise.allSettled(tasks);
    } catch (error) {
        logger.error(`Notification failed: ${error.message}`);
    }
};
const buildRequestHtml = (request) => {
    const base = String(process.env.DASHBOARD_URL || '').replace(/\/$/, '');
    const link = base ? `${base}/requests` : '';
    const items = request.items
        .map((item) => {
            const lines = (item.options || [])
                .map((option) => `<li>${escape(option.title)}: <strong>${escape(option.display)}</strong></li>`)
                .join('');
            return `<div style="padding:12px 24px;border-top:1px solid #e2e8f0"><p style="margin:0 0 6px;font-weight:700">${escape(item.productName)}</p><ul style="margin:0;padding:0 18px 0 0;line-height:1.9">${lines}</ul></div>`;
        })
        .join('');

    return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f8fafc;padding:24px">
<div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
<div style="background:#4f46e5;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:700">طلب منتج جديد ${escape(request.reference)}</div>
<table style="width:100%;border-collapse:collapse;font-size:14px">
${row('الاسم', request.name)}${row('الشركة', request.company)}${row('الهاتف', request.phone)}${row('البريد الإلكتروني', request.email)}${row('المدينة', request.city)}
</table>
${items}
${request.message ? `<div style="padding:16px 24px;border-top:1px solid #e2e8f0;white-space:pre-wrap;line-height:1.9">${escape(request.message)}</div>` : ''}
${link ? `<div style="padding:16px 24px 24px"><a href="${escape(link)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:700">فتح الطلبات</a></div>` : ''}
</div></div>`;
};

const notifyNewProductRequest = async (request) => {
    try {
        const [settings, admins] = await Promise.all([
            NotificationSettings.getSettings(),
            Admin.find({ isActive: true }).select('_id email').lean()
        ]);
        const tasks = [];
        const first = request.items[0];
        const more = request.items.length > 1 ? ` (+${request.items.length - 1})` : '';

        if (settings.pushEnabled) {
            tasks.push(
                sendPush(
                    {
                        title: `طلب منتج جديد من ${oneLine(request.name, 60)}`,
                        body: oneLine(`${first ? first.productName : ''}${more}`, 120),
                        url: '/requests',
                        tag: `request-${request._id}`
                    },
                    { admin: { $in: admins.map((item) => item._id) } }
                )
            );
        }

        if (settings.emailEnabled && email.isConfigured()) {
            const recipients = [
                ...new Set([
                    ...(settings.notifyAllAdmins ? admins.map((item) => item.email) : []),
                    ...settings.extraRecipients
                ])
            ].filter(Boolean);
            const subject = `طلب جديد ${request.reference} من ${oneLine(request.name, 60)}`;
            const html = buildRequestHtml(request);

            recipients.forEach((to) => {
                tasks.push(
                    email
                        .send({ to, subject, html, replyTo: request.email || undefined })
                        .catch((error) => logger.warn(`Request email failed: ${error.message}`))
                );
            });
        }

        await Promise.allSettled(tasks);
    } catch (error) {
        logger.error(`Request notification failed: ${error.message}`);
    }
};

const sendTest = async (admin) => {
    const push = pushReady
        ? await sendPush(
            { title: 'إشعار تجريبي', body: 'الإشعارات تعمل على هذا الجهاز.', url: '/messages', tag: 'test' },
            { admin: admin._id }
        )
        : { sent: 0 };

    const result = { configured: email.isConfigured(), sent: false, error: '' };
    if (result.configured) {
        try {
            await email.send({
                to: admin.email,
                subject: 'رسالة تجريبية',
                html: '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif">تعمل تنبيهات البريد الإلكتروني بنجاح.</div>'
            });
            result.sent = true;
        } catch (error) {
            result.error = error.message;
        }
    }

    return { push: { configured: pushReady, sent: push.sent }, email: result };
};

module.exports = { notifyNewMessage, sendTest, notifyNewProductRequest, isPushReady: () => pushReady };