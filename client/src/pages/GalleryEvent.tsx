import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { useGallery, useEvents } from "@/hooks/use-content";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { SEO } from "@/components/SEO";
import type { GalleryItem, Event } from "@shared/schema";

function VideoSlide({ item, isActive }: { item: GalleryItem; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => { /* autoplay may be blocked until interaction - fine, stays paused */ });
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black" onClick={() => setMuted(m => !m)}>
      <video
        ref={videoRef}
        src={item.mediaUrl}
        className="w-full h-full object-contain"
        loop
        muted={muted}
        playsInline
      />
      <button
        onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
        className="absolute bottom-24 right-4 p-3 bg-black/50 rounded-full text-white z-10"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default function GalleryEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: items } = useGallery();
  const { data: events } = useEvents();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const event = useMemo(() => (events as Event[] | undefined)?.find(e => e.id === eventId), [events, eventId]);
  const media = useMemo(
    () => (items as GalleryItem[] | undefined)?.filter(i => i.eventId === eventId) ?? [],
    [items, eventId]
  );

  // Track which slide is currently most visible, so only that video plays
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const index = slideRefs.current.findIndex(el => el === entry.target);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: [0.6] }
    );
    slideRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [media.length]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="mb-4">Album not found.</p>
          <Link href="/gallery"><a className="underline">Back to Gallery</a></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <SEO title={event.title} description={`Photos and videos from ${event.title} at Palace of His Glory.`} path={`/gallery/${eventId}`} />

      <Link href="/gallery">
        <a className="absolute top-4 left-4 z-20 p-2 bg-black/50 rounded-full text-white">
          <ArrowLeft className="w-5 h-5" />
        </a>
      </Link>
      <div className="absolute top-4 left-16 right-4 z-20 text-white">
        <h1 className="font-serif font-bold text-lg drop-shadow-lg line-clamp-1">{event.title}</h1>
      </div>

      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {media.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => (slideRefs.current[i] = el)}
            className="relative w-full h-full snap-start flex items-center justify-center"
          >
            {item.type === "image" ? (
              <img src={item.mediaUrl} alt={item.caption || event.title} className="w-full h-full object-contain" />
            ) : (
              <VideoSlide item={item} isActive={i === activeIndex} />
            )}
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-16">
                <p className="text-white text-sm">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
        {media.length === 0 && (
          <div className="h-full w-full flex items-center justify-center text-white/60">
            No media in this album yet.
          </div>
        )}
      </div>
    </div>
  );
}
