import { useState } from "react";
import { useGallery } from "@/hooks/use-content";
import { SectionHeader } from "@/components/SectionHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Images, PlayCircle } from "lucide-react";
import { toEmbeddableVideoUrl, isYouTubeUrl } from "@/lib/youtube";
import { SEO } from "@/components/SEO";
import type { GalleryItem } from "@shared/schema";

export default function Gallery() {
  const { data: items, isLoading } = useGallery();
  const [selected, setSelected] = useState<GalleryItem | null>(null);

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

        {!isLoading && items?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No photos or videos yet</h3>
            <p className="text-gray-500">Check back soon for moments from our services and events.</p>
          </div>
        )}

        {/* Masonry layout - each item keeps its natural size/shape, no cropping */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          {items?.map((item: GalleryItem) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="relative block w-full mb-4 break-inside-avoid rounded-xl overflow-hidden shadow-md bg-black group"
            >
              {item.type === "image" ? (
                <img src={item.mediaUrl} alt={item.caption || "Gallery photo"} className="w-full h-auto block" />
              ) : (
                <div className="relative">
                  {isYouTubeUrl(item.mediaUrl) ? (
                    // YouTube thumbnail fallback: show a dark placeholder with play icon
                    // since we don't have a direct thumbnail URL without an extra API call.
                    <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white/80" />
                    </div>
                  ) : (
                    <video src={item.mediaUrl} className="w-full h-auto block" muted />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium line-clamp-2">{item.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selected?.caption && (
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>{selected.caption}</DialogTitle>
            </DialogHeader>
          )}
          {selected && (
            <div className="bg-black flex items-center justify-center">
              {selected.type === "image" ? (
                <img src={selected.mediaUrl} alt={selected.caption || "Gallery photo"} className="w-full h-auto max-h-[80vh] object-contain" />
              ) : isYouTubeUrl(selected.mediaUrl) ? (
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full"
                    src={toEmbeddableVideoUrl(selected.mediaUrl)}
                    title={selected.caption || "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <video src={selected.mediaUrl} className="w-full max-h-[80vh]" controls autoPlay />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
