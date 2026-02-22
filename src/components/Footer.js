import React from "react";
import Logo from "../assest/bdbrandstore2.png"; 
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaShieldAlt, FaTruck, FaHeadset } from "react-icons/fa";

const footerLinks = [
  { 
    title: "BD Brand Store", 
    links: [
      { name: "About Our Brand", path: "/about" },
      { name: "Latest Collections", path: "/products" },
      { name: "Store Locations", path: "/contact" },
      { name: "Customer Reviews", path: "/testimonials" }
    ] 
  },
  { 
    title: "Quick Support", 
    links: [
      { name: "Track Order", path: "/user-panel/orders" },
      { name: "Returns & Privacy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Shipping Info", path: "/shipping" }
    ] 
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-[#020617] text-slate-300 overflow-hidden border-t border-slate-900">
      
      {/* --- Dynamic Color Effects (Glows) --- */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-primary-600/20 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full"></div>

      <div className="container mx-auto px-4 md:px-8 pt-16 pb-10 relative z-10">
        
        {/* --- Top Feature Bar --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 border-b border-slate-800/50 pb-12">
            <FeatureBox icon={<FaShieldAlt/>} title="Secure Payment" desc="100% safe checkout" />
            <FeatureBox icon={<FaTruck/>} title="Fast Delivery" desc="Island wide shipping" />
            <FeatureBox icon={<FaHeadset/>} title="24/7 Support" desc="Dedicated help desk" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img 
                src={Logo} 
                alt="BD Brand Store" 
                className="h-14 w-auto object-contain bg-white rounded-2xl p-2 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Your premier destination for high-end electronics. We define quality and trust in every gadget we deliver.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <SocialIcon icon={<FaFacebookF />} color="hover:bg-blue-600" />
              <SocialIcon icon={<FaInstagram />} color="hover:bg-pink-600" />
              <SocialIcon icon={<FaTwitter />} color="hover:bg-sky-500" />
              <SocialIcon icon={<FaLinkedinIn />} color="hover:bg-blue-700" />
            </div>
          </div>

          {/* Dynamic Links */}
          {footerLinks.map((col) => (
            <div key={col.title} className="lg:ml-10">
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8 border-l-4 border-primary-600 pl-3">{col.title}</h3>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-slate-400 hover:text-primary-400 hover:translate-x-2 flex items-center transition-all duration-300 group"
                    >
                      <span className="w-0 h-[1.5px] bg-primary-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info (Replaced Email Option) */}
          <div className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8 border-l-4 border-primary-600 pl-3">Contact Us</h3>
            <div className="space-y-5">
               <ContactItem icon={<FaPhoneAlt/>} text="+880 1XXX-XXXXXX" subText="Sat - Thu, 10am - 8pm" />
               <ContactItem icon={<FaEnvelope/>} text="support@bdbrand.store" subText="Online support 24/7" />
               <ContactItem icon={<FaMapMarkerAlt/>} text="Dhaka, Bangladesh" subText="Visit our experience center" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-slate-900/80 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} <span className="text-primary-500">BD Brand Store</span>. Premium Quality Guaranteed.
          </p>
          
          <div className="flex items-center gap-6">
            <p className="text-[10px] text-slate-600 font-bold uppercase">Designed by <span className="text-slate-400">Mohammad Ferdous Hossain</span></p>
            <div className="flex gap-3">
                <PaymentChip text="COD" />
                <PaymentChip text="BKASH" />
                <PaymentChip text="Cards" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Sub-Components ---

const FeatureBox = ({ icon, title, desc }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
        <div className="text-primary-500 text-2xl">{icon}</div>
        <div>
            <h4 className="text-white text-sm font-bold">{title}</h4>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
    </div>
);

const ContactItem = ({ icon, text, subText }) => (
    <div className="flex gap-4 group">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
            {icon}
        </div>
        <div>
            <p className="text-sm font-bold text-slate-300">{text}</p>
            <p className="text-[11px] text-slate-500 font-medium">{subText}</p>
        </div>
    </div>
);

const SocialIcon = ({ icon, color }) => (
  <a href="#" className={`w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all duration-300 hover:text-white hover:-translate-y-1 shadow-lg ${color}`}>
    {icon}
  </a>
);

const PaymentChip = ({ text }) => (
    <span className="text-[9px] font-black text-slate-500 border border-slate-800 px-3 py-1 rounded-lg uppercase tracking-tighter bg-slate-900/50">
        {text}
    </span>
);

export default Footer;