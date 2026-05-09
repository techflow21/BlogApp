import { Link } from 'react-router-dom';
import { BookOpen, Mail, X, Globe, Code2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
];

const categories = ['Technology', 'Programming', 'Design', 'Career', 'Tutorial', 'Open Source'];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Subscribed to newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              BlogApp
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              A modern blogging platform for sharing ideas, stories, and knowledge with the world.
              Join our growing community of writers and readers.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="hover:text-indigo-400 transition-colors"><X className="w-4 h-4" /></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><Code2 className="w-4 h-4" /></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><Globe className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-indigo-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/?tag=${encodeURIComponent(cat.toLowerCase())}`}
                  className="px-2 py-1 bg-gray-800 rounded text-xs hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to get the latest posts delivered to your inbox.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-transparent text-sm text-white flex-1 outline-none placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BlogApp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
