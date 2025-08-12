'use client';

import React from 'react';

const PHONE_E164 = '2348039375634';
const DEFAULT_TEXT = 'Hi NexGen, I\'d like to make an enquiry.';

export default function WhatsApp() {
  const href = `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(DEFAULT_TEXT)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label="Chat with NexGen"
      className={[
        'fixed',
        'right-[clamp(16px,env(safe-area-inset-right)+12px,28px)]',
        'bottom-[clamp(16px,env(safe-area-inset-bottom)+12px,28px)]',
        'h-14 w-14 md:h-16 md:w-16',
        'rounded-full',
        'bg-[#166FE5] text-white',
        'shadow-[0_8px_22px_rgba(0,0,0,0.18)]',
        'ring-1 ring-black/10',
        'inline-flex items-center justify-center',
        'transition-transform duration-150',
        'hover:scale-105 active:scale-95',
        'z-[2147483647]'
      ].join(' ')}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7 md:h-8 md:w-8"
        fill="currentColor"
      >
        <path d="M12 2.25c-4.832 0-8.75 3.634-8.75 8.116 0 2.403 1.16 4.556 3.02 6.002l-.61 3.05a.75.75 0 0 0 1.07.82l3.318-1.513c.633.129 1.293.197 1.952.197 4.832 0 8.75-3.634 8.75-8.116S16.832 2.25 12 2.25zm-6.25 8.116c0-3.56 3.008-6.616 6.25-6.616s6.25 3.056 6.25 6.616-3.008 6.616-6.25 6.616c-.67 0-1.335-.08-1.98-.238a.75.75 0 0 0-.48.044L7.02 17.7l.35-1.75a.75.75 0 0 0-.29-.75C6.02 14.2 5.75 12.86 5.75 10.366z" />
        <path d="M8.75 9.75c0-.414.336-.75.75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75zm0 2.75c0-.414.336-.75.75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75z" />
      </svg>
    </a>
  );
}
