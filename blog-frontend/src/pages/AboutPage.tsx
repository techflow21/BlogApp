import { BookOpen, Feather, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Alex Johnson', role: 'Founder & Lead Developer', initials: 'AJ' },
  { name: 'Sarah Chen', role: 'Product Designer', initials: 'SC' },
  { name: 'Marcus Rivera', role: 'Backend Engineer', initials: 'MR' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 text-3xl font-extrabold text-gray-900 mb-4">
          <BookOpen className="w-8 h-8 text-indigo-600" /> BlogApp
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A modern blogging platform built for writers, thinkers, and curious minds.
          Share your ideas, connect with readers, and grow your audience.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            Read Articles
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 border border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition"
          >
            Start Writing
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        {[
          { icon: Feather, label: 'Articles Published', value: '1,200+' },
          { icon: Users, label: 'Active Readers', value: '8,500+' },
          { icon: Globe, label: 'Countries Reached', value: '45+' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
            <Icon className="w-6 h-6 text-indigo-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-indigo-100 leading-relaxed">
          We believe everyone has a story worth sharing. BlogApp provides the tools and community to help
          writers of all levels reach their audience. From technical deep-dives to personal essays,
          our platform celebrates diverse voices and ideas.
        </p>
      </div>

      {/* Team */}
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">The Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
              {member.initials}
            </div>
            <p className="font-semibold text-gray-900">{member.name}</p>
            <p className="text-sm text-gray-500 mt-1">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
