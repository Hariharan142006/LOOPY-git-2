import Link from "next/link";
import { Leaf, Twitter, Instagram, Linkedin, Github, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-black fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">Loopy</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Revolutionizing scrap collection in India with smart weighing, transparent rates, and instant doorstep payouts.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-green-500 hover:bg-white/10 transition-all">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-green-500 hover:bg-white/10 transition-all">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-green-500 hover:bg-white/10 transition-all">
                <Linkedin size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-green-500 hover:bg-white/10 transition-all">
                <Github size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              {["About Us", "How it Works", "Rates", "Locations", "Support"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-green-500 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              {["Terms of Service", "Privacy Policy", "Partner Agreement", "Safety Guidelines"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-green-500 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin size={16} className="text-green-500" />
                <span>Sector 62, Noida, UP - 201301</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone size={16} className="text-green-500" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={16} className="text-green-500" />
                <span>support@loopy.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Loopy Technologies Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">India's Smartest Recycling Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
