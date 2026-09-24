import { useMemo } from "react";
import { Link } from "wouter";
import { useGallery, useEvents } from "@/hooks/use-content";
import { SectionHeader } from "@/components/SectionHeader";
import { Images, PlayCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import type { GalleryItem, Event } from "@shared/schema";

export default function Gallery() {
  const { data: items, isLoading: itemsLoading } = useGallery();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const isLoading = itemsLoading || eventsLoading;

  // Group gallery items by event, then only show events that actually have media
  const albums = useMemo(() => {
    if (!items || !events) return [];
    const grouped = new Map<string, GalleryItem[]>();
    for (const item of items as GalleryItem[]) {
      const list = grouped.get(item.eventId) || [];
      list.push(item);
      grouped.set(item.eventId, list);
    }
    return Array.from(grouped.entries())
      .map(([eventId, media]) => {
        const event = (events as Event[]).find(e => e.id === eventId);
        return event ? { event, media } : null;
      })
      .filter((a): a is { event: Event; media: GalleryItem[] } => a !== null);
  }, [items, events]);

  return (
    <div className="min-h-screen bg-gray-50 pt-48 pb-16">
      <SEO
        title="Gallery"
        description="Photos and videos from Palace of His Glory International Ministries - services, programmes, and our annual convention."
        path="/gallery"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Gallery" subtitle="Moments Of Glory" />

        {isLoading && (
          <div className="text-center py-20 text-gray-400">Loading gallery...</div>
        )}

        {!isLoading && albums.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No photos or videos yet</h3>
            <p className="text-gray-500">Check back soon for moments from our services and events.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {albums.map(({ event, media }) => {
            const cover = media[0];
            return (
              <Link key={event.id} href={`/gallery/${event.id}`}>
                <a className="group block rounded-2xl overflow-hidden shadow-md bg-black relative aspect-[3/4]">
                  {cover.type === "image" ? (
                    <img src={cover.mediaUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <video src={cover.mediaUrl} className="w-full h-full object-cover" muted />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-white text-xs font-medium">
                    <Images className="w-3.5 h-3.5" /> {media.length}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-serif font-bold text-lg leading-tight line-clamp-2">{event.title}</h3>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
