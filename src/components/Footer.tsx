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
    { icon: Facebook, href: 'https://facebook.com/zadeapp', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/zadeapp', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/zadeapp', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/zadeapp', label: 'LinkedIn' }
  ];

  return (
    <footer className="hidden md:block bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img
                src="/logo.svg"
                alt="ZadeApp Logo"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-md text-sm leading-relaxed">
              {t.footer.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Toronto, Canada</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>{t.footer.supportPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>{t.footer.supportEmail}</span>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      language === 'fr'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
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
              <h3 className="font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm"
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
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-wrap items-center gap-6 mb-4 md:mb-0">
            <Link to="/privacy" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
              {t.footer.privacyPolicy}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
              {t.footer.termsOfService}
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
              {t.footer.cookiePolicy}
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 p-2 hover:bg-gray-800 rounded-lg"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm">
            {t.footer.copyright} {t.footer.madeWith} <Heart className="inline w-4 h-4 text-red-500 mx-1" /> {t.footer.inCanada}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
