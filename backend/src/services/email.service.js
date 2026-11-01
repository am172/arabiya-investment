const TIMEOUT_MS = 10000;

const config = () => ({
    provider: String(process.env.EMAIL_PROVIDER || '').toLowerCase(),
    key: process.env.EMAIL_API_KEY || '',
    from: process.env.EMAIL_FROM || '',
    name: process.env.EMAIL_FROM_NAME || 'Academy'
});

const isConfigured = () => {
    const { provider, key, from } = config();
    return ['brevo', 'resend'].includes(provider) && Boolean(key && from);
};

const post = async (url, headers, body) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Email provider responded ${res.status}: ${text.slice(0, 200)}`);
    }
};

const send = async ({ to, subject, html, replyTo }) => {
    if (!isConfigured()) throw new Error('Email is not configured');
    const { provider, key, from, name } = config();

    if (provider === 'brevo') {
        return post(
            'https://api.brevo.com/v3/smtp/email',
            { 'api-key': key },
            {
                sender: { name, email: from },
                to: [{ email: to }],
                subject,
                htmlContent: html,
                ...(replyTo ? { replyTo: { email: replyTo } } : {})
            }
        );
    }

    return post(
        'https://api.resend.com/emails',
        { Authorization: `Bearer ${key}` },
        {
            from: `${name} <${from}>`,
            to: [to],
            subject,
            html,
            ...(replyTo ? { reply_to: replyTo } : {})
        }
    );
};

module.exports = { isConfigured, send };