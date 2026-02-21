import React from "react";
import Logo from "./Logo";
import { Link } from "react-router-dom";

const footerLinks = [
  { title: "E-Store", links: ["Blog", "Pricing", "About Us", "Contact", "Testimonials"] },
  { title: "Support", links: ["Legal", "Status", "Privacy", "Terms of Service"] },
];

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <Logo w={140} h={80} />
            </Link>
            <p className="text-sm text-slate-400">
              Your trusted place for electronics and gadgets. Quality products, fast delivery.
            </p>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} E-Store. All rights reserved.</p>
          </div>
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Stay updated</h3>
            <div className="flex rounded-xl overflow-hidden border border-slate-600 bg-slate-700/50 focus-within:border-primary-500/50 transition-colors">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="px-4 text-primary-400 hover:text-primary-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
          Made with <span className="text-accent-coral">♥</span> by Kumar Prince
        </div>
      </div>
    </footer>
  );
};

export default Footer;
