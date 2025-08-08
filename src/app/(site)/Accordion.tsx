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

function Accordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      title: 'Electrical Installation',
      text:
        'Structured training from basics to advanced wiring, protection, and testing—with hands-on boards and real installation scenarios.',
    },
    {
      title: 'Plumbing Systems',
      text:
        'Pipe work, fittings, fixtures, pressure testing, leak diagnostics, and maintenance workflows used on actual jobs.',
    },
    {
      title: 'Solar Energy',
      text:
        'PV system design, sizing (panels, inverters, batteries), installation, safety, and maintenance for residential and small commercial setups.',
    },
    {
      title: 'Mentorship & Job Referrals',
      text:
        'Guided career support, interview prep, portfolio help, and connections to local opportunities after training.',
    },
    {
      title: 'Workshop-Based, Hands-On Learning',
      text:
        'Less theory, more doing—practical sessions with modern tools and equipment so you build real muscle memory.',
    },
    {
      title: 'Flexible Installment Plans',
      text:
        'Transparent pricing with installment options so you can train now and spread payments without hidden fees.',
    },
    {
      title: 'Startup Guidance & Certification Prep',
      text:
        'Help with pricing jobs, quoting, basic business setup, and exam prep so you can work confidently on your own or with a team.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="max-w-3xl mx-auto divide-y rounded-lg border">
      {items.map((item, idx) => {
        const open = openIndex === idx;
        return (
          <div
            key={item.title}
            className={`transition-colors ${open ? 'bg-blue-50' : 'bg-white'
              }`}
          >
            <button
              onClick={() => toggle(idx)}
              aria-expanded={open}
              className={`w-full text-left px-5 py-4 flex items-center justify-between gap-6 focus:outline-none focus:ring-2 focus:ring-blue-300 ${open ? 'text-blue-900' : 'text-gray-900'
                }`}
            >
              <span className="font-semibold">{item.title}</span>
              <span
                className={`h-7 w-7 flex items-center justify-center rounded-full border transition-colors ${open ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600'
                  }`}
              >
                <PlusIcon open={open} />
              </span>
            </button>

            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${open ? 'max-h-96' : 'max-h-0'
                }`}
            >
              <div className="px-5 pb-5 text-gray-700">
                {item.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
