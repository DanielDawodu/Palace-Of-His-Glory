import { Link } from "wouter";
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20 bg-white">
                <img
                  src="/logo.jpeg"
                  alt="Palace of Glory"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-display text-xl font-bold leading-none text-secondary">
                Palace of Glory<br />
                <span className="text-sm font-sans text-white/80 font-normal">International Ministries</span>
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Raising a people of power, purpose, and passion for God's glory. Join us as we worship in the beauty of His holiness.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-white hover:text-secondary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-white hover:text-secondary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-white hover:text-secondary transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-6 text-secondary">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">About Us</Link></li>
              <li><Link href="/programmes" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">Weekly Programmes</Link></li>
              <li><Link href="/events" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">Upcoming Events</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-6 text-secondary">Service Times</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex justify-between">
                <span>Sunday Service</span>
                <span className="text-white font-medium">9:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Bible Study (Tue)</span>
                <span className="text-white font-medium">5:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Hour Of Glorification (Wed)</span>
                <span className="text-white font-medium">5:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-6 text-secondary">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>7, Alhaji Kujebe Street, Off Asafa Elereku, Degun, Ijebu-Ode, Ogun State</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                <span>info@palaceofglory.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Palace of His Glory International Ministries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
