import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvents, useCreateEvent, useUpdateEventLive, useDeleteEvent, useProgrammes, useCreateProgramme, useDeleteProgramme, useStaff, useCreateStaff, useDeleteStaff, useDepartments, useCreateDepartment, useDeleteDepartment, useRegistrations, useAdmins, useGallery, useCreateGalleryItem, useDeleteGalleryItem } from "@/hooks/use-content";
import { Plus, Trash2, Calendar, List, Users, Landmark, Radio, Heart, UserPlus, Images, Video as VideoIcon, Youtube } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { ImageUpload } from "@/components/ImageUpload";
import { MediaUpload } from "@/components/MediaUpload";
import { Switch } from "@/components/ui/switch";
import { Helmet } from "react-helmet-async";
import { isYouTubeUrl } from "@/lib/youtube";

// Admin Page Components
function EventsManager() {
  const { data: events } = useEvents();
  const createEvent = useCreateEvent();
  const updateEventLive = useUpdateEventLive();
  const deleteEvent = useDeleteEvent();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, control } = useForm();

  const onSubmit = (data: any) => {
    createEvent.mutate({ ...data, date: new Date(data.date) }, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Events</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Event</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input {...register("title", { required: true })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register("description", { required: true })} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="datetime-local" {...register("date", { required: true })} />
              </div>
              <div>
                <Label>Event Image</Label>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div>
                <Label>Video URL / Live Stream URL</Label>
                <Input {...register("videoUrl")} placeholder="YouTube or streaming link" />
              </div>
              <Button type="submit" className="w-full" disabled={createEvent.isPending}>
                {createEvent.isPending ? "Creating..." : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {events?.map(event => (
          <div key={event.id} className="p-4 border-b flex justify-between items-center last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-extrabold text-xl text-primary">{event.title}</p>
                <p className="text-sm text-gray-500 font-medium">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${event.isLive ? "text-red-500 animate-pulse" : "text-gray-400"}`} />
                <span className="text-sm font-medium">Live</span>
                <Switch
                  checked={event.isLive ?? false}
                  onCheckedChange={(checked) => {
                    updateEventLive.mutate({ id: event.id, isLive: checked, videoUrl: event.videoUrl ?? undefined });
                  }}
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure?")) deleteEvent.mutate(event.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {events?.length === 0 && <p className="p-4 text-center text-gray-500">No events found.</p>}
      </div>
    </div>
  );
}

function ProgrammesManager() {
  const { data: programmes } = useProgrammes();
  const createProg = useCreateProgramme();
  const deleteProg = useDeleteProgramme();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = (data: any) => {
    createProg.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Programmes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Programme</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Programme</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input {...register("title", { required: true })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register("description", { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select onValueChange={(val) => setValue("type", val)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Day</Label>
                  <Input {...register("day")} placeholder="e.g. Sunday" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time</Label>
                  <Input {...register("time")} placeholder="e.g. 9:00 AM" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input {...register("location")} placeholder="Main Hall" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createProg.isPending}>
                {createProg.isPending ? "Creating..." : "Create Programme"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {programmes?.map(prog => (
          <div key={prog.id} className="p-4 border-b flex justify-between items-center last:border-0">
            <div>
              <p className="font-bold">{prog.title} <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">{prog.type}</span></p>
              <p className="text-sm text-gray-500">{prog.day} at {prog.time}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure?")) deleteProg.mutate(prog.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffManager() {
  const { data: staff } = useStaff();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, control } = useForm();

  const onSubmit = (data: any) => {
    createStaff.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Staff & Leadership</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Staff Member</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input {...register("name", { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Input {...register("role", { required: true })} placeholder="e.g. Pastor" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select onValueChange={(val) => setValue("category", val)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pastor">Pastor</SelectItem>
                      <SelectItem value="deacon">Deacon</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea {...register("bio")} />
              </div>
              <div>
                <Label>Staff Photo</Label>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createStaff.isPending}>
                {createStaff.isPending ? "Creating..." : "Add Staff Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {staff?.map(member => (
          <div key={member.id} className="p-4 border-b flex justify-between items-center last:border-0">
            <div className="flex items-center gap-4">
              {member.imageUrl && <img src={member.imageUrl} className="w-10 h-10 rounded-full object-cover" />}
              <div>
                <p className="font-bold">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure?")) deleteStaff.mutate(member.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryManager() {
  const { data: items } = useGallery();
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();
  const [open, setOpen] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [videoSource, setVideoSource] = useState<"upload" | "youtube">("upload");
  const { register, handleSubmit, reset, control, watch, setValue } = useForm({
    defaultValues: { type: "image", mediaUrl: "", caption: "", eventTag: "" }
  });

  const onSubmit = (data: any) => {
    if (!data.mediaUrl) {
      return;
    }
    createItem.mutate(
      { type: mediaType, mediaUrl: data.mediaUrl, caption: data.caption, eventTag: data.eventTag },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
          setMediaType("image");
          setVideoSource("upload");
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Gallery</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Photo/Video</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add to Gallery</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={mediaType === "image" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => { setMediaType("image"); setValue("mediaUrl", ""); }}
                  >
                    Photo
                  </Button>
                  <Button
                    type="button"
                    variant={mediaType === "video" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => { setMediaType("video"); setValue("mediaUrl", ""); }}
                  >
                    <VideoIcon className="w-4 h-4 mr-1" /> Video
                  </Button>
                </div>
              </div>

              {mediaType === "video" && (
                <div>
                  <Label>Video Source</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={videoSource === "upload" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => { setVideoSource("upload"); setValue("mediaUrl", ""); }}
                    >
                      Upload File
                    </Button>
                    <Button
                      type="button"
                      variant={videoSource === "youtube" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => { setVideoSource("youtube"); setValue("mediaUrl", ""); }}
                    >
                      <Youtube className="w-4 h-4 mr-1" /> YouTube Link
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label>{mediaType === "image" ? "Photo" : videoSource === "upload" ? "Video File" : "YouTube URL"}</Label>
                {mediaType === "video" && videoSource === "youtube" ? (
                  <Input
                    {...register("mediaUrl", { required: true })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                ) : (
                  <Controller
                    name="mediaUrl"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <MediaUpload value={field.value} mediaType={mediaType} onChange={field.onChange} />
                    )}
                  />
                )}
              </div>

              <div>
                <Label>Caption (optional)</Label>
                <Input {...register("caption")} placeholder="e.g. Sunday Service, September 2026" />
              </div>

              <div>
                <Label>Event Tag (optional)</Label>
                <Input {...register("eventTag")} placeholder="e.g. 2026 Annual Convention" />
              </div>

              <Button type="submit" className="w-full" disabled={createItem.isPending || !watch("mediaUrl")}>
                {createItem.isPending ? "Adding..." : "Add to Gallery"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items?.map((item: any) => (
          <div key={item.id} className="relative rounded-lg overflow-hidden shadow bg-black group aspect-square">
            {item.type === "image" ? (
              <img src={item.mediaUrl} className="w-full h-full object-cover" />
            ) : isYouTubeUrl(item.mediaUrl) ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Youtube className="w-10 h-10 text-white/70" />
              </div>
            ) : (
              <video src={item.mediaUrl} className="w-full h-full object-cover" muted />
            )}
            <button
              onClick={() => {
                if (confirm("Delete this item?")) deleteItem.mutate(item.id);
              }}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white text-xs line-clamp-1">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
        {items?.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-8">No gallery items yet.</p>
        )}
      </div>
    </div>
  );
}

function DepartmentManager() {
  const { data: departments } = useDepartments();
  const createDept = useCreateDepartment();
  const deleteDept = useDeleteDepartment();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, control } = useForm();

  const onSubmit = (data: any) => {
    createDept.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Departments</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Department Name</Label>
                <Input {...register("name", { required: true })} />
              </div>
              <div>
                <Label>Leader</Label>
                <Input {...register("leader", { required: true })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register("description")} />
              </div>
              <div>
                <Label>Department Image</Label>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createDept.isPending}>
                {createDept.isPending ? "Creating..." : "Add Department"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {departments?.map(dept => (
          <div key={dept.id} className="p-4 border-b flex justify-between items-center last:border-0">
            <div>
              <p className="font-bold">{dept.name}</p>
              <p className="text-sm text-gray-500">Leader: {dept.leader}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegistrationsManager({ data: registrations }: { data: any[] | undefined }) {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">New Member Registrations</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {registrations?.map(reg => (
          <div key={reg.id} className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center last:border-0 hover:bg-gray-50 transition-colors gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="w-6 h-6 fill-primary/20" />
              </div>
              <div>
                <p className="font-bold text-lg">{reg.fullName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1 font-medium text-gray-700">{reg.phone}</span>
                  <span className="flex items-center gap-1">{reg.email}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-grow md:flex-grow-0">
              <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg border border-gray-200">{reg.address}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">{new Date(reg.createdAt!).toLocaleDateString()} {new Date(reg.createdAt!).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {registrations?.length === 0 && <p className="p-8 text-center text-gray-500 italic">No registrations yet. New members will appear here.</p>}
      </div>
    </div>
  );
}


function AdminsManager() {
  const { data: admins } = useAdmins();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { toast } = useToast();

  const queryClient = useQueryClient();

  // We'll use a local mutation since this is a one-off admin feature
  const createAdminMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/create", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "New admin created successfully" });
      setOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const onSubmit = (data: any) => {
    createAdminMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Admins</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add New Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Admin User</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input {...register("username", { required: true })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" {...register("email", { required: true })} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" {...register("password", { required: true, minLength: 6 })} />
              </div>
              <Button type="submit" className="w-full" disabled={createAdminMutation.isPending}>
                {createAdminMutation.isPending ? "Creating..." : "Create Admin"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Existing Admins ({admins?.length || 0})</h3>
        </div>
        {admins?.map((admin: any) => (
          <div key={admin.id} className="p-4 border-b flex justify-between items-center last:border-0 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {admin.username}
                {admin.isAdmin && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">Super Admin</span>}
              </p>
              <p className="text-sm text-gray-500">{admin.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Created: {new Date(admin.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {admins?.length === 0 && <p className="p-8 text-center text-gray-500">No admins found.</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: registrations } = useRegistrations();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-48 pb-12">
      <Helmet>
        <title>Admin Dashboard | Palace of His Glory</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center mt-12 md:mt-20">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.username}</p>
          </div>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Events
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Images className="w-4 h-4" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="programmes" className="flex items-center gap-2">
              <List className="w-4 h-4" /> Programmes
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Staff
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Landmark className="w-4 h-4" /> Departments
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2 relative">
              <Heart className="w-4 h-4 text-red-500" />
              New Members
              {!!registrations?.length && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white font-bold">
                  {registrations.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Admins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsManager />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>
          <TabsContent value="programmes">
            <ProgrammesManager />
          </TabsContent>
          <TabsContent value="staff">
            <StaffManager />
          </TabsContent>
          <TabsContent value="departments">
            <DepartmentManager />
          </TabsContent>
          <TabsContent value="registrations">
            <RegistrationsManager data={registrations} />
          </TabsContent>
          <TabsContent value="admins">
            <AdminsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
