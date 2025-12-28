import { useProgrammes } from "@/hooks/use-content";
import { SectionHeader } from "@/components/SectionHeader";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Programmes() {
  const { data: programmes } = useProgrammes();

  const weeklyProgrammes = programmes?.filter(p => p.type === 'weekly') || [];
  const specialProgrammes = programmes?.filter(p => p.type === 'special') || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
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
                      <div className="space-y-2 pt-6 border-t border-gray-100 text-sm">
                         <div className="flex justify-between">
                           <span className="text-gray-500">When:</span>
                           <span className="font-medium">{prog.day} @ {prog.time}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-gray-500">Where:</span>
                           <span className="font-medium">{prog.location || "Auditorium"}</span>
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
