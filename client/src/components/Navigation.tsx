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
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-white/95 backdrop-blur-md shadow-md py-3"
        : "bg-transparent py-6 md:py-8"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link href="/" className="flex flex-col items-center cursor-pointer group">
            <div className={`relative transition-all duration-300 overflow-hidden rounded-full border-[4px] shadow-2xl group-hover:scale-105 ${scrolled
              ? "h-14 w-14 border-primary"
              : "h-24 w-24 md:h-32 md:w-32 border-white"
              } bg-white`}>
              <img
                src="/logo.jpeg"
                alt="Palace of Glory"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">PG</div>';
                }}
              />
            </div>
            <span
              className={`font-display font-black uppercase tracking-tight text-center transition-all duration-300 ${scrolled
                ? "text-[10px] mt-1 text-primary"
                : "text-lg md:text-2xl mt-3 " + (location === "/" ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "text-primary")
                }`}
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
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-secondary ${location === link.href
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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${scrolled || location !== "/" ? "text-gray-800" : "text-white"
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
                className={`text-lg font-medium ${location === link.href ? "text-primary font-bold" : "text-gray-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <div className="flex flex-col items-center gap-4 w-full pt-4 border-t border-gray-100">
                <Link href="/admin" onClick={() => setIsOpen(false)} className="text-primary font-bold">Admin Dashboard</Link>
                <Button onClick={() => logout.mutate()} variant="outline" className="w-full">Logout</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
