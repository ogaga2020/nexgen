import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Registration',
  description: 'Apply for practical electrical, solar or plumbing training with PowerTrust Energy Limited.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
