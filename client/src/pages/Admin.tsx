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
import { useEvents, useCreateEvent, useDeleteEvent, useProgrammes, useCreateProgramme, useDeleteProgramme } from "@/hooks/use-content";
import { Plus, Trash2, Calendar, List } from "lucide-react";
import { useForm } from "react-hook-form";

// Admin Page Components
function EventsManager() {
  const { data: events } = useEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

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
                <Label>Image URL (Optional)</Label>
                <Input {...register("imageUrl")} placeholder="https://..." />
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
          <div key={event.id} className="p-4 border-b flex justify-between items-center last:border-0">
            <div>
              <p className="font-bold">{event.title}</p>
              <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if(confirm("Are you sure?")) deleteEvent.mutate(event.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
                if(confirm("Are you sure?")) deleteProg.mutate(prog.id);
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

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.username}</p>
          </div>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Events & News
            </TabsTrigger>
            <TabsTrigger value="programmes" className="flex items-center gap-2">
              <List className="w-4 h-4" /> Programmes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsManager />
          </TabsContent>
          <TabsContent value="programmes">
            <ProgrammesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
