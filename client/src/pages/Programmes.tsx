import { useProgrammes } from "@/hooks/use-content";
import { SectionHeader } from "@/components/SectionHeader";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Programmes() {
  const { data: programmes, isError, error } = useProgrammes();


  // Fallback data matches server/routes.ts seeds
  const fallbackProgrammes = [
    {
      id: -1,
      title: "Worker's Meeting",
      description: "Preparation for service.",
      type: "weekly",
      day: "Sunday",
      time: "8:00 AM",
      location: "Main Auditorium"
    },
    {
      id: -2,
      title: "Sunday Service",
      description: "Join us for a time of worship and word.",
      type: "weekly",
      day: "Sunday",
      time: "9:00 AM",
      location: "Main Auditorium"
    },
    {
      id: -3,
      title: "Bible Study",
      description: "Digging deep into the scriptures.",
      type: "weekly",
      day: "Tuesday",
      time: "5:30 PM",
      location: "Main Auditorium"
    },
    {
      id: -4,
      title: "Hour Of Glorification",
      description: "Revival Sessions.",
      type: "weekly",
      day: "Wednesday",
      time: "5:00 PM",
      location: "Main Auditorium"
    },
    {
      id: -5,
      title: "Night of Destiny",
      description: "A powerful night of prophetic prayers and divine encounters.",
      type: "special",
      day: "Every last Friday of the Month",
      time: "11:00 PM",
      location: "Main Sanctuary"
    },
    {
      id: -6,
      title: "Romilowo",
      description: "Every 2nd Saturday of the Month Prayer and sacrifice.",
      type: "special",
      day: "Every 2nd Saturday of the Month",
      time: "5:30 AM - 7:00 AM",
      location: "Main Sanctuary"
    },
    {
      id: -7,
      title: "Youth Summit",
      description: "Empowering the next generation for kingdom impact.",
      type: "special",
      day: "Every 1st Tuesday of the Month",
      time: "5:30 PM",
      location: "Youth Hall"
    },
    {
      id: -8,
      title: "Hosannah Service",
      description: "A special service of praise and victory.",
      type: "special",
      day: "Every 1st Sunday of the Month",
      time: "9:00 AM",
      location: "Main Sanctuary"
    },
    {
      id: -9,
      title: "Impartation Service",
      description: "Divine empowerment and mantle for the week ahead.",
      type: "special",
      day: "Every last Sunday of the Month",
      time: "7:30 AM",
      location: "Main Sanctuary"
    }
  ];

  const displayProgrammes = (isError || !programmes || programmes.length === 0) ? fallbackProgrammes : programmes;


  const weeklyProgrammes = displayProgrammes.filter(p => p.type === 'weekly') || [];
  const specialProgrammes = displayProgrammes.filter(p => p.type === 'special') || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-48 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Programmes" subtitle="Gathering of Saints" />

        <Tabs defaultValue="weekly" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-white p-1 rounded-full shadow-sm border border-gray-200">
              <TabsTrigger value="weekly" className="rounded-full px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                Weekly Services
              </TabsTrigger>
              <TabsTrigger value="special" className="rounded-full px-8 py-2 data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                Special Programmes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {weeklyProgrammes.length > 0 ? (
                weeklyProgrammes.map(prog => (
                  <div key={prog.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-primary/5 rounded-2xl flex flex-col items-center justify-center text-primary border border-primary/10">
                      <span className="text-xs font-bold uppercase tracking-wider">{prog.day?.substring(0, 3)}</span>
                      <span className="font-display text-2xl font-bold">{prog.time?.split(':')[0]}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-gray-900">{prog.title}</h3>
                      <p className="text-gray-600 mb-4">{prog.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-secondary" /> {prog.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-secondary" /> {prog.location || "Main Sanctuary"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-500">Weekly programmes list is being updated.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="special">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {specialProgrammes.length > 0 ? (
                specialProgrammes.map(prog => (
                  <div key={prog.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group">
                    <div className="h-3 bg-secondary"></div>
                    <div className="p-8">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
                        Upcoming Special
                      </span>
                      <h3 className="font-display text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{prog.title}</h3>
                      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        {prog.description}
                      </p>
                      <div className="space-y-4 pt-6 border-t border-gray-100 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1 font-bold uppercase text-[10px] tracking-widest">When</p>
                          <p className="font-medium text-gray-900">{prog.day}</p>
                          <p className="text-primary font-bold">{prog.time}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1 font-bold uppercase text-[10px] tracking-widest">Where</p>
                          <p className="font-medium text-gray-900">{prog.location || "Auditorium"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No special programmes scheduled at this time.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
