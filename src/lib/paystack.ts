import axios from 'axios';
import crypto from 'crypto';

export const PAYSTACK_BASE = 'https://api.paystack.co';

type InitiateParams = {
    email: string;
    amount: number;
    reference: string;
    callback_url: string;
};

type InitiateResponse = {
    status: boolean;
    message: string;
    data?: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
};

export async function initiatePaystackPayment(params: InitiateParams): Promise<InitiateResponse> {
    const { email, amount, reference, callback_url } = params;
    const res = await axios.post<InitiateResponse>(
        `${PAYSTACK_BASE}/transaction/initialize`,
        { email, amount: amount * 100, reference, callback_url },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY as string}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return res.data;
}

export function verifyPaystackSignature(rawBody: string, headers: Headers): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY as string | undefined;
    if (!secret) return false;
    const signature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    const received = headers.get('x-paystack-signature');
    return Boolean(received && signature === received);
}
