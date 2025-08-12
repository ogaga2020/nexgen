'use client';
import { useState } from 'react';

function PlusIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
    >
      +
    </span>
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
        'Work on live installation boards under supervision'
      ]
    },
    {
      title: 'Plumbing Systems',
      list: [
        'Learn proper pipe cutting, bending, and joining techniques',
        'Install sinks, toilets, and shower systems',
        'Understand water pressure and flow control',
        'Detect and fix leaks in domestic systems',
        'Perform routine maintenance and inspections'
      ]
    },
    {
      title: 'Solar Energy',
      list: [
        'Understand solar panel types and their applications',
        'Calculate system size based on energy needs',
        'Install panels, inverters, and batteries',
        'Apply correct safety procedures during setup',
        'Maintain and troubleshoot solar systems'
      ]
    },
    {
      title: 'Mentorship & Job Referrals',
      list: [
        'Get one-on-one career advice sessions',
        'Receive help in building a professional portfolio',
        'Prepare for interviews with mock sessions',
        'Connect with local employers and contractors',
        'Get ongoing support after graduation'
      ]
    },
    {
      title: 'Workshop-Based, Hands-On Learning',
      list: [
        'Train using real tools and industry equipment',
        'Work on simulated job site environments',
        'Gain practical experience before going on-site',
        'Develop problem-solving skills in real scenarios',
        'Learn teamwork in a workshop setting'
      ]
    },
    {
      title: 'Flexible Installment Plans',
      list: [
        'Start training without paying the full fee upfront',
        'Choose monthly or quarterly payment schedules',
        'No interest on agreed payment terms',
        'Simple and transparent payment process',
        'Get reminders for upcoming payments'
      ]
    },
    {
      title: 'Startup Guidance & Certification Prep',
      list: [
        'Learn how to price jobs competitively',
        'Get templates for quotations and invoices',
        'Understand basic business registration steps',
        'Prepare for relevant trade certification exams',
        'Learn customer relationship best practices'
      ]
    }
  ];

  const toggle = (idx: number) => setOpenIndex((prev) => (prev === idx ? null : idx));

  return (
    <div className="max-w-3xl mx-auto divide-y rounded-lg border">
      {items.map((item, idx) => {
        const open = openIndex === idx;
        return (
          <div key={item.title} className={`transition-colors ${open ? 'bg-blue-50' : 'bg-white'}`}>
            <button
              onClick={() => toggle(idx)}
              aria-expanded={open}
              className={`w-full text-left px-5 py-4 flex items-center justify-between gap-6 focus:outline-none focus:ring-2 focus:ring-blue-300 ${open ? 'text-blue-900' : 'text-gray-900'}`}
            >
              <span className="font-semibold">{item.title}</span>
              <span
                className={`h-7 w-7 flex items-center justify-center rounded-full border transition-colors ${open ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600'}`}
              >
                <PlusIcon open={open} />
              </span>
            </button>

            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${open ? 'max-h-[500px] md:max-h-96' : 'max-h-0'
                }`}
            >
              <ul className="px-5 pb-5 text-gray-700 text-left">
                {item.list.map((point, i) => (
                  <li
                    key={i}
                    className="relative pl-6 md:pl-8 leading-relaxed"
                  >
                    <span className="absolute left-0 top-0 md:top-0">-</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
