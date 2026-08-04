'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { FiArrowLeft, FiArrowRight, FiMaximize2, FiPlay, FiX } from 'react-icons/fi';

type Category = 'all' | 'electric' | 'solar' | 'plumbing';
type ProjectCategory = Exclude<Category, 'all'>;
type MediaItem = { url: string; type: 'image' | 'video'; category: ProjectCategory; createdAt?: string };

const PAGE_SIZE = 12;
const tabs: { key: Category; label: string }[] = [
  { key: 'all', label: 'All projects' },
  { key: 'electric', label: 'Electrical' },
  { key: 'solar', label: 'Solar' },
  { key: 'plumbing', label: 'Plumbing' },
];
const ratios = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[16/10]', 'aspect-[5/6]'];

function categoryLabel(category: ProjectCategory) {
  return category === 'electric' ? 'Electrical' : category[0].toUpperCase() + category.slice(1);
}

function videoPoster(url: string) {
  const [path, query] = url.split('?');
  const transformed = path
    .replace('/video/upload/', '/video/upload/so_0,q_auto,f_jpg/')
    .replace(/\.[^/.]+$/, '.jpg');
  return query ? `${transformed}?${query}` : transformed;
}

export default function ProjectsPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<MediaItem[]>('/api/gallery', { params: { t: Date.now() } });
        if (mounted) setMedia(data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(
    () => media
      .slice()
      .sort((a, b) => +(new Date(b.createdAt || 0)) - +(new Date(a.createdAt || 0)))
      .filter((item) => active === 'all' || item.category === active),
    [media, active]
  );
  const visible = filtered.slice(0, visibleCount);
  const viewer = viewerIndex >= 0 ? filtered[viewerIndex] : null;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setViewerIndex(-1);
  }, [active]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= filtered.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
      },
      { rootMargin: '500px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  useEffect(() => {
    if (!viewer) return;
    document.body.style.overflow = 'hidden';
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewerIndex(-1);
      if (event.key === 'ArrowLeft') setViewerIndex((index) => index > 0 ? index - 1 : filtered.length - 1);
      if (event.key === 'ArrowRight') setViewerIndex((index) => index < filtered.length - 1 ? index + 1 : 0);
    };
    window.addEventListener('keydown', closeWithEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, [viewer, filtered.length]);

  const moveViewer = (direction: -1 | 1) => {
    setViewerIndex((index) => {
      if (direction === -1) return index > 0 ? index - 1 : filtered.length - 1;
      return index < filtered.length - 1 ? index + 1 : 0;
    });
  };

  return (
    <main className="bg-[#f2f6fa]">
      <section className="relative overflow-hidden bg-[#061a33] py-20 text-white md:py-28">
        <div className="absolute inset-0 brand-grid opacity-70" />
        <div className="absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border-[75px] border-[#0876d1]/15" />
        <div className="site-shell relative grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-extrabold uppercase tracking-[.17em] text-[#8bd338]">PowerTrust projects</span>
            <h1 className="display-title mt-6 max-w-3xl text-3xl md:text-5xl">Built work.<br />Real-world results.</h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-slate-300 lg:justify-self-end">Explore electrical, solar and plumbing installations alongside practical moments from our technical training.</p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="site-shell">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[.68rem] font-extrabold uppercase tracking-[.18em] text-[#0876d1]">Project stream</span>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071b35]">See how the work comes together.</h2>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project categories">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active === tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`rounded-full px-4 py-2.5 text-xs font-extrabold transition ${active === tab.key ? 'bg-[#071b35] text-white shadow-lg' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#0876d1] hover:text-[#0876d1]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {Array.from({ length: 10 }).map((_, index) => <div key={index} className={`${ratios[index % ratios.length]} mb-4 break-inside-avoid animate-pulse rounded-[1.25rem] bg-slate-200`} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white py-24 text-center">
              <strong className="text-xl text-[#071b35]">No projects in this view yet.</strong>
              <p className="mt-2 text-sm text-slate-500">Choose another category or check back soon.</p>
            </div>
          ) : (
            <>
              <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                {visible.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.url}-${index}`}
                    onClick={() => setViewerIndex(index)}
                    aria-label={`Open ${categoryLabel(item.category)} ${item.type}`}
                    className={`group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[1.25rem] bg-[#071b35] text-left shadow-[0_10px_35px_rgba(6,26,51,.1)] ${ratios[index % ratios.length]}`}
                  >
                    {item.type === 'video' ? (
                      <img src={videoPoster(item.url)} alt={`${categoryLabel(item.category)} project video preview`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <img src={item.url} alt={`${categoryLabel(item.category)} project by PowerTrust Energy Limited`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-[#061a33]/85 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[.62rem] font-extrabold uppercase tracking-wider text-[#071b35] backdrop-blur">{categoryLabel(item.category)}</span>
                    <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#071b35] opacity-0 shadow-lg transition group-hover:opacity-100"><FiMaximize2 /></span>
                    {item.type === 'video' && <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-lg text-[#071b35] shadow-xl"><FiPlay className="ml-0.5" /></span>}
                  </button>
                ))}
              </div>

              <div ref={loadMoreRef} className="grid min-h-20 place-items-center">
                {visibleCount < filtered.length ? <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0876d1]" aria-label="Loading more projects" /> : <span className="text-[.65rem] font-extrabold uppercase tracking-[.18em] text-slate-400">You have reached the end</span>}
              </div>
            </>
          )}
        </div>
      </section>

      {viewer && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#020914]/95 p-3 backdrop-blur-md md:p-8" onClick={() => setViewerIndex(-1)} role="dialog" aria-modal="true" aria-label="Project viewer">
          <div className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.4rem] bg-[#081a2d] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white md:px-6">
              <div><span className="text-[.62rem] font-extrabold uppercase tracking-[.16em] text-[#8bd338]">{categoryLabel(viewer.category)}</span><p className="mt-1 text-xs text-slate-400">{viewer.type === 'video' ? 'Project video' : 'Project photograph'}</p></div>
              <button type="button" onClick={() => setViewerIndex(-1)} aria-label="Close project viewer" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white hover:text-[#071b35]"><FiX /></button>
            </div>
            <div className="relative grid min-h-0 flex-1 place-items-center bg-black/30">
              {viewer.type === 'image' ? <img src={viewer.url} alt="PowerTrust project enlarged" className="max-h-full max-w-full object-contain" /> : <video key={viewer.url} src={viewer.url} controls autoPlay playsInline className="max-h-full max-w-full object-contain" />}
              {filtered.length > 1 && (
                <>
                  <button type="button" onClick={() => moveViewer(-1)} aria-label="Previous project" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#071b35] shadow-lg transition hover:bg-[#65bd00] md:left-5"><FiArrowLeft /></button>
                  <button type="button" onClick={() => moveViewer(1)} aria-label="Next project" className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#071b35] shadow-lg transition hover:bg-[#65bd00] md:right-5"><FiArrowRight /></button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
