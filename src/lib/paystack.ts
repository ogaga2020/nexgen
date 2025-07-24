import axios from 'axios';

const PAYSTACK_BASE = 'https://api.paystack.co';

export async function initiatePaystackPayment({
    email,
    amount,
    reference,
    callback_url,
}: {
    email: string;
    amount: number;
    reference: string;
    callback_url: string;
}) {
    const res = await axios.post(
        `${PAYSTACK_BASE}/transaction/initialize`,
        {
            email,
            amount: amount * 100,
            reference,
            callback_url,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return res.data;
}

export function verifyPaystackSignature(req: Request): boolean {
    const crypto = require('crypto');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    const received = req.headers.get('x-paystack-signature');
    return hash === received;
}
