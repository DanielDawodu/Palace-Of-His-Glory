import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowRight, Calendar, MapPin, Clock } from "lucide-react";
import { useEvents } from "@/hooks/use-content";

export default function Home() {
  const { data: events } = useEvents();
  const upcomingEvents = events?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Using a high-quality church interior from Unsplash */}
          <img
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop"
            alt="Church Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-secondary/20 border border-secondary text-secondary font-bold tracking-wider text-sm mb-6 backdrop-blur-sm">
              WELCOME TO GOD'S PRESENCE
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Palace of His Glory <br />
              <span className="text-secondary italic">International Ministries</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Raising a generation of champions who enforce the kingdom of God on earth through power, purpose, and purity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/about">
                <Button size="lg" className="bg-secondary text-primary hover:bg-white hover:text-primary font-bold text-lg px-8 py-6 rounded-full">
                  I'm New Here
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold text-lg px-8 py-6 rounded-full bg-transparent">
                  Watch Live
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent mx-auto" />
          <span className="text-xs uppercase tracking-widest mt-2 block">Scroll</span>
        </motion.div>
      </section>

      {/* WELCOME SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader 
                title="Welcome to the Family of Glory" 
                subtitle="About Our Church" 
                centered={false} 
              />
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Palace of His Glory, we believe that every individual has a divine destiny to fulfill. 
                We are a family-oriented ministry dedicated to teaching the undiluted word of God 
                and demonstrating His power in our generation.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you are joining us for the first time or returning, we want you to know 
                that God has a special plan for your life. Come and experience His glory!
              </p>
              <Link href="/about">
                <Button className="group bg-primary text-white hover:bg-primary/90">
                  Read More About Us 
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/20 rounded-2xl transform rotate-3" />
              <img 
                src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1548&auto=format&fit=crop" 
                alt="Worship Service" 
                className="relative rounded-xl shadow-2xl w-full h-auto aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE TIMES PARALLAX */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title="Join Us This Week" subtitle="Service Times" light={true} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { day: "Sunday", title: "Celebration Service", time: "9:00 AM", icon: Calendar },
              { day: "Wednesday", title: "Bible Study", time: "6:00 PM", icon: Clock },
              { day: "Friday (Last)", title: "Prophetic Vigil", time: "11:00 PM", icon: MapPin },
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors"
              >
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-secondary/20">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{service.day}</h3>
                <p className="text-secondary font-medium mb-1 uppercase tracking-wide text-sm">{service.title}</p>
                <p className="text-2xl font-display font-bold text-white">{service.time}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Upcoming Events" subtitle="Mark Your Calendar" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events`}>
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all h-full flex flex-col cursor-pointer">
                    <div className="relative h-48 overflow-hidden bg-primary/10">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                          <Calendar className="w-12 h-12 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-1 shadow-md font-bold text-primary text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{event.description}</p>
                      <span className="text-secondary font-bold text-sm flex items-center">
                        View Details <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                <p className="text-gray-500">No upcoming events scheduled at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/events">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <img 
            src="https://pixabay.com/get/gc80cbfe23e420b13e3e34298e16f968c6ebe92455f2dd9d3dbd01cd3b4629a12119fb3b3ed0b30e651b540e17b18869cc81ed4beb4083fe0e2920a145e476b2f_1280.jpg" 
            alt="Prayer" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Need Prayer or Counseling?
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Our pastors and ministers are available to stand with you in prayer. 
            God answers prayers, and He cares about your situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8">
                Send Prayer Request
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-bold px-8 bg-transparent">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
