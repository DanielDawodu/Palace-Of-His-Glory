import { useState } from "react";
import { useEvents, useComments, useCreateComment } from "@/hooks/use-content";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Video, MessageCircle, User } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema } from "@shared/schema";
import { z } from "zod";

function CommentSection({ eventId }: { eventId: number }) {
  const { data: comments } = useComments(eventId);
  const createComment = useCreateComment();
  const [isOpen, setIsOpen] = useState(false);

  // Schema for the form (excluding eventId)
  const formSchema = insertCommentSchema.omit({ eventId: true });
  interface FormValues {
    name: string;
    content: string;
  }

  // type FormValues = z.infer<typeof formSchema>;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (data: any) => {
    createComment.mutate({ ...data, eventId }, {
      onSuccess: () => {
        reset();
        setIsOpen(false);
      }
    });
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comments ({comments?.length || 0})
        </h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary text-xs hover:bg-primary/5">
              Write a comment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share your thoughts</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Your Name</label>
                <Input {...register("name")} placeholder="John Doe" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea {...register("content")} placeholder="Great message pastor!" />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>
              <Button type="submit" disabled={createComment.isPending} className="w-full">
                {createComment.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        {comments?.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="font-bold text-gray-800">{comment.name}</span>
              <span className="text-xs text-gray-400">• {new Date(comment.createdAt!).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-600">{comment.content}</p>
          </div>
        ))}
        {comments?.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-2">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  const { data: events, isLoading } = useEvents();

  // Fallback data
  const fallbackEvents = [
    {
      id: -1,
      title: "Sunday Service Live",
      description: "Join us online for our powerful Sunday service.",
      date: new Date().toISOString(),
      location: "Online & Main Sanctuary",
      isLive: true,
      videoUrl: "https://www.youtube.com/watch?v=live",
      imageUrl: null
    },
    {
      id: -2,
      title: "Special Revival Service",
      description: "A time of refreshing and impartation.",
      date: new Date(Date.now() + 86400000 * 2).toISOString(),
      location: "Main Sanctuary",
      isLive: false,
      videoUrl: null,
      imageUrl: null
    }
  ];

  const displayEvents = (isLoading || !events || events.length === 0) ? fallbackEvents : events;

  if (isLoading && !events) return <div className="min-h-screen pt-24 text-center">Loading events...</div>;


  return (
    <div className="min-h-screen bg-gray-50 pt-48 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Events & Livestreams" subtitle="Join Us Live" />

        {/* Featured / Live Now */}
        {displayEvents?.find(e => e.isLive) && (
          <div className="mb-16 bg-black rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse z-10 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span> LIVE NOW
            </div>
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              {displayEvents.find(e => e.isLive)?.videoUrl ? (
                <iframe
                  className="w-full h-full"
                  src={displayEvents.find(e => e.isLive)!.videoUrl!.includes('youtube.com') || displayEvents.find(e => e.isLive)!.videoUrl!.includes('youtu.be')
                    ? displayEvents.find(e => e.isLive)!.videoUrl!.replace('watch?v=', 'embed/').split('&')[0]
                    : displayEvents.find(e => e.isLive)!.videoUrl ?? undefined}
                  title="Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Waiting for live stream to start...</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-white">
              <h2 className="text-2xl font-bold mb-2">{displayEvents.find(e => e.isLive)?.title}</h2>
              <p className="text-gray-600">{displayEvents.find(e => e.isLive)?.description}</p>
              <CommentSection eventId={displayEvents.find(e => e.isLive)!.id} />
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayEvents?.filter(e => !e.isLive).map(event => (
            <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col">
              <div className="relative h-48 bg-gray-200">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    <Calendar className="w-12 h-12 opacity-50" />
                  </div>
                )}
                {event.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group cursor-pointer hover:bg-black/40 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-primary border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded mb-2 inline-block">
                    {event.videoUrl ? "Video Available" : "Upcoming"}
                  </span>
                  <h3 className="font-extrabold text-3xl mb-3 text-primary tracking-tight leading-tight">{event.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.date), 'PPP')}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 flex-1">
                  {event.description}
                </p>

                <CommentSection eventId={event.id} />
              </div>
            </div>
          ))}
        </div>

        {displayEvents?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No events found</h3>
            <p className="text-gray-500">Check back later for upcoming services and events.</p>
          </div>
        )}
      </div>
    </div>
  );
}
