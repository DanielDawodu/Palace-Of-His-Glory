import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function Contact() {
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<ContactForm>();

  const onSubmit = (data: ContactForm) => {
    // In a real app, this would send to an API
    console.log("Form data:", data);
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We will get back to you shortly.",
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-white pt-48 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Contact Us" subtitle="Get in Touch" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <div className="bg-primary text-white rounded-2xl p-10 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

              <h3 className="font-display text-3xl font-bold mb-8 relative z-10">Ministry Information</h3>

              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-secondary">Visit Us</h4>
                    <p className="text-gray-200 leading-relaxed">
                      7, Alhaji Kujebe Street,<br />
                      Off Asafa Elereku, Degun,<br />
                      Ijebu-Ode, Ogun State
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-secondary">Call Us</h4>
                    <p className="text-gray-200">
                      +234 800 123 4567<br />
                      +234 800 987 6543
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-secondary">Email Us</h4>
                    <p className="text-gray-200">
                      info@palaceofglory.org<br />
                      prayer@palaceofglory.org
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 h-64 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center">
              <p className="text-gray-400 font-medium">Google Map Embed Placeholder</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-10 border border-gray-100">
            <h3 className="font-display text-3xl font-bold mb-6 text-gray-900">Send us a Message</h3>
            <p className="text-gray-600 mb-8">
              Have a question, testimony, or prayer request? Fill out the form below
              and our team will be in touch with you.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <Input {...register("name", { required: true })} placeholder="John Doe" className="bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <Input {...register("email", { required: true })} type="email" placeholder="john@example.com" className="bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Input {...register("subject", { required: true })} placeholder="Prayer Request / Inquiry" className="bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <Textarea {...register("message", { required: true })} placeholder="How can we help you?" className="bg-white min-h-[150px]" />
              </div>

              <Button type="submit" size="lg" className="w-full bg-secondary text-primary hover:bg-secondary/90 font-bold">
                Send Message <Send className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
