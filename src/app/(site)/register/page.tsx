'use client';

import { useForm, useWatch } from 'react-hook-form';
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
        control,
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
    const [userFileLabel, setUserFileLabel] = useState('');
    const [guarantorFileLabel, setGuarantorFileLabel] = useState('');

    const passportRef = useRef<HTMLInputElement>(null);
    const guarantorRef = useRef<HTMLInputElement>(null);

    const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;

    const handleUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'photo' | 'guarantor.photo',
        setLabel: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLabel(file.name);
        if (file.size > 3 * 1024 * 1024) {
            notifyError('Image too large. Max 3MB.');
            e.currentTarget.value = '';
            setLabel('');
            return;
        }
        if (!CLOUD || !PRESET) {
            notifyError('Cloudinary config missing.');
            e.currentTarget.value = '';
            setLabel('');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', PRESET);
        formData.append('folder', 'nextgen/passport');
        const setBusy = field === 'photo' ? setUploadingUserPhoto : setUploadingGuarantorPhoto;
        setBusy(true);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: formData });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                const msg = payload?.error?.message || res.statusText || 'Upload failed';
                notifyError(`Upload failed: ${msg}`);
                e.currentTarget.value = '';
                setLabel('');
                return;
            }
            const nameFromCloud = payload?.original_filename
                ? `${payload.original_filename}${payload?.format ? '.' + payload.format : ''}`
                : file.name;
            setLabel(nameFromCloud);
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
            setUserFileLabel('');
            setGuarantorFileLabel('');
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

    const duration = useWatch({ control, name: 'trainingDuration' }) as 4 | 8 | 12 | undefined;
    const tuition = duration ? TUITION_BY_DURATION[duration] : undefined;
    const sixty = tuition ? Math.round(tuition * 0.6) : undefined;
    const forty = tuition && sixty !== undefined ? tuition - sixty : undefined;

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600" />
                <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24 text-center text-white">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">
                        Secure your seat • 60% now, 40% before graduation
                    </div>
                    <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Training Registration</h1>
                    <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                        Learn Electrical, Solar, or Plumbing with hands-on workshops and real tools.
                    </p>
                </div>
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
            </section>
            <div className="bg-white">
                <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                    <div className="grid gap-6 md:grid-cols-3">
                        <form
                            onSubmit={handleSubmit(onSubmit, onInvalid)}
                            className="md:col-span-2 rounded-2xl border bg-white p-6 md:p-8 shadow-sm ring-1 ring-black/10"
                        >
                            <h2 className="text-xl font-semibold text-gray-900">Your Details</h2>
                            <p className="mt-1 text-sm text-gray-600">We’ll use this to set up your profile and enrollment.</p>
                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Full Name</label>
                                    <input {...register('fullName')} className="input-field bg-white" />
                                    {errors.fullName && <p className="mt-1 text-sm text-danger">{errors.fullName.message}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Email</label>
                                    <input {...register('email')} type="email" className="input-field bg-white" />
                                    {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Phone</label>
                                    <input {...register('phone')} type="tel" className="input-field bg-white" />
                                    {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Passport Photo</label>
                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                            {uploadingUserPhoto ? 'Uploading…' : 'Choose file'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={passportRef}
                                                disabled={uploadingUserPhoto || isSubmitting}
                                                onChange={(e) => handleUpload(e, 'photo', setUserFileLabel)}
                                                className="hidden"
                                            />
                                        </label>
                                        <span className="text-xs text-gray-500">Max 3MB • JPG/PNG</span>
                                    </div>
                                    {userFileLabel && (
                                        <p className="mt-1 text-xs text-gray-600 truncate" title={userFileLabel} aria-live="polite">
                                            {userFileLabel}
                                        </p>
                                    )}
                                    {errors.photo && <p className="mt-1 text-sm text-danger">{errors.photo.message}</p>}
                                </div>
                            </div>
                            <div className="mt-8 grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Training Type</label>
                                    <select {...register('trainingType')} className="input-field bg-white">
                                        <option value="">Select</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Solar">Solar</option>
                                    </select>
                                    {errors.trainingType && <p className="mt-1 text-sm text-danger">{errors.trainingType.message}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Duration (months)</label>
                                    <select {...register('trainingDuration')} className="input-field bg-white">
                                        <option value="">Select</option>
                                        <option value="4">4 months</option>
                                        <option value="8">8 months</option>
                                        <option value="12">12 months</option>
                                    </select>
                                    {errors.trainingDuration && (
                                        <p className="mt-1 text-sm text-danger">{errors.trainingDuration.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-10 border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900">Guarantor Information</h3>
                                <p className="mt-1 text-sm text-gray-600">A responsible contact to validate your application.</p>
                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-medium text-gray-700">Guarantor Full Name</label>
                                        <input {...register('guarantor.fullName')} className="input-field bg-white" />
                                        {errors.guarantor?.fullName && (
                                            <p className="mt-1 text-sm text-danger">{errors.guarantor.fullName.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-medium text-gray-700">Guarantor Email</label>
                                        <input {...register('guarantor.email')} className="input-field bg-white" />
                                        {errors.guarantor?.email && (
                                            <p className="mt-1 text-sm text-danger">{errors.guarantor.email.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-medium text-gray-700">Guarantor Phone</label>
                                        <input {...register('guarantor.phone')} className="input-field bg-white" />
                                        {errors.guarantor?.phone && (
                                            <p className="mt-1 text-sm text-danger">{errors.guarantor.phone.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-medium text-gray-700">Guarantor Photo</label>
                                        <div className="flex items-center gap-3">
                                            <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                                {uploadingGuarantorPhoto ? 'Uploading…' : 'Choose file'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={guarantorRef}
                                                    disabled={uploadingGuarantorPhoto || isSubmitting}
                                                    onChange={(e) => handleUpload(e, 'guarantor.photo', setGuarantorFileLabel)}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-xs text-gray-500">Max 3MB • JPG/PNG</span>
                                        </div>
                                        {guarantorFileLabel && (
                                            <p className="mt-1 text-xs text-gray-600 truncate" title={guarantorFileLabel} aria-live="polite">
                                                {guarantorFileLabel}
                                            </p>
                                        )}
                                        {errors.guarantor?.photo && (
                                            <p className="mt-1 text-sm text-danger">{errors.guarantor.photo.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isUploading}
                                    className="w-full rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Submitting…' : 'Submit Registration'}
                                </button>
                                <p className="mt-2 text-center text-xs text-gray-500">Your details will be verified by our Admin after payment confirmation.</p>
                            </div>
                        </form>
                        <aside className="md:sticky md:top-6 h-fit rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-black/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Tuition Summary</h3>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">60/40 plan</span>
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Duration</span>
                                    <span className="font-medium text-gray-900">{duration ? `${duration} months` : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Tuition</span>
                                    <span className="font-medium text-gray-900">{tuition ? fmt(tuition) : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">60% (now)</span>
                                    <span className="font-medium text-gray-900">{sixty ? fmt(sixty) : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">40% (before graduation)</span>
                                    <span className="font-medium text-gray-900">{forty ? fmt(forty) : '-'}</span>
                                </div>
                            </div>
                            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 ring-1 ring-gray-100">
                                <p className="font-medium text-gray-900">What happens next?</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>You’ll be redirected to WhatsApp to request payment details.</li>
                                    <li>After payment, our team confirms your enrollment.</li>
                                    <li>Bring your ID and receipt on your first day.</li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
