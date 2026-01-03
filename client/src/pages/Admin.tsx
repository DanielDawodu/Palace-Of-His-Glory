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
import { useEvents, useCreateEvent, useUpdateEventLive, useDeleteEvent, useProgrammes, useCreateProgramme, useDeleteProgramme, useStaff, useCreateStaff, useDepartments, useCreateDepartment, useRegistrations } from "@/hooks/use-content";
import { Plus, Trash2, Calendar, List, Users, Landmark, Radio, Heart } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { ImageUpload } from "@/components/ImageUpload";
import { Switch } from "@/components/ui/switch";

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
                  checked={event.isLive}
                  onCheckedChange={(checked) => {
                    updateEventLive.mutate({ id: event.id, isLive: checked, videoUrl: event.videoUrl });
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
          </div>
        ))}
      </div>
    </div>
  );
}

function DepartmentManager() {
  const { data: departments } = useDepartments();
  const createDept = useCreateDepartment();
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center mt-12 md:mt-20">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.username}</p>
          </div>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Events
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
              Registrations
              {!!registrations?.length && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white font-bold">
                  {registrations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsManager />
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
        </Tabs>
      </div>
    </div>
  );
}
