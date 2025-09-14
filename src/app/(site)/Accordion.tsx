'use client';
import { useState } from 'react';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform ${open ? 'rotate-45' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      title: 'Electrical Installation',
      list: [
        'Understand wiring principles from basic circuits to advanced layouts',
        'Learn safe handling and use of electrical tools',
        'Practice installing circuit breakers and consumer units',
        'Perform fault-finding and electrical testing',
        'Work on live installation boards under supervision',
      ],
    },
    {
      title: 'Plumbing Systems',
      list: [
        'Learn proper pipe cutting, bending, and joining techniques',
        'Install sinks, toilets, and shower systems',
        'Understand water pressure and flow control',
        'Detect and fix leaks in domestic systems',
        'Perform routine maintenance and inspections',
      ],
    },
    {
      title: 'Solar Energy',
      list: [
        'Understand solar panel types and their applications',
        'Calculate system size based on energy needs',
        'Install panels, inverters, and batteries',
        'Apply correct safety procedures during setup',
        'Maintain and troubleshoot solar systems',
      ],
    },
    {
      title: 'Mentorship & Job Referrals',
      list: [
        'Get one-on-one career advice sessions',
        'Receive help in building a professional portfolio',
        'Prepare for interviews with mock sessions',
        'Connect with local employers and contractors',
        'Get ongoing support after graduation',
      ],
    },
    {
      title: 'Workshop-Based, Hands-On Learning',
      list: [
        'Train using real tools and industry equipment',
        'Work on simulated job site environments',
        'Gain practical experience before going on-site',
        'Develop problem-solving skills in real scenarios',
        'Learn teamwork in a workshop setting',
      ],
    },
    {
      title: 'Flexible Installment Plans',
      list: [
        'Start training without paying the full fee upfront',
        'Choose monthly or quarterly payment schedules',
        'No interest on agreed payment terms',
        'Simple and transparent payment process',
        'Get reminders for upcoming payments',
      ],
    },
    {
      title: 'Startup Guidance & Certification Prep',
      list: [
        'Learn how to price jobs competitively',
        'Get templates for quotations and invoices',
        'Understand basic business registration steps',
        'Prepare for relevant trade certification exams',
        'Learn customer relationship best practices',
      ],
    },
  ];

  const toggle = (idx: number) => setOpenIndex((p) => (p === idx ? null : idx));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-sm">
        {items.map((item, idx) => {
          const open = openIndex === idx;
          return (
            <div key={item.title} className="group">
              <button
                onClick={() => toggle(idx)}
                aria-expanded={open}
                className={[
                  'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition',
                  open ? 'bg-blue-50/70' : 'hover:bg-gray-50',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      'grid h-8 w-8 place-items-center rounded-lg text-white transition',
                      open ? 'bg-blue-600' : 'bg-blue-500 group-hover:bg-blue-600',
                    ].join(' ')}
                  >
                    <Chevron open={open} />
                  </span>
                  <span className={['font-semibold', open ? 'text-blue-900' : 'text-gray-900'].join(' ')}>
                    {item.title}
                  </span>
                </div>
                <span className={['text-sm', open ? 'text-blue-700' : 'text-gray-500'].join(' ')}>
                  {open ? 'Hide' : 'View'}
                </span>
              </button>

              <div
                className={[
                  'grid transition-[grid-template-rows] duration-300 ease-out',
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                ].join(' ')}
              >
                <div className="overflow-hidden">
                  <ul className="px-6 pb-5 pt-1 text-gray-700">
                    {item.list.map((point, i) => (
                      <li key={i} className="relative flex items-start gap-3 py-1.5">
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500/80" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {idx !== items.length - 1 && <div className="mx-5 h-px bg-gray-200" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
