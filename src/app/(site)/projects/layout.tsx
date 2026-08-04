import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore PowerTrust Energy Limited electrical, solar and plumbing projects and training work.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
