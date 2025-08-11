'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type NoticeType = 'success' | 'error' | 'info';
type Ctx = {
  notify: (type: NoticeType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const NotifierContext = createContext<Ctx>({
  notify: () => { },
  success: () => { },
  error: () => { },
  info: () => { },
});

export function useNotifier() {
  return useContext(NotifierContext);
}

export default function NotifierProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<NoticeType>('info');
  const [message, setMessage] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((t: NoticeType, m: string) => {
    setType(t);
    setMessage(m);
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 5000);
  }, []);

  const success = useCallback((m: string) => notify('success', m), [notify]);
  const error = useCallback((m: string) => notify('error', m), [notify]);
  const info = useCallback((m: string) => notify('info', m), [notify]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const color =
    type === 'success' ? 'bg-green-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
        'bg-blue-600 text-white';

  return (
    <NotifierContext.Provider value={{ notify, success, error, info }}>
      <div className="fixed top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className={`transition-transform duration-300 ${open ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className={`px-4 py-3 text-sm font-medium shadow-md ${color} pointer-events-auto`}>
            {message}
          </div>
        </div>
      </div>
      {children}
    </NotifierContext.Provider>
  );
}
