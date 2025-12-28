import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Programmes", href: "/programmes" },
    { name: "Events", href: "/events" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-2"
          : "bg-transparent py-4 md:py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20 bg-white">
              <img
                src="/logo.jpeg"
                alt="Palace of Glory"
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback if logo doesn't load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-white">PG</div>';
                }}
              />
            </div>
            <span
              className={`font-display text-xl md:text-2xl font-bold leading-tight ${
                scrolled || location !== "/" ? "text-primary" : "text-white"
              } transition-colors`}
            >
              Palace of Glory
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-secondary ${
                  location === link.href
                    ? "text-secondary font-bold"
                    : scrolled || location !== "/"
                    ? "text-gray-700"
                    : "text-white/90"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Dashboard
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => logout.mutate()}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Logout
                </Button>
              </div>
            )}
            {!user && location !== "/login" && (
              <Link href="/login">
                <Button 
                  size="sm"
                  className="bg-secondary text-primary hover:bg-secondary/90 font-bold"
                >
                  Member Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${
                scrolled || location !== "/" ? "text-gray-800" : "text-white"
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-xl absolute top-full left-0 w-full animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-6 space-y-4 flex flex-col items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-medium ${
                  location === link.href ? "text-primary font-bold" : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
               <div className="flex flex-col items-center gap-4 w-full pt-4 border-t border-gray-100">
                 <Link href="/admin" onClick={() => setIsOpen(false)} className="text-primary font-bold">Admin Dashboard</Link>
                 <Button onClick={() => logout.mutate()} variant="outline" className="w-full">Logout</Button>
               </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                <Button className="w-full bg-primary text-white">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
