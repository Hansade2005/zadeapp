import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useLanguage } from '../i18n';

const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: t.footer.marketplace,
      links: [
        { name: t.footer.browseProducts, href: '/marketplace' },
        { name: t.footer.myProducts, href: '/my-products' },
        { name: t.footer.myOrders, href: '/my-orders' },
        { name: t.footer.wishlist, href: '/wishlist' }
      ]
    },
    {
      title: t.footer.services,
      links: [
        { name: t.footer.findJobs, href: '/jobs' },
        { name: t.footer.myJobs, href: '/my-jobs' },
        { name: t.footer.freelancers, href: '/freelance' },
        { name: t.footer.events, href: '/events' }
      ]
    },
    {
      title: t.footer.entertainment,
      links: [
        { name: t.footer.artists, href: '/artistes' },
        { name: t.footer.myEvents, href: '/my-events' },
        { name: t.footer.artistProfile, href: '/artiste-profile' },
        { name: t.footer.messages, href: '/messages' }
      ]
    },
    {
      title: t.footer.account,
      links: [
        { name: t.footer.profile, href: '/profile' },
        { name: t.footer.settings, href: '/settings' },
        { name: t.footer.myCredits, href: '/my-credits' },
        { name: t.footer.notifications, href: '/notifications' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/share/1GudXC1APd', label: 'Facebook' },
    { icon: Twitter, href: 'https://x.com/ZaideApp', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/zaideapp?igsh=ZTkzcHZ4cjJxOGs0&utm_source=ig_contact_invite', label: 'Instagram' },
    { icon: Linkedin, href: 'https://ca.linkedin.com/in/zaide-app-67b68213a', label: 'LinkedIn' }
  ];

  return (
    <footer className="hidden md:block bg-stone-950 text-white relative overflow-hidden">
      <div className="motif-band h-1.5 w-full" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-clay-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="group flex items-center mb-4">
              <img
                src="/favicon.jpg"
                alt="Zaideapp — On Good Business"
                className="h-14 w-auto object-contain bg-white rounded-xl p-1 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-stone-400 mb-6 max-w-md text-sm leading-relaxed">
              {t.footer.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-clay-400" />
                <span>Toronto, Canada</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-clay-400" />
                <span>{t.footer.supportPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-clay-400" />
                <span>{t.footer.supportEmail}</span>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-stone-400" />
                <div className="flex bg-stone-800/80 rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      language === 'en'
                        ? 'bg-clay-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      language === 'fr'
                        ? 'bg-clay-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    FR
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-display font-bold mb-4 text-white tracking-tight">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="inline-block text-stone-400 hover:text-clay-400 hover:translate-x-1 transition-all duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-wrap items-center gap-6 mb-4 md:mb-0">
            <Link to="/privacy" className="text-stone-400 hover:text-clay-400 text-sm transition-colors">
              {t.footer.privacyPolicy}
            </Link>
            <Link to="/terms" className="text-stone-400 hover:text-clay-400 text-sm transition-colors">
              {t.footer.termsOfService}
            </Link>
            <Link to="/cookies" className="text-stone-400 hover:text-clay-400 text-sm transition-colors">
              {t.footer.cookiePolicy}
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-white transition-all duration-200 p-2.5 bg-white/5 hover:bg-clay-600 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-clay-600/30"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-white/10">
          <p className="text-stone-400 text-sm">
            {t.footer.copyright} {t.footer.madeWith} <Heart className="inline w-4 h-4 text-clay-500 mx-1 fill-clay-500" /> {t.footer.inCanada}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
