'use client';

import { useForm } from 'react-hook-form';
import type { SubmitHandler, Resolver, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNotifier } from '@/components/Notifier';

const UrlOrEmpty = z.union([z.string().url('Upload a valid image URL'), z.literal('')]);
const FormSchema = z.object({
    fullName: z.string().min(3, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, 'Invalid Nigerian phone'),
    trainingType: z.enum(['Electrical', 'Plumbing', 'Solar']),
    trainingDuration: z.coerce.number().refine((v) => [4, 8, 12].includes(v), { message: 'Select a duration' }),
    photo: UrlOrEmpty,
    guarantor: z.object({
        fullName: z.string().min(3, 'Enter guarantor name'),
        email: z.string().email('Enter a valid email'),
        phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, 'Invalid phone'),
        photo: UrlOrEmpty,
    }),
});

type RegisterForm = z.infer<typeof FormSchema>;

const TUITION_BY_DURATION: Record<4 | 8 | 12, number> = {
    4: 250_000,
    8: 450_000,
    12: 700_000,
};

const BUSINESS_E164 = '2348039375634';

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const durationParam = searchParams.get('duration');
    const typeParam = searchParams.get('type');
    const { error: notifyError } = useNotifier();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(FormSchema) as Resolver<RegisterForm>,
        defaultValues: {
            trainingDuration: durationParam ? (Number(durationParam) as 4 | 8 | 12) : undefined,
            trainingType:
                typeParam === 'Electrical' || typeParam === 'Plumbing' || typeParam === 'Solar'
                    ? (typeParam as RegisterForm['trainingType'])
                    : undefined,
            photo: '',
            guarantor: { fullName: '', email: '', phone: '', photo: '' },
        },
    });

    useEffect(() => {
        const d = searchParams.get('duration');
        const t = searchParams.get('type');
        if (d) setValue('trainingDuration', Number(d) as 4 | 8 | 12, { shouldValidate: true });
        if (t === 'Electrical' || t === 'Plumbing' || t === 'Solar') {
            setValue('trainingType', t as RegisterForm['trainingType'], { shouldValidate: true });
        }
    }, [searchParams, setValue]);

    const [uploadingUserPhoto, setUploadingUserPhoto] = useState(false);
    const [uploadingGuarantorPhoto, setUploadingGuarantorPhoto] = useState(false);

    const passportRef = useRef<HTMLInputElement>(null);
    const guarantorRef = useRef<HTMLInputElement>(null);

    const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'guarantor.photo') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            notifyError('Image too large. Max 3MB.');
            e.currentTarget.value = '';
            return;
        }
        if (!CLOUD || !PRESET) {
            notifyError('Cloudinary config missing.');
            e.currentTarget.value = '';
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', PRESET);
        formData.append('folder', 'nextgen/passport');
        const setBusy = field === 'photo' ? setUploadingUserPhoto : setUploadingGuarantorPhoto;
        setBusy(true);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                const msg = payload?.error?.message || res.statusText || 'Upload failed';
                notifyError(`Upload failed: ${msg}`);
                e.currentTarget.value = '';
                return;
            }
            setValue(field, payload.secure_url, { shouldValidate: true, shouldDirty: true });
        } finally {
            setBusy(false);
        }
    };

    const fmt = (n: number) => `₦${n.toLocaleString()}`;

    const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
        if (isUploading) {
            notifyError('Please wait for uploads to finish.');
            return;
        }
        if (!data.photo) {
            notifyError('Please upload your passport photo.');
            return;
        }
        if (!data.guarantor.photo) {
            notifyError('Please upload the guarantor photo.');
            return;
        }

        try {
            const tuition = TUITION_BY_DURATION[data.trainingDuration as 4 | 8 | 12];
            const sixty = Math.round(tuition * 0.6);
            const forty = tuition - sixty;

            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, tuition, firstPayment: sixty, balance: forty, status: 'pending' }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Registration failed');
            }

            const message =
                `Hello NexGen,\n` +
                `My name is ${data.fullName}.\n` +
                `Course: ${data.trainingType}\n` +
                `Duration: ${data.trainingDuration} months\n` +
                `First payment (60%): ${fmt(sixty)}\n\n` +
                `Email: ${data.email}\n` +
                `Phone: ${data.phone}\n\n` +
                `Please send your bank/payment details so I can make the first payment.`;

            const wa = `https://wa.me/${BUSINESS_E164}?text=${encodeURIComponent(message)}`;
            const win = window.open(wa, '_blank');
            if (!win) notifyError('Popup blocked. Please allow popups or tap this button again.');

            passportRef.current && (passportRef.current.value = '');
            guarantorRef.current && (guarantorRef.current.value = '');
            setValue('photo', '', { shouldDirty: false });
            setValue('guarantor.photo', '', { shouldDirty: false });

            reset({
                fullName: '',
                email: '',
                phone: '',
                trainingType: undefined as any,
                trainingDuration: undefined as any,
                photo: '',
                guarantor: { fullName: '', email: '', phone: '', photo: '' },
            });
        } catch (err) {
            notifyError(err instanceof Error ? err.message : 'Registration failed.');
        }
    };

    const firstErrorMessage = (e: FieldErrors<RegisterForm>): string => {
        if (e.fullName?.message) return e.fullName.message.toString();
        if (e.email?.message) return e.email.message.toString();
        if (e.phone?.message) return e.phone.message.toString();
        if (e.trainingType?.message) return e.trainingType.message.toString();
        if (e.trainingDuration?.message) return e.trainingDuration.message.toString();
        if (e.photo?.message) return e.photo.message.toString();
        if (e.guarantor?.fullName?.message) return e.guarantor.fullName.message.toString();
        if (e.guarantor?.email?.message) return e.guarantor.email.message.toString();
        if (e.guarantor?.phone?.message) return e.guarantor.phone.message.toString();
        if (e.guarantor?.photo?.message) return e.guarantor.photo.message.toString();
        return 'Please complete all required fields.';
    };

    const onInvalid = (formErrors: FieldErrors<RegisterForm>) => {
        notifyError(firstErrorMessage(formErrors));
    };

    const isUploading = uploadingUserPhoto || uploadingGuarantorPhoto;

    return (
        <>
            <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Training Registration</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">Pay 60% now, 40% before graduation.</p>
            </section>
            <div className="bg-white">
                <div className="max-w-5xl mx-auto py-12 px-4">
                    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="grid gap-8 bg-white rounded-xl border shadow-sm p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-ui mb-1 text-gray-700 font-medium">Full Name</label>
                                <input {...register('fullName')} className="input-field bg-white" />
                                {errors.fullName && <p className="text-danger text-sm mt-1">{errors.fullName.message}</p>}
                            </div>
                            <div>
                                <label className="block font-ui mb-1 text-gray-700 font-medium">Email</label>
                                <input {...register('email')} type="email" className="input-field bg-white" />
                                {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-ui mb-1 text-gray-700 font-medium">Phone</label>
                                <input {...register('phone')} type="tel" className="input-field bg-white" />
                                {errors.phone && <p className="text-danger text-sm mt-1">{errors.phone.message}</p>}
                            </div>
                            <div>
                                <label className="block font-ui mb-1 text-gray-700 font-medium">Upload Passport Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={passportRef}
                                    disabled={uploadingUserPhoto || isSubmitting}
                                    onChange={(e) => handleUpload(e, 'photo')}
                                    className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                                />
                                {errors.photo && <p className="text-danger text-sm mt-1">{errors.photo.message}</p>}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-ui mb-1 text-gray-700 font-medium">Training Type</label>
                                <select {...register('trainingType')} className="input-field bg-white">
                                    <option value="">Select</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Solar">Solar</option>
                                </select>
                                {errors.trainingType && <p className="text-danger text-sm mt-1">{errors.trainingType.message}</p>}
                            </div>
                            <div>
                                <label className="block font-ui mb-1 text-gray-700 font-medium">Duration (months)</label>
                                <select {...register('trainingDuration')} className="input-field bg-white">
                                    <option value="">Select</option>
                                    <option value="4">4 months</option>
                                    <option value="8">8 months</option>
                                    <option value="12">12 months</option>
                                </select>
                                {errors.trainingDuration && <p className="text-danger text-sm mt-1">{errors.trainingDuration.message}</p>}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-ui font-semibold text-primary mb-4">Guarantor Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-ui mb-1 text-gray-700 font-medium">Guarantor Full Name</label>
                                    <input {...register('guarantor.fullName')} className="input-field bg-white" />
                                    {errors.guarantor?.fullName && <p className="text-danger text-sm mt-1">{errors.guarantor.fullName.message}</p>}
                                </div>
                                <div>
                                    <label className="block font-ui mb-1 text-gray-700 font-medium">Guarantor Email</label>
                                    <input {...register('guarantor.email')} className="input-field bg-white" />
                                    {errors.guarantor?.email && <p className="text-danger text-sm mt-1">{errors.guarantor.email.message}</p>}
                                </div>
                                <div>
                                    <label className="block font-ui mb-1 text-gray-700 font-medium">Guarantor Phone</label>
                                    <input {...register('guarantor.phone')} className="input-field bg-white" />
                                    {errors.guarantor?.phone && <p className="text-danger text-sm mt-1">{errors.guarantor.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="block font-ui mb-1 text-gray-700 font-medium">Upload Guarantor Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={guarantorRef}
                                        disabled={uploadingGuarantorPhoto || isSubmitting}
                                        onChange={(e) => handleUpload(e, 'guarantor.photo')}
                                        className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                                    />
                                    {errors.guarantor?.photo && <p className="text-danger text-sm mt-1">{errors.guarantor.photo.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed text-center"
                            >
                                {isSubmitting ? 'Submitting…' : 'Submit Registration'}
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">Your details will be verified by our Admin after payment confirmation.</p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
