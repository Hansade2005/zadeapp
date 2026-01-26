import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = 2026;

  const footerSections = [
    {
      title: 'Marketplace',
      links: [
        { name: 'Browse Products', href: '/marketplace' },
        { name: 'My Products', href: '/my-products' },
        { name: 'My Orders', href: '/my-orders' },
        { name: 'Wishlist', href: '/wishlist' }
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Find Jobs', href: '/jobs' },
        { name: 'My Jobs', href: '/my-jobs' },
        { name: 'Freelancers', href: '/freelance' },
        { name: 'Events', href: '/events' }
      ]
    },
    {
      title: 'Entertainment',
      links: [
        { name: 'Artists', href: '/artistes' },
        { name: 'My Events', href: '/my-events' },
        { name: 'Artist Profile', href: '/artiste-profile' },
        { name: 'Messages', href: '/messages' }
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'Profile', href: '/profile' },
        { name: 'Settings', href: '/settings' },
        { name: 'My Credits', href: '/my-credits' },
        { name: 'Notifications', href: '/notifications' }
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
            <p className="text-gray-400 mb-6 max-w-md">
              Canada's premier multi-marketplace platform connecting buyers, sellers, job seekers,
              freelancers, and event organizers across the country.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Toronto, Canada</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (800) ZADE-APP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>hello@zadeapp.ca</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">Get the latest deals, jobs, and events delivered to your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-r-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-wrap items-center space-x-6 mb-4 md:mb-0">
            <span className="text-gray-400 text-sm">
              Privacy Policy
            </span>
            <span className="text-gray-400 text-sm">
              Terms of Service
            </span>
            <span className="text-gray-400 text-sm">
              Cookie Policy
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
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
            © {currentYear} ZadeApp. All rights reserved. Made with <Heart className="inline w-4 h-4 text-red-500 mx-1" /> in Canada.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
