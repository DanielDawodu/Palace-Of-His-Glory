import { useStaff, useDepartments } from "@/hooks/use-content";
import { SectionHeader } from "@/components/SectionHeader";
import { Users, Music, Star, BookHeart } from "lucide-react";

export default function About() {
  const { data: staffList } = useStaff();
  const { data: departments } = useDepartments();

  // Categorize staff
  const leadPastor = staffList?.find(s => s.isLead);
  const otherPastors = staffList?.filter(s => s.category === 'pastor' && !s.isLead) || [];
  const leadership = staffList?.filter(s => s.category !== 'pastor') || [];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HERO */}
        <div className="text-center mb-16">
          <SectionHeader title="Who We Are" subtitle="About Palace of Glory" />
          <div className="max-w-3xl mx-auto text-lg text-gray-600 space-y-6">
            <p>
              Palace of His Glory International Ministries is a dynamic, word-based, and spirit-filled church
              with a mandate to raise a people of power, purpose, and passion.
            </p>
            <p>
              Founded on the solid rock of Christ, we are committed to teaching the undiluted word of God,
              engaging in fervent prayer, and demonstrating the love of Christ to our community and the world at large.
            </p>
          </div>
        </div>

        {/* MISSION & VISION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-gray-50 p-10 rounded-2xl border-l-4 border-primary">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Star className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-display text-3xl font-bold mb-4 text-primary">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To raise a generation of kingdom giants who will take their place in destiny and
              demonstrate the reality of God's power in every sphere of human endeavor.
            </p>
          </div>
          <div className="bg-gray-50 p-10 rounded-2xl border-l-4 border-secondary">
            <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <BookHeart className="text-secondary-foreground w-6 h-6" />
            </div>
            <h3 className="font-display text-3xl font-bold mb-4 text-secondary-foreground">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To preach the gospel of Jesus Christ with simplicity and power, bringing liberation
              to the oppressed and helping believers discover and fulfill their God-given purpose.
            </p>
          </div>
        </div>

        {/* LEAD PASTOR */}
        <div className="mb-24">
          <SectionHeader title="Meet Our Pastors" subtitle="Leadership" />

          {leadPastor ? (
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row mb-12">
              <div className="md:w-1/3 h-96 md:h-auto relative bg-gray-200">
                {leadPastor.imageUrl ? (
                  <img
                    src={leadPastor.imageUrl}
                    alt={leadPastor.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Users className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-secondary font-bold uppercase tracking-wide text-sm mb-2">Lead Pastor</span>
                <h3 className="font-display text-4xl font-bold mb-4 text-primary">{leadPastor.name}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {leadPastor.bio || "A visionary leader with a heart for God and people. Committed to teaching the word of God with clarity and power."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl mb-12">
              <p className="text-gray-500 italic">Lead Pastor profile coming soon.</p>
            </div>
          )}

          {/* OTHER TEAM MEMBERS */}
          {otherPastors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {otherPastors.map(pastor => (
                <div key={pastor.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="h-96 bg-gray-200 relative">
                    {pastor.imageUrl ? (
                      <img src={pastor.imageUrl} alt={pastor.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="font-display text-2xl font-bold text-gray-900 mb-1">{pastor.name}</h4>
                    <p className="text-primary font-medium text-sm mb-4">{pastor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DEPARTMENTS */}
      <div>
        <SectionHeader title="Church Ministries" subtitle="Get Involved" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments?.map(dept => (
            <div key={dept.id} className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                {dept.name.toLowerCase().includes('choir') ? <Music className="w-6 h-6" /> :
                  dept.name.toLowerCase().includes('usher') ? <Users className="w-6 h-6" /> :
                    <Star className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-bold mb-3">{dept.name}</h3>
              <p className="text-gray-600 text-sm mb-6 min-h-[60px]">
                {dept.description || "Serving God with excellence in this capacity."}
              </p>
              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Led By</p>
                <p className="font-medium text-primary">{dept.leader}</p>
              </div>
            </div>
          )) || (
              // Default if no data
              [1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-2xl p-8 h-48 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
}
