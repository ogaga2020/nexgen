'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
    fullName: z.string().min(3),
    email: z.string().email(),
    phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, 'Invalid Nigerian phone'),
    trainingType: z.enum(['Electrical', 'Plumbing', 'Solar']),
    trainingDuration: z.union([z.literal(4), z.literal(8), z.literal(12)]),
    photo: z.string().url(),
    guarantor: z.object({
        fullName: z.string().min(3),
        email: z.string().email(),
        phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, 'Invalid phone'),
        photo: z.string().url(),
    }),
});

type FormData = z.infer<typeof FormSchema>;

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(FormSchema) });

    const [uploadingUserPhoto, setUploadingUserPhoto] = useState(false);
    const [uploadingGuarantorPhoto, setUploadingGuarantorPhoto] = useState(false);
    const router = useRouter();

    const handleUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'photo' | 'guarantor.photo'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'nexgen_default');
        formData.append('folder', 'nextgen/passport');

        const uploadState = field === 'photo' ? setUploadingUserPhoto : setUploadingGuarantorPhoto;
        uploadState(true);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/dg0jsjmh9/image/upload`,
                formData
            );
            setValue(field, res.data.secure_url);
        } catch (err) {
            alert('Upload failed');
        } finally {
            uploadState(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            const res = await axios.post('/api/register', data);
            const { paymentRef, amount, email } = res.data;

            if (paymentRef) {
                const paystack = (window as any).PaystackPop.setup({
                    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                    email,
                    amount: amount * 100,
                    reference: paymentRef,
                    callback: () => {
                        alert('Payment successful!');
                        router.push('/');
                    },
                    onClose: () => alert('Payment cancelled'),
                });
                paystack.openIframe();
            } else {
                alert('Registered without payment');
                router.push('/');
            }
        } catch (err) {
            alert('Registration failed.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-ui font-semibold mb-6 text-primary">
                Training Registration
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-ui mb-1">Full Name</label>
                        <input {...register('fullName')} className="input-field" />
                        {errors.fullName && <p className="text-danger text-sm">{errors.fullName.message}</p>}
                    </div>
                    <div>
                        <label className="block font-ui mb-1">Email</label>
                        <input {...register('email')} type="email" className="input-field" />
                        {errors.email && <p className="text-danger text-sm">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block font-ui mb-1">Phone</label>
                        <input {...register('phone')} type="tel" className="input-field" />
                        {errors.phone && <p className="text-danger text-sm">{errors.phone.message}</p>}
                    </div>
                    <div>
                        <label className="block font-ui mb-1">Upload Passport Photo</label>
                        <input type="file" onChange={(e) => handleUpload(e, 'photo')} />
                        {uploadingUserPhoto && <p className="text-warning">Uploading...</p>}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-ui mb-1">Training Type</label>
                        <select {...register('trainingType')} className="input-field">
                            <option value="">Select</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Solar">Solar</option>
                        </select>
                        {errors.trainingType && (
                            <p className="text-danger text-sm">{errors.trainingType.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block font-ui mb-1">Duration (months)</label>
                        <select {...register('trainingDuration')} className="input-field">
                            <option value="">Select</option>
                            <option value={4}>4 months</option>
                            <option value={8}>8 months</option>
                            <option value={12}>12 months</option>
                        </select>
                        {errors.trainingDuration && (
                            <p className="text-danger text-sm">{errors.trainingDuration.message}</p>
                        )}
                    </div>
                </div>

                <h2 className="text-xl font-ui font-medium mt-8">Guarantor Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-ui mb-1">Guarantor Full Name</label>
                        <input {...register('guarantor.fullName')} className="input-field" />
                        {errors.guarantor?.fullName && (
                            <p className="text-danger text-sm">{errors.guarantor.fullName.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block font-ui mb-1">Guarantor Email</label>
                        <input {...register('guarantor.email')} className="input-field" />
                        {errors.guarantor?.email && (
                            <p className="text-danger text-sm">{errors.guarantor.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block font-ui mb-1">Guarantor Phone</label>
                        <input {...register('guarantor.phone')} className="input-field" />
                        {errors.guarantor?.phone && (
                            <p className="text-danger text-sm">{errors.guarantor.phone.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block font-ui mb-1">Upload Guarantor Photo</label>
                        <input type="file" onChange={(e) => handleUpload(e, 'guarantor.photo')} />
                        {uploadingGuarantorPhoto && <p className="text-warning">Uploading...</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white py-2 px-6 rounded-md hover:bg-blue-800 transition"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit & Pay 60%'}
                </button>
            </form>
        </div>
    );
}
